import cv2
import numpy as np
import joblib


MODEL_PATH = "backend/models/emotion_model.pkl"

classes = {
    0: "angry",
    1: "disgust",
    2: "fear",
    3: "happy",
    4: "neutral",
    5: "sad",
    6: "surprise"
}


model = joblib.load(MODEL_PATH)

print("Model loaded successfully")


image_path = input("Enter image path: ")

image = cv2.imread(image_path)

if image is None:
    print("Could not read image")
    exit()


image = cv2.resize(image, (64, 64))
image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
image = image / 255.0
image = image.flatten()

image = np.array([image])


prediction = model.predict(image)[0]

print("Predicted emotion:", classes[prediction])