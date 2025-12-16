# services/detectionModel/predict.py

import sys
import os
sys.path.append(os.path.dirname(__file__))  # ensures model.py is found

import json
import torch
from torchvision import transforms
from PIL import Image
import cv2
import numpy as np
import requests
import random
from model import PlantDiseaseNet

# ======================
# Config
# ======================
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Absolute paths based on current file location
MODEL_PATH = os.path.join(os.path.dirname(__file__), "plant_disease_model_final123.pth")
CLASSES_PATH = os.path.join(os.path.dirname(__file__), "classes.json")

API_KEY = "2ab24bd4b4cfdb700a6c55c1aac01abb"
CONFIDENCE_THRESHOLD = 0.65

# ======================
# Load classes
# ======================
with open(CLASSES_PATH, "r") as f:
    classes = json.load(f)

NUM_CLASSES = len(classes)

# ======================
# Load model
# ======================
model = PlantDiseaseNet(num_classes=NUM_CLASSES).to(DEVICE)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.eval()

# ======================
# Transform
# ======================
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ======================
# Helper - Split class
# ======================
def split_class_name(class_name: str):
    parts = class_name.split("_")
    plant = parts[0]
    disease = " ".join(parts[1:]) if len(parts) > 1 else "Unknown"
    return plant, disease

# ======================
# Severity calculation
# ======================
def calculate_severity(image_path, is_healthy=False):
    if is_healthy:
        return "Low", round(random.uniform(0.0, 9.9), 2)

    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 120, 255, cv2.THRESH_BINARY_INV)
    mask = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, np.ones((5,5), np.uint8))
    total = img.shape[0] * img.shape[1]
    damaged = cv2.countNonZero(mask)
    damage_percent = (damaged / total) * 100

    if damage_percent < 20:
        severity = "Low"
    elif damage_percent < 50:
        severity = "Moderate"
    else:
        severity = "High"

    return severity, round(damage_percent, 2)

# ======================
# Weather forecast
# ======================
def get_weather_forecast(city):
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url).json()

    if "list" not in response:
        return []

    daily = []
    added = set()

    for e in response['list']:
        date_str, time_str = e['dt_txt'].split(" ")
        if time_str == "12:00:00" and date_str not in added:
            daily.append({
                "date": e['dt_txt'],
                "temp": e['main']['temp'],
                "humidity": e['main']['humidity'],
                "rain": e.get('rain', {}).get('3h', 0)
            })
            added.add(date_str)

    return daily

# ======================
# Outbreak prediction
# ======================
def predict_outbreak(weather_data, ndvi_trend=0.8, days=5, is_healthy=False):
    risks = []

    for day in weather_data[:days]:

        if is_healthy:
            risks.append({"date": day["date"], "risk": "Low"})
            continue

        temp = day["temp"]
        hum = day["humidity"]
        rain = day["rain"]

        score = 0.0

        # ---- Temperature scoring (0–3 points) ----
        # Perfect zone: 22–28C → +3
        # Good zone: 18–32C → +1.5
        if 22 <= temp <= 28:
            score += 3
        elif 18 <= temp <= 32:
            score += 1.5
        else:
            score += 0.5

        # ---- Humidity scoring (0–3 points) ----
        if hum >= 85:
            score += 3
        elif hum >= 70:
            score += 2
        elif hum >= 50:
            score += 1
        else:
            score += 0.5

        # ---- Rainfall scoring (0–2 points) ----
        score += min(rain / 2, 2)  # converts mm rain into 0–2 points

        # ---- NDVI scoring (0–1 point) ----
        if ndvi_trend < 0.7:
            score += 1

        # ---- Final risk classification ----
        if score < 3:
            risk = "Low"
        elif score < 6:
            risk = "Medium"
        else:
            risk = "High"

        risks.append({"date": day["date"], "risk": risk})

    return risks
# ======================
# Main Prediction Function
# ======================
def predict(image_path, city):
    img = Image.open(image_path).convert("RGB")
    input_tensor = transform(img).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(input_tensor)
        if isinstance(outputs, tuple):
            outputs = outputs[0]

        probs = torch.softmax(outputs, dim=1)
        conf, pred_idx = torch.max(probs, dim=1)

        confidence = float(conf)
        predicted_class = classes[pred_idx.item()]

    if confidence < CONFIDENCE_THRESHOLD:
        return {
            "plant": "Unknown",
            "disease": "Not Applicable",
            "confidence": confidence,
            "severity": "N/A",
            "damage_percent": 0,
            "forecast": []
        }

    plant, disease = split_class_name(predicted_class)
    is_healthy = "healthy" in disease.lower()

    severity, damage_percent = calculate_severity(image_path, is_healthy)
    weather_data = get_weather_forecast(city)
    forecast = predict_outbreak(weather_data, days=5, is_healthy=is_healthy)

    return {
        "plant": plant,
        "disease": disease,
        "confidence": confidence,
        "severity": severity,
        "damage_percent": damage_percent,
        "forecast": forecast
    }

# ======================
# CLI for testing
# ======================
if __name__ == "__main__":
    image_path = input("Enter leaf image path: ").strip()
    city = input("Enter city name: ").strip()
    result = predict(image_path, city)
    print("\nPrediction Result:")
    print(result)
