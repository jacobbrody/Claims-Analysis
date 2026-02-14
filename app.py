#!/usr/bin/env python3
"""
Pharmacy Claims Analyzer - Flask Web UI
"""

import os
import uuid
import json

from flask import (
    Flask, render_template, request, redirect, url_for,
    flash, send_file, session, jsonify,
)

from config import TIER_CONFIG, FORMULARY_COLUMNS, CLAIMS_COLUMNS
from engine import load_formulary, load_claims, analyze_claims, build_summary, get_tier_rank
from reports import export_detail_csv, export_unmatched_csv, export_member_summary_csv

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "pharmacy-claims-dev-key")

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


def get_tier_config():
    """Return tier config, with any session overrides applied."""
    if "tier_overrides" in session:
        config = {}
        for tier_name, tier_info in TIER_CONFIG.items():
            config[tier_name] = dict(tier_info)
        for tier_name, pppm in session["tier_overrides"].items():
            if tier_name in config:
                config[tier_name]["pppm"] = float(pppm)
        return config
    return dict(TIER_CONFIG)


def run_analysis_pipeline(formulary_path, claims_path, client_name, run_id, tier_config):
    """Run full analysis and return summary + file paths."""
    # Temporarily override TIER_CONFIG for this run
    import config
    original = dict(config.TIER_CONFIG)
    config.TIER_CONFIG.update(tier_config)

    try:
        formulary = load_formulary(formulary_path)
        claims_df = load_claims(claims_path)
        detail_rows, unmatched = analyze_claims(claims_df, formulary)
        summary = build_summary(detail_rows, unmatched)

        prefix = f"{run_id}_"
        detail_path = os.path.join(OUTPUT_DIR, f"{prefix}member_month_detail.csv")
        member_path = os.path.join(OUTPUT_DIR, f"{prefix}member_summary.csv")
        unmatched_path = os.path.join(OUTPUT_DIR, f"{prefix}unmatched_claims.csv")

        export_detail_csv(detail_rows, detail_path)
        export_member_summary_csv(detail_rows, member_path)
        if unmatched:
            export_unmatched_csv(unmatched, unmatched_path)

        files = {
            "detail": detail_path,
            "member_summary": member_path,
        }
        if unmatched:
            files["unmatched"] = unmatched_path

        return summary, detail_rows, unmatched, files
    finally:
        config.TIER_CONFIG.update(original)


@app.route("/")
def index():
    tier_config = get_tier_config()
    return render_template("index.html", tier_config=tier_config)


@app.route("/analyze", methods=["POST"])
def analyze():
    # Validate uploads
    formulary_file = request.files.get("formulary")
    claims_file = request.files.get("claims")
    compare_file = request.files.get("compare")
    client_name = request.form.get("client_name", "").strip()
    compare_name = request.form.get("compare_name", "").strip()

    if not formulary_file or not formulary_file.filename:
        flash("Please upload a formulary CSV.", "error")
        return redirect(url_for("index"))
    if not claims_file or not claims_file.filename:
        flash("Please upload a claims CSV.", "error")
        return redirect(url_for("index"))

    # Save tier overrides from form
    tier_config = {}
    for tier_name, tier_info in TIER_CONFIG.items():
        tier_config[tier_name] = dict(tier_info)
        form_pppm = request.form.get(f"pppm_{tier_name}")
        if form_pppm:
            try:
                tier_config[tier_name]["pppm"] = float(form_pppm)
            except ValueError:
                pass

    # Persist overrides in session
    session["tier_overrides"] = {k: v["pppm"] for k, v in tier_config.items()}

    # Save uploaded files
    run_id = str(uuid.uuid4())[:8]
    formulary_path = os.path.join(UPLOAD_DIR, f"{run_id}_formulary.csv")
    claims_path = os.path.join(UPLOAD_DIR, f"{run_id}_claims.csv")
    formulary_file.save(formulary_path)
    claims_file.save(claims_path)

    try:
        summary, detail_rows, unmatched, files = run_analysis_pipeline(
            formulary_path, claims_path, client_name or "Primary", run_id, tier_config,
        )
    except Exception as e:
        flash(f"Analysis failed: {str(e)}", "error")
        return redirect(url_for("index"))

    # Comparison analysis
    compare_summary = None
    compare_files = None
    if compare_file and compare_file.filename:
        compare_path = os.path.join(UPLOAD_DIR, f"{run_id}_compare.csv")
        compare_file.save(compare_path)
        compare_id = f"{run_id}_cmp"
        try:
            compare_summary, _, compare_unmatched, compare_files = run_analysis_pipeline(
                formulary_path, compare_path, compare_name or "Comparison", compare_id, tier_config,
            )
        except Exception as e:
            flash(f"Comparison analysis failed: {str(e)}", "error")

    # Store run info in session for downloads
    session["last_run"] = {
        "run_id": run_id,
        "files": files,
        "compare_files": compare_files,
    }

    return render_template(
        "results.html",
        summary=summary,
        detail_rows=detail_rows,
        unmatched=unmatched,
        client_name=client_name or "Primary",
        compare_summary=compare_summary,
        compare_name=compare_name or "Comparison",
        tier_config=tier_config,
        run_id=run_id,
        files=files,
        compare_files=compare_files,
    )


@app.route("/download/<run_id>/<file_type>")
def download(run_id, file_type):
    last_run = session.get("last_run", {})
    all_files = {}
    if last_run.get("files"):
        all_files.update(last_run["files"])
    if last_run.get("compare_files"):
        for k, v in last_run["compare_files"].items():
            all_files[f"compare_{k}"] = v

    filepath = all_files.get(file_type)
    if not filepath or not os.path.isfile(filepath):
        flash("File not found.", "error")
        return redirect(url_for("index"))

    return send_file(filepath, as_attachment=True)


@app.template_filter("currency")
def currency_filter(value):
    try:
        return f"${float(value):,.2f}"
    except (ValueError, TypeError):
        return value


@app.template_filter("number")
def number_filter(value):
    try:
        return f"{int(value):,}"
    except (ValueError, TypeError):
        return value


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
