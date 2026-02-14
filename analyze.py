#!/usr/bin/env python3
"""
Pharmacy Claims Analyzer - CLI Entry Point

Usage:
    python analyze.py --formulary formulary.csv --claims claims.csv [options]

Options:
    --formulary, -f    Path to formulary CSV (NDC-to-tier mapping)
    --claims, -c       Path to pharmacy claims CSV
    --output-dir, -o   Output directory for reports (default: ./output)
    --client-name, -n  Client name for report header
    --compare          Path to a second claims CSV for comparison analysis
"""

import argparse
import os
import sys

from engine import load_formulary, load_claims, analyze_claims, build_summary
from reports import (
    export_detail_csv,
    export_unmatched_csv,
    export_member_summary_csv,
    print_summary,
)
from config import TIER_CONFIG


def run_analysis(formulary_path, claims_path, output_dir, client_name=""):
    """Run the full analysis pipeline for a single claims file."""
    print(f"\n--- Loading formulary: {formulary_path}")
    formulary = load_formulary(formulary_path)
    print(f"    Loaded {len(formulary)} NDC entries across tiers: "
          f"{', '.join(sorted(set(f['tier'] for f in formulary.values())))}")

    print(f"\n--- Loading claims: {claims_path}")
    claims_df = load_claims(claims_path)
    print(f"    Loaded {len(claims_df)} claims for "
          f"{claims_df['member_id'].nunique()} unique members")

    print(f"\n--- Analyzing claims...")
    detail_rows, unmatched = analyze_claims(claims_df, formulary)
    summary = build_summary(detail_rows, unmatched)

    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Determine file prefix from client name
    prefix = client_name.lower().replace(" ", "_") + "_" if client_name else ""

    print(f"\n--- Exporting reports to: {output_dir}")
    export_detail_csv(detail_rows, os.path.join(output_dir, f"{prefix}member_month_detail.csv"))
    export_member_summary_csv(detail_rows, os.path.join(output_dir, f"{prefix}member_summary.csv"))
    if unmatched:
        export_unmatched_csv(unmatched, os.path.join(output_dir, f"{prefix}unmatched_claims.csv"))

    print_summary(summary, client_name)

    return summary, detail_rows, unmatched


def run_comparison(formulary_path, current_path, prospect_path, output_dir):
    """Run analysis on two claims files and print a side-by-side comparison."""
    print("\n" + "=" * 70)
    print("  CURRENT CLIENT ANALYSIS".center(70))
    print("=" * 70)
    current_summary, _, _ = run_analysis(
        formulary_path, current_path, output_dir, client_name="Current Client"
    )

    print("\n" + "=" * 70)
    print("  PROSPECT CLIENT ANALYSIS".center(70))
    print("=" * 70)
    prospect_summary, _, _ = run_analysis(
        formulary_path, prospect_path, output_dir, client_name="Prospect"
    )

    # Side-by-side comparison
    width = 70
    print("\n" + "=" * width)
    print("  COMPARISON: CURRENT vs PROSPECT".center(width))
    print("=" * width)

    print(f"\n  {'Metric':<30} {'Current':>15} {'Prospect':>15}")
    print(f"  {'-' * (width - 4)}")
    print(f"  {'Unique Members':<30} {current_summary['unique_members']:>15}"
          f" {prospect_summary['unique_members']:>15}")
    print(f"  {'Total Member-Months':<30} {current_summary['total_member_months']:>15}"
          f" {prospect_summary['total_member_months']:>15}")
    print(f"  {'Total PPPM Revenue':<30} ${current_summary['total_revenue']:>14,.2f}"
          f" ${prospect_summary['total_revenue']:>14,.2f}")
    print(f"  {'Unmatched Claims':<30} {current_summary['unmatched_claim_count']:>15}"
          f" {prospect_summary['unmatched_claim_count']:>15}")

    # Tier comparison
    all_tiers = sorted(
        set(list(current_summary.get("tier_breakdown", {}).keys()) +
            list(prospect_summary.get("tier_breakdown", {}).keys())),
        key=lambda t: TIER_CONFIG.get(t, {}).get("rank", 0)
    )

    if all_tiers:
        print(f"\n  {'Revenue by Tier':<30} {'Current':>15} {'Prospect':>15}")
        print(f"  {'-' * (width - 4)}")
        for tier in all_tiers:
            c_rev = current_summary.get("tier_breakdown", {}).get(tier, {}).get("revenue", 0)
            p_rev = prospect_summary.get("tier_breakdown", {}).get(tier, {}).get("revenue", 0)
            label = TIER_CONFIG.get(tier, {}).get("label", tier)
            print(f"  {label:<30} ${c_rev:>14,.2f} ${p_rev:>14,.2f}")

    print(f"\n{'=' * width}\n")


def main():
    parser = argparse.ArgumentParser(
        description="Pharmacy Claims Analyzer - Tier-based PPPM Pricing Tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Single client analysis
  python analyze.py -f formulary.csv -c claims.csv -n "Acme Corp"

  # Compare current vs prospect
  python analyze.py -f formulary.csv -c current_claims.csv --compare prospect_claims.csv

  # Custom output directory
  python analyze.py -f formulary.csv -c claims.csv -o ./reports -n "Beta Inc"
        """,
    )

    parser.add_argument(
        "--formulary", "-f", required=True,
        help="Path to formulary CSV file (NDC, drug_name, tier)",
    )
    parser.add_argument(
        "--claims", "-c", required=True,
        help="Path to pharmacy claims CSV file",
    )
    parser.add_argument(
        "--output-dir", "-o", default="./output",
        help="Directory for output reports (default: ./output)",
    )
    parser.add_argument(
        "--client-name", "-n", default="",
        help="Client name for report headers",
    )
    parser.add_argument(
        "--compare", default=None,
        help="Path to a second claims CSV for comparison analysis",
    )

    args = parser.parse_args()

    # Validate inputs
    if not os.path.isfile(args.formulary):
        print(f"ERROR: Formulary file not found: {args.formulary}")
        sys.exit(1)
    if not os.path.isfile(args.claims):
        print(f"ERROR: Claims file not found: {args.claims}")
        sys.exit(1)
    if args.compare and not os.path.isfile(args.compare):
        print(f"ERROR: Comparison claims file not found: {args.compare}")
        sys.exit(1)

    if args.compare:
        run_comparison(args.formulary, args.claims, args.compare, args.output_dir)
    else:
        run_analysis(args.formulary, args.claims, args.output_dir, args.client_name)


if __name__ == "__main__":
    main()
