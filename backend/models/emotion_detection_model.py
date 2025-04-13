import cv2
import numpy as np
import base64
from keras.models import model_from_json # type: ignore

# Load the emotion detection model
json_file = open("emotiondetector.json", "r")
model_json = json_file.read()
json_file.close()
model = model_from_json(model_json)
model.load_weights("emotiondetector.h5")

# Load Haar Cascade for face detection
haar_file = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
face_cascade = cv2.CascadeClassifier(haar_file)

# Labels for emotions
labels = {0: 'angry', 1: 'disgust', 2: 'fear', 3: 'happy', 4: 'neutral', 5: 'sad', 6: 'surprise'}

def extract_features(image):
    """Extract and normalize features from the image."""
    feature = np.array(image)
    feature = feature.reshape(1, 48, 48, 1)
    return feature / 255.0

def detect_emotion(frame):
    """Detect emotion in a given frame."""
    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Detect faces
    faces = face_cascade.detectMultiScale(frame, 1.3, 5)
    
    results = []
    for (p, q, r, s) in faces:
        # Extract face region
        face_image = gray[q:q+s, p:p+r]
        
        # Resize and prepare image for prediction
        face_image = cv2.resize(face_image, (48, 48))
        img = extract_features(face_image)
        
        # Predict emotion
        pred = model.predict(img)
        prediction_label = labels[pred.argmax()]
        confidence = float(np.max(pred))

        # TODO: DAMPEN SOUND VIA LIBROSA LATER.
        
        # Store face details and emotion
        results.append({
            'x': int(p),
            'y': int(q),
            'width': int(r),
            'height': int(s),
            'emotion': prediction_label,
            'confidence': confidence,
            'sound': prediction_label + ".wav"
        })
    
    return results

