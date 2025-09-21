// components/VoiceRecorder.js
"use client";
import { useState } from "react";

const VoiceRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    let mediaRecorder: MediaRecorder | null = null;
    let audioChunks: Blob[] = [];

    // Start recording when the user clicks the button
    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: "audio/wav" });
            const url = URL.createObjectURL(blob);
            setAudioBlob(blob);
            setAudioUrl(url);
        };

        mediaRecorder.start();
        setIsRecording(true);
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
        setIsRecording(false);
    };

    // Upload the audio to the FastAPI backend
    const uploadRecording = async () => {
        if (!audioBlob) return alert("No audio to upload!");

        const formData = new FormData();
        formData.append("file", audioBlob, "audio.wav");

        try {
            const response = await fetch("http://localhost:8000/upload/", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            alert(result.message);
        } catch (error) {
            alert("Error uploading the file.");
        }
    };

    return (
        <div>
            <h2>Voice Recorder</h2>
            <button onClick={startRecording} disabled={isRecording}>
                Start Recording
            </button>
            <button onClick={stopRecording} disabled={!isRecording}>
                Stop Recording
            </button>
            <button onClick={uploadRecording} disabled={!audioBlob}>
                Upload Recording
            </button>
            {audioUrl && <audio controls src={audioUrl}></audio>}
        </div>
    );
};

export default VoiceRecorder;
