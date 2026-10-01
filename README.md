# AuraStream – Context-Aware Audio Delivery System

AuraStream is an end-to-end web application that uses **real-time computer vision and machine learning to detect facial expressions and dynamically select music based on the detected emotional state**.

The system captures a user's facial image through a webcam, processes the face using OpenCV, predicts the emotion using a trained **Linear SVM** model, and maps the detected emotion to a corresponding local music category.

---

## 🚀 Project Overview

The application follows this pipeline:

```text
User opens website
        ↓
Landing page
        ↓
Camera page
        ↓
Webcam captures frame
        ↓
JavaScript sends image to Flask
        ↓
OpenCV detects face
        ↓
Face is cropped
        ↓
Grayscale conversion
        ↓
Resize to 64 × 64
        ↓
Pixel normalization
        ↓
Flatten into 4096 features
        ↓
Linear SVM predicts emotion
        ↓
Flask returns emotion as JSON
        ↓
JavaScript redirects to music page
        ↓
Emotion is passed through URL
        ↓
Matching music is selected
        ↓
Flask serves MP3
        ↓
Browser audio player plays music
```

---

## 🎯 Problem Statement

Traditional music players require users to manually select what they want to listen to.

AuraStream explores a more personalized approach by using **facial emotion as an input**.

For example:

```text
Detected emotion
       ↓
    happy
       ↓
Happy music category
       ↓
happy1.mp3 / happy2.mp3
```

The current implementation supports music categories for:

* Happy
* Sad
* Neutral

---

## 🛠️ Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Fetch API
* Web APIs for webcam access

### Backend

* Python
* Flask
* Flask-CORS

### Computer Vision

* OpenCV
* Haar Cascade Face Detection

### Machine Learning

* Scikit-learn
* Linear SVM (`LinearSVC`)

### Numerical Processing

* NumPy

### Model Storage

* Joblib
* `.pkl` model artifact

### Development Tools

* Git
* GitHub
* VS Code
* Python Virtual Environment

---

## 🏗️ System Architecture

AuraStream consists of three main layers:

```text
┌──────────────────────────────┐
│          Frontend            │
│                              │
│ HTML + CSS + JavaScript      │
│ Webcam + UI + Audio Player   │
└──────────────┬───────────────┘
               │
               │ HTTP
               ↓
┌──────────────────────────────┐
│       Flask Backend          │
│                              │
│ Image Processing             │
│ REST APIs                    │
│ Model Inference              │
│ Music File Serving           │
└──────────────┬───────────────┘
               │
               ↓
┌──────────────────────────────┐
│      ML / Computer Vision    │
│                              │
│ OpenCV → Face Detection      │
│ Linear SVM → Emotion         │
└──────────────────────────────┘
```

---

## 📁 Project Structure

```text
AuraStream/
│
├── backend/
│   ├── app.py
│   └── models/
│       └── emotion_model.pkl
│
├── frontend/
│   ├── index.html
│   ├── camera.html
│   ├── music.html
│   ├── style.css
│   ├── script.js
│   └── music.js
│
├── music/
│   ├── happy/
│   │   ├── happy1.mp3
│   │   └── happy2.mp3
│   │
│   ├── sad/
│   │   ├── sad1.mp3
│   │   └── sad2.mp3
│   │
│   └── neutral/
│       ├── neutral1.mp3
│       └── neutral2.mp3
│
├── src/
│   ├── train.py
│   └── test_model.py
│
├── .gitignore
└── README.md
```

> **Note:** The training dataset and Python virtual environment are not included in the repository.

---

# 🧠 Machine Learning Pipeline

The project uses a **Linear Support Vector Machine (Linear SVM)** for emotion classification.

The model receives a processed facial image rather than the complete webcam frame.

```text
Webcam Frame
     ↓
Face Detection
     ↓
Face Crop
     ↓
Grayscale
     ↓
64 × 64 Resize
     ↓
Normalization
     ↓
Flatten
     ↓
4096 Features
     ↓
Linear SVM
     ↓
Emotion
```

---

## 📊 Dataset

The facial-expression dataset is organized into seven emotion classes:

