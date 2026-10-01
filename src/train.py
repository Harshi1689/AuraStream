import cv2
import numpy as np
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score


DATASET_PATH = "dataset/train"
IMG_SIZE = 64
IMAGES_PER_CLASS = 1000

classes = {
    "angry": 0,
    "disgust": 1,
    "fear": 2,
    "happy": 3,
    "neutral": 4,
    "sad": 5,
    "surprise": 6
}

images = []
labels = []


for emotion, label in classes.items():

    folder = os.path.join(DATASET_PATH, emotion)

    print("Reading:", emotion)

    files = os.listdir(folder)[:IMAGES_PER_CLASS]

    for file in files:

        path = os.path.join(folder, file)

        image = cv2.imread(path)

        if image is None:
            continue

        image = cv2.resize(image, (IMG_SIZE, IMG_SIZE))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        image = image / 255.0
        image = image.flatten()

        images.append(image)
        labels.append(label)


X = np.array(images)
y = np.array(labels)


print("Total images:", len(X))
print("Image shape:", X.shape)
print("Labels shape:", y.shape)


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


print("Training images:", len(X_train))
print("Testing images:", len(X_test))


model = LinearSVC()

print("Training model...")

model.fit(X_train, y_train)

print("Training completed")


predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("Accuracy:", accuracy)


os.makedirs("backend/models", exist_ok=True)

joblib.dump(
    model,
    "backend/models/emotion_model.pkl"
)

print("Model saved successfully")