"""Tests for the tier-pricing rules in engine.py."""

from pathlib import Path

import pandas as pd
import pytest

from config import TIER_CONFIG
from engine import (
    analyze_claims,
    build_summary,
    get_covered_months,
    load_claims,
    load_formulary,
    normalize_ndc,
)

SAMPLE = Path(__file__).resolve().parent.parent / "sample_data"

# Small formulary covering every tier, keyed by normalized NDC.
FORMULARY = {
    "00000000001": {"drug_name": "GLP-1", "tier": "ZorroCard"},
    "00000000002": {"drug_name": "Statin", "tier": "Basic"},
    "00000000003": {"drug_name": "Enhanced", "tier": "Basic+"},
    "00000000004": {"drug_name": "Humira", "tier": "Specialty"},
    "00000000005": {"drug_name": "Revlimid", "tier": "LDD"},
}


def claims(*rows):
    """Build a claims DataFrame shaped like load_claims output.

    Each row is (member_id, ndc, fill_date, days_supply).
    """
    return pd.DataFrame(
        [
            {
                "claim_id": f"C{i}",
                "member_id": member,
                "member_first_name": "Test",
                "member_last_name": member,
                "ndc": ndc,
                "drug_name": FORMULARY.get(ndc, {}).get("drug_name", "Unknown"),
                "fill_date": pd.Timestamp(fill_date),
                "days_supply": days,
            }
            for i, (member, ndc, fill_date, days) in enumerate(rows)
        ]
    )


def by_month(detail_rows):
    return {(r["member_id"], r["year"], r["month"]): r for r in detail_rows}


# --- NDC normalization ---------------------------------------------------

@pytest.mark.parametrize(
    "raw, expected",
    [
        ("00074322002", "00074322002"),
        ("0074-3220-02", "00074322002"),  # hyphenated, short
        ("74322002", "00074322002"),  # leading zeros lost in Excel
        ("74322002.0", "00074322002"),  # read as a float
        (" 00074322002 ", "00074322002"),
    ],
)
def test_normalize_ndc(raw, expected):
    assert normalize_ndc(raw) == expected


# --- Month spreading -----------------------------------------------------

@pytest.mark.parametrize(
    "days, expected_months",
    [(0, 1), (1, 1), (30, 1), (31, 2), (60, 2), (90, 3), (100, 4)],
)
def test_months_are_ceil_of_days_over_30(days, expected_months):
    months = get_covered_months(pd.Timestamp("2024-01-15"), days)
    assert len(months) == expected_months


def test_months_start_at_fill_month_regardless_of_day():
    assert get_covered_months(pd.Timestamp("2024-01-31"), 30) == [(2024, 1)]


def test_months_roll_over_year_end():
    assert get_covered_months(pd.Timestamp("2024-11-20"), 90) == [
        (2024, 11),
        (2024, 12),
        (2025, 1),
    ]


# --- Tier assignment -----------------------------------------------------

def test_highest_tier_wins_within_a_month():
    detail, _ = analyze_claims(
        claims(
            ("M1", "00000000002", "2024-01-05", 30),  # Basic
            ("M1", "00000000004", "2024-01-20", 30),  # Specialty
            ("M1", "00000000001", "2024-01-25", 30),  # ZorroCard
        ),
        FORMULARY,
    )
    assert len(detail) == 1
    row = detail[0]
    assert row["assigned_tier"] == "Specialty"
    assert row["pppm"] == 900
    assert row["all_tiers_present"] == "ZorroCard; Basic; Specialty"


def test_one_charge_per_member_month_even_with_duplicate_fills():
    detail, _ = analyze_claims(
        claims(
            ("M1", "00000000002", "2024-01-01", 30),
            ("M1", "00000000002", "2024-01-15", 30),
        ),
        FORMULARY,
    )
    assert len(detail) == 1
    assert detail[0]["pppm"] == 100


def test_long_fill_carries_tier_into_later_months():
    # 90-day Specialty fill in Jan, 30-day Basic fill in Mar:
    # Specialty should still be charged in March.
    detail, _ = analyze_claims(
        claims(
            ("M1", "00000000004", "2024-01-10", 90),
            ("M1", "00000000002", "2024-03-10", 30),
        ),
        FORMULARY,
    )
    rows = by_month(detail)
    assert [rows[("M1", 2024, m)]["assigned_tier"] for m in (1, 2, 3)] == [
        "Specialty",
        "Specialty",
        "Specialty",
    ]


def test_members_are_priced_independently():
    detail, _ = analyze_claims(
        claims(
            ("M1", "00000000005", "2024-01-01", 30),  # LDD
            ("M2", "00000000002", "2024-01-01", 30),  # Basic
        ),
        FORMULARY,
    )
    rows = by_month(detail)
    assert rows[("M1", 2024, 1)]["pppm"] == 3000
    assert rows[("M2", 2024, 1)]["pppm"] == 100


