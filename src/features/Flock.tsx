import type { Flock } from '../types';

export function FlockMgmt() {
    const flocks: Flock[] = [
        { id: '01', name: 'Flock A', startDate: '10 Jan', age: 23, status: 'Active', birdCount: 4800 },
        { id: '02', name: 'Flock B', startDate: '02 Feb', age: 7, status: 'Active', birdCount: 5100 },
        { id: '03', name: 'Flock C', startDate: '15 Dec', age: 45, status: 'Sold', birdCount: 4600 },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-lg font-bold">Flock Overview</h2>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">+ Add Flock</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Flock Name</th>
                            <th className="px-6 py-3">Start Date</th>
                            <th className="px-6 py-3">Age</th>
                            <th className="px-6 py-3">Birds</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {flocks.map((flock) => (
                            <tr key={flock.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-mono text-slate-500">#{flock.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{flock.name}</td>
                                <td className="px-6 py-4">{flock.startDate}</td>
                                <td className="px-6 py-4">{flock.age} days</td>
                                <td className="px-6 py-4">{flock.birdCount.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${flock.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                        {flock.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-emerald-600 hover:underline cursor-pointer">Manage</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
