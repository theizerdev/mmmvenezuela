"""
download_models.py
Descarga automaticamente todos los modelos neuronales ONNX de MMM Studio AI
directamente desde HuggingFace a storage/app/ai_models/.
"""

import os
import shutil
import sys

try:
    from huggingface_hub import hf_hub_download
except ImportError:
    print("Instalando huggingface_hub...")
    os.system(f"{sys.executable} -m pip install huggingface_hub")
    from huggingface_hub import hf_hub_download

MODELS_DIR = os.getenv(
    "AI_MODELS_DIR",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "storage", "app", "ai_models"))
)
os.makedirs(MODELS_DIR, exist_ok=True)

MODELS = [
    {
        "name": "YuNet Face Detector (5 Landmarks)",
        "repo": "opencv/face_detection_yunet",
        "file": "face_detection_yunet_2023mar.onnx",
        "target": "face_detection_yunet_2023mar.onnx",
    },
    {
        "name": "MODNet Portrait Matting (Cabello HD)",
        "repo": "Xenova/modnet",
        "file": "onnx/model.onnx",
        "target": "modnet_portrait.onnx",
    },
    {
        "name": "RMBG-1.4 Recorte de Fondo",
        "repo": "briaai/RMBG-1.4",
        "file": "onnx/model.onnx",
        "target": "rmbg_1_4.onnx",
    },
    {
        "name": "GFPGAN v1.4 Restauracion Facial",
        "repo": "HowToSD/GFPGAN-ONNX",
        "file": "GFPGANv1.4.onnx",
        "target": "gfpgan14.onnx",
    },
    {
        "name": "Real-ESRGAN General x4",
        "repo": "vlad-grig/realesr-general-x4v3-onnx",
        "file": "onnx/model.onnx",
        "target": "realesr_general_x4.onnx",
    },
    {
        "name": "Real-ESRGAN Photo x4",
        "repo": "smile-forge/real-esrgan-gfpgan-onnx",
        "file": "upscaler-x4/upscaler-x4.onnx",
        "target": "realesrgan_x4_photo.onnx",
    },
]

print(f"Directorio de modelos: {MODELS_DIR}\n")
for m in MODELS:
    dst = os.path.join(MODELS_DIR, m["target"])
    if os.path.isfile(dst) and os.path.getsize(dst) > 10000:
        size_mb = round(os.path.getsize(dst) / 1024 / 1024, 1)
        print(f"OK [Ya existe]: {m['target']} ({size_mb} MB)")
        continue
    print(f"Descargando {m['name']} ({m['target']})...")
    try:
        src = hf_hub_download(repo_id=m["repo"], filename=m["file"])
        shutil.copy2(src, dst)
        size_mb = round(os.path.getsize(dst) / 1024 / 1024, 1)
        print(f"  OK Descargado: {m['target']} ({size_mb} MB)")
    except Exception as e:
        print(f"  ERROR en {m['name']}: {e}")

print("\nVerificando modelos descargados...")
for m in MODELS:
    p = os.path.join(MODELS_DIR, m["target"])
    status = "OK" if os.path.isfile(p) and os.path.getsize(p) > 10000 else "FALTA"
    print(f"  [{status}] {m['target']}")

print("\nListo!")

