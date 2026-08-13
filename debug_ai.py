import cv2
from ultralytics import YOLO
import os

img_path = r"C:\Users\ansar\.gemini\antigravity\brain\0b43cbd2-b2c4-47c0-b4ef-f48ab48039a4\uploaded_image_1765787246346.png"

# 1. Check Image
if not os.path.exists(img_path):
    print("Image not found!")
    exit()

img = cv2.imread(img_path)
if img is None:
    print("Image is corrupt or empty!")
else:
    print(f"Image shape: {img.shape}")

# 2. Try Inference Locally
try:
    print("Loading YOLOv8m...")
    model = YOLO('yolov8m.pt')
    print("Running inference...")
    results = model(img_path, conf=0.15)
    print(f"Detections: {len(results[0].boxes)}")
    for box in results[0].boxes:
        print(f"Class: {box.cls}, Conf: {box.conf}")
except Exception as e:
    print(f"Inference Error: {e}")
