# services/backend/app.py

import sys
import os
import shutil
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

# ==========================
# Add 'services' folder to PYTHONPATH
# ==========================
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# ==========================
# Import ML Predict Function
# ==========================
from detectionModel.predict import predict

# ==========================
# Flask App Setup
# ==========================
BASE_DIR = os.path.dirname(__file__)
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ==========================
# Enable CORS
# ==========================
from flask_cors import CORS
CORS(app)

# ==========================
# Serve Uploaded Images
# ==========================
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    """Serve image files stored in uploads/"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# ==========================
# Prediction Route
# ==========================
@app.route("/predict", methods=["POST"])
def predict_leaf():
    """Receive images + city, run model, return predictions."""

    if "files" not in request.files or "city" not in request.form:
        return jsonify({"error": "Missing files or city"}), 400

    files = request.files.getlist("files")
    city = request.form["city"]

    # ==================================
    # CLEAR OLD IMAGES BEFORE PROCESSING
    # ==================================
    try:
        shutil.rmtree(app.config["UPLOAD_FOLDER"])
    except:
        pass

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    results = []

    for file in files:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

        # Save file
        file.save(filepath)

        try:
            prediction = predict(filepath, city)
            prediction["image"] = filename  # Attach filename
            results.append(prediction)
        except Exception as e:
            results.append({
                "image": filename,
                "error": str(e)
            })

    return jsonify({
        "images": [r["image"] for r in results],
        "predictions": results
    })


# ==========================
# Entry Point
# ==========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
