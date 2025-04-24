import whisper
import asyncio
import os
import uuid
import cv2
import numpy as np
import base64
from elevenlabs import ElevenLabs, VoiceSettings, save
from fastapi import FastAPI, UploadFile, File, HTTPException, Body, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from pydantic import BaseModel
from models.emotion_detection_model import detect_emotion
from models.isl_prediction_model import detect_isl
# from models.bsl_prediction_model import detect_bsl

# Set Eleven Labs API Key
client = ElevenLabs(
    api_key="sk_ebb815a15f7d16f616e3897f2859a3d276bdd36c0da98922",
)
# Load Whisper model
voice_model = whisper.load_model("tiny")

# Custom CORS middleware for WebSocket connections
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

# Initialize FastAPI app
app = FastAPI()

# Add custom CORS middleware
app.add_middleware(CustomCORSMiddleware)

# Add standard CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request body model for TTS
class TTSNER(BaseModel):
    text: str
    voiceID: str
    speed: float
    style: float

# Text-to-Speech endpoint
@app.post("/labs-tts/")
async def labs_tts(request: TTSNER = Body(...)):
    try:
        out = f"{uuid.uuid4()}.ogg"

        async def remove():
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, lambda: os.remove(out))

        audio = client.text_to_speech.convert(
            voice_id=request.voiceID,
            output_format="mp3_44100_128",
            text= request.text,
            model_id="eleven_multilingual_v2",
            voice_settings = VoiceSettings(
                style=request.style,
                speed=request.speed
            )
        )


        save(audio, out)
        
        return FileResponse(out, headers={"Content-Disposition": f"attachment; filename={out}"}, background=remove)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Speech-to-Text endpoint
@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        audio_path = f"{uuid.uuid4()}.webm"
        
        with open(audio_path, "wb") as f:
            f.write(await file.read())
        
        result = voice_model.transcribe(whisper.pad_or_trim(whisper.load_audio(audio_path)))
        text = result["text"]
        src_lang = result["language"]
        
        os.remove(audio_path)
        
        return {"text": text, "src_lang": src_lang}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Emotion detection WebSocket endpoint
@app.websocket("/ws/emotion-detection")
async def emotion_detection_websocket(websocket: WebSocket):
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

# Sign language detection WebSocket endpoint
@app.websocket("/ws/isl-sign-language-detection")
async def sign_language_detection_websocket(websocket: WebSocket):
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
            signs = detect_isl(frame)
            
            # Send back detection results
            await websocket.send_json(signs)
    
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error in websocket: {e}")
        await websocket.close()

# BSL (British Sign Language) detection WebSocket endpoint
# @app.websocket("/ws/bsl-sign-language-detection")
# async def bsl_detection_websocket(websocket: WebSocket):
#     await websocket.accept()
    
#     try:
#         # Track framerate
#         frame_count = 0
#         start_time = asyncio.get_event_loop().time()
#         framerate = 0.0
        
#         while True:
#             # Receive base64 encoded frame
#             data = await websocket.receive_text()
            
#             # Decode base64 to numpy array
#             image_bytes = base64.b64decode(data)
#             nparr = np.frombuffer(image_bytes, np.uint8)
#             frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
#             # Detect BSL signs
#             result = detect_bsl(frame)
            
#             # Calculate framerate
#             frame_count += 1
#             current_time = asyncio.get_event_loop().time()
#             elapsed = current_time - start_time
            
#             if elapsed > 1.0:
#                 framerate = frame_count / elapsed
#                 frame_count = 0
#                 start_time = current_time
            
#             # Add framerate to result
#             result["framerate"] = round(framerate, 2)
            
#             # Send back detection results
#             await websocket.send_json(result)
    
#     except WebSocketDisconnect:
#         print("BSL client disconnected")
#     except Exception as e:
#         print(f"Error in BSL websocket: {e}")
#         await websocket.close()


if __name__ == "__main__":
    import uvicorn
    # Run on all interfaces and port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)