```text
dataset/
└── train/
    ├── angry/
    ├── disgust/
    ├── fear/
    ├── happy/
    ├── neutral/
    ├── sad/
    └── surprise/
```

The class mapping is:

```text
0 → angry
1 → disgust
2 → fear
3 → happy
4 → neutral
5 → sad
6 → surprise
```

The training run used:

```text
Total images : 6436
Training     : 5148
Testing      : 1288
Split        : approximately 80/20
```

Each image is converted into:

```text
64 × 64 = 4096 features
```

---

# 🔄 Image Preprocessing

Every training and prediction image goes through the same preprocessing pipeline.

### 1. Grayscale Conversion

The image is converted from a color image to grayscale using OpenCV.

```python
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
```

This reduces the image to a single channel.

### 2. Resize

Each face is resized to:

```text
64 × 64
```

This ensures that every input has the same dimensions.

### 3. Normalization

Pixel values originally range from:

```text
0 – 255
```

They are normalized to approximately:

```text
0 – 1
```

using:

```python
face = face / 255.0
```

### 4. Flattening

The 64 × 64 image is converted into a one-dimensional vector:

```text
64 × 64 = 4096
```

Therefore the SVM receives:

```text
4096 numerical features
```

---

# 🏋️ Model Training

The training script is:

```text
src/train.py
```

The process is:

```text
Load Images
     ↓
Assign Labels
     ↓
Grayscale
     ↓
Resize
     ↓
Normalize
     ↓
Flatten
     ↓
Create X and y
     ↓
Train/Test Split
     ↓
Train Linear SVM
     ↓
Evaluate
     ↓
Save Model
```

The SVM is created using:

```python
LinearSVC()
```

and trained using:

```python
model.fit(X_train, y_train)
```

---

# 📈 Model Evaluation

The current implementation achieved approximately:

```text
Accuracy: 23.14%
```

This should be considered a **baseline implementation**, rather than a production-ready emotion recognition model.

The relatively low accuracy is expected from a simple approach based on flattened grayscale pixels and a Linear SVM.

### Possible improvements

Future versions could use:

* HOG features + SVM
* CNN-based emotion recognition
* Transfer learning
* Data augmentation
* Face alignment
* Better face detection
* Hyperparameter tuning
* Larger and more representative datasets
* Class balancing

---

# 💾 Model Storage

After training, the model is saved using Joblib:

```text
backend/models/emotion_model.pkl
```

The model is trained once and then loaded when the Flask application starts.

```text
Training
    ↓
emotion_model.pkl
    ↓
Flask starts
    ↓
Load model
    ↓
Prediction requests
```

This avoids retraining the model every time the application starts.

---

# 🎥 Webcam Processing

The frontend uses the browser's MediaDevices API:

```javascript
navigator.mediaDevices.getUserMedia({
    video: true
})
```

Once the user grants permission:

```text
Webcam
   ↓
MediaStream
   ↓
HTML <video>
```

When the user clicks **Detect My Emotion**, JavaScript captures the current frame using an HTML canvas.

```text
Video Frame
     ↓
Canvas
     ↓
Image Blob
     ↓
FormData
     ↓
POST /predict
```

---

# 🔌 REST API

AuraStream uses Flask to expose HTTP endpoints.

## 1. Emotion Prediction

### Endpoint

```text
POST /predict
```

### Request

The frontend sends the captured image as multipart form data:

```text
image = webcam image
```

### Processing

```text
Receive Image
     ↓
Decode Image
     ↓
Detect Face
     ↓
Crop Face
     ↓
Grayscale
     ↓
Resize 64 × 64
     ↓
Normalize
     ↓
Flatten
     ↓
SVM Prediction
```

### Response

Example:

```json
{
    "emotion": "happy"
}
```

---

## 2. Music API

### Endpoint

```text
GET /music/<emotion>/<filename>
```

Example:

```text
GET /music/happy/happy1.mp3
```

The Flask backend locates the requested file and sends the MP3 to the browser.

---

# 🔗 Frontend ↔ Backend Communication

The frontend communicates with Flask using the browser Fetch API.

Example:

