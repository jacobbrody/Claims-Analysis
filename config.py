"""
Pharmacy Claims Analysis - Configuration

Tier pricing (PPPM) and hierarchy. Adjust values here to change pricing
or add/remove tiers without touching the rest of the codebase.
"""

# Tier hierarchy: higher rank = higher priority = more expensive membership.
# When a member has claims across multiple tiers, the highest-rank tier wins.
TIER_CONFIG = {
    "ZorroCard": {"rank": 1, "pppm": 50.00,   "label": "ZorroCard (Cash Pay GLP-1)"},
    "Basic":     {"rank": 2, "pppm": 100.00,   "label": "Basic"},
    "Basic+":    {"rank": 3, "pppm": 250.00,   "label": "Basic+"},
    "Specialty":  {"rank": 4, "pppm": 900.00,   "label": "Specialty"},
    "LDD":       {"rank": 5, "pppm": 3000.00,  "label": "Limited Distribution Drug"},
}

# Column mappings - adjust these if your CSVs use different header names.
# The keys are the internal names used by the engine; the values are the
# column headers in the incoming CSV files.

FORMULARY_COLUMNS = {
    "ndc": "ndc",
    "drug_name": "drug_name",
    "tier": "tier",
}

CLAIMS_COLUMNS = {
    "claim_id": "claim_id",
    "member_id": "member_id",
    "member_first_name": "member_first_name",
    "member_last_name": "member_last_name",
    "ndc": "ndc",
    "drug_name": "drug_name",
    "fill_date": "fill_date",
    "days_supply": "days_supply",
    "quantity": "quantity",
    "pharmacy_name": "pharmacy_name",
    "plan_paid": "plan_paid",
    "member_paid": "member_paid",
}
