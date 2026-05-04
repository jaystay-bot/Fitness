"""Apex Protocol lab parser.

Reads PDF bytes from stdin, attempts to identify the lab format
(Quest / LabCorp / ZRT) by signature text, runs format-aware regex
extraction over a curated set of clinical markers, and emits a
single JSON object on stdout.

Privacy: no file is written to disk. The PDF stays in memory and is
discarded when the process exits.
"""
from __future__ import annotations

import io
import json
import re
import sys
from typing import Any, Optional


MARKERS = [
    ("ferritin_ng_ml", r"\bferritin\b"),
    ("vitamin_d_25oh_ng_ml", r"\bvitamin\s*d[\s,\-]*25[\s\-]?oh\b|25[\s\-]?(?:hydroxy)?\s*vit"),
    ("b12_pg_ml", r"\bvitamin\s*b\s*12\b|\bb\s*12\b|cobalamin"),
    ("magnesium_mg_dl", r"\bmagnesium\b"),
    ("total_cholesterol_mg_dl", r"total\s+cholesterol|cholesterol[,\s]+total"),
    ("hdl_mg_dl", r"\bhdl\b"),
    ("ldl_mg_dl", r"\bldl\b"),
    ("triglycerides_mg_dl", r"triglycerides?"),
    ("glucose_fasting_mg_dl", r"glucose[, ]+fasting|\bfasting\s+glucose\b|\bglucose\b"),
    ("hba1c_pct", r"\bhba1c\b|hemoglobin\s+a1c|a1c"),
]

NUMERIC_PATTERNS = [
    re.compile(r"([0-9]+(?:\.[0-9]+)?)\s*(ng/m[lL]|pg/m[lL]|mg/d[lL]|%|mmol/L|U/L|g/dL)"),
    re.compile(r"\b([0-9]+(?:\.[0-9]+)?)\b"),
]


def detect_format(text: str) -> str:
    lower = text.lower()
    if "quest diagnostics" in lower or "questdiagnostics" in lower:
        return "quest"
    if "labcorp" in lower or "laboratory corporation of america" in lower:
        return "labcorp"
    if "zrt laboratory" in lower or "zrtlab" in lower or "zrt-lab" in lower:
        return "zrt"
    return "unknown"


def find_value(text: str, name_pattern: str) -> Optional[float]:
    """Search text for a marker name then capture the nearest numeric value."""
    name_re = re.compile(name_pattern, re.IGNORECASE)
    for m in name_re.finditer(text):
        # Look in a window of up to 80 chars after the marker.
        window = text[m.end(): m.end() + 200]
        for pat in NUMERIC_PATTERNS:
            num = pat.search(window)
            if num:
                try:
                    return float(num.group(1))
                except ValueError:
                    continue
    return None


def physiological_ok(key: str, value: float) -> bool:
    bounds = {
        "ferritin_ng_ml": (1.0, 2000.0),
        "vitamin_d_25oh_ng_ml": (1.0, 200.0),
        "b12_pg_ml": (50.0, 4000.0),
        "magnesium_mg_dl": (0.5, 5.0),
        "total_cholesterol_mg_dl": (60.0, 400.0),
        "hdl_mg_dl": (10.0, 150.0),
        "ldl_mg_dl": (10.0, 300.0),
        "triglycerides_mg_dl": (20.0, 1500.0),
        "glucose_fasting_mg_dl": (40.0, 500.0),
        "hba1c_pct": (3.0, 18.0),
    }
    lo, hi = bounds.get(key, (-float("inf"), float("inf")))
    return lo <= value <= hi


def extract_text(pdf_bytes: bytes) -> str:
    try:
        import pdfplumber  # type: ignore
    except ImportError:
        return ""
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        chunks = []
        for page in pdf.pages:
            try:
                chunks.append(page.extract_text() or "")
            except Exception:
                continue
        return "\n".join(chunks)


def parse(pdf_bytes: bytes) -> dict[str, Any]:
    text = extract_text(pdf_bytes)
    if not text.strip():
        return {"ok": False, "reason": "empty_or_unreadable_pdf"}
    fmt = detect_format(text)
    if fmt == "unknown":
        return {"ok": False, "reason": "format_not_recognized", "format": fmt}
    values: dict[str, float] = {}
    for key, pattern in MARKERS:
        val = find_value(text, pattern)
        if val is None:
            continue
        if not physiological_ok(key, val):
            continue
        values[key] = val
    return {
        "ok": True,
        "format": fmt,
        "values": values,
    }


def main() -> int:
    pdf_bytes = sys.stdin.buffer.read()
    if not pdf_bytes:
        sys.stdout.write(json.dumps({"ok": False, "reason": "no_input"}))
        return 0
    try:
        result = parse(pdf_bytes)
    except Exception as exc:  # noqa: BLE001 — never crash the route
        result = {"ok": False, "reason": "parser_error", "detail": str(exc)[:200]}
    sys.stdout.write(json.dumps(result))
    return 0


if __name__ == "__main__":
    sys.exit(main())
