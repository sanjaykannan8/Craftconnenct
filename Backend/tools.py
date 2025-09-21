import whisper
import qrcode
from PIL import Image
import requests
from io import BytesIO
import uuid
import os
from pathlib import Path
from vertexai import agent_engines  
from speech import generate
from google.genai import types
import re
import vertexai
def transcribe_audio(audio_path):
    model = whisper.load_model("base")
    result = model.transcribe(audio_path)
    return result
def voice_over(text):
    file_name = generate(text)
    return file_name

def extract_story_text(json_response):
    """
    Extract only the story_text value from JSON response using regex
    
    Args:
        json_response (str): The JSON response string
        
    Returns:
        str: The extracted story_text content, or None if not found
    """
    # Regex pattern to match "story_text": "content"
    pattern = r'"story_text":\s*"([^"]*(?:\\.[^"]*)*)"'
    
    match = re.search(pattern, json_response)
    if match:
        generated_story = match.group(1)
        return generated_story
    else:
        return "unable to extract story_text"    
        
async def agent_engine(transcript,image_url,output_language):
    remote_app = agent_engines.get("projects/450267902324/locations/us-central1/reasoningEngines/4933996856993644544")
    remote_session = await remote_app.async_create_session(user_id="u_456")
    # Clean the transcript text to remove any extra characters
    clean_transcript = transcript.strip()
    if clean_transcript.endswith('.'):
        clean_transcript = clean_transcript[:-1]  # Remove trailing period
    
    # Create a simple text prompt following the exact example pattern
    prompt_text = f"Create a story based on this transcript: {clean_transcript}. Output language: {output_language}"
    
    print(f"Original transcript: '{transcript}'")
    print(f"Clean transcript: '{clean_transcript}'")
    print(f"Prompt: '{prompt_text}'")
    print(f"Image URL: {image_url}")
    print(f"Output Language: {output_language}")
    
    response = ""
    try:
        # Try using Vertex AI compatible format instead of Google GenAI
        print("Trying Vertex AI compatible approach...")
        
        # Create a simple text message that includes both transcript and image reference
        simple_prompt = f"Create a story in {output_language} based on this transcript: {clean_transcript}. Please also consider the image at: {image_url}"
        
        print(f"Simple prompt: '{simple_prompt}'")
        
        # Try passing just the text string instead of Part objects
        async for event in remote_app.async_stream_query(
            user_id="u_456",
            session_id=remote_session["id"],
            message=simple_prompt,
        ):
            print(event)
            # Handle different event types - could be string or dict
            if isinstance(event, str):
                response += event
            elif isinstance(event, dict):
                # Extract text content from dict if available
                if 'content' in event and 'parts' in event['content']:
                    for part in event['content']['parts']:
                        if 'text' in part:
                            response += part['text']
                        elif 'function_call' in part:
                            # Handle function calls - check if it's a transfer to another agent
                            func_call = part['function_call']
                            func_name = func_call.get('name', 'unknown')
                            func_args = func_call.get('args', {})
                            
                            if func_name == 'transfer_to_agent':
                                agent_name = func_args.get('agent_name', 'Unknown Agent')
                                response += f"[Transferring to {agent_name} agent...]"
                            else:
                                response += f"[Function call: {func_name}]"
                elif 'text' in event:
                    response += event['text']
                else:
                    # If it's a dict but no text content, convert to string
                    response += str(event)
            else:
                # Convert other types to string
                response += str(event)
        print(response)
        
        return response
    except Exception as e:
        print(f"Error in agent_engine: {str(e)}")
        # Try with a dictionary format
        try:
            print("Trying dictionary format...")
            message_dict = {
                "transcript": clean_transcript,
                "output_language": output_language,
                "image_url": image_url
            }
            
            async for event in remote_app.async_stream_query(
                user_id="u_456",
                session_id=remote_session["id"],
                message=message_dict,
            ):
                print(event)
                # Handle different event types - could be string or dict
                if isinstance(event, str):
                    response += event
                elif isinstance(event, dict):
                    # Extract text content from dict if available
                    if 'content' in event and 'parts' in event['content']:
                        for part in event['content']['parts']:
                            if 'text' in part:
                                response += part['text']
                            elif 'function_call' in part:
                                # Handle function calls - check if it's a transfer to another agent
                                func_call = part['function_call']
                                func_name = func_call.get('name', 'unknown')
                                func_args = func_call.get('args', {})
                                
                                if func_name == 'transfer_to_agent':
                                    agent_name = func_args.get('agent_name', 'Unknown Agent')
                                    response += f"[Transferring to {agent_name} agent...]"
                                else:
                                    response += f"[Function call: {func_name}]"
                    elif 'text' in event:
                        response += event['text']
                    else:
                        # If it's a dict but no text content, convert to string
                        response += str(event)
                else:
                    # Convert other types to string
                    response += str(event)
            print(response)
            return response 
        except Exception as e2:
            print(f"Dictionary format also failed: {str(e2)}")
            raise e


def create_qr_code(audio_url, uploaded_image_path=None, logo_path=None):
    """
    Create a QR code that points to the audio URL with uploaded image as center logo
    
    Args:
        audio_url (str): The URL to encode in the QR code
        uploaded_image_path (str): Path to the uploaded image to use as logo
        logo_path (str): Fallback logo path (logo.png from public)
    
    Returns:
        str: Path to the generated QR code image
    """
    try:
        # Create QR code instance
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction for logo
            box_size=10,
            border=4,
        )
        
        # Add data and make QR code
        qr.add_data(audio_url)
        qr.make(fit=True)
        
        # Create QR code image
        qr_img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
        
        # Prepare logo
        logo = None
        if uploaded_image_path and os.path.exists(uploaded_image_path):
            try:
                # Validate that the file is actually an image
                with Image.open(uploaded_image_path) as test_img:
                    test_img.verify()  # This will raise an exception if not a valid image
                
                # If verification passed, open the image again (verify() closes the file)
                logo = Image.open(uploaded_image_path)
                print(f"Successfully loaded uploaded image: {uploaded_image_path}")
            except Exception as e:
                print(f"Error loading uploaded image {uploaded_image_path}: {e}")
                logo = None
                
        if logo is None and logo_path and os.path.exists(logo_path):
            try:
                # Validate fallback logo
                with Image.open(logo_path) as test_img:
                    test_img.verify()
                
                logo = Image.open(logo_path)
                print(f"Successfully loaded fallback logo: {logo_path}")
            except Exception as e:
                print(f"Error loading fallback logo {logo_path}: {e}")
        
        if logo:
            # Calculate logo size (about 1/5 of QR code size)
            qr_width, qr_height = qr_img.size
            logo_size = min(qr_width, qr_height) // 5
            
            # Resize logo
            logo = logo.convert("RGBA")
            logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
            
            # Create a white background for the logo area
            logo_bg = Image.new('RGBA', (logo_size + 20, logo_size + 20), 'white')
            logo_bg.paste(logo, (10, 10), logo)
            
            # Calculate position to center the logo
            logo_pos = ((qr_width - logo_size - 20) // 2, (qr_height - logo_size - 20) // 2)
            
            # Paste logo onto QR code
            qr_img.paste(logo_bg, logo_pos)
        else:
            print("No valid logo found, creating QR code without logo")
        
        # Save QR code
        qr_filename = f"qr_code_{uuid.uuid4()}.png"
        qr_path = Path("uploads") / qr_filename
        qr_img.save(qr_path)
        
        return str(qr_path)
        
    except Exception as e:
        print(f"Error creating QR code: {e}")
        return None