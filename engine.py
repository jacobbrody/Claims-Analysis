"""
Pharmacy Claims Analysis - Core Pricing Engine

Handles formulary matching, tier assignment, month spreading,
and per-member PPPM calculation.
"""

import math
from datetime import datetime
from collections import defaultdict

import pandas as pd

from config import TIER_CONFIG, FORMULARY_COLUMNS, CLAIMS_COLUMNS


def normalize_ndc(ndc_value):
    """Normalize NDC to an 11-digit zero-padded string for consistent matching."""
    s = str(ndc_value).strip().replace("-", "").replace(" ", "")
    # Remove any decimal points (e.g. from float conversion)
    if "." in s:
        s = s.split(".")[0]
    return s.zfill(11)


def load_formulary(filepath, tier_config=None):
    """Load formulary CSV and return a dict mapping NDC -> {drug_name, tier}."""
    cfg = tier_config if tier_config is not None else TIER_CONFIG
    col = FORMULARY_COLUMNS
    df = pd.read_csv(filepath, dtype=str)

    # Normalize column names to lowercase/stripped
    df.columns = [c.strip().lower() for c in df.columns]

    formulary = {}
    for _, row in df.iterrows():
        ndc = normalize_ndc(row[col["ndc"]])
        tier = row[col["tier"]].strip()
        drug_name = row.get(col["drug_name"], "Unknown").strip()

        if tier not in cfg:
            print(f"  WARNING: Unknown tier '{tier}' for NDC {ndc} ({drug_name}) - skipping")
            continue

        formulary[ndc] = {"drug_name": drug_name, "tier": tier}

    return formulary


def load_claims(filepath):
    """Load claims CSV into a DataFrame with normalized types."""
    col = CLAIMS_COLUMNS
    df = pd.read_csv(filepath, dtype=str)
    df.columns = [c.strip().lower() for c in df.columns]

    # Normalize NDC
    df[col["ndc"]] = df[col["ndc"]].apply(normalize_ndc)

    # Parse dates and numerics
    df[col["fill_date"]] = pd.to_datetime(df[col["fill_date"]], format="mixed")
    df[col["days_supply"]] = pd.to_numeric(df[col["days_supply"]], errors="coerce").fillna(0).astype(int)

    for money_col in [col["plan_paid"], col["member_paid"]]:
        if money_col in df.columns:
            df[money_col] = pd.to_numeric(df[money_col], errors="coerce").fillna(0)

    if col["quantity"] in df.columns:
        df[col["quantity"]] = pd.to_numeric(df[col["quantity"]], errors="coerce").fillna(0)

    return df


def get_covered_months(fill_date, days_supply):
    """
    Given a fill date and days supply, return a list of (year, month) tuples
    that the supply covers.

    Uses 30-day months: a 90-day fill = 3 months, 30-day fill = 1 month.
    Months start from the fill date's month.

    A 90-day fill starting Jan 15 covers Jan, Feb, Mar.
    A 30-day fill starting Jan 15 covers Jan only.
    """
    num_months = max(1, math.ceil(days_supply / 30))

    months = []
    year, month = fill_date.year, fill_date.month
    for _ in range(num_months):
        months.append((year, month))
        month += 1
        if month > 12:
            month = 1
            year += 1

    return months


def get_tier_rank(tier_name, tier_config=None):
    """Return the numeric rank for a tier (higher = more expensive)."""
    cfg = tier_config if tier_config is not None else TIER_CONFIG
    return cfg.get(tier_name, {}).get("rank", 0)


def get_tier_pppm(tier_name, tier_config=None):
    """Return the PPPM price for a tier."""
    cfg = tier_config if tier_config is not None else TIER_CONFIG
    return cfg.get(tier_name, {}).get("pppm", 0)


