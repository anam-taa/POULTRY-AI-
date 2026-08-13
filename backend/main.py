


import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import shutil
import cv2
import numpy as np
from ultralytics import YOLO
from fastapi import Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import uvicorn
from sqlmodel import Session, select
from database import create_db_and_tables, get_session
from models import User, AnalysisLog
import auth
from datetime import timedelta
from contextlib import asynccontextmanager

# Initialization
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    # Seed default user for Quick Login
    from database import engine
    with Session(engine) as session:
        roles = ["farmer", "dealer", "vet", "admin"]
        for role in roles:
            statement = select(User).where(User.username == role)
            user = session.exec(statement).first()
            if not user:
                hashed_pwd = auth.get_password_hash(role)
                new_user = User(username=role, hashed_password=hashed_pwd, role=role)
                session.add(new_user)
        session.commit()
    yield

app = FastAPI(title="Poultry AI Backend", lifespan=lifespan)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files to serve images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Load Model
try:
    model = YOLO('yolov8m.pt')
except Exception as e:
    print(f"Error loading model: {e}")

# ═══════════════════════════════════════════════════════════════════════════════
# YOLO DETECTION ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

def run_hybrid_detection(img_path: str):
    """
    Runs Standard YOLO inference on the full image with a confidence threshold of 0.25.
    Returns:
      - detections  : list of (box_xyxy, score) tuples
      - bird_count  : final count
      - method      : 'YOLO'
      - annotated   : annotated image (ndarray)
    """
    img = cv2.imread(img_path)
    results = model(img_path, conf=0.25, classes=[14], verbose=False)
    
    kept = []
    annotated = img.copy()
    
    for box in results[0].boxes:
        bx1, by1, bx2, by2 = box.xyxy[0].tolist()
        score = float(box.conf[0])
        kept.append(([bx1, by1, bx2, by2], score))
        
        x1, y1, x2, y2 = int(bx1), int(by1), int(bx2), int(by2)
        cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 220, 50), 2)
        label = f"Bird {score:.0%}"
        cv2.putText(
            annotated, label,
            (x1, max(y1 - 5, 10)),
            cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 220, 50), 1,
            lineType=cv2.LINE_AA,
        )
        
    final_count = len(kept)
    method = "YOLO"

    # ── Overlay count banner on annotated image ───────────────────────────────
    banner = f"  Birds: {final_count}  [{method}]  "
    (tw, th), _ = cv2.getTextSize(banner, cv2.FONT_HERSHEY_DUPLEX, 0.9, 2)
    cv2.rectangle(annotated, (0, 0), (tw + 10, th + 16), (20, 20, 20), -1)
    cv2.putText(
        annotated, banner,
        (5, th + 5),
        cv2.FONT_HERSHEY_DUPLEX, 0.9, (0, 255, 180), 2,
        lineType=cv2.LINE_AA,
    )

    return kept, final_count, method, annotated
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/health")
def read_health():
    return {"message": "Poultry AI API is running! (Enhanced Model)"}

@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    statement = select(User).where(User.username == form_data.username)
    user = session.exec(statement).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@app.post("/register")
async def register_user(user_data: dict, session: Session = Depends(get_session)):
    username = user_data.get("username")
    password = user_data.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")
    
    # Check existing
    statement = select(User).where(User.username == username)
    existing = session.exec(statement).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_pwd = auth.get_password_hash(password)
    new_user = User(username=username, hashed_password=hashed_pwd, role="farmer")
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return {"message": "User registered successfully", "username": new_user.username}