```javascript
fetch("http://127.0.0.1:5000/predict", {
    method: "POST",
    body: formData
})
```

The backend returns JSON:

```json
{
    "emotion": "happy"
}
```

JavaScript then reads the emotion and redirects to:

```text
music.html?emotion=happy
```

---

# 🎵 Emotion-to-Music Mapping

The ML model is responsible only for **emotion classification**.

Music selection is handled separately using a rule-based mapping.

```text
ML Model
   ↓
happy
   ↓
JavaScript
   ↓
happy music folder
   ↓
happy1.mp3 / happy2.mp3
```

Current mapping:

```text
happy   → music/happy/
sad     → music/sad/
neutral → music/neutral/
```

The model recognizes seven emotions, while the current music library contains three categories.

Future versions can support all seven emotion categories.

---

# 🎧 Music Playback

The music page contains an HTML audio player:

```html
<audio id="audioPlayer" controls></audio>
```

JavaScript selects a music file and sets the audio source.

```text
Emotion
   ↓
music.js
   ↓
Select MP3
   ↓
GET /music/<emotion>/<filename>
   ↓
Flask
   ↓
MP3
   ↓
Browser Audio Player
```

Browser autoplay restrictions may require the user to click **Play**.

---

# 🗄️ Why No Database?

The current version does not require a database.

The application only needs:

```text
Dataset       → Model Training
Model         → Prediction
Music Folders  → Audio Files
```

There are currently no requirements for storing:

* User accounts
* User profiles
* Listening history
* Song metadata
* Persistent predictions

A database could be introduced in a future version for:

* User accounts
* Personalized playlists
* Listening history
* Song metadata
* User feedback
* Recommendation history

---

# 🔐 Privacy

The webcam image is captured when the user requests emotion detection.

The current implementation processes the image for prediction and does not require permanent storage of the webcam image.

The application is designed around local processing through the Flask backend.

---

# 🧩 Problems Faced & Solutions

## 1. OpenCV Compatibility

An OpenCV compatibility issue affected the Haar Cascade functionality.

### Solution

A compatible OpenCV version was installed:

```bash
python -m pip install opencv-python==4.10.0.84
```

---

## 2. Flask Dependency

The Flask package was initially unavailable in the active Python environment.

### Solution

The required dependencies were installed inside the project's virtual environment.

---

## 3. OpenCV Import During Training

The training script initially could not import OpenCV.

### Solution

OpenCV was installed inside the active `.venv` environment.

---

## 4. Dataset Organization

The training images needed to be organized according to their emotion classes.

```text
train/
├── angry/
├── disgust/
├── fear/
├── happy/
├── neutral/
├── sad/
└── surprise/
```

The folder names are used as class labels during training.

---

## 5. Long Training Time

Training required significant processing because thousands of images were converted into 4096-dimensional feature vectors.

### Solution

The model was trained separately and saved as:

```text
emotion_model.pkl
```

Future application runs load the saved model instead of retraining it.

---

## 6. Frontend Security / Origin Issue

Opening the HTML files directly using:

```text
file://
```

caused browser origin/security issues.

### Solution

The frontend was served through a local HTTP server:

```bash
python -m http.server 5500 --directory frontend
```

The frontend can then be accessed through:

```text
http://127.0.0.1:5500
```

---

## 7. Music API 404 Error

The music page initially displayed correctly, but Flask returned:

```text
404 Not Found
```

when requesting an MP3.

### Solution

The backend music route was updated to construct the correct absolute project path before serving the requested MP3.

---

## 8. Frontend-Backend Communication

The frontend runs on port `5500`, while Flask runs on port `5000`.

Flask-CORS was configured to allow the frontend to communicate with the backend during local development.

---

# ▶️ How to Run

## 1. Clone the Repository

```bash
git clone https://github.com/Harshi1689/AuraStream.git
cd AuraStream
```

---

## 2. Create a Virtual Environment

