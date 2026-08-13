import { useState } from 'react';
import type { Flock } from '../types';

const todayISO = () => new Date().toISOString().split('T')[0];
const fmtDate = (iso: string) =>
    iso
        ? new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : '—';

const EMPTY_FLOCK: Omit<Flock, 'id'> = {
    name: '',
    startDate: '',
    age: 0,
    status: 'Active',
    birdCount: 0,
};

interface FlockMgmtProps {
    flocks: Flock[];
    setFlocks: React.Dispatch<React.SetStateAction<Flock[]>>;
}

export function FlockMgmt({ flocks, setFlocks }: FlockMgmtProps) {

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Omit<Flock, 'id'> & { id: string }>({ id: '', ...EMPTY_FLOCK });
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Partial<Record<keyof Flock, string>>>({});

    // ── Helpers ──────────────────────────────────────────────────────────────
    const openAdd = () => {
        setEditingId(null);
        const nextId = String(flocks.length + 1).padStart(2, '0');
        setForm({ id: nextId, ...EMPTY_FLOCK, startDate: todayISO() });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (flock: Flock) => {
        setEditingId(flock.id);
        setForm({ ...flock });
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setErrors({});
    };

    const validate = (): boolean => {
        const e: Partial<Record<keyof Flock, string>> = {};
        if (!form.id.trim()) e.id = 'ID is required';
        if (!form.name.trim()) e.name = 'Flock name is required';
        if (!form.startDate.trim()) e.startDate = 'Start date is required';
        if (form.age < 0) e.age = 'Age must be ≥ 0';
        if (form.birdCount < 0) e.birdCount = 'Bird count must be ≥ 0';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        if (editingId) {
            setFlocks(prev => prev.map(f => f.id === editingId ? { ...form } : f));
        } else {
            // Prevent duplicate ID
            if (flocks.some(f => f.id === form.id)) {
                setErrors(prev => ({ ...prev, id: 'ID already exists' }));
                return;
            }
            setFlocks(prev => [...prev, { ...form }]);
        }
        closeModal();
    };

    const handleDelete = (id: string) => {
        setFlocks(prev => prev.filter(f => f.id !== id));
        setDeleteConfirmId(null);
    };

    const statusColor = (s: string) =>
        s === 'Active' ? 'bg-green-100 text-green-700'
            : s === 'Issue' ? 'bg-red-100 text-red-700'
                : 'bg-slate-100 text-slate-700';

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {/* ── Table Card ─────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Flock Overview</h2>
                    <button
                        onClick={openAdd}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                        + Add Flock
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Flock Name</th>
                                <th className="px-6 py-3">Start Date</th>
                                <th className="px-6 py-3">Age (days)</th>
                                <th className="px-6 py-3">Birds</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {flocks.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                                        No flocks yet. Click <strong>+ Add Flock</strong> to get started.
                                    </td>
                                </tr>
                            )}
                            {flocks.map((flock) => (
                                <tr key={flock.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-500">#{flock.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <div className="flex items-center gap-2">
                                            {flock.name}
                                            {flock.linkedAnalysisDate && (
                                                <span
                                                    title={`Linked from AI analysis on ${new Date(flock.linkedAnalysisDate).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700"
                                                >
                                                    🧠 AI
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{fmtDate(flock.startDate)}</td>
                                    <td className="px-6 py-4">{flock.age} days</td>
                                    <td className="px-6 py-4">{flock.birdCount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(flock.status)}`}>
                                            {flock.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => openEdit(flock)}
                                                className="text-emerald-600 hover:underline text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmId(flock.id)}
                                                className="text-red-500 hover:underline text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Add / Edit Modal ────────────────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-white font-bold text-lg">
                                {editingId ? '✏️ Edit Flock' : '🐔 Add New Flock'}
                            </h3>
                            <button onClick={closeModal} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            {/* ID */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Flock ID</label>
                                <input
                                    type="text"
                                    value={form.id}
                                    onChange={e => setForm(p => ({ ...p, id: e.target.value }))}
                                    disabled={!!editingId}
                                    placeholder="e.g. 04"
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${editingId ? 'bg-slate-100 cursor-not-allowed' : ''} ${errors.id ? 'border-red-400' : 'border-slate-300'}`}
                                />
                                {errors.id && <p className="text-xs text-red-500 mt-1">{errors.id}</p>}
                            </div>

                            {/* Flock Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Flock Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Flock D"
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${errors.name ? 'border-red-400' : 'border-slate-300'}`}
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${errors.startDate ? 'border-red-400' : 'border-slate-300'}`}
                                />
                                {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
                            </div>

                            {/* Age + Birds side-by-side */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Age (days)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.age}
                                        onChange={e => setForm(p => ({ ...p, age: Number(e.target.value) }))}
                                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${errors.age ? 'border-red-400' : 'border-slate-300'}`}
                                    />
                                    {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Bird Count</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.birdCount}
                                        onChange={e => setForm(p => ({ ...p, birdCount: Number(e.target.value) }))}
                                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${errors.birdCount ? 'border-red-400' : 'border-slate-300'}`}
                                    />
                                    {errors.birdCount && <p className="text-xs text-red-500 mt-1">{errors.birdCount}</p>}
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm(p => ({ ...p, status: e.target.value as Flock['status'] }))}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Sold">Sold</option>
                                    <option value="Issue">Issue</option>
                                </select>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6 flex gap-3 justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                            >
                                {editingId ? 'Save Changes' : 'Add Flock'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ────────────────────────────────────── */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
                        <div className="text-5xl mb-3">🗑️</div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">Delete Flock?</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            This will permanently remove <strong>Flock #{deleteConfirmId}</strong> from the list.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirmId)}
                                className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
