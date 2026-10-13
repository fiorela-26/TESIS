import os
import time

import cv2
import requests
from dotenv import load_dotenv
from ultralytics import YOLO

load_dotenv()

API_URL = os.getenv("API_URL", "http://localhost:3000")
API_KEY = os.getenv("API_KEY", "")
PUNTO_CONTROL_ID = int(os.getenv("PUNTO_CONTROL_ID", "1"))
FUENTE = os.getenv("FUENTE_VIDEO", "0")
CONFIANZA = float(os.getenv("CONFIANZA", "0.5"))
ESPERA_SEGUNDOS = 10  # tiempo mínimo entre alertas para no enviar cientos de eventos

# Clases del modelo que significan infracción -> EPP que falta
INFRACCIONES = {
    "NO-Hardhat": "casco",
    "NO-Safety Vest": "chaleco",
}

model = YOLO("best.pt")
cap = cv2.VideoCapture(int(FUENTE) if FUENTE.isdigit() else FUENTE)
ultimo_envio = 0


def subir_foto(imagen):
    ok, buf = cv2.imencode(".jpg", imagen)
    if not ok:
        return None
    try:
        r = requests.post(
            f"{API_URL}/eventos-epp/foto",
            files={"foto": ("evento.jpg", buf.tobytes(), "image/jpeg")},
            headers={"x-api-key": API_KEY},
            timeout=10,
        )
        r.raise_for_status()
        return r.json().get("fotoUrl")
    except requests.RequestException as e:
        print("No se pudo subir la foto:", e)
        return None


def enviar_evento(faltantes, foto_url):
    payload = {"puntoControlId": PUNTO_CONTROL_ID, "eppFaltantes": faltantes}
    if foto_url:
        payload["fotoUrl"] = foto_url
    try:
        r = requests.post(
            f"{API_URL}/eventos-epp",
            json=payload,
            headers={"x-api-key": API_KEY},
            timeout=5,
        )
        print(f"Evento enviado {faltantes} foto={foto_url} -> {r.status_code}")
    except requests.RequestException as e:
        print("No se pudo enviar el evento:", e)


while True:
    ok, frame = cap.read()
    if not ok:
        break

    resultado = model(frame, conf=CONFIANZA, verbose=False)[0]
    imagen = resultado.plot()
    detectadas = {model.names[int(c)] for c in resultado.boxes.cls}
    faltantes = sorted({INFRACCIONES[n] for n in detectadas if n in INFRACCIONES})

    ahora = time.time()
    if faltantes and ahora - ultimo_envio >= ESPERA_SEGUNDOS:
        enviar_evento(faltantes, subir_foto(imagen))
        ultimo_envio = ahora

    cv2.imshow("SystemSafety AI - Detector (q para salir)", imagen)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()