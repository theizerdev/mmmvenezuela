#!/usr/bin/env python3
"""
enhance_photo.py
CLI local del Agente Diseñador Fotográfico (100% offline, respaldo directo sin servidor HTTP).

Modos soportados:
1) Clásico:   python enhance_photo.py <input_path> <output_path> [options_json_or_path]
2) Análisis:  python enhance_photo.py --analyze <input_path>
3) Fondo IA:  python enhance_photo.py --remove-bg <input_path> <output_path> [options_json_or_path]
"""

from __future__ import annotations

import json
import os
import sys
import time
from typing import Any

from ai_engine import analyze_file, enhance_file
from designer_agent import decode_image_any, detect_primary_face, remove_background_studio, save_output_file


def _parse_options(arg: str | None) -> dict[str, Any] | None:
    if not arg:
        return None
    if os.path.isfile(arg):
        with open(arg, "r", encoding="utf-8") as f:
            return json.load(f)
    return json.loads(arg)


def main() -> None:
    args = sys.argv[1:]
    if not args:
        print(json.dumps({"success": False, "error": "Argumentos insuficientes."}, ensure_ascii=False))
        sys.exit(1)

    try:
        if args[0] == "--analyze":
            if len(args) < 2:
                raise ValueError("Uso: enhance_photo.py --analyze <input_path>")
            res = analyze_file(args[1])
            print(json.dumps(res, ensure_ascii=False))
            sys.exit(0 if res.get("success") else 1)

        if args[0] == "--remove-bg":
            if len(args) < 3:
                raise ValueError("Uso: enhance_photo.py --remove-bg <input_path> <output_path> [options_json]")
            t0 = time.time()
            opts = _parse_options(args[3] if len(args) > 3 else None) or {}
            bgr, _ = decode_image_any(args[1])
            face = detect_primary_face(bgr)
            clean_bgr, alpha = remove_background_studio(
                bgr,
                mode=str(opts.get("mode", "ensemble")),
                defringe=float(opts.get("defringe", 65.0)) / 100.0,
                edge_feather=float(opts.get("edge_feather", 1.3)),
                edge_shift=float(opts.get("edge_shift", -0.3)),
                face_info=face,
            )
            save_output_file(args[2], clean_bgr, alpha)
            print(
                json.dumps(
                    {
                        "success": True,
                        "output_path": args[2],
                        "duration_seconds": round(time.time() - t0, 2),
                        "face": face,
                    },
                    ensure_ascii=False,
                )
            )
            sys.exit(0)

        if len(args) < 2:
            raise ValueError("Uso: enhance_photo.py <input_path> <output_path> [options_json]")

        opts = _parse_options(args[2] if len(args) > 2 else None)
        res = enhance_file(args[0], args[1], opts)
        print(json.dumps(res, ensure_ascii=False))
        sys.exit(0 if res.get("success") else 1)
    except Exception as exc:
        print(json.dumps({"success": False, "error": str(exc)}, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()
