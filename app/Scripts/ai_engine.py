"""Mejora local de fotografías para credenciales ministeriales."""

import os
import time

import cv2
import numpy as np
import onnxruntime as ort

MODEL_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "storage", "app", "ai_models")
)
MODEL_NAMES = ("realesrgan_x4_photo.onnx", "realesr_general_x4.onnx")
MAX_INPUT_DIMENSION = 1024

_cached_session = None
_cached_model_name = None


def get_session():
    global _cached_session
    global _cached_model_name
    if _cached_session is None:
        model_path = next(
            (os.path.join(MODEL_DIR, name) for name in MODEL_NAMES if os.path.isfile(os.path.join(MODEL_DIR, name))),
            None,
        )
        if model_path is None:
            expected_path = os.path.join(MODEL_DIR, MODEL_NAMES[0])
            raise FileNotFoundError(f"Modelo ONNX Real-ESRGAN no encontrado en: {expected_path}")

        options = ort.SessionOptions()
        options.log_severity_level = 3
        options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        _cached_session = ort.InferenceSession(
            model_path,
            sess_options=options,
            providers=["CPUExecutionProvider"],
        )
        _cached_model_name = os.path.splitext(os.path.basename(model_path))[0]
    return _cached_session


def get_model_name() -> str:
    get_session()
    return _cached_model_name


def _detect_faces(image: np.ndarray) -> list[tuple[int, int, int, int]]:
    classifier = getattr(cv2, "CascadeClassifier", None)
    if classifier is None:
        return []

    cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
    detector = classifier(cascade_path)
    if detector.empty():
        return []

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    min_face_size = max(24, min(image.shape[:2]) // 12)
    faces = detector.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(min_face_size, min_face_size),
    )
    return [tuple(int(value) for value in face) for face in faces]


def _prepare_image(image: np.ndarray) -> np.ndarray:
    denoised = cv2.fastNlMeansDenoisingColored(
        image,
        None,
        h=3,
        hColor=3,
        templateWindowSize=7,
        searchWindowSize=17,
    )
    lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
    luminance, chroma_a, chroma_b = cv2.split(lab)
    adjusted_luminance = cv2.createCLAHE(clipLimit=1.15, tileGridSize=(8, 8)).apply(luminance)
    luminance = cv2.addWeighted(luminance, 0.86, adjusted_luminance, 0.14, 0)
    prepared = cv2.cvtColor(cv2.merge((luminance, chroma_a, chroma_b)), cv2.COLOR_LAB2BGR)

    ycrcb = cv2.cvtColor(prepared, cv2.COLOR_BGR2YCrCb)
    skin_mask = cv2.inRange(ycrcb, np.array((0, 125, 65)), np.array((255, 185, 140)))
    skin_pixels = skin_mask > 0
    if np.any(skin_pixels):
        soft_mask = cv2.GaussianBlur(skin_mask, (0, 0), 2.0).astype(np.float32) / 255.0
        prepared_lab = cv2.cvtColor(prepared, cv2.COLOR_BGR2LAB)
        luminance, chroma_a, chroma_b = cv2.split(prepared_lab)
        equalized = cv2.createCLAHE(clipLimit=1.2, tileGridSize=(8, 8)).apply(luminance)
        shadow_lift = min(8.0, max(0.0, (128.0 - float(np.mean(luminance[skin_pixels]))) * 0.08))
        corrected_luminance = cv2.addWeighted(luminance, 0.82, equalized, 0.18, shadow_lift)
        blend = (soft_mask * 0.45)[:, :, np.newaxis]
        corrected = cv2.cvtColor(
            cv2.merge((corrected_luminance, chroma_a, chroma_b)),
            cv2.COLOR_LAB2BGR,
        )
        prepared = np.clip(
            prepared.astype(np.float32) * (1.0 - blend) + corrected.astype(np.float32) * blend,
            0,
            255,
        ).astype(np.uint8)
        smoothed = cv2.bilateralFilter(prepared, d=7, sigmaColor=20, sigmaSpace=7)
        blend = (soft_mask * 0.08)[:, :, np.newaxis]
        prepared = np.clip(
            prepared.astype(np.float32) * (1.0 - blend) + smoothed.astype(np.float32) * blend,
            0,
            255,
        ).astype(np.uint8)

    for x, y, width, height in _detect_faces(prepared):
        x_end = min(x + width, prepared.shape[1])
        y_end = min(y + height, prepared.shape[0])
        face = prepared[y:y_end, x:x_end]
        if face.size == 0:
            continue

        face_lab = cv2.cvtColor(face, cv2.COLOR_BGR2LAB)
        face_luminance, face_a, face_b = cv2.split(face_lab)
        equalized = cv2.createCLAHE(clipLimit=1.35, tileGridSize=(4, 4)).apply(face_luminance)
        shadow_lift = min(8.0, max(0.0, (128.0 - float(np.mean(face_luminance))) * 0.08))
        face_luminance = cv2.addWeighted(face_luminance, 0.78, equalized, 0.22, shadow_lift)
        corrected_face = cv2.cvtColor(
            cv2.merge((face_luminance, face_a, face_b)),
            cv2.COLOR_LAB2BGR,
        )

        ycrcb = cv2.cvtColor(corrected_face, cv2.COLOR_BGR2YCrCb)
        skin_mask = cv2.inRange(ycrcb, np.array((0, 125, 65)), np.array((255, 185, 140)))
        skin_mask = cv2.GaussianBlur(skin_mask, (0, 0), 2.0).astype(np.float32) / 255.0
        smoothed_face = cv2.bilateralFilter(corrected_face, d=7, sigmaColor=22, sigmaSpace=7)
        blend = (skin_mask * 0.12)[:, :, np.newaxis]
        corrected_face = np.clip(
            corrected_face.astype(np.float32) * (1.0 - blend)
            + smoothed_face.astype(np.float32) * blend,
            0,
            255,
        ).astype(np.uint8)
        prepared[y:y_end, x:x_end] = corrected_face

    return prepared


