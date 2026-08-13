export type UserRole = 'farmer' | 'dealer' | 'vet' | 'admin';
export type ViewState = 'login' | 'dashboard' | 'upload' | 'results' | 'history' | 'flock' | 'dealer' | 'vet' | 'admin' | 'feedstock';

export interface Flock {
    id: string;
    name: string;
    startDate: string;
    age: number;
    status: 'Active' | 'Sold' | 'Issue';
    birdCount: number;
    /** Optional: flock name suggested/created from an AI analysis */
    linkedAnalysisDate?: string;
}

export interface DailyLog {
    date: string;
    feed: number;
    water: number;
    mortality: number;
    temp: number;
    notes: string;
}

export interface AiDetection {
    id: number;
    class: string;
    confidence: number;
    method?: string;   // 'YOLO' | 'CV-Blob'
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface AnalysisResult {
    filename: string;
    bird_count: number;
    detection_method?: string;   // 'YOLO' | 'CV-Blob'
    status: string;
    heatmap_url: string;
    mock_heatmap_url: string;
    detections: AiDetection[];
    density_score: number;
    density_label: 'Low' | 'Medium' | 'High';
    insights: string[];
    message: string;
}
