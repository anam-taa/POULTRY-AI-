export function Admin() {
    return (
        <div className="space-y-6">
            <div className="bg-slate-800 text-white rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4">System Status</h2>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-slate-700 rounded-lg">
                        <div className="text-xs text-slate-400">CPU Usage</div>
                        <div className="text-xl font-mono text-emerald-400">45%</div>
                    </div>
                    <div className="p-3 bg-slate-700 rounded-lg">
                        <div className="text-xs text-slate-400">Active Users</div>
                        <div className="text-xl font-mono text-blue-400">842</div>
                    </div>
                    <div className="p-3 bg-slate-700 rounded-lg">
                        <div className="text-xs text-slate-400">AI Inferences</div>
                        <div className="text-xl font-mono text-purple-400">214</div>
                    </div>
                    <div className="p-3 bg-slate-700 rounded-lg">
                        <div className="text-xs text-slate-400">Model Ver</div>
                        <div className="text-xl font-mono text-orange-400">v11.2</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold mb-4">User Management</h3>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-2">Name</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        <tr className="hover:bg-slate-50">
                            <td className="p-2">John Doe</td>
                            <td className="p-2 bg-blue-50 text-blue-700">Farmer</td>
                            <td className="p-2 text-green-600">Active</td>
                            <td className="p-2 text-blue-600 cursor-pointer">Edit</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                            <td className="p-2">Dr. Smith</td>
                            <td className="p-2 bg-purple-50 text-purple-700">Vet</td>
                            <td className="p-2 text-green-600">Active</td>
                            <td className="p-2 text-blue-600 cursor-pointer">Edit</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
