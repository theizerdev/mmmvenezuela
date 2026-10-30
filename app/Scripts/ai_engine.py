"""
ai_engine.py
Puente de compatibilidad y fachada hacia el Agente Diseñador Fotográfico (designer_agent.py).
Mantiene compatibilidad total con invocaciones existentes mientras aprovecha GFPGAN v1.4,
RMBG-1.4, MODNet, YuNet 5-landmarks, Real-ESRGAN y calibración de estudio.
"""

from __future__ import annotations

import os
import time
from typing import Any

import numpy as np

from designer_agent import (
    analyze_photo,
    decode_image_any,
    get_available_capabilities,
    preload_studio_models,
    run_designer_pipeline,
    save_output_file,
)


def get_session():
    return preload_studio_models()


def get_model_name() -> str:
    caps = get_available_capabilities()
    return str(caps.get("engine_version", "MMM-Studio-Agent-2.0"))


def enhance_cv2_image(img_bgr: np.ndarray, options: dict[str, Any] | None = None) -> np.ndarray:
    """Mejora inteligente sobre matriz BGR/BGRA OpenCV."""
    if img_bgr is None or img_bgr.size == 0:
        raise ValueError("La fotografía no puede estar vacía.")

    bgr, alpha = decode_image_any(img_bgr)
    if options is None:
        effective_opts: dict[str, Any] = {
            "auto_pilot": True,
            "remove_bg": False,
            "auto_frame": False,
            "bg_type": "transparent" if alpha is not None else "keep",
        }
    else:
        effective_opts = dict(options)

    out_bgr, out_alpha, _ = run_designer_pipeline(bgr, alpha, effective_opts)
    if out_alpha is not None:
        a_u8 = np.clip(np.round(out_alpha * 255.0), 0, 255).astype(np.uint8)
        return np.dstack([out_bgr, a_u8])
    return out_bgr


def enhance_file(
    input_path: str,
    output_path: str,
    options: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Ejecuta el Agente Diseñador sobre un archivo de entrada y guarda el resultado."""
    start_time = time.time()

    if not os.path.isfile(input_path):
        return {"success": False, "error": f"Archivo no encontrado: {input_path}"}

    try:
        bgr, alpha = decode_image_any(input_path)
        if options is None:
            effective_opts: dict[str, Any] = {
                "auto_pilot": True,
                "remove_bg": False,
                "auto_frame": False,
                "bg_type": "transparent" if alpha is not None else "keep",
            }
        else:
            effective_opts = dict(options)

        out_bgr, out_alpha, meta = run_designer_pipeline(bgr, alpha, effective_opts)
        save_output_file(output_path, out_bgr, out_alpha)

        return {
            "success": True,
            "output_path": output_path,
            "duration_seconds": round(time.time() - start_time, 2),
            "engine": meta.get("engine", get_model_name()),
            "width": meta.get("width"),
            "height": meta.get("height"),
            "has_alpha": meta.get("has_alpha", False),
            "steps_applied": meta.get("steps_applied", []),
            "before_score": meta.get("before_score"),
            "after_score": meta.get("after_score"),
            "diagnosis": meta.get("diagnosis"),
        }
    except Exception as error:
        return {"success": False, "error": f"Error al procesar la fotografía con el Agente IA: {error}"}


def analyze_file(input_path: str) -> dict[str, Any]:
    """Analiza un archivo de imagen y retorna el diagnóstico completo del Agente Diseñador."""
    if not os.path.isfile(input_path):
        return {"success": False, "error": f"Archivo no encontrado: {input_path}"}
    try:
        bgr, alpha = decode_image_any(input_path)
        return analyze_photo(bgr, alpha)
    except Exception as error:
        return {"success": False, "error": f"Error al analizar la fotografía: {error}"}
