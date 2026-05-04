"""Apex Protocol bottle scanner.

Reads image bytes from stdin, runs OCR, fuzzy-matches the result against
a curated list of supplement names mirroring lib/supplements.ts plus the
variation candidates, extracts a dose if visible, and emits a JSON
identification on stdout.

Privacy: no file is written to disk. The image stays in memory and is
discarded when the process exits.
"""
from __future__ import annotations

import io
import json
import re
import sys
from typing import Any, Optional


# Mirror of (id, display name + common variants) used by the engine.
KNOWN: list[tuple[str, list[str]]] = [
    ("creatine", ["creatine monohydrate", "creatine"]),
    ("vitamin-d3", ["vitamin d3", "vitamin d-3", "cholecalciferol"]),
    ("magnesium-glycinate", ["magnesium glycinate", "magnesium bisglycinate", "magnesium chelate"]),
    ("omega-3", ["omega-3", "omega 3", "fish oil", "epa dha", "ultra omega"]),
    ("protein", ["whey protein", "plant protein", "pea protein", "isolate"]),
    ("caffeine-theanine", ["caffeine theanine", "caffeine + l-theanine", "l-theanine + caffeine"]),
    ("rhodiola", ["rhodiola rosea", "rhodiola"]),
    ("ashwagandha", ["ashwagandha", "ksm-66"]),
    ("zinc", ["zinc picolinate", "zinc citrate", "zinc gluconate", "zinc"]),
    ("b12", ["methylcobalamin", "vitamin b12", "b-12", "b12"]),
    ("iron", ["ferrous bisglycinate", "iron bisglycinate", "iron"]),
    ("probiotic", ["multi-strain probiotic", "probiotic"]),
    ("electrolytes", ["electrolytes", "sodium potassium magnesium"]),
    ("melatonin", ["melatonin"]),
    ("hmb", ["hmb", "hydroxymethylbutyrate"]),
    ("beta-alanine", ["beta alanine", "beta-alanine"]),
    ("citrulline-malate", ["citrulline malate", "l-citrulline"]),
    ("tyrosine", ["l-tyrosine", "tyrosine"]),
]


DOSE_RE = re.compile(
    r"(\d+(?:\.\d+)?)\s*(mg|mcg|µg|ug|g|iu)\b",
    re.IGNORECASE,
)


def normalize_dose(value: float, unit: str) -> Optional[int]:
    u = unit.lower()
    if u == "g":
        return int(round(value * 1000))
    if u in ("mcg", "µg", "ug"):
        return int(round(value / 1000)) if value >= 1000 else int(round(value))
    if u == "mg":
        return int(round(value))
    if u == "iu":
        # IU does not directly convert to mg without compound knowledge.
        # Return the IU value as-is; consumer can choose to interpret.
        return int(round(value))
    return None


def extract_text(image_bytes: bytes) -> str:
    try:
        from PIL import Image  # type: ignore
        import pytesseract  # type: ignore
    except ImportError:
        return ""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        return pytesseract.image_to_string(img)
    except Exception:
        return ""


def fuzzy_match(text: str) -> tuple[Optional[str], float]:
    try:
        from rapidfuzz import fuzz, process  # type: ignore
    except ImportError:
        return (None, 0.0)
    lowered = text.lower()
    best_id: Optional[str] = None
    best_score = 0.0
    for sup_id, variants in KNOWN:
        for variant in variants:
            score = fuzz.partial_ratio(variant, lowered) / 100.0
            if score > best_score:
                best_score = score
                best_id = sup_id
    if best_score < 0.65:
        return (None, best_score)
    return (best_id, best_score)


def extract_dose_mg(text: str) -> Optional[int]:
    for m in DOSE_RE.finditer(text):
        try:
            value = float(m.group(1))
            unit = m.group(2)
            return normalize_dose(value, unit)
        except (TypeError, ValueError):
            continue
    return None


def scan(image_bytes: bytes) -> dict[str, Any]:
    text = extract_text(image_bytes)
    if not text.strip():
        return {
            "ok": True,
            "identified": None,
            "dose_mg": None,
            "raw_text": "",
            "confidence": 0.0,
            "reason": "no_ocr_output",
        }
    identified, score = fuzzy_match(text)
    dose_mg = extract_dose_mg(text)
    return {
        "ok": True,
        "identified": identified,
        "dose_mg": dose_mg,
        "raw_text": text[:1000],
        "confidence": round(score, 3),
    }


def main() -> int:
    image_bytes = sys.stdin.buffer.read()
    if not image_bytes:
        sys.stdout.write(json.dumps({"ok": False, "reason": "no_input"}))
        return 0
    try:
        result = scan(image_bytes)
    except Exception as exc:  # noqa: BLE001
        result = {"ok": False, "reason": "scanner_error", "detail": str(exc)[:200]}
    sys.stdout.write(json.dumps(result))
    return 0


if __name__ == "__main__":
    sys.exit(main())
