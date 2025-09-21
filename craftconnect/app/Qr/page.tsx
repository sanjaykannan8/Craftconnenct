"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface StoryResponse {
    message: string;
    image_path: string;
    audio_path: string;
    qr_code_url: string;
    image_filename: string;
    audio_filename: string;
    transcript: string;
    output_language: string;
}

export default function QrPage() {
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [outputLanguage, setOutputLanguage] = useState<string>("English");
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [storyResponse, setStoryResponse] = useState<StoryResponse | null>(null);
    const [showResult, setShowResult] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error starting recording:", error);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedImageFile) {
            alert("Please select an image");
            return;
        }
        
        if (!audioBlob) {
            alert("Please record audio");
            return;
        }

        const formData = new FormData();
        formData.append("image", selectedImageFile);
        formData.append("output_language", outputLanguage);
        
        // Convert audio blob to file
        const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });
        formData.append("audio", audioFile);

        setIsLoading(true);

        try {
            // Use environment variable for backend URL with fallback
            const backendUrl = "https://api.0xkannan.ninja/create_story/";
            
            const response = await fetch(backendUrl, {
                method: "POST",
                body: formData,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data: StoryResponse = await response.json();
            console.log(data);
            setStoryResponse(data);
            setShowResult(true);

        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Error creating story. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadImage = async (imageUrl: string, filename: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Error downloading image. Please try again.');
        }
    };

    const resetForm = () => {
        setSelectedImage(null);
        setSelectedImageFile(null);
        setOutputLanguage("English");
        setAudioUrl(null);
        setAudioBlob(null);
        setStoryResponse(null);
        setShowResult(false);
        setIsLoading(false);
    };

    // Loading Screen
    if (isLoading) {
        return (
            <div className={styles.root}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <h2 className={styles.loadingTitle}>✨ Creating Your Story</h2>
                    <p className={styles.loadingText}>Hold tight while we craft something amazing for you...</p>
                    <div className={styles.loadingDots}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        );
    }

    // Result Screen
    if (showResult && storyResponse) {
        return (
            <div className={styles.root}>
                <div className={styles.nav}>
                    <span className={styles.text}>QR Connect</span>
                    <span className={styles.logo} onClick={() => router.push("/")}></span>
                    <span className={styles.text}>Marketing analytics</span>
                </div>
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        Your <span className={styles.highlight}>Story</span> is Ready! 🎉
                    </h1>
                    
                    <div className={styles.resultContainer}>
                        {storyResponse.qr_code_url && (
                            <div className={styles.premiumQrSection}>
                                <h3 className={styles.premiumQrTitle}>🎵 Your Audio Story QR Code</h3>
                                <div className={styles.premiumQrContainer}>
                                    <div className={styles.qrFrame}>
                                        <div className={styles.qrGlow}>
                                            <img 
                                                src={storyResponse.qr_code_url} 
                                                alt="QR Code for Audio Story" 
                                                className={styles.premiumQrImage}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.qrInfo}>
                                        <h4 className={styles.qrInfoTitle}>✨ Scan to Experience</h4>
                                        <p className={styles.qrInfoText}>
                                            Point your camera at this QR code to instantly access your personalized audio story
                                        </p>
                                        <div className={styles.qrFeatures}>
                                            <div className={styles.feature}>
                                                <span className={styles.featureIcon}></span>
                                                <span>High Quality Audio</span>
                                            </div>
                                            <div className={styles.feature}>
                                                <span className={styles.featureIcon}></span>
                                                <span>{storyResponse.output_language} Language</span>
                                            </div>
                                            <div className={styles.feature}>
                                                <span className={styles.featureIcon}></span>
                                                <span>Mobile Optimized</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.qrActions}>
                                    <button 
                                        onClick={() => downloadImage(storyResponse.qr_code_url, `audio_story_qr_${Date.now()}.png`)}
                                        className={styles.primaryDownloadButton}
                                    >
                                         Download QR Code
                                    </button>
                                    <button 
                                        onClick={() => downloadImage(storyResponse.image_path, storyResponse.image_filename)}
                                        className={styles.secondaryDownloadButton}
                                    >
                                         Download Original Image
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={styles.transcriptSection}>
                            <h3 className={styles.sectionTitle}> Audio Transcript</h3>
                            <div className={styles.transcriptBox}>
                                <p>{storyResponse.transcript}</p>
                            </div>
                        </div>

                        <div className={styles.actionButtons}>
                            <button 
                                onClick={resetForm}
                                className={styles.createAnotherButton}
                            >
                                ✨Create Another Story
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <div className={styles.nav}>
                <span className={styles.text}>QR Connect</span>
                <span className={styles.logo} onClick={() => router.push("/")}></span>
                <span className={styles.text}>Marketing analytics</span>
            </div>
            <div className={styles.content}>
                <h1 className={styles.title}>
                    Create Your Own <span className={styles.highlight}>Story</span>
                </h1>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Language Selection */}
                    <div className={styles.languageSection}>
                        <label htmlFor="language" className={styles.languageLabel}>
                            Output Language
                        </label>
                        <select 
                            id="language"
                            value={outputLanguage}
                            onChange={(e) => setOutputLanguage(e.target.value)}
                            className={styles.languageSelect}
                        >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Italian">Italian</option>
                            <option value="Portuguese">Portuguese</option>
                            <option value="Chinese">Chinese</option>
                            <option value="Japanese">Japanese</option>
                            <option value="Korean">Korean</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Arabic">Arabic</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Telugu">Telugu</option>
                            <option value="Malayalam">Malayalam</option>
                            <option value="Marathi">Marathi</option>
                            <option value="Kannada">Kannada</option>
                            <option value="Bengali">Bengali</option>
                            <option value="Gujarati">Gujarati</option>
                            <option value="Punjabi">Punjabi</option>
                        </select>
                    </div>

                    {/* Image Upload Section */}
                    <div className={styles.uploadSection}>
                        <label htmlFor="image" className={styles.uploadLabel}>
                            Upload Image
                        </label>
                        <input 
                            type="file" 
                            id="image" 
                            name="image" 
                            accept="image/*"
                            onChange={handleImageChange}
                            className={styles.fileInput}
                        />
                        
                        {/* Image Preview */}
                        <div className={styles.imagePreview}>
                            {selectedImage ? (
                                <img src={selectedImage} alt="Preview" className={styles.previewImage} />
                            ) : (
                                <div className={styles.placeholderImage}>
                                    <span>📷</span>
                                    <p>No image selected</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Voice Recording Section */}
                    <div className={styles.audioSection}>
                        <label className={styles.audioLabel}>Record Audio</label>
                        <div className={styles.audioControls}>
                            <button 
                                type="button"
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`${styles.recordButton} ${isRecording ? styles.recording : ''}`}
                            >
                                {isRecording ? 'Stop Recording' : 'Start Recording'}
                            </button>
                            
                            {audioUrl && (
                                <div className={styles.audioPlayer}>
                                    <audio controls src={audioUrl} className={styles.audioElement}></audio>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className={styles.submitButton}>
                        ✨ Create Story
                    </button>
                </form>
            </div>    
        </div>
    );
}