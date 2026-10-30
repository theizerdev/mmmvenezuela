"""
ai_server.py
Microservicio FastAPI Local del Agente Diseñador Fotográfico (MMM Studio AI v2.0).
Mantiene en memoria RAM las redes neuronales ONNX (YuNet, RMBG-1.4, MODNet, GFPGAN v1.4 y Real-ESRGAN)
para diagnóstico instantáneo (~40ms) y diseño/restauración de estudio (~1.5s - 3.5s).
"""

from __future__ import annotations

import base64
from contextlib import asynccontextmanager
import time
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_engine import analyze_file, enhance_file, get_model_name
from designer_agent import (
    analyze_photo,
    decode_image_any,
    encode_output_png,
    get_available_capabilities,
    preload_studio_models,
    remove_background_studio,
    run_designer_pipeline,
    save_output_file,
    detect_primary_face,
)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    print("[MMM Studio AI] Precargando redes neuronales ONNX en memoria RAM...")
    loaded = preload_studio_models()
    print(f"[MMM Studio AI] Modelos activos: {loaded}")
    print("[MMM Studio AI] Agente Diseñador listo en http://0.0.0.0:8001 (escuchando local y red)")
    yield


app = FastAPI(
    title="MMM Studio AI — Agente Diseñador Fotográfico",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FileEnhanceRequest(BaseModel):
    input_path: str
    output_path: str
    options: dict[str, Any] | None = None


class Base64EnhanceRequest(BaseModel):
    data_url: str
    options: dict[str, Any] | None = None


class AnalyzeRequest(BaseModel):
    data_url: str | None = None
    input_path: str | None = None


class RemoveBgRequest(BaseModel):
    data_url: str | None = None
    input_path: str | None = None
    output_path: str | None = None
    mode: str = "ensemble"
    defringe: float = 65.0
    edge_feather: float = 1.3
    edge_shift: float = -0.3


@app.get("/health")
def health_check():
    caps = get_available_capabilities()
    return {
        "status": "ready" if caps["ready"] else "degraded",
        "engine": get_model_name(),
        "models": caps["models"],
        "models_dir": caps.get("models_dir"),
        "models_dir_exists": caps.get("models_dir_exists"),
        "timestamp": time.time(),
    }


@app.get("/capabilities")
def capabilities_endpoint():
    return get_available_capabilities()


@app.post("/analyze")
def analyze_endpoint(req: AnalyzeRequest):
    try:
        if req.data_url:
            bgr, alpha = decode_image_any(req.data_url)
            return analyze_photo(bgr, alpha)
        if req.input_path:
            res = analyze_file(req.input_path)
            if not res.get("success"):
                raise HTTPException(status_code=422, detail=res.get("error"))
            return res
        raise HTTPException(status_code=422, detail="Se requiere data_url o input_path.")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error al analizar imagen: {exc}")


@app.post("/remove-background")
def remove_bg_endpoint(req: RemoveBgRequest):
    t0 = time.time()
    try:
        source = req.data_url or req.input_path
        if not source:
            raise HTTPException(status_code=422, detail="Se requiere data_url o input_path.")

        bgr, _ = decode_image_any(source)
        face_info = detect_primary_face(bgr)
        clean_bgr, alpha = remove_background_studio(
            bgr,
            mode=req.mode,
            defringe=req.defringe / 100.0,
            edge_feather=req.edge_feather,
            edge_shift=req.edge_shift,
            face_info=face_info,
        )

        if req.output_path:
            save_output_file(req.output_path, clean_bgr, alpha)
            return {
                "success": True,
                "output_path": req.output_path,
                "duration_seconds": round(time.time() - t0, 2),
                "engine": get_model_name(),
            }

        png_bytes = encode_output_png(clean_bgr, alpha)
        out_data_url = "data:image/png;base64," + base64.b64encode(png_bytes).decode("utf-8")
        return {
            "success": True,
            "data_url": out_data_url,
            "duration_seconds": round(time.time() - t0, 2),
            "engine": get_model_name(),
            "face": face_info,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error removiendo fondo: {exc}")


@app.post("/studio-process")
def studio_process_endpoint(req: Base64EnhanceRequest):
    t0 = time.time()
    try:
        bgr, alpha = decode_image_any(req.data_url)
        out_bgr, out_alpha, meta = run_designer_pipeline(bgr, alpha, req.options or {"auto_pilot": True})
        png_bytes = encode_output_png(out_bgr, out_alpha)
        out_data_url = "data:image/png;base64," + base64.b64encode(png_bytes).decode("utf-8")
        return {
            "success": True,
            "data_url": out_data_url,
            "duration_seconds": round(time.time() - t0, 2),
            **meta,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error en Agente Diseñador: {exc}")


@app.post("/enhance-file")
def enhance_file_endpoint(req: FileEnhanceRequest):
    res = enhance_file(req.input_path, req.output_path, req.options)
    if not res.get("success"):
        raise HTTPException(status_code=422, detail=res.get("error"))
    return res


@app.post("/enhance-base64")
def enhance_base64_endpoint(req: Base64EnhanceRequest):
    start = time.time()
    try:
        bgr, alpha = decode_image_any(req.data_url)
        opts = req.options or {
            "auto_pilot": True,
            "remove_bg": False,
            "auto_frame": False,
            "bg_type": "transparent" if alpha is not None else "keep",
        }
        out_bgr, out_alpha, meta = run_designer_pipeline(bgr, alpha, opts)
        png_bytes = encode_output_png(out_bgr, out_alpha)
        out_data_url = "data:image/png;base64," + base64.b64encode(png_bytes).decode("utf-8")
        return {
            "success": True,
            "data_url": out_data_url,
            "duration_seconds": round(time.time() - start, 2),
            **meta,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error al procesar: {exc}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("ai_server:app", host="0.0.0.0", port=8001, reload=False, log_level="warning")