@app.post("/upload")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(auth.get_current_user),
    session: Session = Depends(get_session)
):
    import json

    # ── 1. Save uploaded file ─────────────────────────────────────────────────
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # ── 2. Hybrid AI + CV Detection ───────────────────────────────────────────
    # Runs optimised YOLO tiled inference PLUS a white-blob CV detector that is
    # specifically tuned for white broiler chickens.  The best result is kept.
    kept, bird_count, det_method, annotated_frame = run_hybrid_detection(file_path)

    # ── 3. Read image dimensions for normalisation ────────────────────────────
    img_cv = cv2.imread(file_path)
    h_img, w_img = img_cv.shape[:2]

    # ── 4. Build detection payload ────────────────────────────────────────────
    detection_data = []
    for idx, (box, score) in enumerate(kept):
        x1, y1, x2, y2 = box
        bw = x2 - x1
        bh = y2 - y1
        detection_data.append({
            "id":         idx,
            "class":      "Bird",
            "confidence": int(score * 100),
            "method":     det_method,
            # Normalised top-left origin (percent, 0-100)
            "x": (x1 / w_img) * 100,
            "y": (y1 / h_img) * 100,
            "w": (bw / w_img) * 100,
            "h": (bh / h_img) * 100,
        })

    # ── 5. Save annotated image ───────────────────────────────────────────────
    output_filename = f"pred_{file.filename}"
    output_path     = f"{UPLOAD_DIR}/{output_filename}"
    cv2.imwrite(output_path, annotated_frame)

    heatmap_url = f"{request.base_url}uploads/{output_filename}"

    # ── 6. Persist to database ────────────────────────────────────────────────
    new_log = AnalysisLog(
        user_id=current_user.id,
        filename=file.filename,
        image_url=heatmap_url,
        bird_count=bird_count,
        density_score=0,
        density_label="N/A",
        insights_json=json.dumps([]),
        detections_json=json.dumps(detection_data),
    )
    session.add(new_log)
    session.commit()

    return {
        "filename":          file.filename,
        "bird_count":        bird_count,
        "detection_method":  det_method,
        "status":            "Analysis Complete",
        "mock_heatmap_url":  heatmap_url,
        "heatmap_url":       heatmap_url,
        "detections":        detection_data,
        "density_score":     0,
        "density_label":     "Standard",
        "insights":          [],
        "message":           f"Analysis Complete: {bird_count} birds detected via {det_method}.",
    }

