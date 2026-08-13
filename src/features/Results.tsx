import { useState } from 'react';
import type { AnalysisResult, Flock } from '../types';

interface ResultsProps {
    image: string | ArrayBuffer | null;
    analysisResult: AnalysisResult | null;
    onNewUpload: () => void;
    onNavigateToFlock: () => void;
    flocks: Flock[];
    setFlocks: React.Dispatch<React.SetStateAction<Flock[]>>;
}

export function Results({ image, analysisResult, onNewUpload, onNavigateToFlock, flocks, setFlocks }: ResultsProps) {
    const [resultTab, setResultTab] = useState<'original' | 'detections' | 'insights'>('detections');
    const detections = analysisResult?.detections || [];
    const insights = analysisResult?.insights || [];

    // ── Flock linking state ────────────────────────────────────────────────────
    const [flockAction, setFlockAction] = useState<'none' | 'create' | 'link'>('none');
    const [newFlockName, setNewFlockName] = useState('');
    const [linkedFlockId, setLinkedFlockId] = useState('');
    const [savedFlock, setSavedFlock] = useState<string | null>(null);
    const [nameError, setNameError] = useState('');

    // Helpers to get the current system date+time
    const getNowISO = () => new Date().toISOString();
    const formatDateTime = (iso: string) =>
        new Date(iso).toLocaleString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const handleCreateFlock = () => {
        const trimmed = newFlockName.trim();
        if (!trimmed) { setNameError('Flock name is required'); return; }
        if (flocks.some(f => f.name.toLowerCase() === trimmed.toLowerCase())) {
            setNameError('A flock with this name already exists'); return;
        }
        const nowISO = getNowISO();
        const nextId = String(flocks.length + 1).padStart(2, '0');
        const newFlock: Flock = {
            id: nextId,
            name: trimmed,
            startDate: nowISO.split('T')[0],   // date-only for the Flock start date field
            age: 0,
            status: 'Active',
            birdCount: analysisResult?.bird_count ?? 0,
            linkedAnalysisDate: nowISO,          // full ISO timestamp
        };
        setFlocks(prev => [...prev, newFlock]);
        setSavedFlock(`Created "${trimmed}" with ${newFlock.birdCount} birds`);
        setNameError('');
        setFlockAction('none');
        setNewFlockName('');
    };

    const handleLinkFlock = () => {
        if (!linkedFlockId) return;
        const target = flocks.find(f => f.id === linkedFlockId);
        if (!target) return;
        const nowISO = getNowISO();
        setFlocks(prev => prev.map(f =>
            f.id === linkedFlockId
                ? { ...f, birdCount: analysisResult?.bird_count ?? f.birdCount, linkedAnalysisDate: nowISO }
                : f
        ));
        setSavedFlock(`Updated "${target.name}" bird count to ${analysisResult?.bird_count ?? target.birdCount}`);
        setFlockAction('none');
    };

    const densityColor =
        analysisResult?.density_label === 'High' ? 'text-red-600 bg-red-50' :
        analysisResult?.density_label === 'Medium' ? 'text-orange-600 bg-orange-50' :
        'text-green-600 bg-green-50';

    return (
        <div className="h-full flex flex-col">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm gap-1">
                        <button
                            onClick={() => setResultTab('original')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${resultTab === 'original' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
                        >Original</button>
                        <button
                            onClick={() => setResultTab('detections')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${resultTab === 'detections' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
                        >Detections</button>
                        <button
                            onClick={() => setResultTab('insights')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${resultTab === 'insights' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            🧠 AI Insights
                            {insights.length > 0 && (
                                <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {insights.length}
                                </span>
                            )}
                        </button>
                    </div>
                    <button onClick={onNewUpload} className="text-sm text-slate-500 hover:text-slate-900">← New Upload</button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* ── Left: Visual Canvas (hidden on insights tab) ─────────────── */}
                    {resultTab !== 'insights' && (
                        <div className="flex-1 bg-neutral-900 relative flex items-center justify-center p-4 overflow-auto">
                            <div className="relative inline-block shadow-2xl">
                                <img
                                    src={(image as string) || 'https://images.unsplash.com/photo-1563205764-647e2974309f?q=80&w=800&auto=format&fit=crop'}
                                    className="max-w-full max-h-[70vh] block"
                                />
                                {resultTab === 'detections' && detections.map((det) => (
                                    <div key={det.id}
                                        style={{ left: `${det.x}%`, top: `${det.y}%`, width: `${det.w}%`, height: `${det.h}%` }}
                                        className="absolute border-2 border-emerald-400 bg-emerald-400/20 group hover:bg-emerald-400/40 transition-colors cursor-crosshair">
                                        <div className="absolute -top-6 left-0 bg-emerald-500 text-white text-[10px] px-1 rounded shadow">
                                            {det.class} {det.confidence}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Right / Full: Metrics or Insights Panel ──────────────────── */}
                    {resultTab !== 'insights' ? (
                        <div className="w-full md:w-80 bg-white border-l border-slate-200 overflow-y-auto p-6">
                            <h3 className="font-bold text-slate-900 mb-4">AI Metrics Summary</h3>
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <span className="text-xs text-slate-500 block">Total Bird Count</span>
                                    <span className="text-2xl font-bold text-emerald-600">{analysisResult?.bird_count || 0}</span>
                                </div>
                                {/* Detection Method Badge */}
                                {analysisResult?.detection_method && (
                                    <div className={`p-3 rounded-lg flex items-center gap-2 ${
                                        analysisResult.detection_method === 'CV-Blob'
                                            ? 'bg-cyan-50 border border-cyan-200'
                                            : 'bg-emerald-50 border border-emerald-200'
                                    }`}>
                                        <span className="text-lg">
                                            {analysisResult.detection_method === 'CV-Blob' ? '🔬' : '🤖'}
                                        </span>
                                        <div>
                                            <span className={`text-xs font-semibold block ${
                                                analysisResult.detection_method === 'CV-Blob' ? 'text-cyan-700' : 'text-emerald-700'
                                            }`}>Method Used</span>
                                            <span className={`text-sm font-bold ${
                                                analysisResult.detection_method === 'CV-Blob' ? 'text-cyan-800' : 'text-emerald-800'
                                            }`}>
                                                {analysisResult.detection_method === 'CV-Blob'
                                                    ? 'CV Blob (White Chicken Masking)'
                                                    : 'YOLOv8 Neural Network'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {analysisResult?.density_label && (
                                    <div className={`p-3 rounded-lg ${densityColor}`}>
                                        <span className="text-xs font-semibold block">Density Level</span>
                                        <span className="text-lg font-bold">{analysisResult.density_label} ({analysisResult.density_score}%)</span>
                                    </div>
                                )}
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
                                                {detections.slice(0, 10).map((d) => (
                                                    <tr key={d.id}>
                                                        <td className="p-2">{d.class}</td>
                                                        <td className="p-2">{d.confidence}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="p-2 text-center text-xs text-slate-400 bg-slate-50">
                                            + {detections.length > 10 ? detections.length - 10 : 0} more
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── AI INSIGHTS FULL PANEL ─────────────────────────────────── */
                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            <div className="max-w-2xl mx-auto space-y-6">

                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                                        <p className="text-xs text-emerald-600 font-semibold uppercase">Bird Count</p>
                                        <p className="text-3xl font-extrabold text-emerald-700 mt-1">{analysisResult?.bird_count ?? 0}</p>
                                    </div>
                                    <div className={`rounded-xl p-4 text-center border ${
                                        analysisResult?.density_label === 'High' ? 'bg-red-50 border-red-100' :
                                        analysisResult?.density_label === 'Medium' ? 'bg-orange-50 border-orange-100' :
                                        'bg-green-50 border-green-100'}`}>
                                        <p className={`text-xs font-semibold uppercase ${
                                            analysisResult?.density_label === 'High' ? 'text-red-600' :
                                            analysisResult?.density_label === 'Medium' ? 'text-orange-600' :
                                            'text-green-600'}`}>Density</p>
                                        <p className={`text-3xl font-extrabold mt-1 ${
                                            analysisResult?.density_label === 'High' ? 'text-red-700' :
                                            analysisResult?.density_label === 'Medium' ? 'text-orange-700' :
                                            'text-green-700'}`}>
                                            {analysisResult?.density_label ?? '—'}
                                        </p>
                                    </div>
                                    <div className={`rounded-xl p-4 text-center border ${
                                        analysisResult?.detection_method === 'CV-Blob'
                                            ? 'bg-cyan-50 border-cyan-100'
                                            : 'bg-slate-50 border-slate-200'
                                    }`}>
                                        <p className={`text-xs font-semibold uppercase ${
                                            analysisResult?.detection_method === 'CV-Blob' ? 'text-cyan-600' : 'text-slate-500'
                                        }`}>AI Method</p>
                                        <p className={`text-lg font-extrabold mt-1 ${
                                            analysisResult?.detection_method === 'CV-Blob' ? 'text-cyan-700' : 'text-slate-700'
                                        }`}>
                                            {analysisResult?.detection_method === 'CV-Blob' ? '🔬 CV' : '🤖 YOLO'}
                                        </p>
                                    </div>
                                </div>

                                {/* Insights List */}
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center gap-2">
                                        <span className="text-white text-lg">🧠</span>
                                        <h3 className="text-white font-bold">AI Recommendations</h3>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {insights.length === 0 ? (
                                            <p className="px-5 py-8 text-slate-400 text-center text-sm">No insights available for this analysis.</p>
                                        ) : insights.map((insight, i) => (
                                            <div key={i} className="px-5 py-3 flex gap-3 items-start hover:bg-slate-50 transition-colors">
                                                <span className="text-emerald-500 text-lg mt-0.5 flex-shrink-0">✦</span>
                                                <p className="text-sm text-slate-700">{insight}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Flock Linking Card ─────────────────────────────────── */}
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="px-5 py-3 bg-gradient-to-r from-slate-700 to-slate-800 flex items-center gap-2">
                                        <span className="text-white text-lg">🐔</span>
                                        <h3 className="text-white font-bold">Link to Flock Management</h3>
                                    </div>

                                    {savedFlock ? (
                                        /* Success state */
                                        <div className="p-5 space-y-3">
                                            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                                                <span className="text-emerald-500 text-xl">✅</span>
                                                <p className="text-sm text-emerald-700 font-medium">{savedFlock}</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => { setSavedFlock(null); setFlockAction('none'); }}
                                                    className="flex-1 border border-slate-300 text-slate-600 rounded-lg px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
                                                >Link Another</button>
                                                <button
                                                    onClick={onNavigateToFlock}
                                                    className="flex-1 bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-emerald-700 transition-colors"
                                                >View Flock Management →</button>
                                            </div>
                                        </div>
                                    ) : flockAction === 'none' ? (
                                        /* Default: choose action */
                                        <div className="p-5 space-y-3">
                                            <p className="text-sm text-slate-500">Use the AI-detected bird count ({analysisResult?.bird_count ?? 0}) to create or update a flock record.</p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => { setFlockAction('create'); setNewFlockName(''); setNameError(''); }}
                                                    className="flex-1 bg-emerald-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <span>+</span> Create New Flock
                                                </button>
                                                <button
                                                    onClick={() => { setFlockAction('link'); setLinkedFlockId(flocks[0]?.id ?? ''); }}
                                                    className="flex-1 border border-emerald-600 text-emerald-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                                                    disabled={flocks.length === 0}
                                                >
                                                    🔗 Update Existing
                                                </button>
                                            </div>
                                        </div>
                                    ) : flockAction === 'create' ? (
                                        /* Create new flock */
                                        <div className="p-5 space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">New Flock Name</label>
                                                <input
                                                    type="text"
                                                    value={newFlockName}
                                                    onChange={e => { setNewFlockName(e.target.value); setNameError(''); }}
                                                    placeholder="e.g. Flock D – April Batch"
                                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${nameError ? 'border-red-400' : 'border-slate-300'}`}
                                                />
                                                {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                                                <div><span className="font-semibold block">Bird Count (from AI)</span>{analysisResult?.bird_count ?? 0}</div>
                                                <div><span className="font-semibold block">Linked At</span>{formatDateTime(getNowISO())}</div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={() => setFlockAction('none')} className="flex-1 border border-slate-300 text-slate-600 rounded-lg px-4 py-2 text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                                                <button onClick={handleCreateFlock} className="flex-1 bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-emerald-700 transition-colors">Create Flock</button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Link to existing flock */
                                        <div className="p-5 space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Flock to Update</label>
                                                <select
                                                    value={linkedFlockId}
                                                    onChange={e => setLinkedFlockId(e.target.value)}
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                                >
                                                    {flocks.map(f => (
                                                        <option key={f.id} value={f.id}>#{f.id} – {f.name} ({f.birdCount.toLocaleString()} birds)</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <p className="text-xs text-slate-500">The bird count will be updated to <strong>{analysisResult?.bird_count ?? 0}</strong> based on this analysis.</p>
                                            <div className="flex gap-3">
                                                <button onClick={() => setFlockAction('none')} className="flex-1 border border-slate-300 text-slate-600 rounded-lg px-4 py-2 text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                                                <button onClick={handleLinkFlock} className="flex-1 bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-emerald-700 transition-colors">Update Flock</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
