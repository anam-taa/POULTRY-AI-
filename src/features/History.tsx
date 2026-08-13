import { useEffect, useState } from 'react';

/** Ensure ISO string is parsed as UTC (append Z if no timezone offset present) */
const toUTC = (iso: string) => (iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z');

interface HistoryItem {
    id: number;
    timestamp: string;
    filename: string;
    image_url: string;
    bird_count: number;
    density_label: string;
    density_score: number;
}

export function History() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const token = () => localStorage.getItem('token');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/history', {
                    headers: { 'Authorization': `Bearer ${token()}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setHistory(data);
                }
            } catch (error) {
                console.error('Failed to load history', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleDelete = async (id: number) => {
        setDeleting(true);
        try {
            const response = await fetch(`http://localhost:8000/api/history/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token()}` }
            });
            if (response.ok) {
                setHistory(prev => prev.filter(item => item.id !== id));
            } else {
                alert('Failed to delete record. Please try again.');
            }
        } catch (error) {
            console.error('Delete failed', error);
            alert('Network error. Could not delete record.');
        } finally {
            setDeleting(false);
            setDeleteConfirmId(null);
        }
    };

    const handleDownloadDataset = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/dataset/export', {
                headers: { 'Authorization': `Bearer ${token()}` }
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'poultry_dataset_export.zip';
                a.click();
            } else {
                alert('Failed to download dataset. Upload some images first.');
            }
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const densityStyle = (label: string) =>
        label === 'High'   ? 'bg-red-100 text-red-800' :
        label === 'Medium' ? 'bg-orange-100 text-orange-800' :
                             'bg-green-100 text-green-800';

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Historical Analysis</h2>
                <button
                    onClick={handleDownloadDataset}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm"
                >
                    <span className="text-lg">📥</span>
                    Download Dataset (For Training)
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading records...</div>
            ) : history.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                    <p className="text-slate-500">No analysis history found.</p>
                    <p className="text-sm text-slate-400 mt-1">Upload an image to generate data.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date &amp; Time</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bird Count</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Density</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {history.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {new Date(toUTC(item.timestamp)).toLocaleDateString()}
                                        <span className="ml-1.5 text-xs text-slate-400">
                                            {new Date(toUTC(item.timestamp)).toLocaleTimeString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-10 w-16 bg-slate-100 rounded overflow-hidden border border-slate-200">
                                            <img src={item.image_url} className="h-full w-full object-cover" alt={item.filename} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                                        {item.bird_count}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${densityStyle(item.density_label)}`}>
                                            {item.density_label} ({item.density_score}%)
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">
                                        Computed
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => setDeleteConfirmId(item.id)}
                                            className="text-red-500 hover:text-red-700 hover:underline text-sm font-medium transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
            {deleteConfirmId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
                        <div className="text-5xl mb-3">🗑️</div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">Delete Record?</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            This will permanently remove this analysis entry from the database.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                disabled={deleting}
                                className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirmId)}
                                disabled={deleting}
                                className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-2"
                            >
                                {deleting ? (
                                    <><span className="animate-spin">⏳</span> Deleting...</>
                                ) : (
                                    'Yes, Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
