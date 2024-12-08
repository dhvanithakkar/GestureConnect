import cv2
import numpy as np
from tensorflow.keras.models import model_from_json
from tensorflow.keras.preprocessing.image import img_to_array

class EmotionRecognitionModel:
    def __init__(self, model_json_path, model_weights_path):
        # Load model architecture from JSON
        with open(model_json_path, 'r') as json_file:
            model_json = json_file.read()
        
        # Reconstruct model
        self.model = model_from_json(model_json)
        
        # Load weights
        self.model.load_weights(model_weights_path)
        
        # Emotion labels
        self.emotion_labels = [
            'Angry', 'Disgust', 'Fear', 
            'Happy', 'Sad', 'Surprise', 'Neutral'
        ]
        
        # Preprocessing parameters
        self.input_shape = (48, 48)  # Adjust based on your model's input size
    
    def preprocess_frame(self, frame):
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        processed_frame = frame.copy()
        
        for (x, y, w, h) in faces:
            # Extract face ROI
            roi_gray = gray[y:y+h, x:x+w]
            roi_gray = cv2.resize(roi_gray, self.input_shape)
            
            # Normalize
            roi = roi_gray.astype('float') / 255.0
            roi = img_to_array(roi)
            roi = np.expand_dims(roi, axis=0)
            
            # Predict emotion
            preds = self.model.predict(roi)[0]
            emotion_idx = np.argmax(preds)
            emotion = self.emotion_labels[emotion_idx]
            confidence = preds[emotion_idx]
            
            # Draw rectangle and emotion label
            color = (0, 255, 0)  # Green for detected face
            cv2.rectangle(processed_frame, (x, y), (x+w, y+h), color, 2)
            
            # Display emotion and confidence
            label = f'{emotion}: {confidence:.2f}'
            cv2.putText(processed_frame, label, 
                        (x, y-10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 
                        0.9, color, 2)
        
        return processed_frame

# Create model instances for different use cases
def process_emotion_model(frame):
    # Emotion recognition model for page 1
    model = EmotionRecognitionModel(
        model_json_path='models/emotiondetector.json', 
        model_weights_path='models/emotiondetector.h5'
    )
    return model.preprocess_frame(frame)

