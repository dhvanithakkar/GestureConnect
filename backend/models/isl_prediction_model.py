import cv2
import mediapipe as mp
import copy
import itertools
import numpy as np
import pandas as pd
import string
from tensorflow import keras

# Load the saved model
model = keras.models.load_model("models/islprediction.h5")

# MediaPipe setup
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
mp_hands = mp.solutions.hands

# Alphabet setup
alphabet = ['1','2','3','4','5','6','7','8','9']
alphabet += list(string.ascii_uppercase)

def calc_landmark_list(image, landmarks):
    """Calculate landmark points from MediaPipe hand landmarks."""
    image_width, image_height = image.shape[1], image.shape[0]

    landmark_point = []
    for _, landmark in enumerate(landmarks.landmark):
        landmark_x = min(int(landmark.x * image_width), image_width - 1)
        landmark_y = min(int(landmark.y * image_height), image_height - 1)
        landmark_point.append([landmark_x, landmark_y])

    return landmark_point

def pre_process_landmark(landmark_list):
    """Preprocess landmark points for model input."""
    temp_landmark_list = copy.deepcopy(landmark_list)

    # Convert to relative coordinates
    base_x, base_y = temp_landmark_list[0][0], temp_landmark_list[0][1]
    temp_landmark_list = [[point[0] - base_x, point[1] - base_y] for point in temp_landmark_list]

    # Convert to a one-dimensional list and normalize
    temp_landmark_list = list(itertools.chain.from_iterable(temp_landmark_list))
    max_value = max(list(map(abs, temp_landmark_list)))
    
    temp_landmark_list = [n / max_value for n in temp_landmark_list]

    return temp_landmark_list

def detect_isl(frame):
    """Detect sign language in a given frame."""
    # Setup MediaPipe Hands
    with mp_hands.Hands(
        model_complexity=0,
        max_num_hands=2,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as hands:
        # Flip the image horizontally
        frame = cv2.flip(frame, 1)
        
        # Convert color space
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process frame
        results = hands.process(rgb_frame)
        
        detections = []
        if results.multi_hand_landmarks:
            for hand_landmarks, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
                # Calculate landmark list
                landmark_list = calc_landmark_list(frame, hand_landmarks)
                
                # Preprocess landmarks
                pre_processed_landmark_list = pre_process_landmark(landmark_list)
                
                # Prepare for prediction
                df = pd.DataFrame(pre_processed_landmark_list).transpose()
                
                # Predict sign
                predictions = model.predict(df, verbose=0)
                predicted_classes = np.argmax(predictions, axis=1)
                label = alphabet[predicted_classes[0]]
                confidence = float(np.max(predictions))
                
                # Get bounding box
                x_coords = [lm[0] for lm in landmark_list]
                y_coords = [lm[1] for lm in landmark_list]
                x_min, x_max = min(x_coords), max(x_coords)
                y_min, y_max = min(y_coords), max(y_coords)
                
                detections.append({
                    'x': int(x_min),
                    'y': int(y_min),
                    'width': int(x_max - x_min),
                    'height': int(y_max - y_min),
                    'sign': label,
                    'confidence': confidence
                })
        
        return detections

