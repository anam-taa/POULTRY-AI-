export function Vet() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <span className="block text-red-600 font-bold text-xl">3</span>
                    <span className="text-xs text-red-600 uppercase">High Risk Farms</span>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <span className="block text-orange-600 font-bold text-xl">8</span>
                    <span className="text-xs text-orange-600 uppercase">Medium Risk</span>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <span className="block text-green-600 font-bold text-xl">21</span>
                    <span className="text-xs text-green-600 uppercase">Low Risk</span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50 font-medium">Farm Health Scoreboard</div>
                <div className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        {/* Farm Card */}
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold">Farm A - Flock 02</h4>
                                    <p className="text-sm text-slate-500">Last Checked: Today</p>
                                </div>
                                <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Score: 84</div>
                            </div>
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Mortality Rate</span>
                                    <span className="text-red-500 font-medium">+2% vs Std</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Litter Moisture</span>
                                    <span className="text-green-500 font-medium">Normal</span>
                                </div>
                            </div>
                            <button className="mt-4 w-full py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded hover:bg-slate-200">View Detailed Report</button>
                        </div>

                        {/* Farm Card */}
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold">Farm B - Flock 01</h4>
                                    <p className="text-sm text-slate-500">Last Checked: Yesterday</p>
                                </div>
                                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Score: 92</div>
                            </div>
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Mortality Rate</span>
                                    <span className="text-green-500 font-medium">Optimal</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Litter Moisture</span>
                                    <span className="text-green-500 font-medium">Optimal</span>
                                </div>
                            </div>
                            <button className="mt-4 w-full py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded hover:bg-slate-200">View Detailed Report</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
