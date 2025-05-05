import cv2
import mediapipe as mp
import numpy as np
import pickle
framerate = 0.0

def image_processed(hand_img):
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

with open('models/one_hand_model.pkl', 'rb') as f:
    one_hand_model = pickle.load(f)
    
with open('models/two_hand_model.pkl', 'rb') as f:
    two_hand_model = pickle.load(f)

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Cannot open camera")
    exit()

frame_count = 0
start_time = cv2.getTickCount()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Can't receive frame (stream end?). Exiting ...")
        break

    landmarks_list = image_processed(frame)

    if len(landmarks_list) == 0:
        output = "PREDICTION"
    else:
        if len(landmarks_list) == 1:
            model = one_hand_model
            data = np.array(landmarks_list[0]).reshape(1, -1)
        elif len(landmarks_list) == 2:
            model = two_hand_model
            data = np.concatenate(landmarks_list[:2]).reshape(1, -1) if len(landmarks_list) > 1 else np.array(landmarks_list[0]).reshape(1, -1)
            
        y_pred = model.predict(data)
        output = str(y_pred[0])
        
    frame_count += 1
    current_time = cv2.getTickCount()
    elapsed_time = (current_time - start_time) / cv2.getTickFrequency()
    if elapsed_time > 1:
        framerate = frame_count / elapsed_time
        frame_count = 0
        start_time = cv2.getTickCount()

    frame = cv2.putText(frame, 'OUTPUT: ' + output, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.25, (255, 0, 0), 3, cv2.LINE_AA)
    frame = cv2.putText(frame, f'FPS: {framerate:.2f}', (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1.25, (255, 0, 0), 3, cv2.LINE_AA)

    cv2.imshow('frame', frame)
    if cv2.waitKey(1) == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()