def test_months_with_no_supply_are_not_charged():
    detail, _ = analyze_claims(
        claims(
            ("M1", "00000000002", "2024-01-01", 30),
            ("M1", "00000000002", "2024-04-01", 30),
        ),
        FORMULARY,
    )
    assert sorted((r["year"], r["month"]) for r in detail) == [(2024, 1), (2024, 4)]


def test_custom_tier_config_changes_price():
    cfg = {k: dict(v) for k, v in TIER_CONFIG.items()}
    cfg["Basic"]["pppm"] = 120
    detail, _ = analyze_claims(
        claims(("M1", "00000000002", "2024-01-01", 30)), FORMULARY, tier_config=cfg
    )
    assert detail[0]["pppm"] == 120


# --- Unmatched claims ----------------------------------------------------

def test_unmatched_ndc_is_reported_and_not_charged():
    detail, unmatched = analyze_claims(
        claims(
            ("M1", "99999999999", "2024-01-01", 30),
            ("M2", "00000000002", "2024-01-01", 30),
        ),
        FORMULARY,
    )
    assert [r["member_id"] for r in detail] == ["M2"]
    assert len(unmatched) == 1
    assert unmatched[0]["ndc"] == "99999999999"
    assert build_summary(detail, unmatched)["unmatched_claim_count"] == 1


def test_member_with_only_unmatched_claims_is_not_counted():
    detail, unmatched = analyze_claims(
        claims(("M1", "99999999999", "2024-01-01", 30)), FORMULARY
    )
    summary = build_summary(detail, unmatched)
    assert summary["unique_members"] == 0
    assert summary["total_revenue"] == 0


# --- Loaders -------------------------------------------------------------

def test_load_formulary_skips_unknown_tiers_and_pads_ndcs(tmp_path):
    path = tmp_path / "formulary.csv"
    path.write_text(
        "NDC,Drug_Name,Tier\n"
        "74322002,Humira,Specialty\n"
        "00000000009,Mystery,Platinum\n"
    )
    formulary = load_formulary(path)
    assert formulary == {"00074322002": {"drug_name": "Humira", "tier": "Specialty"}}


def test_load_claims_parses_types(tmp_path):
    path = tmp_path / "claims.csv"
    path.write_text(
        "claim_id,member_id,member_first_name,member_last_name,ndc,drug_name,"
        "fill_date,days_supply,quantity,pharmacy_name,plan_paid,member_paid\n"
        "C1,M1,A,B,0074-3220-02,Humira,2024-01-15,,2,X,5800.00,50\n"
    )
    df = load_claims(path)
    row = df.iloc[0]
    assert row["ndc"] == "00074322002"
    assert row["fill_date"] == pd.Timestamp("2024-01-15")
    assert row["days_supply"] == 0  # blank days supply becomes 0 -> 1 month
    assert row["plan_paid"] == 5800.0


# --- Summary ---------------------------------------------------------------

def test_summary_of_empty_input():
    summary = build_summary([], [])
    assert summary["total_revenue"] == 0
    assert summary["unique_members"] == 0


def test_member_tier_distribution_uses_highest_tier_ever():
    detail, unmatched = analyze_claims(
        claims(
            ("M1", "00000000002", "2024-01-01", 30),  # Basic
            ("M1", "00000000004", "2024-02-01", 30),  # Specialty
        ),
        FORMULARY,
    )
    summary = build_summary(detail, unmatched)
    assert summary["member_tier_distribution"] == {"Specialty": 1}
    assert summary["tier_breakdown"]["Basic"]["member_months"] == 1
    assert summary["tier_breakdown"]["Specialty"]["member_months"] == 1
    assert summary["total_revenue"] == 1000


# --- End to end on the sample data ----------------------------------------

def test_sample_data_totals():
    """Pins the current results for sample_data/. If a pricing change is
    intentional, update these numbers in the same commit."""
    formulary = load_formulary(SAMPLE / "formulary.csv")
    detail, unmatched = analyze_claims(load_claims(SAMPLE / "claims.csv"), formulary)
    summary = build_summary(detail, unmatched)

    assert summary["unique_members"] == 10
    assert summary["total_member_months"] == 26
    assert summary["total_revenue"] == 10250
    assert summary["unmatched_claim_count"] == 0
    assert {t: b["revenue"] for t, b in summary["tier_breakdown"].items()} == {
        "Basic": 1500,
        "Basic+": 1250,
        "Specialty": 4500,
        "LDD": 3000,
    }
    assert summary["member_tier_distribution"] == {
        "Basic": 4,
        "Basic+": 3,
        "Specialty": 2,
        "LDD": 1,
    }
