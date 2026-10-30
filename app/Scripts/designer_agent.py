"""
designer_agent.py
Agente Diseñador Fotográfico Propio (MMM Studio AI) — 100% Local & Offline (ONNX + OpenCV).

Capacidades de nivel Estudio Profesional (Canva AI / Picsart AI):
1. Auditoría y Diagnóstico Fotográfico Inteligente (Exposición en rostro, Balance de Blancos,
   Nitidez Laplaciana, Ruido ISO/JPEG, Landmarks Biométricos de 5 puntos e Inclinación Ocular).
2. Receta Adaptativa "Auto-Diseñador 1-Clic" calculada dinámicamente según las carencias reales de cada foto.
3. Remoción de Fondo de Alta Precisión (Ensamble BRIA RMBG-1.4 + MODNet Portrait Alpha Matting +
   Guided Filter a resolución completa + Descontaminación de Halos de Color / Defringe).
4. Restauración Facial Generativa con Fidelidad de Identidad (GFPGAN v1.4 con alineación canónica
   FFHQ de 5 puntos, preservación cromática LAB de tono de piel y realce selectivo de ojos).
5. Súper-Resolución Inteligente por Bloques (Real-ESRGAN x4 preservando canal Alfa RGBA).
6. Calibración Fotográfica de Estudio (Temperatura, Matiz, Exposición con compresión suave de altas luces,
   Levantamiento de Sombras / Relight, Recuperación de Brillos en frente/gafas, Vibrancia con protección
   de piel, Separación de Frecuencias para piel natural, Claridad y Nitidez LAB sin halos).
7. Encuadre Biométrico Oficial para Credencial MMM (Enderezado de horizonte ocular y proporción 374×562 / 748×1124).
8. Composición de Escenarios de Estudio (Transparente, Plateado Oficial, Blanco Estudio, Gris Perla,
   Azul Institucional, Celeste, Marfil, Bokeh DSLR f/1.4 y Sombra de Estudio 3D).
"""

from __future__ import annotations

import base64
import math
import os
import threading
import time
from typing import Any

os.environ.setdefault("ORT_LOG_LEVEL", "3")

import cv2
import numpy as np
import onnxruntime as ort

try:
    ort.set_default_logger_severity(3)
except Exception:
    pass

try:
    cv2.setLogLevel(0)
except Exception:
    pass


# Directorio de modelos ONNX (con soporte de variable de entorno y carpetas alternativas)
_default_model_dir = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "storage", "app", "ai_models")
)
MODEL_DIR = os.getenv("AI_MODELS_DIR", _default_model_dir)
if not os.path.isdir(MODEL_DIR):
    for candidate in [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "ai_models")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ai_models")),
        "/var/www/mmmvenezuela/storage/app/ai_models",
        "/var/www/html/storage/app/ai_models",
    ]:
        if os.path.isdir(candidate):
            MODEL_DIR = candidate
            break

# Proporción oficial del marco fotográfico en la credencial MMM (85×54mm):
# Vista UI: 187×281 px | Alta resolución 2x: 374×562 px | Master Studio 4x: 748×1124 px
CREDENTIAL_ASPECT = 374.0 / 562.0
MASTER_WIDTH = 748
MASTER_HEIGHT = 1124

# Coordenadas canónicas FFHQ 512×512 para alineación facial de 5 landmarks en GFPGAN v1.4:
# Orden: [ojo_izq_imagen, ojo_der_imagen, nariz, boca_izq_imagen, boca_der_imagen]
FFHQ_TEMPLATE_512 = np.array(
    [
        [192.98138, 239.94708],
        [318.90277, 240.19360],
        [256.63416, 314.01935],
        [201.26117, 371.41043],
        [313.08905, 371.15118],
    ],
    dtype=np.float32,
)

_session_lock = threading.Lock()
_sessions: dict[str, ort.InferenceSession] = {}


def _get_ort_session(filename: str) -> ort.InferenceSession | None:
    """Obtiene o inicializa de forma perezosa y thread-safe una sesión ONNX en RAM."""
    path = os.path.join(MODEL_DIR, filename)
    if not os.path.isfile(path):
        return None

    with _session_lock:
        if filename not in _sessions:
            opts = ort.SessionOptions()
            opts.log_severity_level = 3
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            providers = ["CPUExecutionProvider"]
            available = ort.get_available_providers()
            if "CUDAExecutionProvider" in available:
                providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]
            elif "DmlExecutionProvider" in available:
                providers = ["DmlExecutionProvider", "CPUExecutionProvider"]

            _sessions[filename] = ort.InferenceSession(path, sess_options=opts, providers=providers)
        return _sessions[filename]


def preload_studio_models() -> dict[str, bool]:
    """Precarga los modelos principales en RAM al iniciar el microservicio FastAPI."""
    loaded = {}
    for key, fname in [
        ("yunet", "face_detection_yunet_2023mar.onnx"),
        ("rmbg", "rmbg_1_4.onnx"),
        ("modnet", "modnet_portrait.onnx"),
        ("gfpgan", "gfpgan14.onnx"),
        ("upscaler_fast", "realesr_general_x4.onnx"),
    ]:
        if key == "yunet":
            loaded[key] = os.path.isfile(os.path.join(MODEL_DIR, fname))
        else:
            loaded[key] = _get_ort_session(fname) is not None
    return loaded


def get_available_capabilities() -> dict[str, Any]:
    """Devuelve el inventario de motores neuronales disponibles localmente."""
    files = {
        "face_landmarks_yunet": os.path.isfile(os.path.join(MODEL_DIR, "face_detection_yunet_2023mar.onnx")),
        "bg_rmbg_1_4": os.path.isfile(os.path.join(MODEL_DIR, "rmbg_1_4.onnx")),
        "bg_modnet_hair": os.path.isfile(os.path.join(MODEL_DIR, "modnet_portrait.onnx")),
        "face_gfpgan_v1_4": os.path.isfile(os.path.join(MODEL_DIR, "gfpgan14.onnx")),
        "upscale_fast_x4": os.path.isfile(os.path.join(MODEL_DIR, "realesr_general_x4.onnx")),
        "upscale_ultra_x4": os.path.isfile(os.path.join(MODEL_DIR, "realesrgan_x4_photo.onnx")),
    }
    return {
        "engine_version": "MMM-Studio-Agent-2.0",
        "models_dir": MODEL_DIR,
        "models_dir_exists": os.path.isdir(MODEL_DIR),
        "models": files,
        "ready": any(files.values()),
    }


# ==============================================================================
# UTILIDADES DE IMAGEN Y DECODIFICACIÓN RGBA
# ==============================================================================

