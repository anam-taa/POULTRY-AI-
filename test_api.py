import requests

url = "http://localhost:8000/upload"
# Create a dummy image for testing if one doesn't exist, or use likely existing one
# But simpler to just try to upload requirements.txt as a dummy file to check if endpoint is alive
# or better, list the uploads dir to see if I can pick a real image
try:
    files = {'file': open('C:/Users/ansar/ANTIG/-Poultry-AI/yolov8n.pt', 'rb')} # Using a model file as dummy big file? No, bad idea.
    # Let's try to capture an image path from previous turns or just use a dummy text file to see if it 422s or errors, 
    # but to check AI I need an image.
    pass
except:
    pass

# I will just write a script that sends a request. 
# User has an uploaded image in: C:/Users/ansar/.gemini/antigravity/brain/0b43cbd2-b2c4-47c0-b4ef-f48ab48039a4/uploaded_image_1765787246346.png
image_path = "C:/Users/ansar/.gemini/antigravity/brain/0b43cbd2-b2c4-47c0-b4ef-f48ab48039a4/uploaded_image_1765787246346.png"

try:
    with open(image_path, 'rb') as f:
        files = {'file': f}
        print(f"Sending {image_path} to {url}...")
        response = requests.post(url, files=files)
        print(f"Status Code: {response.status_code}")
        print("Response JSON:")
        print(response.json())
except FileNotFoundError:
    print(f"File not found: {image_path}")
except Exception as e:
    print(f"Error: {e}")
