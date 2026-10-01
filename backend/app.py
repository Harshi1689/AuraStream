import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

import cv2
import numpy as np
import joblib


app = Flask(__name__)
CORS(app)


MODEL_PATH = "backend/models/emotion_model.pkl"

model = joblib.load(MODEL_PATH)


classes = {
    0: "angry",
    1: "disgust",
    2: "fear",
    3: "happy",
    4: "neutral",
    5: "sad",
    6: "surprise"
}


face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades +
    "haarcascade_frontalface_default.xml"
)


@app.route("/")
def home():
    return "Emotion Music Player Backend is running"


@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({
            "error": "No image received"
        }), 400


    image_file = request.files["image"]

    image_bytes = image_file.read()

    image_array = np.frombuffer(
        image_bytes,
        np.uint8
    )

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )


    if image is None:
        return jsonify({
            "error": "Invalid image"
        }), 400


    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )


    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(50, 50)
    )


    if len(faces) == 0:
        return jsonify({
            "error": "No face detected"
        }), 400


    x, y, w, h = max(
        faces,
        key=lambda face: face[2] * face[3]
    )


    face = gray[
        y:y+h,
        x:x+w
    ]


    face = cv2.resize(
        face,
        (64, 64)
    )


    face = face / 255.0

    face = face.flatten()

    face = np.array([face])


    prediction = model.predict(face)[0]

    emotion = classes[prediction]

    try:
        decision = model.decision_function(face)[0]
        exp_d = np.exp(decision - np.max(decision))
        probs = (exp_d / np.sum(exp_d)) * 100
        prob_dict = {classes[i]: round(float(probs[i]), 1) for i in range(len(classes))}
        confidence = round(float(probs[prediction]), 1)
    except Exception as e:
        print("Prob calculation error:", e)
        prob_dict = {emotion: 90.0}
        confidence = 90.0

    print("Detected emotion:", emotion, f"({confidence}%)")

    return jsonify({
        "emotion": emotion,
        "confidence": confidence,
        "probabilities": prob_dict
    })
# music logic
@app.route("/music/<emotion>/<filename>")
def music(emotion, filename):

    music_folder = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "music",
        emotion
    )

    return send_from_directory(
        music_folder,
        filename
    )

if __name__ == "__main__":
    app.run(debug=True)