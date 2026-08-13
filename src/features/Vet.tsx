import { useState } from 'react';

interface VaxRecord {
    id: number;
    flockName: string;
    type: 'Vaccination' | 'Medication';
    name: string;
    date: string;
    status: 'Completed' | 'Pending' | 'Overdue';
    notes: string;
}

const INITIAL_RECORDS: VaxRecord[] = [
    { id: 1, flockName: 'Flock A', type: 'Vaccination', name: 'Newcastle Disease (ND)',  date: '2025-01-12', status: 'Completed', notes: 'Ocular drop method' },
    { id: 2, flockName: 'Flock A', type: 'Medication',  name: 'Amprolium (Coccidiosis)', date: '2025-01-20', status: 'Completed', notes: 'In drinking water 5 days' },
    { id: 3, flockName: 'Flock B', type: 'Vaccination', name: 'Infectious Bursal (IBD)', date: '2025-02-05', status: 'Completed', notes: 'Drinking water' },
    { id: 4, flockName: 'Flock B', type: 'Medication',  name: 'Enrofloxacin',            date: '2025-02-10', status: 'Pending',   notes: 'Respiratory treatment' },
    { id: 5, flockName: 'Flock C', type: 'Vaccination', name: 'Marek\'s Disease',         date: '2024-12-15', status: 'Completed', notes: 'Subcutaneous injection' },
    { id: 6, flockName: 'Flock C', type: 'Medication',  name: 'Vitamin B Complex',        date: '2025-01-02', status: 'Overdue',   notes: 'Stress recovery' },
];

const EMPTY_RECORD: Omit<VaxRecord, 'id'> = {
    flockName: 'Flock A',
    type: 'Vaccination',
    name: '',
    date: '',
    status: 'Pending',
    notes: '',
};

const statusStyle = (s: VaxRecord['status']) =>
    s === 'Completed' ? 'bg-green-100 text-green-700'
    : s === 'Pending'  ? 'bg-orange-100 text-orange-700'
    : 'bg-red-100 text-red-700';

const typeStyle = (t: VaxRecord['type']) =>
    t === 'Vaccination' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';

