export type UserRole = 'farmer' | 'dealer' | 'vet' | 'admin' | null;
export type ViewState = 'login' | 'register' | 'dashboard' | 'upload' | 'results' | 'live-feed' | 'flock' | 'insights' | 'logs' | 'settings' | 'dealer' | 'vet' | 'admin';

export interface Flock {
    id: string;
    name: string;
    startDate: string;
    age: number;
    status: 'Active' | 'Sold' | 'Issue';
    birdCount: number;
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
    x: number;
    y: number;
    w: number;
    h: number;
}