@app.get("/api/history")
async def get_history(
    current_user: User = Depends(auth.get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(AnalysisLog).where(AnalysisLog.user_id == current_user.id).order_by(AnalysisLog.timestamp.desc())
    logs = session.exec(statement).all()
    # Unpack JSON insights for frontend
    history = []
    import json
    for log in logs:
        item = log.model_dump()
        try:
            item['insights'] = json.loads(log.insights_json)
        except:
            item['insights'] = []
        history.append(item)
    return history

@app.delete("/api/history/{log_id}")
async def delete_history_item(
    log_id: int,
    current_user: User = Depends(auth.get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(AnalysisLog).where(AnalysisLog.id == log_id, AnalysisLog.user_id == current_user.id)
    log = session.exec(statement).first()
    if not log:
        raise HTTPException(status_code=404, detail="Record not found or access denied")
    session.delete(log)
    session.commit()
    return {"message": "Record deleted successfully"}

@app.get("/api/dataset/export")
async def export_dataset(
    current_user: User = Depends(auth.get_current_user),
    session: Session = Depends(get_session)
):
    import zipfile
    import io
    
    # Fetch all user logs
    statement = select(AnalysisLog).where(AnalysisLog.user_id == current_user.id)
    logs = session.exec(statement).all()
    
    if not logs:
        raise HTTPException(status_code=404, detail="No data to export")

    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for log in logs:
            # 1. Add Image
            # image_url is like http://localhost:8000/uploads/pred_filename.png
            # We need the ORIGINAL file, but we only stored the processed URL.
            # Strategy: Try to find original by stripping 'pred_' from filename
            # The 'filename' field in DB is the original filename.
            original_path = f"{UPLOAD_DIR}/{log.filename}"
            if os.path.exists(original_path):
                zip_file.write(original_path, arcname=f"images/{log.filename}")
                
                # 2. Add Labels (YOLO Format)
                # Parse detections from DB (if available)
                try:
                    import json
                    detections = json.loads(log.detections_json)
                    label_content = ""
                    for det in detections:
                        # Map class name to ID
                        # 0: Bird, 1: WaterLine, 2: WetSpot
                        cls_id = 0
                        if det['class'] == 'WaterLine': cls_id = 1
                        elif det['class'] == 'WetSpot': cls_id = 2
                        
                        # YOLO format: class x_center y_center width height (0-1 normalized)
                        # Our 'x', 'y' in detection_data are percentages (0-100).
                        # We need to divide by 100.
                        x_n = det['x'] / 100.0
                        y_n = det['y'] / 100.0
                        w_n = det['w'] / 100.0
                        h_n = det['h'] / 100.0
                        
                        label_content += f"{cls_id} {x_n:.6f} {y_n:.6f} {w_n:.6f} {h_n:.6f}\n"
                    
                    # Write txt file
                    txt_filename = os.path.splitext(log.filename)[0] + ".txt"
                    zip_file.writestr(f"labels/{txt_filename}", label_content)
                    
                    # Create data.yaml content
                    yaml_content = """train: ../train/images
val: ../valid/images

nc: 3
names: ['Bird', 'WaterLine', 'WetSpot']"""
                    zip_file.writestr("data.yaml", yaml_content)
                    
                except Exception as e:
                    print(f"Error generating labels for {log.filename}: {e}")
                    # Skip labels if error, but keep image
                    pass
            
    # Since we realized a flaw (missing detection data in DB), 
    # WE MUST FIX THE MODEL FIRST to support this feature properly.
    # I will submit this creation of the endpoint, but it will be limited to Images only for now,
    # and I will immediately update the Model to store detections for FUTURE uploads.
    
    zip_buffer.seek(0)
    return Response(content=zip_buffer.getvalue(), media_type="application/zip", headers={"Content-Disposition": f"attachment; filename=dataset_export.zip"})

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(auth.get_current_user),
    session: Session = Depends(get_session)
):
    import json
    statement = select(AnalysisLog).where(AnalysisLog.user_id == current_user.id).order_by(AnalysisLog.timestamp.desc())
    logs = session.exec(statement).all()
    
    if not logs:
        return {
            "total_birds": 0,
            "flocks_monitored": 0,
            "health_score": 100,
            "alerts": [],
            "recent_activity": []
        }
        
    total_birds = sum(log.bird_count for log in logs)
    # Estimate flock count: Assume 1 flock for now, or use unique filenames logic if needed.
    flocks_monitored = 1 
    
    # Calculate Health Score
    health_score = 100
    alerts = []
    
    # Get last 5 logs for activity
    recent_activity = []
    
    for i, log in enumerate(logs):
        # Activity Feed
        if i < 5:
            recent_activity.append({
                "id": log.id,
                "message": f"Analysis complete: {log.bird_count} birds detected.",
                "time": log.timestamp.isoformat(),
                "type": "success" if log.bird_count > 0 else "info"
            })

        # Health Deductions
        # Check insights for keywords
        try:
            insights = json.loads(log.insights_json)
            # Check for wet spots in detections if we had them, OR rely on insights text
            has_wet = any("Wet" in ins for ins in insights)
            has_crowd = "High" in log.density_label
            
            if i < 10: # Only penalize based on recent history (last 10 scans)
                if has_wet: 
                    health_score -= 5
                    if i == 0: alerts.append("⚠️ Wet litter detected in recent scan")
                if has_crowd:
                    health_score -= 2
                    if i == 0: alerts.append("⚠️ High density crowding detected")
        except:
            pass
            
    return {
        "total_birds": total_birds,
        "flocks_monitored": flocks_monitored,
        "health_score": max(0, health_score),
        "alerts": list(set(alerts)), # Remove dupes
        "recent_activity": recent_activity
    }

# Mount Frontend (Must be last to avoid overriding API routes)
# We serve the 'dist' directory which is the built React app
if os.path.exists("../dist"):
    app.mount("/", StaticFiles(directory="../dist", html=True), name="frontend")
elif os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="frontend")
else:
    print("Warning: Frontend 'dist' folder not found. Running API only.")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
