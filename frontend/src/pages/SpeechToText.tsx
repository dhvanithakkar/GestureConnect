"use client"

import React, { useState, useRef, useCallback } from "react"
import { Mic, Download, Copy, Loader2 } from "lucide-react"
import axios from 'axios';

async function transcribeAudio(formData: FormData) {
  try {
    const response = await axios.post(
      'http://localhost:8000/transcribe/', // Change if your backend URL is different
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

const SpeechToText = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcribedText, setTranscribedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState("en-US")
  const [recognitionMode, setRecognitionMode] = useState("continuous")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Start recording function
  const startRecording = useCallback(async () => {
    try {
      setError(null)
      audioChunksRef.current = []

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        await processAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      setError("Could not access microphone. Please check permissions.")
      setIsRecording(false)
    }
  }, [])

  // Stop recording function
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()

      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())

      setIsRecording(false)
    }
  }, [isRecording])

  // Process the recorded audio
  const processAudio = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true)

      // Create a FormData object to send to our server action
      const formData = new FormData()
      formData.append("file", audioBlob)

      // Call the server action to transcribe the audio
      const result = await transcribeAudio(formData)

      if (result.text) {
        if (recognitionMode === "continuous" && transcribedText) {
          setTranscribedText((prev) => prev + " " + result.text)
        } else {
          setTranscribedText(result.text)
        }
      } else {
        setError(result.error || "Failed to transcribe audio")
      }
    } catch (err) {
      console.error("Error processing audio:", err)
      setError("Error processing audio. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // Copy text to clipboard
  const copyToClipboard = () => {
    if (transcribedText) {
      navigator.clipboard
        .writeText(transcribedText)
        .then(() => {
          alert("Text copied to clipboard!")
        })
        .catch((err) => {
          console.error("Failed to copy text:", err)
        })
    }
  }

  // Download text as file
  const downloadText = () => {
    if (transcribedText) {
      const element = document.createElement("a")
      const file = new Blob([transcribedText], { type: "text/plain" })
      element.href = URL.createObjectURL(file)
      element.download = "transcription.txt"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Mic className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Speech to Text</h1>
          <p className="text-xl text-gray-600">Convert spoken words into text with high accuracy</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                  isRecording
                    ? "bg-red-100 text-red-600 animate-pulse"
                    : isProcessing
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={toggleRecording}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
                role="button"
                tabIndex={0}
              >
                {isProcessing ? <Loader2 className="w-16 h-16 animate-spin" /> : <Mic className="w-16 h-16" />}
              </div>
              <p className="text-lg font-medium">
                {isRecording
                  ? "Recording... Click to stop"
                  : isProcessing
                    ? "Processing audio..."
                    : "Click to start recording"}
              </p>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Transcribed Text</h2>
                <div className="flex space-x-2">
                  <button
                    className="p-2 text-gray-600 hover:text-gray-900"
                    onClick={copyToClipboard}
                    disabled={!transcribedText}
                    aria-label="Copy to clipboard"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-gray-900"
                    onClick={downloadText}
                    disabled={!transcribedText}
                    aria-label="Download as text file"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg min-h-[300px] whitespace-pre-wrap">
                {transcribedText || <p className="text-gray-500">Your transcribed text will appear here...</p>}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  Real-time transcription
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  Multiple language support
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  Punctuation detection
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  Export to multiple formats
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpeechToText