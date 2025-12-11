export function Dealer() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="text-slate-500 text-sm">Farms Managed</div>
                    <div className="text-3xl font-bold mt-2">12</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="text-slate-500 text-sm">Total Birds Under Mgmt</div>
                    <div className="text-3xl font-bold mt-2">250,000</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <div className="text-slate-500 text-sm">Feed Forecast (15 Days)</div>
                    <div className="text-3xl font-bold mt-2">18 Tons</div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4">Farm Status & Supply Needs</h3>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-200 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="p-3">Farm Name</th>
                            <th className="p-3">Owner</th>
                            <th className="p-3">Bird Count</th>
                            <th className="p-3">Feed Stock</th>
                            <th className="p-3">Alerts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        <tr className="hover:bg-slate-50">
                            <td className="p-3 font-medium">Sunrise Farms</td>
                            <td className="p-3">Ramesh K.</td>
                            <td className="p-3">18,000</td>
                            <td className="p-3 text-red-500 font-bold">Low (2 days)</td>
                            <td className="p-3"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">2 Critical</span></td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                            <td className="p-3">Green Valley</td>
                            <td className="p-3">Sarah J.</td>
                            <td className="p-3">12,500</td>
                            <td className="p-3 text-green-600">Good</td>
                            <td className="p-3">-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
