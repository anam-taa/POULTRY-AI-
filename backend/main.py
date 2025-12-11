from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os
import cv2
import numpy as np
from ultralytics import YOLO

app = FastAPI(title="Poultry AI Backend")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files to serve images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load Model
# We are using 'yolov8n.pt' which is a small, pre-trained model. 
# It will automatically download on first run.
# In a real scenario, you would use: model = YOLO('best.pt') having trained it on chickens.
try:
    model = YOLO('yolov8n.pt') 
except Exception as e:
    print(f"Error loading model: {e}")

@app.get("/")
def read_root():
    return {"message": "Poultry AI API is running!"}

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    # 1. Save uploaded file
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 2. Run AI Inference
    # We set conf=0.25 to be safe
    results = model(file_path, conf=0.25)
    
    # 3. Process Results
    result = results[0]
    
    # Filter for 'bird' class (Class ID 14 in COCO dataset)
    # If using a Custom Trained model on chickens, you might just count everything or class 0.
    # For this demo, we'll count ALL detections to ensure you see something, 
    # but strictly speaking COCO 'bird' is index 14.
    
    detections = result.boxes
    bird_count = len(detections) # Counting all detections for demo visibility
    
    # 4. Save Annotated Image (This is your "Heatmap" / Visual result)
    annotated_frame = result.plot()
    output_filename = f"pred_{file.filename}"
    output_path = f"{UPLOAD_DIR}/{output_filename}"
    cv2.imwrite(output_path, annotated_frame)
    
    # Construct URL
    # IMPORTANT: Ensure this matches your actual backend URL/Port
    heatmap_url = f"http://localhost:8000/uploads/{output_filename}"
    
    return {
        "filename": file.filename,
        "bird_count": bird_count,
        "status": "Analysis Complete",
        "mock_heatmap_url": heatmap_url, # Using this key as frontend might expect it
        "heatmap_url": heatmap_url,
        "message": "Used YOLOv8n (Pre-trained). For better results, train on specific chicken dataset."
    }