def enhance_cv2_image(img_bgr: np.ndarray) -> np.ndarray:
    if img_bgr is None or img_bgr.ndim != 3 or img_bgr.shape[2] != 3:
        raise ValueError("La imagen debe ser una fotografía en color válida.")

    height, width = img_bgr.shape[:2]
    if height == 0 or width == 0:
        raise ValueError("La fotografía no puede estar vacía.")

    scale = min(1.0, MAX_INPUT_DIMENSION / max(height, width))
    if scale < 1:
        img_bgr = cv2.resize(
            img_bgr,
            (max(1, round(width * scale)), max(1, round(height * scale))),
            interpolation=cv2.INTER_AREA,
        )

    height, width = img_bgr.shape[:2]
    prepared = _prepare_image(img_bgr)

    pad_h = (8 - (height % 8)) % 8
    pad_w = (8 - (width % 8)) % 8
    padded = cv2.copyMakeBorder(prepared, 0, pad_h, 0, pad_w, cv2.BORDER_REFLECT)
    rgb = cv2.cvtColor(padded, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    tensor = np.transpose(rgb, (2, 0, 1))[np.newaxis, ...]

    session = get_session()
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name
    output = session.run([output_name], {input_name: tensor})[0][0]
    output = np.clip(np.transpose(output, (1, 2, 0)) * 255.0, 0, 255).astype(np.uint8)
    enhanced = cv2.cvtColor(output, cv2.COLOR_RGB2BGR)[: height * 4, : width * 4]

    if enhanced.shape[0] != height * 4 or enhanced.shape[1] != width * 4:
        raise ValueError("El modelo de mejora no produjo una imagen con resolución x4.")

    lab = cv2.cvtColor(enhanced, cv2.COLOR_BGR2LAB)
    luminance, chroma_a, chroma_b = cv2.split(lab)
    softened_luminance = cv2.GaussianBlur(luminance, (0, 0), 0.9)
    fine_detail = luminance.astype(np.float32) - softened_luminance.astype(np.float32)
    fine_detail[np.abs(fine_detail) < 2.0] = 0
    crisp_luminance = np.clip(
        luminance.astype(np.float32) + fine_detail * 0.34,
        0,
        255,
    ).astype(np.uint8)
    return cv2.cvtColor(cv2.merge((crisp_luminance, chroma_a, chroma_b)), cv2.COLOR_LAB2BGR)


def enhance_file(input_path: str, output_path: str) -> dict:
    start_time = time.time()

    if not os.path.isfile(input_path):
        return {"success": False, "error": f"Archivo no encontrado: {input_path}"}

    img = cv2.imread(input_path, cv2.IMREAD_COLOR)
    if img is None:
        return {"success": False, "error": f"No se pudo decodificar la imagen: {input_path}"}

    try:
        enhanced = enhance_cv2_image(img)
        output_dir = os.path.dirname(os.path.abspath(output_path))
        os.makedirs(output_dir, exist_ok=True)

        if not cv2.imwrite(output_path, enhanced):
            return {"success": False, "error": "No se pudo guardar la fotografía mejorada."}

        return {
            "success": True,
            "output_path": output_path,
            "duration_seconds": round(time.time() - start_time, 2),
            "engine": get_model_name(),
            "width": int(enhanced.shape[1]),
            "height": int(enhanced.shape[0]),
        }
    except Exception as error:
        return {"success": False, "error": f"Error al mejorar la fotografía: {error}"}
