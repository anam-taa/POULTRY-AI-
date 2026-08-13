import { useState } from 'react';

import type { AnalysisResult } from '../types';

interface UploadProps {
    onAnalysisComplete: (result: AnalysisResult) => void;
}

export function Upload({ onAnalysisComplete }: UploadProps) {
    const [uploadedImage, setUploadedImage] = useState<string | ArrayBuffer | null>(null);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileToUpload(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target?.result || null);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearUpload = () => {
        setUploadedImage(null);
        setFileToUpload(null);
    };

    const runAnalysis = async () => {
        if (!uploadedImage || !fileToUpload) return;

        setIsAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('file', fileToUpload);

            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Analysis Result:", data);

                // Pass the full result object to the App
                onAnalysisComplete(data);
            } else {
                console.error("Upload failed");
                alert("Failed to connect to AI Backend");
            }
        } catch (error) {
            console.error("Error connecting to backend:", error);
            alert("Error: Ensure Backend is running on port 8000");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">

                {/* Drop Zone */}
                {!uploadedImage && (
                    <div className="border-2 border-dashed border-slate-300 rounded-xl m-8 p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                        <input type="file" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">Upload poultry image</h3>
                        <p className="text-slate-500 mt-1">Drag and drop or click to browse</p>
                        <p className="text-xs text-slate-400 mt-4">Supported: JPG, PNG (Max 10MB)</p>
                    </div>
                )}

                {/* Preview & Analyze */}
                {uploadedImage && (
                    <div className="p-8">
                        <div className="relative rounded-lg overflow-hidden bg-black mb-6 aspect-video flex items-center justify-center">
                            <img src={uploadedImage as string} className="max-h-[500px] w-auto" />
                            {/* Analysis Overlay (Loader) */}
                            {isAnalyzing && (
                                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                                    <div className="text-white font-mono animate-pulse text-center">
                                        <div>🔬 Running Hybrid Bird Detection...</div>
                                        <div className="text-xs mt-1 text-white/60">YOLOv8 + CV White-Blob Analysis</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center">
                            <button onClick={clearUpload} className="text-slate-500 hover:text-slate-700 font-medium">Cancel</button>
                            <button onClick={runAnalysis} disabled={isAnalyzing} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-lg flex items-center gap-2">
                                {!isAnalyzing ? <span>Run AI Analysis</span> : <span>Processing...</span>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
