import cv2
import mediapipe as mp
import numpy as np
import pickle

# Load BSL models
with open('models/one_hand_model.pkl', 'rb') as f:
    one_hand_model = pickle.load(f)
    
with open('models/two_hand_model.pkl', 'rb') as f:
    two_hand_model = pickle.load(f)

def image_processed(hand_img):
    """Process image to extract hand landmarks"""
    img_rgb = cv2.cvtColor(hand_img, cv2.COLOR_BGR2RGB)

    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(static_image_mode=False,
                           max_num_hands=2, 
                           min_detection_confidence=0.5, 
                           min_tracking_confidence=0.5)
    
    output = hands.process(img_rgb)
    hands.close()

    landmarks_list = []
    if output.multi_hand_landmarks:
        for hand_landmarks in output.multi_hand_landmarks:
            landmarks = [np.array([landmark.x, landmark.y, landmark.z]) for landmark in hand_landmarks.landmark]
            landmarks = np.array(landmarks).flatten()
            landmarks_list.append(landmarks)

    return landmarks_list

def detect_bsl(frame):
    """Detect BSL signs from a frame"""
    landmarks_list = image_processed(frame)
    
    result = {
        "prediction": "NO_HANDS_DETECTED",
        "confidence": 0.0,
        "hands_detected": len(landmarks_list)
    }
    
    if len(landmarks_list) == 0:
        return result
    
    try:
        if len(landmarks_list) == 1:
            model = one_hand_model
            data = np.array(landmarks_list[0]).reshape(1, -1)
        else:  # 2 or more hands, use two_hand_model
            model = two_hand_model
            data = np.concatenate(landmarks_list[:2]).reshape(1, -1) if len(landmarks_list) > 1 else np.array(landmarks_list[0]).reshape(1, -1)
        
        # Get prediction and probability
        prediction = model.predict(data)[0]
        
        # If model supports probabilities, get them
        try:
            probabilities = model.predict_proba(data)[0]
            confidence = np.max(probabilities)
        except:
            confidence = 1.0  # Default if probabilities aren't available
            
        result = {
            "prediction": str(prediction),
            "letter": str(prediction)[-1],
            "confidence": float(confidence),
            "hands_detected": len(landmarks_list)
        }
    except Exception as e:
        result = {
            "prediction": "ERROR",
            "error": str(e),
            "hands_detected": len(landmarks_list)
        }
    
    return result