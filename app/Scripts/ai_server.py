"""
ai_server.py
Microservicio FastAPI local de Inteligencia Artificial para el sistema MMM Venezuela.
Mantiene el modelo de red neuronal precargado en memoria RAM para inferencia ultrarrápida (~1.5s - 2s).
"""

import time
import base64
import os
import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai_engine import get_model_name, get_session, enhance_cv2_image, enhance_file

app = FastAPI(title="MMM Venezuela AI Photo Enhancer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Precargar modelo en el inicio
@app.on_event("startup")
def startup_event():
    print("[AI Server] Precargando red neuronal ONNX en memoria...")
    get_session()
    print("[AI Server] Modelo cargado y listo para inferencia en http://127.0.0.1:8001")

class FileEnhanceRequest(BaseModel):
    input_path: str
    output_path: str

class Base64EnhanceRequest(BaseModel):
    data_url: str

@app.get("/health")
def health_check():
    return {
        "status": "ready",
        "engine": get_model_name(),
        "timestamp": time.time()
    }

@app.post("/enhance-file")
def enhance_file_endpoint(req: FileEnhanceRequest):
    res = enhance_file(req.input_path, req.output_path)
    if not res.get("success"):
        raise HTTPException(status_code=422, detail=res.get("error"))
    return res

@app.post("/enhance-base64")
def enhance_base64_endpoint(req: Base64EnhanceRequest):
    start = time.time()
    data_uri = req.data_url

    if "," not in data_uri:
        raise HTTPException(status_code=422, detail="Formato data_url inválido")

    try:
        header, encoded = data_uri.split(",", 1)
        img_bytes = base64.b64decode(encoded)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img_bgr is None:
            raise HTTPException(status_code=422, detail="No se pudo decodificar la imagen base64")

        enhanced_bgr = enhance_cv2_image(img_bgr)
        _, buffer = cv2.imencode(".png", enhanced_bgr)
        out_base64 = base64.b64encode(buffer).decode("utf-8")
        out_data_url = "data:image/png;base64," + out_base64

        return {
            "success": True,
            "data_url": out_data_url,
            "duration_seconds": round(time.time() - start, 2),
            "engine": get_model_name()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ai_server:app", host="127.0.0.1", port=8001, reload=False, log_level="info")
