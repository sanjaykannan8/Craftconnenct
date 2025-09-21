from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
from pathlib import Path
import whisper
import dotenv
import cloudinary
import cloudinary.uploader
import cloudinary.api
from tools import transcribe_audio, create_qr_code, agent_engine,extract_story_text,voice_over
dotenv.load_dotenv()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.post("/create_story/")
async def create_story(
    image: UploadFile = File(...),
    audio: UploadFile = File(...),
    output_language: str = Form(default="English")
):
    try:
        # Validate file types
        if not image.content_type or not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Invalid image file type")
        
        if not audio.content_type or not audio.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="Invalid audio file type")
        
        image_filename = f"{uuid.uuid4()}_{image.filename}"
        audio_filename = f"{uuid.uuid4()}_{audio.filename}"
        
        image_path = UPLOAD_DIR / image_filename
        with open(image_path, "wb") as buffer:
            content = await image.read()
            buffer.write(content)
        
        # Validate image file after saving
        try:
            from PIL import Image
            with Image.open(image_path) as test_img:
                test_img.verify()
            print(f"Image validation successful: {image_path}")
        except Exception as e:
            print(f"Invalid image file: {e}")
            # Clean up the invalid file
            if os.path.exists(image_path):
                os.remove(image_path)
            raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")
        
        # Save audio file
        audio_path = UPLOAD_DIR / audio_filename
        with open(audio_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)
            
        cloudinary.config(api_key=os.getenv("CLOUDINARY_API_KEY"),
                        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
                        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
                        secure=True) 
        print("configured cloudinary")
        try:
            print("uploading image to cloudinary")
            upload_image = cloudinary.uploader.upload(image_path, public_id=image_filename)
            print("uploading audio to cloudinary")
            upload_audio = cloudinary.uploader.upload(audio_path, public_id=audio_filename,resource_type="video")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error uploading files to Cloudinary: {str(e)}")
        
        # Transcribe audio before deleting the file
        try:
            print(f"Starting transcription of audio file: {audio_path}")
            print(f"Audio file exists: {os.path.exists(audio_path)}")
            print(f"Audio file size: {os.path.getsize(audio_path) if os.path.exists(audio_path) else 'N/A'} bytes")
            transcript = transcribe_audio(str(audio_path))
            print(f"Transcription completed: {transcript}")
            print(f"Transcript type: {type(transcript)}")
            print(f"Transcript keys: {transcript.keys() if isinstance(transcript, dict) else 'Not a dict'}")
            print(f"Transcript text: '{transcript['text']}'")
            print("="*70)
            story = await agent_engine(transcript["text"],upload_image["secure_url"],output_language)
            print("="*70)
            json_story =extract_story_text(story)
            print("="*70)
            voice_over_story = voice_over(json_story)
            print("="*70)
            upload_voice_over = cloudinary.uploader.upload(f"{voice_over_story}.wav", public_id=voice_over_story,resource_type="video")
            print("="*70)
            print(f"Voice over story uploaded: {upload_voice_over['secure_url']}")
            print("="*70)
        except Exception as e:
            print(f"Error during transcription: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error transcribing audio: {str(e)}")
        
        # Generate QR code with uploaded image as logo
        try:
            print(f"Creating QR code for audio URL: {upload_voice_over['secure_url']}")
            # Use the local image path before deletion for QR code generation
            qr_code_path = create_qr_code(
                audio_url=upload_voice_over["secure_url"],
                uploaded_image_path=str(image_path),
                logo_path="./logo.png"  # Fallback logo
            )
            
            if qr_code_path:
                # Upload QR code to Cloudinary
                qr_filename = f"qr_{uuid.uuid4()}.png"
                upload_qr = cloudinary.uploader.upload(qr_code_path, public_id=qr_filename)
                qr_url = upload_qr["secure_url"]
                
                # Clean up local QR code file
                os.remove(qr_code_path)
            else:
                qr_url = None
                print("Failed to create QR code")
                
        except Exception as e:
            print(f"Error creating QR code: {str(e)}")
            qr_url = None
        
        # Clean up local files after transcription and QR generation
        os.remove(image_path)
        os.remove(audio_path)
        
        return {
            "message": "Story created successfully",
            "image_path": str(upload_image["secure_url"]),
            "audio_path": str(upload_voice_over["secure_url"]),
            "qr_code_url": qr_url,
            "image_filename": image_filename,
            "audio_filename": audio_filename,
            "transcript": transcript["text"],
            "output_language": output_language
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing files: {str(e)}")
