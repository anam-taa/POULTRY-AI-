from ultralytics import YOLO
import os

def train_custom_model():
    # 1. Load the Base Model
    # We start with 'yolov8m.pt' (Medium) for a good balance of speed and accuracy.
    # You could use 'yolov8n.pt' (Nano) for speed or 'yolov8l.pt' (Large) for accuracy.
    model = YOLO('yolov8m.pt')

    # 2. Define Dataset Path
    # You must download your dataset (e.g., from Roboflow) and extract it.
    # Point this to the 'data.yaml' file inside your dataset folder.
    # Example: dataset_yaml = "C:/Users/ansar/Datasets/PoultryProject/data.yaml"
    dataset_yaml = "path/to/your/dataset/data.yaml" 

    if not os.path.exists(dataset_yaml):
        print(f"Error: Dataset not found at {dataset_yaml}")
        print("Please export your dataset from Roboflow in YOLOv8 format and update the path above.")
        return

    # 3. Train the Model
    # epochs=100: How many times to go through the data. 50-100 is usually good.
    # imgsz=640: Image resolution.
    # batch=16: How many images to process at once. Reduce if you run out of GPU memory.
    print("Starting training...")
    try:
        results = model.train(
            data=dataset_yaml,
            epochs=100,
            imgsz=640,
            batch=16,
            name='poultry_custom_v1'
        )
        print("Training Complete!")
        print(f"Your new model is saved at: runs/detect/poultry_custom_v1/weights/best.pt")
    except Exception as e:
        print(f"Training failed: {e}")
        print("Ensure you have a GPU enabled or install the CPU version of PyTorch.")

if __name__ == '__main__':
    train_custom_model()
