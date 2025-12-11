# Poultry AI - Project Documentation

![Poultry AI Banner](https://images.unsplash.com/photo-1563205764-647e2974309f?q=80&w=800&auto=format&fit=crop)

**Poultry AI** is a smart farm management system that leverages Computer Vision to monitor flock health, detect anomalies, and optimize farm operations.

This implementation features a **Production-Ready** architecture with a React Frontend, FastAPI Backend, and YOLOv8 AI integration.

---

## 🚀 Key Features

*   **Role-Based Dashboards**: Custom views for Farmers, Dealers, Veterinarians, and Admins.
*   **AI Image Analysis**: 
    *   Upload shed images.
    *   **YOLOv8 Inference**: Automatically detects birds and counts them.
    *   **Visual Output**: Returns images with bounding boxes showing detections.
*   **Flock Management**: Track age, mortality, and status.
*   **Real-time Insights**: Placeholder for heatmaps and density alerts.

---

## 🛠 Tech Stack

### Frontend
*   **Framework**: React 18 + Vite 4
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **State**: Local State (useState) with modular components.

### Backend (API & AI)
*   **Framework**: FastAPI (Python)
*   **AI Engine**: YOLOv8 (Ultralytics)
*   **Image Processing**: OpenCV, NumPy
*   **Server**: Uvicorn

### Infrastructure
*   **Contract**: Docker & Docker Compose ready.
*   **API**: RESTful endpoints.

---

## 📦 Project Structure

```bash
poultry-ai-react/
├── src/
│   ├── components/       # Shared UI (Sidebar, Auth)
│   ├── features/         # Page Logic (Dashboard, Upload, etc.)
│   ├── types.ts          # TypeScript Interfaces
│   └── App.tsx           # Main Router
├── backend/
│   ├── main.py           # FastAPI Entry Point & AI Logic
│   ├── requirements.txt  # Python Dependencies
│   └── uploads/          # Image Storage
├── docker-compose.yml    # Container Orchestration
└── REQUIREMENTS.md       # Detailed Project Specs
```

---

## 🏁 Getting Started

### Option A: Running Manually (Development)

**1. Start the Backend (API)**
```bash
cd backend
# Create venv if needed: python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*API will run at: http://localhost:8000*

**2. Start the Frontend (UI)**
```bash
# In project root
npm install
npm run dev
```
*App will run at: http://localhost:5173*

### Option B: Running with Docker (Production Sim)

```bash
docker-compose up --build
```
*   Frontend: http://localhost:5173
*   Backend: http://localhost:8000
*   Docs: http://localhost:8000/docs

---

## 🧪 Testing the AI

1.  Login as **Farmer**.
2.  Go to **Upload Image**.
3.  Select a poultry shed image.
4.  Click **"Run AI Analysis"**.
5.  Wait a moment for the result to appear. You should see the image returned with **green bounding boxes** around every detected chicken!

---

## 📜 License
Proprietary. Created for Academic Project / Startup Prototype.
