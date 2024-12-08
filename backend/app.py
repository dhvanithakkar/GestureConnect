from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64
from keras.models import model_from_json # type: ignore
from models.emotion_detection_model import detect_emotion
from models.isl_prediction_model import detect_sign_language
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class CustomCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Handle WebSocket connections
        if request.scope.get("type") == "websocket":
            origin = request.headers.get('origin', '')
            if not origin:
                return Response("Forbidden", status_code=403)
            
            # Add more specific origin checks if needed
            allowed_origins = [
                "http://localhost:3000",
                "https://localhost:3000"
            ]
            
            if origin not in allowed_origins:
                return Response("Forbidden", status_code=403)
        
        # Continue with the request
        response = await call_next(request)
        return response

app = FastAPI()

# Add custom CORS middleware
app.add_middleware(CustomCORSMiddleware)

@app.websocket("/ws/emotion-detection")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive base64 encoded frame
            data = await websocket.receive_text()
            
            # Decode base64 to numpy array
            image_bytes = base64.b64decode(data)
            nparr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Detect emotions
            emotions = detect_emotion(frame)
            
            # Send back detection results
            await websocket.send_json(emotions)
    
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error in websocket: {e}")
        await websocket.close()


# Add standard CORS middleware for additional protection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/sign-language-detection")
async def websocket_endpoint(websocket: WebSocket):
    # Add CORS headers manually
    await websocket.accept()
    
    try:
        while True:
            # Receive base64 encoded frame
            data = await websocket.receive_text()
            
            # Decode base64 to numpy array
            image_bytes = base64.b64decode(data)
            nparr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Detect sign language
            signs = detect_sign_language(frame)
            
            # Send back detection results
            await websocket.send_json(signs)
    
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error in websocket: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    # Run on all interfaces and port 8000
    uvicorn.run(app, host="127.0.0.0", port=8000)
