# Poultry AI Project Documentation

## 🟦 TECH STACK (Final & Clean Version)

### 🚀 Frontend (Web UI)
*   **React + TypeScript**: Fast, modern, scalable for production dashboards.
*   **Libraries**:
    *   **Axios**: API calls
    *   **React Router**: Screen navigation
    *   **TailwindCSS**: UI styling
    *   **Recharts / Chart.js**: Graphs
    *   **React Query**: Caching server state
    *   **HTML Canvas / Konva.js**: Heatmap rendering
*   **Optional (Production)**:
    *   Redux Toolkit (advanced state management)

### 🔥 Backend (API Layer)
*   **FastAPI (Python)**: Easy, fast, async, built-in docs, perfect for ML inference.
*   **Libraries**:
    *   `uvicorn`: Server
    *   `Pydantic`: Schema validation
    *   `SQLAlchemy`: Database ORM
    *   `Alembic`: Database migrations
    *   `python-multipart`: Image uploads

### 🧠 AI / Computer Vision Engine
*   **Model**: YOLOv8 or YOLOv11
*   **Libraries**: `ultralytics` (YOLO), `OpenCV`, `NumPy`, `Pillow`, `SciPy` (optional for heatmaps)
*   **Outputs**:
    *   Bird detection (bounding boxes)
    *   Bird count
    *   Heatmap overlay
    *   Feedline occupancy indicator
    *   Waterline occupancy indicator
    *   Litter condition score

### 🗄 Database
*   **College**: SQLite
*   **Production**: PostgreSQL
*   **Tables**: `Users`, `Farms`, `Flocks`, `AI Results`, `Daily Logs`, `Alerts`

### 🐳 Containerization
*   **Docker + Docker Compose**
*   **Services**: Frontend container, Backend + AI container, Postgres container (production), Optional nginx reverse proxy

### 📲 WhatsApp Integration (Production Only)
*   Admin-approved templates
*   Message conversations
*   Image-based analysis through WhatsApp
*   Tools: Gupshup / Meta Cloud API

### 🛡 Security & Compliance
*   JWT authentication
*   HTTPS
*   DPDP 2023 readiness
*   Basic audit logs
*   Rate limiting (production)

---

## 🟨 FULL REQUIREMENTS

### 🎓 COLLEGE PROJECT REQUIREMENTS (Minimum Functional Scope)

#### 📌 Core Features
1.  Upload an image OR short video.
2.  Run YOLO detection to count birds.
3.  Generate and display a heatmap.
4.  Display detection summary.
5.  Simple dashboard showing:
    *   Bird count
    *   Heatmap
    *   Basic logs

#### 📌 Backend Requirements
*   **FastAPI API endpoint**: `/upload` (returns detection + heatmap)
*   **Image processing**: YOLOv8 inference, Heatmap generation
*   **DB**: No need for complex DB (SQLite optional)

#### 📌 Frontend Requirements
*   **React page**: Upload images, Preview image
*   **Action**: Button to run AI
*   **Results page**: Original image, Heatmap image, Bird count, Detections

#### 📌 College Demo Flow
1.  Show UI upload screen
2.  Upload sample shed image
3.  Run AI
4.  Show bounding boxes + heatmap
5.  Explain YOLO model
6.  Show Docker containers running

---

### 🟩 PRODUCTION PRODUCT REQUIREMENTS (Complete System)

#### 1️⃣ AI Requirements
*   **Core**: Bird detection & counting, Heatmap generation, Feedline/Waterline occupancy, Litter wetness score, Activity/crowding detection.
*   **Advanced**: Disease risk scoring, Mortality prediction, Behavior analysis, Live CCTV monitoring.

#### 2️⃣ Farmer Features
*   **Workflow**: Upload shed images/video, View AI insights, Log feed/mortality/temp.
*   **Flock Mgmt**: Add flock, Track flock age, End-cycle report, Charts.

#### 3️⃣ Dealer Portal Requirements
*   Manage farms they support
*   Predict feed consumption
*   View overall farm health
*   Sales forecasting

#### 4️⃣ Veterinarian Portal Requirements
*   Health risk alerts
*   Track farm issues
*   Suggest treatments
*   Monitor litter / crowding over time

#### 5️⃣ Admin Portal Requirements
*   User management
*   Farm management
*   Subscription & billing
*   AI model upgrade panel
*   System monitoring

#### 6️⃣ Communication Requirements
*   WhatsApp integration
*   Template-based AI outputs
*   Multi-language UI

#### 7️⃣ Compliance Requirements
*   DPDP 2023 consent
*   Data encryption
*   Clear data retention policy

#### 8️⃣ Non-Functional Requirements
*   **Performance**: Image processed < 3s, Handle 100+ farms.
*   **Reliability**: Logs, Error handling, Auto restart.
*   **Scalability**: Horizontal scaling, AI inference queue.