Windows:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\activate
```

---

## 3. Install Dependencies

Install the required packages:

```bash
pip install flask flask-cors opencv-python==4.10.0.84 numpy scikit-learn joblib
```

---

## 4. Start the Flask Backend

From the project root:

```powershell
python backend\app.py
```

Backend:

```text
http://127.0.0.1:5000
```

---

## 5. Start the Frontend

Open a second terminal and run:

```powershell
python -m http.server 5500 --directory frontend
```

Frontend:

```text
http://127.0.0.1:5500
```

Open:

```text
http://127.0.0.1:5500/index.html
```

---

# 🧪 Training the Model

If you want to retrain the model:

```powershell
python src\train.py
```

The training pipeline is:

```text
Dataset
   ↓
Preprocessing
   ↓
Train/Test Split
   ↓
Linear SVM
   ↓
Evaluation
   ↓
emotion_model.pkl
```

The dataset is intentionally excluded from the Git repository because of its size.

---

# 🔬 Testing the Saved Model

The saved model can be tested using:

```powershell
python src\test_model.py
```

This verifies that the trained model can be loaded and used for prediction.

---

# 📌 Training vs Prediction

An important distinction in the application is between training and inference.

### Training

Performed during development:

```text
Thousands of labeled images
        ↓
Preprocessing
        ↓
SVM Training
        ↓
Saved Model
```

### Prediction

Performed while the application is running:

```text
Webcam Image
      ↓
Preprocessing
      ↓
Saved Model
      ↓
Emotion Prediction
```

The model is **not retrained** every time a user clicks the emotion detection button.

---

# ⚠️ Current Limitations

1. The current Linear SVM baseline achieves approximately **23.14% accuracy**.
2. The model uses relatively simple flattened pixel features.
3. The Haar Cascade detector primarily targets frontal faces.
4. Poor lighting or face angles may affect detection and prediction.
5. The current music library supports only happy, sad, and neutral categories.
6. The current system does not maintain user profiles or listening history.
7. Automatic audio playback may be restricted by browser policies.

---

# 🚀 Future Improvements

### Machine Learning

* Replace raw pixel features with HOG features.
* Experiment with CNN-based models.
* Use transfer learning.
* Add data augmentation.
* Improve face alignment.
* Tune model hyperparameters.
* Evaluate using additional metrics such as precision, recall, and F1-score.

### Music System

* Support all seven emotion classes.
* Add larger music libraries.
* Add song metadata.
* Add personalized playlists.
* Add recommendation history.
* Add user feedback.

### Application

* User authentication.
* Listening history.
* Emotion history.
* Next/previous song controls.
* Confidence score display.
* Better mobile support.
* Production deployment.
* HTTPS and secure camera access.

---

# 📚 Key Technical Concepts Demonstrated

This project demonstrates practical implementation of:

* Computer Vision
* Facial Expression Recognition
* Machine Learning Classification
* Linear SVM
* Image Preprocessing
* OpenCV
* NumPy
* Scikit-learn
* Flask REST APIs
* JavaScript Fetch API
* Web Camera APIs
* Multipart Form Data
* JSON APIs
* CORS
* File Serving
* Frontend/Backend Integration
* Git and GitHub

---

# 💡 Key Learning

The main learning from AuraStream was understanding how different technologies can be integrated into a complete application.

Instead of treating machine learning and web development as separate components, the project connects them through a Flask API:

```text
Webcam
   ↓
JavaScript
   ↓
Flask API
   ↓
OpenCV
   ↓
Machine Learning Model
   ↓
Emotion
   ↓
JavaScript
   ↓
Music Selection
   ↓
Flask
   ↓
Audio Player
```

This provided practical experience in taking an ML model from **training and preprocessing to real-time application inference and user-facing functionality**.

---

## 👨‍💻 Author

**Harshith M**

MCA – BMS College of Engineering, Bengaluru

GitHub: [Harshi1689](https://github.com/Harshi1689)

---

## 📄 Project Status

**Status:** Working End-to-End Prototype

The current version demonstrates the complete flow from:

```text
Webcam Capture
      ↓
Face Detection
      ↓
Emotion Classification
      ↓
Emotion Mapping
      ↓
Music Selection
      ↓
Audio Playback
```

The ML component is currently a baseline implementation, with model accuracy and personalization planned for future improvement.