export function Vet() {
    const [records, setRecords] = useState<VaxRecord[]>(INITIAL_RECORDS);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Omit<VaxRecord, 'id'>>(EMPTY_RECORD);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [filterType, setFilterType] = useState<'All' | 'Vaccination' | 'Medication'>('All');
    const [filterFlock, setFilterFlock] = useState('All');
    const [nameError, setNameError] = useState('');

    const flockNames = Array.from(new Set(records.map(r => r.flockName)));

    const filtered = records.filter(r =>
        (filterType === 'All' || r.type === filterType) &&
        (filterFlock === 'All' || r.flockName === filterFlock)
    );

    const countByStatus = (s: VaxRecord['status']) => records.filter(r => r.status === s).length;

    const openAdd = () => {
        setEditingId(null);
        setForm(EMPTY_RECORD);
        setNameError('');
        setShowModal(true);
    };

    const openEdit = (r: VaxRecord) => {
        setEditingId(r.id);
        const { id: _id, ...rest } = r;
        setForm(rest);
        setNameError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNameError('');
    };

    const handleSave = () => {
        if (!form.name.trim()) { setNameError('Name is required'); return; }
        if (!form.date) { setNameError('Date is required'); return; }
        if (editingId !== null) {
            setRecords(prev => prev.map(r => r.id === editingId ? { ...form, id: editingId } : r));
        } else {
            setRecords(prev => [...prev, { ...form, id: Date.now() }]);
        }
        closeModal();
        setForm(EMPTY_RECORD);
    };

    const handleDelete = (id: number) => {
        setRecords(prev => prev.filter(r => r.id !== id));
        setDeleteId(null);
    };

    return (
        <div className="space-y-6">

            {/* ── Stats Row ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <span className="block text-red-600 font-extrabold text-2xl">{countByStatus('Overdue')}</span>
                    <span className="text-xs text-red-600 font-semibold uppercase">Overdue Flocks</span>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <span className="block text-orange-600 font-extrabold text-2xl">{countByStatus('Pending')}</span>
                    <span className="text-xs text-orange-600 font-semibold uppercase">Pending Flocks</span>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <span className="block text-green-600 font-extrabold text-2xl">{countByStatus('Completed')}</span>
                    <span className="text-xs text-green-600 font-semibold uppercase">Completed</span>
                </div>
            </div>

            {/* ── Flock Health Scoreboard ───────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                <div className="p-4 border-b bg-slate-50 font-semibold text-slate-700">🐔 Flock Health Scoreboard</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">

                    {/* Flock A */}
                    <div className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-slate-800">Flock A</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Last Checked: Today</p>
                            </div>
                            <div className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold">Score: 84</div>
                        </div>
                        <div className="mt-3 space-y-1.5 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Mortality Rate</span><span className="text-red-500 font-medium">+2% vs Std</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Vaccination</span><span className="text-green-600 font-medium">✔ Up to date</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Medication</span><span className="text-orange-500 font-medium">1 Pending</span></div>
                        </div>
                        <button className="mt-3 w-full py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors">View Detailed Report</button>
                    </div>

                    {/* Flock B */}
                    <div className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-slate-800">Flock B</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Last Checked: Yesterday</p>
                            </div>
                            <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">Score: 92</div>
                        </div>
                        <div className="mt-3 space-y-1.5 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Mortality Rate</span><span className="text-green-500 font-medium">Optimal</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Vaccination</span><span className="text-green-600 font-medium">✔ Up to date</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Medication</span><span className="text-green-600 font-medium">✔ Completed</span></div>
                        </div>
                        <button className="mt-3 w-full py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors">View Detailed Report</button>
                    </div>

                    {/* Flock C */}
                    <div className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-slate-800">Flock C</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Last Checked: 2 days ago</p>
                            </div>
                            <div className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold">Score: 71</div>
                        </div>
                        <div className="mt-3 space-y-1.5 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Mortality Rate</span><span className="text-red-500 font-medium">+4% vs Std</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Vaccination</span><span className="text-green-600 font-medium">✔ Up to date</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Medication</span><span className="text-red-500 font-medium">⚠ Overdue</span></div>
                        </div>
                        <button className="mt-3 w-full py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors">View Detailed Report</button>
                    </div>

                </div>
            </div>

            {/* ── Vaccination & Medication Tracker ─────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                    <span className="font-semibold text-slate-700">💉 Vaccination &amp; Medication Tracker</span>
                    <button
                        onClick={openAdd}
                        className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                        + Add Record
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 px-4 pt-4">
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 text-sm">
                        {(['All', 'Vaccination', 'Medication'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setFilterType(t)}
                                className={`px-3 py-1.5 font-medium transition-colors ${filterType === t ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                            >{t}</button>
                        ))}
                    </div>
                    <select
                        value={filterFlock}
                        onChange={e => setFilterFlock(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                        <option value="All">All Flocks</option>
                        {flockNames.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto mt-3">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                            <tr>
                                <th className="px-5 py-3">Flock</th>
                                <th className="px-5 py-3">Type</th>
                                <th className="px-5 py-3">Name</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Notes</th>
                                <th className="px-5 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">No records found.</td>
                                </tr>
                            )}
                            {filtered.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3 font-medium text-slate-800">{r.flockName}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeStyle(r.type)}`}>{r.type}</span>
                                    </td>
                                    <td className="px-5 py-3 text-slate-700">{r.name}</td>
                                    <td className="px-5 py-3 text-slate-500">{r.date}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle(r.status)}`}>{r.status}</span>
                                    </td>
                                    <td className="px-5 py-3 text-slate-500 text-xs max-w-[160px] truncate">{r.notes}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => openEdit(r)}
                                                className="text-emerald-600 hover:underline text-xs font-medium"
                                            >Edit</button>
                                            <button
                                                onClick={() => setDeleteId(r.id)}
                                                className="text-red-500 hover:underline text-xs font-medium"
                                            >Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Add Record Modal ─────────────────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-white font-bold text-lg">
                                {editingId !== null ? '✏️ Edit Record' : '💉 Add Vax / Medication Record'}
                            </h3>
                            <button onClick={closeModal} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">

                            {/* Flock */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Flock</label>
                                <select
                                    value={form.flockName}
                                    onChange={e => setForm(p => ({ ...p, flockName: e.target.value }))}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                >
                                    {['Flock A', 'Flock B', 'Flock C'].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Type</label>
                                <div className="flex gap-3">
                                    {(['Vaccination', 'Medication'] as const).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setForm(p => ({ ...p, type: t }))}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${form.type === t ? (t === 'Vaccination' ? 'bg-blue-600 text-white border-blue-600' : 'bg-purple-600 text-white border-purple-600') : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                                        >{t}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                                    {form.type === 'Vaccination' ? 'Vaccine Name' : 'Medication Name'}
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setNameError(''); }}
                                    placeholder={form.type === 'Vaccination' ? 'e.g. Newcastle Disease' : 'e.g. Enrofloxacin'}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${nameError ? 'border-red-400' : 'border-slate-300'}`}
                                />
                                {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                            </div>

                            {/* Date + Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={e => { setForm(p => ({ ...p, date: e.target.value })); setNameError(''); }}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={e => setForm(p => ({ ...p, status: e.target.value as VaxRecord['status'] }))}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Notes</label>
                                <input
                                    type="text"
                                    value={form.notes}
                                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                                    placeholder="e.g. Drinking water method, 5 days"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                />
                            </div>
                        </div>
                        <div className="px-6 pb-6 flex gap-3 justify-end">
                            <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
                                {editingId !== null ? 'Save Changes' : 'Save Record'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm ───────────────────────────────────────────────── */}
            {deleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
                        <div className="text-5xl mb-3">🗑️</div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">Delete Record?</h3>
                        <p className="text-slate-500 text-sm mb-6">This will permanently remove this entry.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={() => handleDelete(deleteId)} className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600">Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
