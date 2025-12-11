import { useState, useEffect } from 'react';
import type { AiDetection } from '../types';

interface ResultsProps {
    image: string | ArrayBuffer | null;
    onNewUpload: () => void;
}

export function Results({ image, onNewUpload }: ResultsProps) {
    const [resultTab, setResultTab] = useState<'original' | 'detections' | 'heatmap' | 'insights'>('detections');
    const [mockDetections, setMockDetections] = useState<AiDetection[]>([]);

    useEffect(() => {
        setMockDetections(Array.from({ length: 24 }, (_, i) => ({
            id: i,
            class: 'Bird',
            confidence: Math.floor(Math.random() * 20) + 80,
            x: Math.random() * 80 + 5,
            y: Math.random() * 80 + 5,
            w: Math.random() * 5 + 3,
            h: Math.random() * 5 + 3
        })));
    }, []);

    return (
        <div className="h-full flex flex-col">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                        <button onClick={() => setResultTab('original')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${resultTab === 'original' ? 'bg-emerald-100 text-emerald-700' : ''}`}>Original</button>
                        <button onClick={() => setResultTab('detections')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${resultTab === 'detections' ? 'bg-emerald-100 text-emerald-700' : ''}`}>Detections</button>
                        <button onClick={() => setResultTab('heatmap')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${resultTab === 'heatmap' ? 'bg-emerald-100 text-emerald-700' : ''}`}>Heatmap</button>
                        <button onClick={() => setResultTab('insights')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${resultTab === 'insights' ? 'bg-emerald-100 text-emerald-700' : ''}`}>Insights</button>
                    </div>
                    <button onClick={onNewUpload} className="text-sm text-slate-500 hover:text-slate-900">← New Upload</button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Left: Visual Canvas */}
                    <div className="flex-1 bg-neutral-900 relative flex items-center justify-center p-4 overflow-auto">
                        <div className="relative inline-block shadow-2xl">
                            <img src={(image as string) || 'https://images.unsplash.com/photo-1563205764-647e2974309f?q=80&w=800&auto=format&fit=crop'} className="max-w-full max-h-[70vh] block" />

                            {/* Detection Overlay */}
                            {resultTab === 'detections' && mockDetections.map((det) => (
                                <div key={det.id}
                                    style={{ left: `${det.x}%`, top: `${det.y}%`, width: `${det.w}%`, height: `${det.h}%` }}
                                    className="absolute border-2 border-emerald-400 bg-emerald-400/20 group hover:bg-emerald-400/40 transition-colors cursor-crosshair">
                                    <div className="absolute -top-6 left-0 bg-emerald-500 text-white text-[10px] px-1 rounded shadow">
                                        {det.class} {det.confidence}%
                                    </div>
                                </div>
                            ))}

                            {/* Heatmap Overlay (CSS Simulation) */}
                            {resultTab === 'heatmap' && (
                                <div className="absolute inset-0 opacity-60 pointer-events-none"
                                    style={{ background: 'radial-gradient(circle at 30% 40%, red, transparent 20%), radial-gradient(circle at 70% 60%, yellow, transparent 25%), radial-gradient(circle at 50% 50%, blue, transparent 50%)', mixBlendMode: 'multiply' }}>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Metrics Panel */}
                    <div className="w-full md:w-80 bg-white border-l border-slate-200 overflow-y-auto p-6">
                        <h3 className="font-bold text-slate-900 mb-4">AI Metrics Summary</h3>

                        <div className="space-y-4">
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <span className="text-xs text-slate-500 block">Total Bird Count</span>
                                <span className="text-2xl font-bold text-emerald-600">{mockDetections.length}</span>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">Density Score</span>
                                    <span className="font-bold text-orange-500">High</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 w-[85%]"></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-50 p-2 rounded">
                                    <div className="text-[10px] text-slate-500">Feed Line</div>
                                    <div className="text-sm font-semibold text-green-600">Normal</div>
                                </div>
                                <div className="bg-slate-50 p-2 rounded">
                                    <div className="text-[10px] text-slate-500">Litter Wetness</div>
                                    <div className="text-sm font-semibold text-yellow-600">Mild Risk</div>
                                </div>
                            </div>

                            {resultTab === 'insights' && (
                                <div className="mt-6 border-t pt-4">
                                    <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Generated Insights</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex gap-2">
                                            <span className="text-red-500">⚠️</span>
                                            <span>Crowding detected near water line B.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-blue-500">ℹ️</span>
                                            <span>Bird distribution uneven (Left skew).</span>
                                        </li>
                                    </ul>
                                </div>
                            )}

                            {/* Detection Table (Mini) */}
                            <div className="mt-6 border-t pt-4">
                                <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Detection Log</h4>
                                <div className="overflow-hidden rounded border border-slate-200">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="p-2">Class</th>
                                                <th className="p-2">Conf</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {mockDetections.slice(0, 5).map((d) => (
                                                <tr key={d.id}>
                                                    <td className="p-2">{d.class}</td>
                                                    <td className="p-2">{d.confidence}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="p-2 text-center text-xs text-slate-400 bg-slate-50">
                                        + {mockDetections.length - 5} more
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
