"""
Pharmacy Claims Analysis - Report Generation

Outputs detailed CSV and prints a formatted summary to the console.
"""

import os

import pandas as pd

from config import TIER_CONFIG
from engine import get_tier_rank


def export_detail_csv(detail_rows, output_path):
    """Export the member-month detail to a CSV file."""
    if not detail_rows:
        print("  No detail rows to export.")
        return

    df = pd.DataFrame(detail_rows)
    col_order = [
        "member_id", "member_name", "month_name", "year", "month",
        "assigned_tier", "tier_label", "pppm",
        "drugs_on_claims", "all_tiers_present", "claim_ids",
    ]
    # Only include columns that exist
    col_order = [c for c in col_order if c in df.columns]
    df = df[col_order]
    df.to_csv(output_path, index=False)
    print(f"  Detail CSV written to: {output_path}")


def export_unmatched_csv(unmatched_claims, output_path):
    """Export unmatched claims (NDCs not in formulary) to a CSV."""
    if not unmatched_claims:
        print("  No unmatched claims to export.")
        return

    df = pd.DataFrame(unmatched_claims)
    df.to_csv(output_path, index=False)
    print(f"  Unmatched claims CSV written to: {output_path}")


def export_member_summary_csv(detail_rows, output_path):
    """
    Export a per-member summary: one row per member with their highest tier
    across all months and total months charged.
    """
    if not detail_rows:
        print("  No data for member summary.")
        return

    df = pd.DataFrame(detail_rows)

    members = {}
    for _, row in df.iterrows():
        mid = row["member_id"]
        if mid not in members:
            members[mid] = {
                "member_id": mid,
                "member_name": row["member_name"],
                "highest_tier": row["assigned_tier"],
                "months_charged": 0,
                "total_pppm_charged": 0.0,
                "all_drugs": set(),
                "months_list": [],
            }

        m = members[mid]
        if get_tier_rank(row["assigned_tier"]) > get_tier_rank(m["highest_tier"]):
            m["highest_tier"] = row["assigned_tier"]
        m["months_charged"] += 1
        m["total_pppm_charged"] += row["pppm"]
        m["all_drugs"].update(row["drugs_on_claims"].split("; "))
        m["months_list"].append(row["month_name"])

    rows = []
    for mid in sorted(members.keys()):
        m = members[mid]
        rows.append({
            "member_id": m["member_id"],
            "member_name": m["member_name"],
            "highest_tier": m["highest_tier"],
            "tier_label": TIER_CONFIG[m["highest_tier"]]["label"],
            "highest_tier_pppm": TIER_CONFIG[m["highest_tier"]]["pppm"],
            "months_with_claims": m["months_charged"],
            "total_charged": m["total_pppm_charged"],
            "all_drugs": "; ".join(sorted(m["all_drugs"])),
            "months_covered": "; ".join(m["months_list"]),
        })

    out_df = pd.DataFrame(rows)
    out_df.to_csv(output_path, index=False)
    print(f"  Member summary CSV written to: {output_path}")


def print_summary(summary, client_name=""):
    """Print a formatted summary to the console."""
    header = "PHARMACY CLAIMS ANALYSIS SUMMARY"
    if client_name:
        header += f" - {client_name}"

    width = 70
    print()
    print("=" * width)
    print(header.center(width))
    print("=" * width)

    print(f"\n  Unique Members:        {summary['unique_members']:>8}")
    print(f"  Total Member-Months:   {summary['total_member_months']:>8}")
    print(f"  Total PPPM Revenue:    ${summary['total_revenue']:>10,.2f}")
    print(f"  Unmatched Claims:      {summary['unmatched_claim_count']:>8}")

    if summary.get("tier_breakdown"):
        print(f"\n  {'TIER BREAKDOWN':^{width - 4}}")
        print(f"  {'-' * (width - 4)}")
        print(f"  {'Tier':<30} {'PPPM':>8} {'Mbr-Mo':>8} {'Members':>8} {'Revenue':>12}")
        print(f"  {'-' * (width - 4)}")

        for tier_name in sorted(summary["tier_breakdown"].keys(),
                                key=lambda t: TIER_CONFIG[t]["rank"]):
            tb = summary["tier_breakdown"][tier_name]
            print(f"  {tb['label']:<30} ${tb['pppm']:>7,.0f} {tb['member_months']:>8} "
                  f"{tb['unique_members']:>8} ${tb['revenue']:>11,.2f}")

        print(f"  {'-' * (width - 4)}")
        total_mm = summary["total_member_months"]
        total_rev = summary["total_revenue"]
        print(f"  {'TOTAL':<30} {'':>8} {total_mm:>8} "
              f"{summary['unique_members']:>8} ${total_rev:>11,.2f}")

    if summary.get("member_tier_distribution"):
        print(f"\n  {'MEMBER DISTRIBUTION (by highest tier)':^{width - 4}}")
        print(f"  {'-' * (width - 4)}")
        for tier_name in sorted(summary["member_tier_distribution"].keys(),
                                key=lambda t: TIER_CONFIG.get(t, {}).get("rank", 0)):
            count = summary["member_tier_distribution"][tier_name]
            label = TIER_CONFIG.get(tier_name, {}).get("label", tier_name)
            print(f"  {label:<40} {count:>5} members")

    print()
    print("=" * width)
    print()
