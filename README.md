# Pharmacy Claims Analyzer

Tier-based PPPM (Per Participant Per Month) pricing tool for pharmacy claims analysis. Ingests a formulary and claims CSVs, matches drugs by NDC, assigns the highest applicable tier per member per month, and calculates membership fees.

## Tier Pricing

| Tier | PPPM | Description |
|------|------|-------------|
| ZorroCard | $50 | Cash pay GLP-1s |
| Basic | $100 | Standard formulary drugs |
| Basic+ | $250 | Enhanced formulary drugs |
| Specialty | $900 | Specialty drugs (e.g. Humira, Enbrel) |
| LDD | $3,000 | Limited Distribution Drugs (e.g. Revlimid) |

**Rule:** Each member is charged exactly one membership tier — the highest tier drug in their active supply for that month.

## Quick Start

```bash
pip install -r requirements.txt

# Single client analysis
python analyze.py -f sample_data/formulary.csv -c sample_data/claims.csv -n "Acme Corp"

# Compare current client vs prospect
python analyze.py -f sample_data/formulary.csv -c current_claims.csv --compare prospect_claims.csv
```

## Input Files

### Formulary CSV
NDC-to-tier mapping. Required columns:

| Column | Description |
|--------|-------------|
| `ndc` | 11-digit NDC code |
| `drug_name` | Drug name |
| `tier` | One of: ZorroCard, Basic, Basic+, Specialty, LDD |

### Claims CSV
Standard pharmacy claims. Required columns:

| Column | Description |
|--------|-------------|
| `claim_id` | Unique claim identifier |
| `member_id` | Member identifier |
| `member_first_name` | Member first name |
| `member_last_name` | Member last name |
| `ndc` | 11-digit NDC code |
| `drug_name` | Drug name |
| `fill_date` | Fill date (YYYY-MM-DD) |
| `days_supply` | Days supply |
| `quantity` | Quantity dispensed |
| `pharmacy_name` | Pharmacy name |
| `plan_paid` | Plan paid amount |
| `member_paid` | Member paid amount |

## Output

Reports are written to `./output/` (configurable with `-o`):

- **`member_month_detail.csv`** — One row per member per month showing assigned tier, PPPM, all drugs on claims
- **`member_summary.csv`** — One row per member with highest tier, total months charged, total fees
- **`unmatched_claims.csv`** — Claims with NDCs not found in the formulary (if any)
- **Console summary** — Tier breakdown with member counts and revenue

## Configuration

Edit `config.py` to adjust:

- **Tier pricing and hierarchy** — Add/remove tiers, change PPPM rates or rank order
- **Column mappings** — Remap CSV column headers if your files use different names

## Month Spreading

Days supply is converted to months using `ceil(days_supply / 30)`:
- 30-day fill = 1 month
- 60-day fill = 2 months
- 90-day fill = 3 months

Months are counted starting from the fill date's month.

## CLI Options

```
python analyze.py [options]

Required:
  -f, --formulary     Path to formulary CSV
  -c, --claims        Path to claims CSV

Optional:
  -o, --output-dir    Output directory (default: ./output)
  -n, --client-name   Client name for report headers
  --compare           Second claims CSV for side-by-side comparison
```