def decode_image_any(source: str | bytes | np.ndarray) -> tuple[np.ndarray, np.ndarray | None]:
    """
    Decodifica ruta en disco, bytes o data_url Base64 preservando el canal Alfa si existe.
    Retorna (bgr_uint8, alpha_float32_0_to_1_or_None).
    """
    if isinstance(source, np.ndarray):
        raw = source.copy()
    elif isinstance(source, (bytes, bytearray)):
        arr = np.frombuffer(source, dtype=np.uint8)
        raw = cv2.imdecode(arr, cv2.IMREAD_UNCHANGED)
    elif isinstance(source, str):
        if source.startswith("data:image/"):
            if "," not in source:
                raise ValueError("Formato data_url inválido.")
            _, encoded = source.split(",", 1)
            img_bytes = base64.b64decode(encoded)
            arr = np.frombuffer(img_bytes, dtype=np.uint8)
            raw = cv2.imdecode(arr, cv2.IMREAD_UNCHANGED)
        else:
            if not os.path.isfile(source):
                raise FileNotFoundError(f"Archivo no encontrado: {source}")
            # Soportar rutas con caracteres especiales / acentos en Windows
            arr = np.fromfile(source, dtype=np.uint8)
            raw = cv2.imdecode(arr, cv2.IMREAD_UNCHANGED)
    else:
        raise ValueError("Tipo de imagen no soportado.")

    if raw is None or raw.size == 0:
        raise ValueError("No se pudo decodificar la fotografía.")

    if raw.dtype == np.uint16:
        raw = (raw / 257.0).astype(np.uint8)
    elif raw.dtype != np.uint8:
        raw = np.clip(raw, 0, 255).astype(np.uint8)

    if raw.ndim == 2:
        return cv2.cvtColor(raw, cv2.COLOR_GRAY2BGR), None

    if raw.shape[2] == 4:
        bgr = raw[:, :, :3].copy()
        alpha = raw[:, :, 3].astype(np.float32) / 255.0
        # Si el alfa es completamente opaco en toda la imagen, tratar como RGB normal
        if float(alpha.min()) >= 0.995:
            return bgr, None
        # Evitar artefactos negros en píxeles transparentes rellenando con color vecino suave
        zero_mask = (alpha < 0.02).astype(np.uint8)
        if np.any(zero_mask) and not np.all(zero_mask):
            small_bgr = cv2.resize(bgr, (max(1, bgr.shape[1] // 4), max(1, bgr.shape[0] // 4)))
            small_mask = cv2.resize(zero_mask, (small_bgr.shape[1], small_bgr.shape[0]), interpolation=cv2.INTER_NEAREST)
            inpainted_small = cv2.inpaint(small_bgr, small_mask, 3, cv2.INPAINT_TELEA)
            inpainted = cv2.resize(inpainted_small, (bgr.shape[1], bgr.shape[0]), interpolation=cv2.INTER_LINEAR)
            bgr = np.where(zero_mask[:, :, None] > 0, inpainted, bgr)
        return bgr, alpha

    return raw[:, :, :3].copy(), None


def encode_output_png(bgr: np.ndarray, alpha: np.ndarray | None = None) -> bytes:
    """Codifica imagen BGR + Alfa opcional en bytes PNG sin pérdida."""
    if alpha is not None:
        a_u8 = np.clip(np.round(alpha * 255.0), 0, 255).astype(np.uint8)
        bgra = np.dstack([bgr, a_u8])
        ok, buf = cv2.imencode(".png", bgra)
    else:
        ok, buf = cv2.imencode(".png", bgr)
    if not ok:
        raise RuntimeError("No se pudo codificar la imagen PNG de salida.")
    return buf.tobytes()


def save_output_file(output_path: str, bgr: np.ndarray, alpha: np.ndarray | None = None) -> None:
    """Guarda en disco soportando rutas Unicode en Windows."""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    ext = os.path.splitext(output_path)[1].lower()
    if ext in (".jpg", ".jpeg") and alpha is None:
        ok, buf = cv2.imencode(".jpg", bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 96])
        if not ok:
            raise RuntimeError("Error codificando JPEG.")
        buf.tofile(output_path)
    else:
        png_bytes = encode_output_png(bgr, alpha)
        with open(output_path, "wb") as f:
            f.write(png_bytes)


# ==============================================================================
# 1. DETECTOR BIOMÉTRICO DE 5 LANDMARKS (YUNET + FALLBACK HAAR)
# ==============================================================================

def detect_primary_face(bgr: np.ndarray) -> dict[str, Any] | None:
    """
    Detecta el rostro principal y sus 5 puntos biométricos exactos usando YuNet ONNX.
    Retorna bbox [x, y, w, h], landmarks_5 (orden FFHQ), ángulo ocular roll_deg y confianza.
    """
    h, w = bgr.shape[:2]
    if h < 24 or w < 24:
        return None

    yunet_path = os.path.join(MODEL_DIR, "face_detection_yunet_2023mar.onnx")
    if os.path.isfile(yunet_path) and hasattr(cv2, "FaceDetectorYN"):
        try:
            max_det_dim = 960
            scale = min(1.0, max_det_dim / max(h, w))
            det_w = max(32, int(round(w * scale)))
            det_h = max(32, int(round(h * scale)))
            det_img = cv2.resize(bgr, (det_w, det_h), interpolation=cv2.INTER_AREA) if scale < 1.0 else bgr

            detector = cv2.FaceDetectorYN.create(
                yunet_path, "", (det_w, det_h), 0.45, 0.3, 50
            )
            _, faces = detector.detect(det_img)

            if faces is not None and len(faces) > 0:
                best_face = None
                best_score = -1.0
                inv = 1.0 / scale

                for f in faces:
                    fx, fy, fw, fh = float(f[0]) * inv, float(f[1]) * inv, float(f[2]) * inv, float(f[3]) * inv
                    conf = float(f[14])
                    cx = (fx + fw * 0.5) / w
                    cy = (fy + fh * 0.5) / h
                    center_bonus = 1.0 - 0.35 * abs(cx - 0.5) - 0.25 * max(0.0, cy - 0.65)
                    area_score = (fw * fh) / float(w * h)
                    score = area_score * conf * max(0.3, center_bonus)
                    if score > best_score:
                        best_score = score
                        best_face = (f, inv, conf)

                if best_face is not None:
                    f, inv, conf = best_face
                    bx, by, bw, bh = f[0] * inv, f[1] * inv, f[2] * inv, f[3] * inv
                    pts = np.array(
                        [
                            [f[4] * inv, f[5] * inv],
                            [f[6] * inv, f[7] * inv],
                            [f[8] * inv, f[9] * inv],
                            [f[10] * inv, f[11] * inv],
                            [f[12] * inv, f[13] * inv],
                        ],
                        dtype=np.float32,
                    )
                    # Garantizar orden izquierda-a-derecha en imagen
                    if pts[0, 0] > pts[1, 0]:
                        pts[[0, 1]] = pts[[1, 0]]
                    if pts[3, 0] > pts[4, 0]:
                        pts[[3, 4]] = pts[[4, 3]]

                    dx = float(pts[1, 0] - pts[0, 0])
                    dy = float(pts[1, 1] - pts[0, 1])
                    roll_deg = math.degrees(math.atan2(dy, max(1e-5, dx)))
                    inter_ocular = math.hypot(dx, dy)
                    eye_center = ((pts[0] + pts[1]) * 0.5).tolist()

                    return {
                        "bbox": [round(float(bx), 1), round(float(by), 1), round(float(bw), 1), round(float(bh), 1)],
                        "landmarks": pts.round(2).tolist(),
                        "eye_center": [round(eye_center[0], 1), round(eye_center[1], 1)],
                        "inter_ocular_px": round(inter_ocular, 1),
                        "roll_deg": round(roll_deg, 2),
                        "confidence": round(conf, 3),
                        "has_5_landmarks": True,
                    }
        except Exception:
            pass

    # Fallback clásico Haar Cascade si YuNet no detectó rostro
    cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
    detector = cv2.CascadeClassifier(cascade_path)
    if not detector.empty():
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        min_sz = max(24, min(h, w) // 10)
        faces = detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(min_sz, min_sz))
        if len(faces) > 0:
            fx, fy, fw, fh = max(faces, key=lambda r: r[2] * r[3])
            eye_y = fy + fh * 0.38
            pts = np.array(
                [
                    [fx + fw * 0.32, eye_y],
                    [fx + fw * 0.68, eye_y],
                    [fx + fw * 0.50, fy + fh * 0.58],
                    [fx + fw * 0.36, fy + fh * 0.76],
                    [fx + fw * 0.64, fy + fh * 0.76],
                ],
                dtype=np.float32,
            )
            return {
                "bbox": [float(fx), float(fy), float(fw), float(fh)],
                "landmarks": pts.round(2).tolist(),
                "eye_center": [round(float(fx + fw * 0.5), 1), round(float(eye_y), 1)],
                "inter_ocular_px": round(float(fw * 0.36), 1),
                "roll_deg": 0.0,
                "confidence": 0.65,
                "has_5_landmarks": False,
            }

    return None


def compute_biometric_framing_suggestion(
    width: int,
    height: int,
    face_info: dict[str, Any] | None,
) -> dict[str, Any]:
    """
    Calcula los parámetros exactos de encuadre biométrico para el lienzo del Carnet MMM
    (187×281 UI / 374×562 2x), ubicando la línea ocular al ~39.5% de la altura y centrando el eje facial.
    También devuelve las sugerencias equivalentes de scale, panX, panY y rotation para el estudio React.
    """
    if not face_info:
        return {
            "available": False,
            "rotation_deg": 0.0,
            "ui_scale": 1.0,
            "ui_pan_x": 0.0,
            "ui_pan_y": 0.0,
            "crop_box": [0, 0, width, height],
        }

    bx, by, bw, bh = face_info["bbox"]
    eye_cx, eye_cy = face_info["eye_center"]
    roll_deg = float(face_info["roll_deg"])

    # Corrección suave de inclinación si supera 0.8° y es razonable (<= 16°)
    suggested_rot = -roll_deg if 0.8 <= abs(roll_deg) <= 16.0 else 0.0

    # Altura ideal del cuadro de carnet en función del alto facial (el rostro ocupa ~40.5% de la altura total
    # para dejar aire sobre el cabello y mostrar cuello/corbata/hombros con porte ministerial)
    ideal_crop_h = bh / 0.405

    # Equivalencia con object-cover: nunca permitir que crop_h supere la cobertura máxima de la imagen,
    # para que ui_scale >= 1.0 y el borde inferior del saco/hombros JAMÁS quede cortado flotando arriba.
    img_ratio = width / max(1.0, float(height))
    if img_ratio > CREDENTIAL_ASPECT:
        cover_h_in_src = float(height)
    else:
        cover_h_in_src = float(width) / CREDENTIAL_ASPECT

    min_crop_h = max(120.0, cover_h_in_src * 0.42)
    max_crop_h = cover_h_in_src
    crop_h = float(np.clip(ideal_crop_h, min_crop_h, max_crop_h))
    crop_w = crop_h * CREDENTIAL_ASPECT

    # Posicionar ojos al 39.5% desde el borde superior del carnet, anclando bordes dentro de la imagen
    # para no dejar franjas vacías debajo de los hombros ni en los costados.
    target_eye_ratio_y = 0.395
    crop_x = float(np.clip(eye_cx - crop_w * 0.50, 0.0, max(0.0, float(width) - crop_w)))
    crop_y = float(np.clip(eye_cy - crop_h * target_eye_ratio_y, 0.0, max(0.0, float(height) - crop_h)))

    ui_scale = float(np.clip(cover_h_in_src / max(1.0, crop_h), 1.0, 2.4))

    # Centro deseado en coordenadas de imagen original:
    desired_cx = crop_x + crop_w * 0.5
    desired_cy = crop_y + crop_h * 0.5
    offset_src_x = (width * 0.5 - desired_cx)
    offset_src_y = (height * 0.5 - desired_cy)

    # En PastorPhotoAdjustModal: canvas base = 374×562, drawH_base = 562 (si más ancha) o 374/img_ratio
    if img_ratio > CREDENTIAL_ASPECT:
        px_per_src = 562.0 / max(1.0, float(height))
    else:
        px_per_src = 374.0 / max(1.0, float(width))

    # En canvas: translate(W/2 + panX * 2, H/2 + panY * 2) antes de scale(ui_scale)
    ui_pan_x = (offset_src_x * px_per_src * ui_scale) / 2.0
    ui_pan_y = (offset_src_y * px_per_src * ui_scale) / 2.0

    return {
        "available": True,
        "rotation_deg": round(suggested_rot, 2),
        "ui_scale": round(ui_scale, 3),
        "ui_pan_x": round(float(np.clip(ui_pan_x, -160.0, 160.0)), 1),
        "ui_pan_y": round(float(np.clip(ui_pan_y, -160.0, 160.0)), 1),
        "crop_box": [round(crop_x, 1), round(crop_y, 1), round(crop_w, 1), round(crop_h, 1)],
    }


# ==============================================================================
# 2. AUDITORÍA Y DIAGNÓSTICO INTELIGENTE DEL AGENTE DISEÑADOR
# ==============================================================================

def analyze_photo(bgr: np.ndarray, alpha: np.ndarray | None = None) -> dict[str, Any]:
    """
    Inspecciona minuciosamente la fotografía y genera:
    - Score global de calidad para carnet (0–100)
    - Diagnósticos específicos en español
    - Receta óptima personalizada de parámetros para el modo "Auto-Diseñador 1-Clic"
    """
    t0 = time.time()
    h, w = bgr.shape[:2]
    face = detect_primary_face(bgr)

    # Región de medición principal: priorizar rostro detectado para no engañar al fotómetro con fondos blancos/oscuros
    if face:
        bx, by, bw, bh = [int(round(v)) for v in face["bbox"]]
        x0 = max(0, bx)
        y0 = max(0, by)
        x1 = min(w, bx + max(1, bw))
        y1 = min(h, by + max(1, bh))
        roi_bgr = bgr[y0:y1, x0:x1] if (x1 > x0 and y1 > y0) else bgr
    else:
        x0, x1 = int(w * 0.2), int(w * 0.8)
        y0, y1 = int(h * 0.12), int(h * 0.72)
        roi_bgr = bgr[y0:y1, x0:x1] if (x1 > x0 and y1 > y0) else bgr

    roi_lab = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2LAB)
    l_chan, a_chan, b_chan = cv2.split(roi_lab)
    l_f = l_chan.astype(np.float32)

    p10, p50, p90, p98 = [float(v) for v in np.percentile(l_f, [10, 50, 90, 98])]
    dyn_range = p90 - p10
    glare_pct = float(np.mean(l_f > 245.0) * 100.0)
    shadow_pct = float(np.mean(l_f < 32.0) * 100.0)

    # Nitidez perceptual en rostro (Varianza Laplaciana normalizada a escala 256px)
    norm_roi = cv2.resize(roi_bgr, (256, 256), interpolation=cv2.INTER_AREA)
    norm_gray = cv2.cvtColor(norm_roi, cv2.COLOR_BGR2GRAY)
    lap_var = float(cv2.Laplacian(norm_gray, cv2.CV_64F).var())
    sharpness_score = int(round(np.clip((math.log1p(lap_var) / math.log1p(420.0)) * 100.0, 5, 100)))

    # Estimación de ruido de alta frecuencia (MAD residual 3x3)
    blur3 = cv2.GaussianBlur(norm_gray.astype(np.float32), (3, 3), 0)
    noise_sigma = float(np.median(np.abs(norm_gray.astype(np.float32) - blur3)) / 0.6745)

    # Estimación de dominante de color (Balance de Blancos en iluminantes neutros / piel)
    full_lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
    fl, fa, fb = cv2.split(full_lab)
    neutral_mask = (fl > 55) & (fl < 235)
    if alpha is not None:
        neutral_mask = neutral_mask & (alpha > 0.5)

    if np.any(neutral_mask):
        # En OpenCV LAB uint8: 128 es neutro. En retratos cálidos naturales a~133, b~136.
        mean_a = float(np.mean(fa[neutral_mask])) - 128.0
        mean_b = float(np.mean(fb[neutral_mask])) - 128.0
    else:
        mean_a, mean_b = 0.0, 0.0

    # Complejidad del fondo (bordes superior/izquierdo/derecho)
    has_alpha = alpha is not None
    bg_strip_pixels = np.concatenate(
        [
            bgr[: max(4, int(h * 0.08)), :, :].reshape(-1, 3),
            bgr[: int(h * 0.6), : max(4, int(w * 0.08)), :].reshape(-1, 3),
            bgr[: int(h * 0.6), max(0, w - max(4, int(w * 0.08))) :, :].reshape(-1, 3),
        ],
        axis=0,
    ).astype(np.float32)
    bg_std = float(np.mean(np.std(bg_strip_pixels, axis=0))) if bg_strip_pixels.size > 0 else 0.0
    bg_is_clean_studio = has_alpha or (bg_std < 11.5)

    # --- Construir hallazgos y receta personalizada ---
    findings: list[dict[str, str]] = []
    penalties = 0

    rec_exposure = 0
    rec_shadows = 8
    rec_highlights = -6
    rec_contrast = 6
    rec_temp = 0
    rec_tint = 0
    rec_vibrance = 8
    rec_clarity = 10
    rec_sharpness = 18
    rec_denoise = 10
    rec_skin_smooth = 18
    rec_eye_clarity = 25
    rec_face_restore = True
    rec_face_strength = 62
    rec_upscale = False

    # 1. Resolución
    min_side = min(h, w)
    if min_side < 360 or h < 500:
        penalties += 22
        rec_upscale = True
        rec_face_strength = 72
        findings.append({
            "type": "warning",
            "label": "Baja resolución",
            "detail": f"Dimensiones reducidas ({w}×{h} px). Se aumentará la resolución y se reconstruirán los detalles del rostro.",
        })
    elif h < 540:
        penalties += 7
        rec_upscale = True
        findings.append({
            "type": "info",
            "label": "Resolución media-baja",
            "detail": f"Tamaño {w}×{h} px. Se escalará a calidad de impresión 300+ DPI.",
        })
    else:
        findings.append({
            "type": "ok",
            "label": "Resolución óptima",
            "detail": f"Fotografía de buena densidad ({w}×{h} px).",
        })

    # 2. Nitidez
    if lap_var < 55:
        penalties += 20
        rec_face_strength = max(rec_face_strength, 76)
        rec_sharpness = 32
        rec_clarity = 18
        findings.append({
            "type": "warning",
            "label": "Desenfoque facial detectado",
            "detail": "Falta definición en ojos y rasgos. Se restaurarán los detalles del rostro.",
        })
    elif lap_var < 130:
        penalties += 8
        rec_face_strength = max(rec_face_strength, 65)
        rec_sharpness = 24

    # 3. Iluminación y Sombras en el rostro (respetando todos los tonos de piel)
    if p90 < 142 and p50 < 92:
        penalties += 18
        under_amount = (150.0 - p90) / 150.0
        rec_exposure = int(round(np.clip(under_amount * 42.0, 10, 32)))
        rec_shadows = int(round(np.clip(22 + under_amount * 35.0, 18, 48)))
        findings.append({
            "type": "warning",
            "label": "Rostro subexpuesto / oscuro",
            "detail": "Falta luz frontal en el rostro. Se iluminará y se abrirán las sombras.",
        })
    elif shadow_pct > 22.0:
        penalties += 10
        rec_shadows = 32
        findings.append({
            "type": "info",
            "label": "Sombras duras en rostro o traje",
            "detail": "Contraluz o sombras marcadas detectadas. Se equilibrará el rango dinámico.",
        })

    if glare_pct > 4.5 or p98 > 248:
        penalties += 10
        rec_highlights = int(round(np.clip(-18 - glare_pct * 2.2, -55, -18)))
        if p50 > 175:
            rec_exposure = min(rec_exposure, -10)
        findings.append({
            "type": "info",
            "label": "Brillos altos / reflejo de flash",
            "detail": "Altas luces intensas en piel o gafas. Se suavizarán los brillos especulares.",
        })

    if dyn_range < 65:
        penalties += 6
        rec_contrast = 16
        rec_clarity = 16

    # 4. Dominante de color (Temperatura / Matiz)
    # Piel + ropa neutra suele tener ligero calor (+5 en b*). Si supera +13 es bombillo amarillo; si < +0 es fría/azulada.
    warm_excess = mean_b - 6.5
    if warm_excess > 7.5:
        penalties += 8
        rec_temp = int(round(np.clip(-warm_excess * 2.1, -36, -8)))
        findings.append({
            "type": "info",
            "label": "Dominante cálida / amarillenta",
            "detail": "Luz interior cálida detectada. Se neutralizará el balance de blancos.",
        })
    elif warm_excess < -6.5:
        penalties += 8
        rec_temp = int(round(np.clip(-warm_excess * 2.0, 8, 32)))
        findings.append({
            "type": "info",
            "label": "Dominante fría / azulada",
            "detail": "Tono frío detectado. Se aportará calidez natural de retrato.",
        })

    tint_excess = mean_a - 4.5
    if abs(tint_excess) > 6.5:
        rec_tint = int(round(np.clip(-tint_excess * 1.8, -24, 24)))

    # 5. Ruido ISO / Compresión WhatsApp
    if noise_sigma > 4.2:
        penalties += 10
        rec_denoise = int(round(np.clip(noise_sigma * 6.5, 22, 58)))
        findings.append({
            "type": "info",
            "label": "Ruido o compresión de imagen",
            "detail": "Se aplicará limpieza selectiva de crominancia y luminancia.",
        })

    # 6. Fondo y Encuadre Biométrico
    if not bg_is_clean_studio:
        penalties += 12
        findings.append({
            "type": "info",
            "label": "Fondo no uniforme",
            "detail": "Se recomienda recortar el fondo para lucir mejor en el marco oficial.",
        })

    biometric = compute_biometric_framing_suggestion(w, h, face)
    if face:
        if abs(face["roll_deg"]) >= 1.8:
            penalties += 6
            findings.append({
                "type": "info",
                "label": f"Inclinación facial ({face['roll_deg']:+.1f}°)",
                "detail": "El encuadre biométrico nivelará automáticamente la línea de los ojos.",
            })
    else:
        penalties += 15
        rec_face_restore = False
        findings.append({
            "type": "warning",
            "label": "Rostro frontal no detectado con claridad",
            "detail": "Verifica que el pastor mire de frente. Se aplicará una mejora general.",
        })

    quality_score = int(np.clip(100 - penalties, 18, 99))
    if quality_score >= 85:
        grade = "Excelente"
    elif quality_score >= 70:
        grade = "Buena"
    elif quality_score >= 52:
        grade = "Mejorable"
    else:
        grade = "Requiere Restauración"

    recommended_params = {
        "remove_bg": not bg_is_clean_studio and not has_alpha,
        "matting_mode": "ensemble",
        "defringe": 65,
        "edge_feather": 1.4,
        "edge_shift": -0.4,
        "face_restore": rec_face_restore,
        "face_strength": rec_face_strength,
        "eye_clarity": rec_eye_clarity,
        "skin_smooth": rec_skin_smooth,
        "upscale": rec_upscale,
        "upscale_mode": "fast",
        "auto_frame": bool(face and (abs(face["roll_deg"]) >= 1.5 or abs(biometric["ui_scale"] - 1.0) > 0.14)),
        "exposure": rec_exposure,
        "brightness": 0,
        "contrast": rec_contrast,
        "shadows": rec_shadows,
        "highlights": rec_highlights,
        "temperature": rec_temp,
        "tint": rec_tint,
        "vibrance": rec_vibrance,
        "saturation": 0,
        "clarity": rec_clarity,
        "sharpness": rec_sharpness,
        "denoise": rec_denoise,
        "bg_type": "transparent" if (not bg_is_clean_studio or has_alpha) else "keep",
        "drop_shadow": 24 if (not bg_is_clean_studio or has_alpha) else 0,
    }

    return {
        "success": True,
        "quality_score": quality_score,
        "grade": grade,
        "dimensions": {"width": w, "height": h, "has_alpha": has_alpha},
        "metrics": {
            "sharpness": sharpness_score,
            "laplacian_var": round(lap_var, 1),
            "noise_sigma": round(noise_sigma, 2),
            "face_luma_median": round(p50, 1),
            "dynamic_range": round(dyn_range, 1),
            "glare_pct": round(glare_pct, 2),
            "warm_cast": round(warm_excess, 2),
            "bg_clean": bg_is_clean_studio,
        },
        "face": face,
        "biometric": biometric,
        "findings": findings,
        "recommended_params": recommended_params,
        "duration_ms": int(round((time.time() - t0) * 1000)),
    }


# ==============================================================================
# 3. REMOCIÓN DE FONDO DE ESTUDIO (RMBG-1.4 + MODNET CABELLO + GUIDED FILTER + DEFRINGE)
# ==============================================================================

def _guided_filter_gray_by_color(guide_bgr: np.ndarray, src_alpha: np.ndarray, radius: int = 6, eps: float = 1e-3) -> np.ndarray:
    """
    Fast Guided Filter (He et al.) guiado por luminancia y bordes de alta resolución.
    Alinea la máscara neuronal a los bordes exactos de hebras de cabello, gafas y solapas del traje.
    """
    guide = cv2.cvtColor(guide_bgr, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
    p = src_alpha.astype(np.float32)
    ksize = (2 * radius + 1, 2 * radius + 1)

    mean_I = cv2.boxFilter(guide, cv2.CV_32F, ksize)
    mean_p = cv2.boxFilter(p, cv2.CV_32F, ksize)
    mean_Ip = cv2.boxFilter(guide * p, cv2.CV_32F, ksize)
    cov_Ip = mean_Ip - mean_I * mean_p

    mean_II = cv2.boxFilter(guide * guide, cv2.CV_32F, ksize)
    var_I = mean_II - mean_I * mean_I

    a = cov_Ip / (var_I + eps)
    b = mean_p - a * mean_I

    mean_a = cv2.boxFilter(a, cv2.CV_32F, ksize)
    mean_b = cv2.boxFilter(b, cv2.CV_32F, ksize)

    q = mean_a * guide + mean_b
    return np.clip(q, 0.0, 1.0)


def _infer_rmbg_matte(bgr: np.ndarray) -> np.ndarray | None:
    """Ejecuta BRIA RMBG-1.4 (1024×1024) con normalización [-1, 1] exacta (mean=0.5, std=0.5)."""
    sess = _get_ort_session("rmbg_1_4.onnx")
    if sess is None:
        return None

    h, w = bgr.shape[:2]
    rgb_1024 = cv2.cvtColor(cv2.resize(bgr, (1024, 1024), interpolation=cv2.INTER_LINEAR), cv2.COLOR_BGR2RGB)
    inp = ((rgb_1024.astype(np.float32) / 255.0 - 0.5) / 0.5).transpose(2, 0, 1)[np.newaxis, ...]
    pred = sess.run(None, {sess.get_inputs()[0].name: inp})[0][0, 0]

    p_min, p_max = float(pred.min()), float(pred.max())
    if p_max - p_min > 1e-6:
        pred = (pred - p_min) / (p_max - p_min)
    pred = np.clip(pred, 0.0, 1.0)
    return cv2.resize(pred, (w, h), interpolation=cv2.INTER_CUBIC)


def _infer_modnet_matte(bgr: np.ndarray) -> np.ndarray | None:
    """Ejecuta MODNet Portrait Alpha Matting preservando relación de aspecto múltiplo de 32."""
    sess = _get_ort_session("modnet_portrait.onnx")
    if sess is None:
        return None

    h, w = bgr.shape[:2]
    ref_size = 512
    if max(h, w) >= ref_size or min(h, w) >= ref_size:
        if w >= h:
            im_rh = ref_size
            im_rw = int(w / h * ref_size)
        else:
            im_rw = ref_size
            im_rh = int(h / w * ref_size)
    else:
        im_rh, im_rw = h, w

    im_rw = max(32, im_rw - (im_rw % 32))
    im_rh = max(32, im_rh - (im_rh % 32))

    rgb = cv2.cvtColor(cv2.resize(bgr, (im_rw, im_rh), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2RGB)
    inp = ((rgb.astype(np.float32) / 255.0 - 0.5) / 0.5).transpose(2, 0, 1)[np.newaxis, ...]
    matte = sess.run(None, {sess.get_inputs()[0].name: inp})[0][0, 0]
    matte = np.clip(matte, 0.0, 1.0)
    return cv2.resize(matte, (w, h), interpolation=cv2.INTER_CUBIC)


def remove_background_studio(
    bgr: np.ndarray,
    mode: str = "ensemble",
    defringe: float = 0.65,
    edge_feather: float = 1.2,
    edge_shift: float = 0.0,
    face_info: dict[str, Any] | None = None,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Aísla al sujeto con precisión de estudio fotográfico:
    - Ensamble inteligente RMBG-1.4 (estructura limpia) + MODNet (hebras de cabello en zona craneal)
    - Refinamiento Guided Filter guiado por la imagen a resolución completa
    - Contracción/expansión sub-píxel (edge_shift) y suavizado (edge_feather)
    - Descontaminación matemática del color de fondo en bordes semitransparentes (Defringe)
    """
    h, w = bgr.shape[:2]
    alpha_rmbg = _infer_rmbg_matte(bgr) if mode in ("ensemble", "rmbg") else None
    alpha_mod = _infer_modnet_matte(bgr) if mode in ("ensemble", "modnet") or alpha_rmbg is None else None

    if alpha_rmbg is not None and alpha_mod is not None:
        # Usar RMBG-1.4 como núcleo sólido libre de fantasmas y mezclar el alpha fino de MODNet
        # exclusivamente en la banda de transición capilar/craneal para capturar cabellos sueltos.
        transition = (alpha_rmbg > 0.015) & (alpha_rmbg < 0.985)
        hair_zone = np.zeros((h, w), dtype=np.float32)
        if face_info:
            bx, by, bw, bh = face_info["bbox"]
            hair_bottom = int(min(h, by + bh * 1.18))
            hair_left = int(max(0, bx - bw * 0.48))
            hair_right = int(min(w, bx + bw * 1.48))
            hair_top = int(max(0, by - bh * 0.72))
            hair_zone[hair_top:hair_bottom, hair_left:hair_right] = 1.0
            hair_zone = cv2.GaussianBlur(hair_zone, (0, 0), max(5.0, bw * 0.08))
        else:
            hair_zone[: int(h * 0.62), :] = 1.0
            hair_zone = cv2.GaussianBlur(hair_zone, (0, 0), max(5.0, w * 0.05))

        blend_w = hair_zone * transition.astype(np.float32) * 0.65
        alpha = alpha_rmbg * (1.0 - blend_w) + (0.45 * alpha_rmbg + 0.55 * alpha_mod) * blend_w
    elif alpha_rmbg is not None:
        alpha = alpha_rmbg
    elif alpha_mod is not None:
        alpha = alpha_mod
    else:
        raise RuntimeError("No se encontraron modelos locales de segmentación (rmbg_1_4.onnx / modnet_portrait.onnx).")

    # Refinamiento guiado por bordes reales de la foto
    gf_radius = max(3, int(round(min(h, w) / 140)))
    alpha = _guided_filter_gray_by_color(bgr, alpha, radius=gf_radius, eps=6e-4)

    # Limpieza de polvo en fondo lejano (< 3.5%) y consolidación del núcleo interior (> 97.5%)
    alpha = np.clip((alpha - 0.035) / (0.975 - 0.035), 0.0, 1.0)

    # Supresión topológica de islas o manchas flotantes desconectadas del retrato principal,
    # preservando un margen amplio alrededor de la silueta para respetar rizos y hebras finas de cabello.
    core_bin = (alpha > 0.32).astype(np.uint8)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(core_bin, connectivity=8)
    if num_labels > 1:
        areas = stats[1:, cv2.CC_STAT_AREA]
        max_area = int(areas.max()) if len(areas) > 0 else 0
        if max_area > 64:
            keep_mask = np.zeros((h, w), dtype=np.uint8)
            for lbl_idx in range(1, num_labels):
                if stats[lbl_idx, cv2.CC_STAT_AREA] >= max(64, int(max_area * 0.06)):
                    keep_mask[labels == lbl_idx] = 255
            halo_pad = max(14, int(round(min(h, w) * 0.048)))
            k_halo = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * halo_pad + 1, 2 * halo_pad + 1))
            allowed_zone = cv2.dilate(keep_mask, k_halo).astype(np.float32) / 255.0
            allowed_zone = cv2.GaussianBlur(allowed_zone, (0, 0), max(3.0, halo_pad * 0.25))
            alpha = alpha * np.clip(allowed_zone, 0.0, 1.0)

    # Ajuste fino de borde (edge_shift: negativo contrae halos, positivo expande)
    if abs(edge_shift) > 0.05:
        px = int(math.ceil(abs(edge_shift)))
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * px + 1, 2 * px + 1))
        morphed = cv2.erode(alpha, k) if edge_shift < 0 else cv2.dilate(alpha, k)
        frac = min(1.0, abs(edge_shift) / max(1.0, float(px)))
        alpha = alpha * (1.0 - frac) + morphed * frac

    # Suavizado controlado de borde (feather) solo en la frontera
    if edge_feather > 0.1:
        blurred_a = cv2.GaussianBlur(alpha, (0, 0), float(edge_feather) * 0.75)
        edge_band = ((alpha > 0.01) & (alpha < 0.99)).astype(np.float32)
        edge_band = cv2.GaussianBlur(edge_band, (0, 0), 1.5)
        alpha = np.clip(alpha * (1.0 - edge_band) + blurred_a * edge_band, 0.0, 1.0)

    # Descontaminación de color de fondo (Defringe / Spill Removal)
    clean_bgr = bgr.copy()
    defringe_strength = float(np.clip(defringe, 0.0, 1.0))
    if defringe_strength > 0.02:
        bg_mask = (alpha < 0.08).astype(np.float32)
        fg_mask = (alpha > 0.92).astype(np.float32)
        if np.any(bg_mask > 0.5) and np.any(fg_mask > 0.5):
            sigma = max(4.0, min(h, w) * 0.018)
            # Estimar color local del fondo propagándolo hacia la frontera
            bg_weighted = cv2.GaussianBlur(bgr.astype(np.float32) * bg_mask[:, :, None], (0, 0), sigma)
            bg_norm = cv2.GaussianBlur(bg_mask, (0, 0), sigma)[:, :, None] + 1e-5
            local_bg = bg_weighted / bg_norm

            # Estimar también color interior limpio del sujeto para anclar valores extremos
            fg_weighted = cv2.GaussianBlur(bgr.astype(np.float32) * fg_mask[:, :, None], (0, 0), sigma * 0.7)
            fg_norm = cv2.GaussianBlur(fg_mask, (0, 0), sigma * 0.7)[:, :, None] + 1e-5
            local_fg = fg_weighted / fg_norm

            semi = (alpha > 0.02) & (alpha < 0.96)
            if np.any(semi):
                a_3d = np.maximum(alpha[:, :, None], 0.18)
                unmixed = (bgr.astype(np.float32) - (1.0 - alpha[:, :, None]) * local_bg) / a_3d
                # Limitar desviación respecto al color interior real del cabello/ropa para evitar ruido
                unmixed = np.clip(unmixed, np.minimum(bgr, local_fg) - 18.0, np.maximum(bgr, local_fg) + 18.0)
                unmixed = np.clip(unmixed, 0.0, 255.0)
                w_semi = ((1.0 - alpha) * semi.astype(np.float32) * defringe_strength)[:, :, None]
                clean_bgr = np.clip(
                    bgr.astype(np.float32) * (1.0 - w_semi) + unmixed * w_semi,
                    0.0,
                    255.0,
                ).astype(np.uint8)

    return clean_bgr, alpha


# ==============================================================================
# 4. RESTAURACIÓN FACIAL GENERATIVA GFPGAN v1.4 CON FIDELIDAD DE IDENTIDAD
# ==============================================================================

def restore_face_gfpgan(
    bgr: np.ndarray,
    strength: float = 0.65,
    eye_clarity: float = 0.25,
    face_info: dict[str, Any] | None = None,
) -> np.ndarray:
    """
    Restaura ojos, pestañas, piel, barba y monturas de gafas usando GFPGAN v1.4 (512×512)
    con alineación afín canónica FFHQ de 5 landmarks y anclaje cromático LAB para preservar
    al 100% la identidad y el tono de piel real del pastor.
    """
    strength = float(np.clip(strength, 0.0, 1.0))
    if strength <= 0.01:
        return bgr

    sess = _get_ort_session("gfpgan14.onnx")
    if sess is None:
        return bgr

    if face_info is None:
        face_info = detect_primary_face(bgr)
    if face_info is None:
        return bgr

    src_pts = np.array(face_info["landmarks"], dtype=np.float32)
    matrix, _ = cv2.estimateAffinePartial2D(src_pts, FFHQ_TEMPLATE_512, method=cv2.LMEDS)
    if matrix is None:
        return bgr

    aligned_bgr = cv2.warpAffine(
        bgr,
        matrix,
        (512, 512),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REFLECT_101,
    )

    # Inferencia GFPGAN v1.4: entrada RGB [-1, 1] -> salida RGB [-1, 1]
    aligned_rgb = cv2.cvtColor(aligned_bgr, cv2.COLOR_BGR2RGB).astype(np.float32)
    inp = ((aligned_rgb / 255.0 - 0.5) / 0.5).transpose(2, 0, 1)[np.newaxis, ...]
    out = sess.run(None, {sess.get_inputs()[0].name: inp})[0][0]
    restored_rgb = np.clip((out.transpose(1, 2, 0) * 0.5 + 0.5) * 255.0, 0.0, 255.0).astype(np.uint8)
    restored_bgr = cv2.cvtColor(restored_rgb, cv2.COLOR_RGB2BGR)

    # Anclaje de tono de piel en espacio CIE LAB para que GFPGAN jamás altere el color natural de la piel
    orig_lab = cv2.cvtColor(aligned_bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    rest_lab = cv2.cvtColor(restored_bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    skin_zone = np.zeros((512, 512), dtype=bool)
    skin_zone[140:420, 130:382] = True

    for ch in (1, 2):  # Canales a* y b*
        o_mean, o_std = float(np.mean(orig_lab[:, :, ch][skin_zone])), float(np.std(orig_lab[:, :, ch][skin_zone])) + 1e-5
        r_mean, r_std = float(np.mean(rest_lab[:, :, ch][skin_zone])), float(np.std(rest_lab[:, :, ch][skin_zone])) + 1e-5
        matched = (rest_lab[:, :, ch] - r_mean) * (o_std / r_std) + o_mean
        rest_lab[:, :, ch] = rest_lab[:, :, ch] * 0.25 + matched * 0.75

    # Evitar cambio brusco de luminancia media respecto al original
    ol_mean = float(np.mean(orig_lab[:, :, 0][skin_zone]))
    rl_mean = float(np.mean(rest_lab[:, :, 0][skin_zone]))
    rest_lab[:, :, 0] = np.clip(rest_lab[:, :, 0] + (ol_mean - rl_mean) * 0.55, 0.0, 255.0)
    restored_bgr = cv2.cvtColor(rest_lab.astype(np.uint8), cv2.COLOR_LAB2BGR)

    # Realce sutil de claridad en iris y pestañas sobre el lienzo canónico 512×512
    eye_boost = float(np.clip(eye_clarity, 0.0, 1.0))
    if eye_boost > 0.02:
        rlab = cv2.cvtColor(restored_bgr, cv2.COLOR_BGR2LAB)
        rl, ra, rb = cv2.split(rlab)
        eye_mask = np.zeros((512, 512), dtype=np.float32)
        for ex, ey in ((193, 240), (319, 240)):
            cv2.ellipse(eye_mask, (ex, ey), (46, 26), 0, 0, 360, 1.0, -1)
        eye_mask = cv2.GaussianBlur(eye_mask, (0, 0), 10.0)
        soft_l = cv2.GaussianBlur(rl.astype(np.float32), (0, 0), 2.2)
        detail_l = (rl.astype(np.float32) - soft_l) * (0.55 * eye_boost)
        rl_new = np.clip(rl.astype(np.float32) + detail_l * eye_mask, 0.0, 255.0).astype(np.uint8)
        restored_bgr = cv2.cvtColor(cv2.merge([rl_new, ra, rb]), cv2.COLOR_LAB2BGR)

    # Mezclar con original alineado según fidelidad de identidad
    blended_512 = np.clip(
        aligned_bgr.astype(np.float32) * (1.0 - strength) + restored_bgr.astype(np.float32) * strength,
        0.0,
        255.0,
    ).astype(np.uint8)

    # Máscara facial elíptica suavizada para reintegración sin costuras
    face_mask_512 = np.zeros((512, 512), dtype=np.float32)
    cv2.ellipse(face_mask_512, (256, 272), (185, 218), 0, 0, 360, 1.0, -1)
    face_mask_512 = cv2.GaussianBlur(face_mask_512, (0, 0), 26.0)

    h, w = bgr.shape[:2]
    warped_face = cv2.warpAffine(
        blended_512,
        matrix,
        (w, h),
        flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP,
        borderMode=cv2.BORDER_REFLECT_101,
    )
    warped_mask = cv2.warpAffine(
        face_mask_512,
        matrix,
        (w, h),
        flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=0.0,
    )[:, :, np.newaxis]

    result = np.clip(
        bgr.astype(np.float32) * (1.0 - warped_mask) + warped_face.astype(np.float32) * warped_mask,
        0.0,
        255.0,
    ).astype(np.uint8)
    return result


# ==============================================================================
# 5. SÚPER-RESOLUCIÓN POR BLOQUES PRESERVANDO CANAL ALFA (REAL-ESRGAN X4)
# ==============================================================================

def upscale_realesrgan(
    bgr: np.ndarray,
    alpha: np.ndarray | None = None,
    mode: str = "fast",
    target_max_height: int = 1350,
) -> tuple[np.ndarray, np.ndarray | None]:
    """
    Aumenta la resolución con Real-ESRGAN x4 usando inferencia por mosaicos (tiles) con solapamiento
    suave para bajo consumo de RAM, preservando intacto el canal Alfa RGBA si existe.
    """
    model_file = "realesrgan_x4_photo.onnx" if mode == "ultra" else "realesr_general_x4.onnx"
    sess = _get_ort_session(model_file) or _get_ort_session("realesr_general_x4.onnx") or _get_ort_session("realesrgan_x4_photo.onnx")
    if sess is None:
        return bgr, alpha

    h, w = bgr.shape[:2]
    # Evitar escalar entradas enormes innecesariamente antes de x4
    max_in_side = 560 if mode == "ultra" else 720
    pre_scale = min(1.0, max_in_side / max(h, w))
    if pre_scale < 1.0:
        work_w = max(16, int(round(w * pre_scale)))
        work_h = max(16, int(round(h * pre_scale)))
        work_bgr = cv2.resize(bgr, (work_w, work_h), interpolation=cv2.INTER_AREA)
    else:
        work_bgr = bgr
        work_h, work_w = h, w

    tile_size = 256 if mode == "ultra" else 384
    tile_pad = 16
    scale = 4

    out_h, out_w = work_h * scale, work_w * scale
    out_rgb = np.zeros((out_h, out_w, 3), dtype=np.float32)
    weight_map = np.zeros((out_h, out_w, 1), dtype=np.float32)

    rgb_in = cv2.cvtColor(work_bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    inp_name = sess.get_inputs()[0].name
    out_name = sess.get_outputs()[0].name

    tiles_y = math.ceil(work_h / tile_size)
    tiles_x = math.ceil(work_w / tile_size)

    for ty in range(tiles_y):
        for tx in range(tiles_x):
            x0 = tx * tile_size
            y0 = ty * tile_size
            x1 = min(x0 + tile_size, work_w)
            y1 = min(y0 + tile_size, work_h)

            px0 = max(x0 - tile_pad, 0)
            py0 = max(y0 - tile_pad, 0)
            px1 = min(x1 + tile_pad, work_w)
            py1 = min(y1 + tile_pad, work_h)

            tile = rgb_in[py0:py1, px0:px1, :]
            th, tw = tile.shape[:2]
            pad_b = (8 - (th % 8)) % 8
            pad_r = (8 - (tw % 8)) % 8
            if pad_b or pad_r:
                tile_padded = cv2.copyMakeBorder(tile, 0, pad_b, 0, pad_r, cv2.BORDER_REFLECT_101)
            else:
                tile_padded = tile

            tensor = np.transpose(tile_padded, (2, 0, 1))[np.newaxis, ...]
            pred = sess.run([out_name], {inp_name: tensor})[0][0]
            pred_img = np.clip(np.transpose(pred, (1, 2, 0)), 0.0, 1.0)[: th * scale, : tw * scale, :]

            # Extraer región útil sin el padding exterior
            ox0 = (x0 - px0) * scale
            oy0 = (y0 - py0) * scale
            ox1 = ox0 + (x1 - x0) * scale
            oy1 = oy0 + (y1 - y0) * scale

            useful = pred_img[oy0:oy1, ox0:ox1, :]
            out_rgb[y0 * scale : y1 * scale, x0 * scale : x1 * scale, :] += useful
            weight_map[y0 * scale : y1 * scale, x0 * scale : x1 * scale, :] += 1.0

    merged_rgb = np.clip((out_rgb / np.maximum(weight_map, 1e-5)) * 255.0, 0.0, 255.0).astype(np.uint8)
    up_bgr = cv2.cvtColor(merged_rgb, cv2.COLOR_RGB2BGR)

    # Ajustar a resolución Master limpia para no inflar innecesariamente el peso del PNG
    final_h, final_w = up_bgr.shape[:2]
    if final_h > target_max_height:
        s = target_max_height / float(final_h)
        final_w = max(16, int(round(final_w * s)))
        final_h = target_max_height
        up_bgr = cv2.resize(up_bgr, (final_w, final_h), interpolation=cv2.INTER_LANCZOS4)

    up_alpha = None
    if alpha is not None:
        up_alpha = cv2.resize(alpha, (final_w, final_h), interpolation=cv2.INTER_CUBIC)
        up_alpha = _guided_filter_gray_by_color(up_bgr, np.clip(up_alpha, 0.0, 1.0), radius=4, eps=5e-4)

    return up_bgr, up_alpha


# ==============================================================================
# 6. MOTOR DE CALIBRACIÓN FOTOGRÁFICA DE ESTUDIO (LUZ, COLOR, PIEL Y NITIDEZ)
# ==============================================================================

def calibrate_studio_grade(
    bgr: np.ndarray,
    params: dict[str, Any],
    face_info: dict[str, Any] | None = None,
) -> np.ndarray:
    """
    Aplica calibración colorimétrica y lumínica de precisión:
    - Reducción de ruido selectiva (crominancia + luminancia suave)
    - Temperatura Kelvin y Matiz en espacio perceptual CIE LAB
    - Exposición EV con compresión suave (soft-knee) en altas luces
    - Levantamiento de Sombras (Studio Relight) y recuperación de Altas Luces (anti-flash)
    - Brillo, Contraste en curva S, Vibrancia con protección de tonos de piel y Saturación
    - Suavizado de piel por Separación de Frecuencias (conservando poros, cejas y ojos)
    - Claridad de medios tonos y Nitidez de luminancia sin halos
    """
    out = bgr.copy()

    denoise = float(params.get("denoise", 0))
    temperature = float(params.get("temperature", 0))
    tint = float(params.get("tint", 0))
    exposure = float(params.get("exposure", 0))
    brightness = float(params.get("brightness", 0))
    contrast = float(params.get("contrast", 0))
    shadows = float(params.get("shadows", 0))
    highlights = float(params.get("highlights", 0))
    vibrance = float(params.get("vibrance", 0))
    saturation = float(params.get("saturation", 0))
    skin_smooth = float(params.get("skin_smooth", 0))
    clarity = float(params.get("clarity", 0))
    sharpness = float(params.get("sharpness", 0))

    # 1. Reducción de ruido antes de realzar detalles
    if denoise > 1.0:
        d_strength = np.clip(denoise / 100.0, 0.0, 1.0)
        lab_dn = cv2.cvtColor(out, cv2.COLOR_BGR2LAB)
        dl, da, db = cv2.split(lab_dn)
        # Limpiar ruido de color agresivamente (típico de celulares en poca luz) y luminancia con delicadeza
        da = cv2.bilateralFilter(da, d=5, sigmaColor=12 + d_strength * 24, sigmaSpace=9)
        db = cv2.bilateralFilter(db, d=5, sigmaColor=12 + d_strength * 24, sigmaSpace=9)
        dl_smooth = cv2.bilateralFilter(dl, d=5, sigmaColor=6 + d_strength * 18, sigmaSpace=5)
        dl = cv2.addWeighted(dl, 1.0 - d_strength * 0.65, dl_smooth, d_strength * 0.65, 0)
        out = cv2.cvtColor(cv2.merge([dl, da, db]), cv2.COLOR_LAB2BGR)

    # 2. Balance de Blancos: Temperatura (Azul <-> Ámbar) y Matiz (Verde <-> Magenta) en LAB
    if abs(temperature) > 0.5 or abs(tint) > 0.5:
        lab = cv2.cvtColor(out, cv2.COLOR_BGR2LAB).astype(np.float32)
        l_norm = lab[:, :, 0] / 255.0
        # Proteger negros puros y blancos quemados para no teñirlos
        mid_weight = np.clip(4.0 * l_norm * (1.0 - l_norm * 0.85), 0.15, 1.0)
        lab[:, :, 2] = np.clip(lab[:, :, 2] + (temperature * 0.28) * mid_weight, 0.0, 255.0)
        lab[:, :, 1] = np.clip(lab[:, :, 1] + (tint * 0.24) * mid_weight, 0.0, 255.0)
        out = cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_LAB2BGR)

    # 3. Exposición, Sombras (Relight), Altas Luces, Brillo y Contraste sobre luminancia preservando color
    if any(abs(v) > 0.5 for v in (exposure, brightness, contrast, shadows, highlights)):
        lab = cv2.cvtColor(out, cv2.COLOR_BGR2LAB).astype(np.float32)
        L = lab[:, :, 0] / 255.0

        # Exposición EV con hombro suave en altas luces
        if abs(exposure) > 0.5:
            ev = (exposure / 100.0) * 1.15
            gain = math.pow(2.0, ev)
            L = (L * gain) / (1.0 + np.maximum(0.0, L * gain - 0.82) * 0.55)
            L = np.clip(L, 0.0, 1.0)

        # Mapa de iluminación base suave (evita lavar el micro-contraste al levantar sombras)
        sigma_illum = max(8.0, min(out.shape[:2]) * 0.03)
        base_L = cv2.GaussianBlur(L, (0, 0), sigma_illum)

        if abs(shadows) > 0.5:
            sh = shadows / 100.0  # [-1, +1]
            shadow_mask = np.power(np.clip(1.0 - base_L, 0.0, 1.0), 1.85)
            L = np.clip(L + sh * 0.34 * shadow_mask, 0.0, 1.0)

        if abs(highlights) > 0.5:
            hl = highlights / 100.0  # [-1, +1]
            hi_mask = np.power(np.clip(base_L, 0.0, 1.0), 2.1)
            L = np.clip(L + hl * 0.30 * hi_mask, 0.0, 1.0)

        if abs(brightness) > 0.5:
            br = brightness / 100.0
            # Curva gamma suave para no empastar negros
            gamma = math.pow(2.0, -br * 0.55)
            L = np.power(np.clip(L, 1e-5, 1.0), gamma)

        if abs(contrast) > 0.5:
            ct = contrast / 100.0  # [-1, +1]
            # Curva S sigmoidea centrada en 0.50
            centered = L - 0.5
            L = np.clip(0.5 + centered * (1.0 + ct * 0.65) - (ct * 0.35) * np.power(centered, 3) * 4.0, 0.0, 1.0)

        lab[:, :, 0] = np.clip(L * 255.0, 0.0, 255.0)
        out = cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_LAB2BGR)

    # 4. Vibrancia inteligente (protegiendo tonos de piel) y Saturación
    if abs(vibrance) > 0.5 or abs(saturation) > 0.5:
        hsv = cv2.cvtColor(out, cv2.COLOR_BGR2HSV).astype(np.float32)
        H, S, V = hsv[:, :, 0], hsv[:, :, 1] / 255.0, hsv[:, :, 2]

        # Máscara de tonos piel (Hue en OpenCV 0..179: piel ~ 4..24) para evitar piel anaranjada
        skin_hue = np.exp(-0.5 * np.square((H - 13.0) / 9.5))
        vib = vibrance / 100.0
        sat = saturation / 100.0

        # Vibrancia actúa más sobre colores apagados y modera su efecto sobre la piel
        vib_gain = vib * (1.0 - S) * (1.0 - 0.58 * skin_hue) * 0.65
        S_new = np.clip(S * (1.0 + sat * 0.65) + vib_gain, 0.0, 1.0)
        hsv[:, :, 1] = S_new * 255.0
        out = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)

    # 5. Retoque de Piel de Estudio por Separación de Frecuencias (preserva poros finos, ojos, cejas y labios)
    if skin_smooth > 1.0:
        sm_amount = np.clip(skin_smooth / 100.0, 0.0, 1.0)
        ycrcb = cv2.cvtColor(out, cv2.COLOR_BGR2YCrCb)
        skin_mask = cv2.inRange(ycrcb, np.array((25, 130, 75)), np.array((250, 182, 135))).astype(np.float32) / 255.0

        if face_info:
            # Restringir principalmente al área del rostro/cuello y excluir ojos/boca para máxima nitidez
            h_img, w_img = out.shape[:2]
            face_gate = np.zeros((h_img, w_img), dtype=np.float32)
            bx, by, bw, bh = face_info["bbox"]
            cx, cy = int(bx + bw * 0.5), int(by + bh * 0.62)
            cv2.ellipse(face_gate, (cx, cy), (int(bw * 0.68), int(bh * 0.85)), 0, 0, 360, 1.0, -1)
            for lx, ly in face_info["landmarks"][:2]:  # Proteger ambos ojos al 100%
                cv2.circle(face_gate, (int(lx), int(ly)), max(6, int(bw * 0.11)), 0.0, -1)
            face_gate = cv2.GaussianBlur(face_gate, (0, 0), max(4.0, bw * 0.05))
            skin_mask = skin_mask * face_gate
        else:
            skin_mask = cv2.GaussianBlur(skin_mask, (0, 0), 3.0)

        if np.any(skin_mask > 0.05):
            out_f = out.astype(np.float32)
            fine_blur = cv2.GaussianBlur(out_f, (0, 0), 1.1)
            high_freq_pores = out_f - fine_blur  # Textura microscópica real de la piel
            even_base = cv2.bilateralFilter(out, d=9, sigmaColor=28, sigmaSpace=11).astype(np.float32)
            retouched = np.clip(even_base + high_freq_pores * 0.68, 0.0, 255.0)
            blend = (skin_mask * sm_amount * 0.62)[:, :, np.newaxis]
            out = np.clip(out_f * (1.0 - blend) + retouched * blend, 0.0, 255.0).astype(np.uint8)

    # 6. Claridad (contraste local de medios tonos) y Nitidez LAB sin halos
    if abs(clarity) > 0.5 or sharpness > 0.5:
        lab = cv2.cvtColor(out, cv2.COLOR_BGR2LAB)
        L, A, B = cv2.split(lab)
        Lf = L.astype(np.float32)

        if abs(clarity) > 0.5:
            cl_amt = (clarity / 100.0) * 0.42
            sigma_cl = max(4.0, min(out.shape[:2]) * 0.015)
            local_mean = cv2.GaussianBlur(Lf, (0, 0), sigma_cl)
            mid_mask = 4.0 * (Lf / 255.0) * (1.0 - Lf / 255.0)
            Lf = np.clip(Lf + (Lf - local_mean) * cl_amt * mid_mask, 0.0, 255.0)

        if sharpness > 0.5:
            sh_amt = (sharpness / 100.0) * 0.85
            soft = cv2.GaussianBlur(Lf, (0, 0), 1.0)
            detail = Lf - soft
            # Suprimir micro-ruido plano (< 1.5 niveles) y limitar picos para cero halos blancos
            detail = np.where(np.abs(detail) < 1.5, 0.0, detail)
            detail = np.clip(detail, -18.0, 18.0)
            Lf = np.clip(Lf + detail * sh_amt, 0.0, 255.0)

        out = cv2.cvtColor(cv2.merge([Lf.astype(np.uint8), A, B]), cv2.COLOR_LAB2BGR)

    return out


# ==============================================================================
# 7. ENCUADRE BIOMÉTRICO AUTOMÁTICO Y ROTACIÓN FINA
# ==============================================================================

def apply_biometric_alignment_and_crop(
    bgr: np.ndarray,
    alpha: np.ndarray | None = None,
    face_info: dict[str, Any] | None = None,
    extra_rotation_deg: float = 0.0,
) -> tuple[np.ndarray, np.ndarray | None]:
    """
    Nivela automáticamente la inclinación de los ojos y recorta/encuadra con precisión
    biométrica a proporción oficial Master (748×1124 px, equivalente 4x de 187×281).
    """
    h, w = bgr.shape[:2]
    if face_info is None:
        face_info = detect_primary_face(bgr)

    rot_deg = float(extra_rotation_deg)
    if face_info and abs(rot_deg) < 0.01:
        roll = float(face_info["roll_deg"])
        if 0.8 <= abs(roll) <= 16.0:
            rot_deg = roll  # En getRotationMatrix2D ángulo positivo gira antihorario; compensa dy>0

    work_bgr = bgr
    work_alpha = alpha

    if abs(rot_deg) > 0.1:
        pivot = tuple(face_info["eye_center"]) if face_info else (w * 0.5, h * 0.45)
        rot_mat = cv2.getRotationMatrix2D(pivot, rot_deg, 1.0)
        border_mode = cv2.BORDER_CONSTANT if work_alpha is not None else cv2.BORDER_REFLECT_101
        work_bgr = cv2.warpAffine(work_bgr, rot_mat, (w, h), flags=cv2.INTER_CUBIC, borderMode=border_mode, borderValue=(255, 255, 255))
        if work_alpha is not None:
            work_alpha = cv2.warpAffine(work_alpha, rot_mat, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0.0)
        face_info = detect_primary_face(work_bgr) or face_info

    if face_info:
        bio = compute_biometric_framing_suggestion(w, h, face_info)
        cx0, cy0, cw, ch = bio["crop_box"]
    else:
        # Encuadre inteligente centrado priorizando tercio superior
        orig_ratio = w / float(h)
        if orig_ratio > CREDENTIAL_ASPECT:
            ch = float(h)
            cw = ch * CREDENTIAL_ASPECT
            cx0 = (w - cw) * 0.5
            cy0 = 0.0
        else:
            cw = float(w)
            ch = cw / CREDENTIAL_ASPECT
            cx0 = 0.0
            cy0 = (h - ch) * 0.10

    # Transformación afín directa desde crop_box hacia MASTER_WIDTH × MASTER_HEIGHT (soporta padding limpio si la cabeza está muy pegada arriba)
    src_tri = np.array([[cx0, cy0], [cx0 + cw, cy0], [cx0, cy0 + ch]], dtype=np.float32)
    dst_tri = np.array([[0, 0], [MASTER_WIDTH, 0], [0, MASTER_HEIGHT]], dtype=np.float32)
    aff = cv2.getAffineTransform(src_tri, dst_tri)

    border_bgr = cv2.BORDER_CONSTANT if work_alpha is not None else cv2.BORDER_REPLICATE
    framed_bgr = cv2.warpAffine(
        work_bgr, aff, (MASTER_WIDTH, MASTER_HEIGHT), flags=cv2.INTER_LANCZOS4, borderMode=border_bgr, borderValue=(235, 238, 242)
    )
    framed_alpha = None
    if work_alpha is not None:
        framed_alpha = cv2.warpAffine(
            work_alpha, aff, (MASTER_WIDTH, MASTER_HEIGHT), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=0.0
        )
        framed_alpha = np.clip(framed_alpha, 0.0, 1.0)

    return framed_bgr, framed_alpha


# ==============================================================================
# 8. COMPOSITOR DE FONDOS DE ESTUDIO Y SOMBRA DE CONTACTO 3D
# ==============================================================================

def _hex_to_bgr(hex_color: str, default: tuple[int, int, int] = (255, 255, 255)) -> tuple[int, int, int]:
    clean = (hex_color or "").strip().lstrip("#")
    if len(clean) == 6:
        try:
            r = int(clean[0:2], 16)
            g = int(clean[2:4], 16)
            b = int(clean[4:6], 16)
            return (b, g, r)
        except ValueError:
            pass
    return default


def _build_backdrop(
    width: int,
    height: int,
    bg_type: str,
    bg_color: str = "#ffffff",
    bg_color_secondary: str = "#dbeafe",
    original_bgr: np.ndarray | None = None,
) -> np.ndarray:
    """Genera fondos de estudio profesionales (degradados lineales/radiales o bokeh DSLR)."""
    y_lin = np.linspace(0.0, 1.0, height, dtype=np.float32)[:, np.newaxis, np.newaxis]
    yy, xx = np.ogrid[:height, :width]
    rx = (xx - width * 0.5) / max(1.0, width * 0.65)
    ry = (yy - height * 0.38) / max(1.0, height * 0.65)
    radial = np.clip(np.sqrt(rx * rx + ry * ry), 0.0, 1.0)[:, :, np.newaxis]

    presets: dict[str, tuple[tuple[int, int, int], tuple[int, int, int], str]] = {
        "credential_silver": ((225, 215, 207), (213, 203, 194), "linear"),  # BGR de #cfd7e1 -> #c2cbd5
        "studio_white": ((255, 255, 255), (242, 240, 236), "radial"),
        "pearl_gray": ((252, 250, 248), (225, 213, 203), "radial"),         # BGR de #f8fafc -> #cbd5e1
        "mmm_blue": ((185, 78, 28), (68, 26, 12), "radial"),               # Azul institucional profundo
        "passport_sky": ((254, 244, 226), (245, 216, 178), "radial"),      # Celeste documento oficial
        "warm_ivory": ((248, 250, 252), (216, 226, 232), "radial"),
    }

    if bg_type == "bokeh" and original_bgr is not None:
        resized_orig = cv2.resize(original_bgr, (width, height), interpolation=cv2.INTER_LINEAR)
        sigma = max(12.0, min(width, height) * 0.045)
        return cv2.GaussianBlur(resized_orig, (0, 0), sigma)

    if bg_type == "custom_solid":
        c = np.array(_hex_to_bgr(bg_color), dtype=np.uint8)
        return np.full((height, width, 3), c, dtype=np.uint8)

    if bg_type == "custom_gradient":
        c1 = np.array(_hex_to_bgr(bg_color), dtype=np.float32)
        c2 = np.array(_hex_to_bgr(bg_color_secondary), dtype=np.float32)
        return np.clip(c1 * (1.0 - radial) + c2 * radial, 0.0, 255.0).astype(np.uint8)

    c1_t, c2_t, style = presets.get(bg_type, presets["studio_white"])
    c1 = np.array(c1_t, dtype=np.float32)
    c2 = np.array(c2_t, dtype=np.float32)
    t = y_lin if style == "linear" else radial
    return np.clip(c1 * (1.0 - t) + c2 * t, 0.0, 255.0).astype(np.uint8)


def compose_studio_backdrop(
    fg_bgr: np.ndarray,
    alpha: np.ndarray | None,
    bg_type: str = "transparent",
    bg_color: str = "#ffffff",
    bg_color_secondary: str = "#dbeafe",
    drop_shadow: float = 0.0,
    original_bgr: np.ndarray | None = None,
) -> tuple[np.ndarray, np.ndarray | None]:
    """
    Compone al sujeto recortado sobre el escenario elegido, añadiendo sombra de estudio 3D opcional.
    Si bg_type == 'transparent', conserva el PNG RGBA (incluyendo sombra suave semitransparente si se activa).
    """
    if alpha is None or bg_type == "keep":
        return fg_bgr, alpha

    h, w = fg_bgr.shape[:2]
    sh_strength = float(np.clip(drop_shadow / 100.0, 0.0, 1.0))

    # Generar mapa de sombra de contacto desplazada suavemente
    shadow_alpha = None
    if sh_strength > 0.02:
        dx = int(round(w * 0.018))
        dy = int(round(h * 0.016))
        shift_m = np.float32([[1, 0, dx], [0, 1, dy]])
        shifted = cv2.warpAffine(alpha, shift_m, (w, h), borderMode=cv2.BORDER_CONSTANT, borderValue=0.0)
        blur_sigma = max(6.0, min(w, h) * 0.028)
        shadow_alpha = cv2.GaussianBlur(shifted, (0, 0), blur_sigma) * (sh_strength * 0.48)

    if bg_type == "transparent":
        if shadow_alpha is None:
            return fg_bgr, alpha
        # Composición Porter-Duff sobre transparente: sujeto encima de sombra negra suave
        out_a = alpha + shadow_alpha * (1.0 - alpha)
        safe_a = np.maximum(out_a[:, :, None], 1e-5)
        out_bgr = (fg_bgr.astype(np.float32) * alpha[:, :, None]) / safe_a
        return np.clip(out_bgr, 0.0, 255.0).astype(np.uint8), np.clip(out_a, 0.0, 1.0)

    backdrop = _build_backdrop(w, h, bg_type, bg_color, bg_color_secondary, original_bgr=original_bgr).astype(np.float32)

    if shadow_alpha is not None:
        # Oscurecer suavemente el fondo donde cae la sombra del pastor
        backdrop = backdrop * (1.0 - shadow_alpha[:, :, None] * 0.72)

    a3 = alpha[:, :, None]
    comp = backdrop * (1.0 - a3) + fg_bgr.astype(np.float32) * a3
    return np.clip(comp, 0.0, 255.0).astype(np.uint8), None


# ==============================================================================
# 9. PIPELINE ORQUESTADOR DEL AGENTE DISEÑADOR (AUTO-PILOTO Y MODO PERSONALIZADO)
# ==============================================================================

PRESET_RECIPES: dict[str, dict[str, Any]] = {
    "auto_agent": {"auto_pilot": True},
    "studio_credential_pro": {
        "auto_pilot": True,
        "remove_bg": True,
        "bg_type": "credential_silver",
        "drop_shadow": 20,
        "auto_frame": True,
        "face_restore": True,
    },
    "restore_only": {
        "auto_pilot": False,
        "remove_bg": False,
        "face_restore": True,
        "face_strength": 68,
        "eye_clarity": 30,
        "skin_smooth": 20,
        "upscale": True,
        "upscale_mode": "fast",
        "exposure": 6,
        "shadows": 16,
        "highlights": -10,
        "contrast": 8,
        "vibrance": 8,
        "clarity": 12,
        "sharpness": 22,
        "denoise": 14,
        "auto_frame": False,
        "bg_type": "keep",
    },
    "cutout_only": {
        "auto_pilot": False,
        "remove_bg": True,
        "matting_mode": "ensemble",
        "defringe": 70,
        "edge_feather": 1.3,
        "edge_shift": -0.4,
        "face_restore": False,
        "upscale": False,
        "auto_frame": False,
        "bg_type": "transparent",
        "drop_shadow": 0,
    },
}


def run_designer_pipeline(
    bgr: np.ndarray,
    alpha: np.ndarray | None = None,
    options: dict[str, Any] | None = None,
) -> tuple[np.ndarray, np.ndarray | None, dict[str, Any]]:
    """
    Ejecuta el flujo completo del Agente Diseñador en el orden óptico óptimo:
    1. Diagnóstico inicial + fusión con receta Auto-Piloto (si auto_pilot=True o preset indicado)
    2. Remoción de fondo de alta precisión sobre imagen original íntegra (mejor coherencia de bordes)
    3. Restauración facial generativa GFPGAN v1.4 con preservación cromática
    4. Súper-resolución Real-ESRGAN x4 (cuando aplica) preservando canal Alfa
    5. Calibración fotográfica minuciosa de luz, balance de blancos, piel y nitidez
    6. Encuadre biométrico oficial y nivelación ocular (cuando auto_frame=True)
    7. Composición de escenario de estudio y sombra 3D
    """
    t0 = time.time()
    opts = dict(options or {})

    preset_name = opts.get("preset")
    if preset_name and preset_name in PRESET_RECIPES:
        merged_preset = dict(PRESET_RECIPES[preset_name])
        merged_preset.update({k: v for k, v in opts.items() if k != "preset"})
        opts = merged_preset

    # Limitar imágenes gigantescas (> 2048px) al entrar para mantener tiempos ágiles (< 4s)
    h0, w0 = bgr.shape[:2]
    if max(h0, w0) > 2048:
        s0 = 2048.0 / max(h0, w0)
        nw, nh = int(round(w0 * s0)), int(round(h0 * s0))
        bgr = cv2.resize(bgr, (nw, nh), interpolation=cv2.INTER_AREA)
        if alpha is not None:
            alpha = cv2.resize(alpha, (nw, nh), interpolation=cv2.INTER_AREA)

    original_for_bokeh = bgr.copy()
    diagnosis = analyze_photo(bgr, alpha)
    face_info = diagnosis.get("face")

    # Si está en modo auto_pilot, partir de la receta inteligente del Agente y sobrescribir con lo explícito
    if opts.get("auto_pilot", False):
        effective = dict(diagnosis["recommended_params"])
        for k, v in opts.items():
            if k != "auto_pilot" and v is not None:
                effective[k] = v
    else:
        effective = {
            "remove_bg": False,
            "matting_mode": "ensemble",
            "defringe": 65,
            "edge_feather": 1.2,
            "edge_shift": 0.0,
            "face_restore": False,
            "face_strength": 65,
            "eye_clarity": 25,
            "skin_smooth": 0,
            "upscale": False,
            "upscale_mode": "fast",
            "auto_frame": False,
            "rotation": 0.0,
            "exposure": 0,
            "brightness": 0,
            "contrast": 0,
            "shadows": 0,
            "highlights": 0,
            "temperature": 0,
            "tint": 0,
            "vibrance": 0,
            "saturation": 0,
            "clarity": 0,
            "sharpness": 0,
            "denoise": 0,
            "bg_type": "transparent" if alpha is not None else "keep",
            "bg_color": "#ffffff",
            "bg_color_secondary": "#cbd5e1",
            "drop_shadow": 0,
        }
        effective.update({k: v for k, v in opts.items() if v is not None})

    work_bgr = bgr.copy()
    work_alpha = alpha.copy() if alpha is not None else None
    steps_applied: list[str] = []

    # Paso 1: Restauración Facial Generativa GFPGAN v1.4
    if bool(effective.get("face_restore", False)) and float(effective.get("face_strength", 0)) > 1:
        work_bgr = restore_face_gfpgan(
            work_bgr,
            strength=float(effective.get("face_strength", 65)) / 100.0,
            eye_clarity=float(effective.get("eye_clarity", 25)) / 100.0,
            face_info=face_info,
        )
        steps_applied.append("gfpgan_face_restore")

    # Paso 2: Súper-Resolución Real-ESRGAN x4
    if bool(effective.get("upscale", False)):
        work_bgr, work_alpha = upscale_realesrgan(
            work_bgr,
            alpha=work_alpha,
            mode=str(effective.get("upscale_mode", "fast")),
            target_max_height=1350,
        )
        face_info = detect_primary_face(work_bgr)
        steps_applied.append("realesrgan_upscale")

    # Paso 3: Calibración Fotográfica de Estudio
    work_bgr = calibrate_studio_grade(work_bgr, effective, face_info=face_info)
    steps_applied.append("studio_color_calibration")

    # Conservar escena completa mejorada (con fondo original intacto para modo Original / Bokeh / Pincel Restaurar)
    enhanced_scene_bgr = work_bgr.copy()
    original_for_bokeh = enhanced_scene_bgr

    # Paso 4: Remoción neuronal de fondo de estudio (sobre rostro/luz ya restaurados para máxima precisión capilar)
    if bool(effective.get("remove_bg", False)):
        work_bgr, work_alpha = remove_background_studio(
            work_bgr,
            mode=str(effective.get("matting_mode", "ensemble")),
            defringe=float(effective.get("defringe", 65)) / 100.0,
            edge_feather=float(effective.get("edge_feather", 1.2)),
            edge_shift=float(effective.get("edge_shift", 0.0)),
            face_info=face_info,
        )
        steps_applied.append("studio_matting")

    # Paso 5: Encuadre Biométrico Oficial (cuando se ejecuta en lotes o modo directo)
    if bool(effective.get("auto_frame", False)):
        work_bgr, work_alpha = apply_biometric_alignment_and_crop(
            work_bgr,
            alpha=work_alpha,
            face_info=face_info,
            extra_rotation_deg=float(effective.get("rotation", 0.0)),
        )
        enhanced_scene_bgr, _ = apply_biometric_alignment_and_crop(
            enhanced_scene_bgr,
            alpha=None,
            face_info=face_info,
            extra_rotation_deg=float(effective.get("rotation", 0.0)),
        )
        original_for_bokeh = enhanced_scene_bgr
        steps_applied.append("biometric_framing")

    # Si el Estudio Interactivo solicita capas separadas no destructivas (escena completa + recorte RGBA alineado)
    cutout_data_url: str | None = None
    return_layers = bool(opts.get("return_layers", False))
    if return_layers and work_alpha is not None:
        cutout_png = encode_output_png(work_bgr, work_alpha)
        cutout_data_url = "data:image/png;base64," + base64.b64encode(cutout_png).decode("utf-8")

    # Paso 6: Escenario de Estudio y Sombra 3D
    bg_type = str(effective.get("bg_type", "transparent" if work_alpha is not None else "keep"))
    if not return_layers and work_alpha is not None and bg_type != "keep":
        work_bgr, work_alpha = compose_studio_backdrop(
            work_bgr,
            work_alpha,
            bg_type=bg_type,
            bg_color=str(effective.get("bg_color", "#ffffff")),
            bg_color_secondary=str(effective.get("bg_color_secondary", "#cbd5e1")),
            drop_shadow=float(effective.get("drop_shadow", 0)),
            original_bgr=original_for_bokeh,
        )
        steps_applied.append(f"backdrop_{bg_type}")

    final_bgr = enhanced_scene_bgr if (return_layers and cutout_data_url is not None) else work_bgr
    final_alpha = None if (return_layers and cutout_data_url is not None) else work_alpha

    post_diagnosis = analyze_photo(work_bgr, work_alpha)
    meta: dict[str, Any] = {
        "duration_seconds": round(time.time() - t0, 2),
        "engine": "MMM-Studio-Agent-2.0",
        "steps_applied": steps_applied,
        "applied_params": effective,
        "width": int(final_bgr.shape[1]),
        "height": int(final_bgr.shape[0]),
        "has_alpha": final_alpha is not None or cutout_data_url is not None,
        "before_score": diagnosis["quality_score"],
        "after_score": max(diagnosis["quality_score"], post_diagnosis["quality_score"]),
        "diagnosis": post_diagnosis,
    }
    if cutout_data_url is not None:
        meta["cutout_data_url"] = cutout_data_url

    return final_bgr, final_alpha, meta