def analyze_claims(claims_df, formulary, tier_config=None):
    """
    Core analysis: match claims to formulary, spread across months,
    determine highest tier per member per month.

    Returns:
        detail_rows: list of dicts, one per member per month
        unmatched_claims: list of dicts for claims with no formulary match
    """
    cfg = tier_config if tier_config is not None else TIER_CONFIG
    col = CLAIMS_COLUMNS

    def _rank(tier_name):
        return cfg.get(tier_name, {}).get("rank", 0)

    # --- Step 1: Match claims to formulary and collect per-member/month tiers ---
    # Structure: member_id -> (year, month) -> {tier, drugs, claims, member_name}
    member_months = defaultdict(lambda: defaultdict(lambda: {
        "tiers": [],
        "drugs": [],
        "claims": [],
        "member_name": "",
    }))

    unmatched_claims = []

    for _, claim in claims_df.iterrows():
        ndc = claim[col["ndc"]]
        member_id = claim[col["member_id"]]
        member_name = f"{claim.get(col['member_first_name'], '')} {claim.get(col['member_last_name'], '')}".strip()
        fill_date = claim[col["fill_date"]]
        days_supply = claim[col["days_supply"]]
        drug_name = claim.get(col["drug_name"], "Unknown")

        if ndc not in formulary:
            unmatched_claims.append({
                "claim_id": claim.get(col["claim_id"], ""),
                "member_id": member_id,
                "member_name": member_name,
                "ndc": ndc,
                "drug_name": drug_name,
                "fill_date": fill_date,
                "days_supply": days_supply,
            })
            continue

        tier = formulary[ndc]["tier"]
        covered_months = get_covered_months(fill_date, days_supply)

        for ym in covered_months:
            bucket = member_months[member_id][ym]
            bucket["tiers"].append(tier)
            bucket["drugs"].append(drug_name)
            bucket["claims"].append(claim.get(col["claim_id"], ""))
            bucket["member_name"] = member_name

    # --- Step 2: For each member-month, pick the highest tier ---
    detail_rows = []

    for member_id in sorted(member_months.keys()):
        months_data = member_months[member_id]
        for ym in sorted(months_data.keys()):
            data = months_data[ym]
            # Find highest tier
            highest_tier = max(data["tiers"], key=_rank)
            pppm = cfg.get(highest_tier, {}).get("pppm", 0)

            detail_rows.append({
                "member_id": member_id,
                "member_name": data["member_name"],
                "year": ym[0],
                "month": ym[1],
                "month_name": datetime(ym[0], ym[1], 1).strftime("%b %Y"),
                "assigned_tier": highest_tier,
                "tier_label": cfg[highest_tier]["label"],
                "pppm": pppm,
                "drugs_on_claims": "; ".join(sorted(set(data["drugs"]))),
                "all_tiers_present": "; ".join(sorted(set(data["tiers"]), key=_rank)),
                "claim_ids": "; ".join(sorted(set(data["claims"]))),
            })

    return detail_rows, unmatched_claims


def build_summary(detail_rows, unmatched_claims, tier_config=None):
    """
    Build a summary dict from the detail analysis.

    Returns a dict with aggregate statistics.
    """
    cfg = tier_config if tier_config is not None else TIER_CONFIG

    def _rank(tier_name):
        return cfg.get(tier_name, {}).get("rank", 0)

    if not detail_rows:
        return {
            "total_member_months": 0,
            "unique_members": 0,
            "total_revenue": 0,
            "tier_breakdown": {},
            "unmatched_claim_count": len(unmatched_claims),
        }

    df = pd.DataFrame(detail_rows)

    unique_members = df["member_id"].nunique()
    total_member_months = len(df)
    total_revenue = df["pppm"].sum()

    # Breakdown by tier
    tier_breakdown = {}
    for tier_name, tier_info in sorted(cfg.items(), key=lambda x: x[1]["rank"]):
        tier_df = df[df["assigned_tier"] == tier_name]
        if len(tier_df) > 0:
            tier_breakdown[tier_name] = {
                "label": tier_info["label"],
                "pppm": tier_info["pppm"],
                "member_months": len(tier_df),
                "unique_members": tier_df["member_id"].nunique(),
                "revenue": tier_df["pppm"].sum(),
            }

    # Per-member summary: highest tier across all months
    member_highest = {}
    for _, row in df.iterrows():
        mid = row["member_id"]
        tier = row["assigned_tier"]
        if mid not in member_highest or _rank(tier) > _rank(member_highest[mid]):
            member_highest[mid] = tier

    member_tier_counts = defaultdict(int)
    for tier in member_highest.values():
        member_tier_counts[tier] += 1

    return {
        "total_member_months": total_member_months,
        "unique_members": unique_members,
        "total_revenue": total_revenue,
        "tier_breakdown": tier_breakdown,
        "member_tier_distribution": dict(member_tier_counts),
        "unmatched_claim_count": len(unmatched_claims),
    }
