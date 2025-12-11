interface DashboardProps {
    onViewResults: () => void;
}

export function Dashboard({ onViewResults }: DashboardProps) {
    return (
        <div className="space-y-6">

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                    <div className="text-slate-500 text-sm font-medium uppercase">Bird Density</div>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-semibold text-slate-900">72%</span>
                        <span className="ml-2 text-sm text-green-600">Optimal</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
                    <div className="text-slate-500 text-sm font-medium uppercase">Heatmap Alerts</div>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-semibold text-slate-900">3</span>
                        <span className="ml-2 text-sm text-red-600">Requires Action</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-emerald-500">
                    <div className="text-slate-500 text-sm font-medium uppercase">Litter Status</div>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-semibold text-slate-900">Normal</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
                    <div className="text-slate-500 text-sm font-medium uppercase">Mortality Today</div>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-semibold text-slate-900">4</span>
                        <span className="ml-2 text-sm text-slate-500">/ 12000</span>
                    </div>
                </div>
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bird Count Trend */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Bird Count Trend (7 Days)</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {[40, 60, 55, 70, 65, 80, 75].map((h, i) => (
                            <div key={i} style={{ height: `${h}%` }} className="w-full bg-blue-100 rounded-t hover:bg-blue-200 transition-all relative group">
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded">{h * 10}</div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                {/* Feed Usage */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Feed Usage (kg)</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {[30, 45, 40, 50, 60, 55, 65].map((h, i) => (
                            <div key={i} style={{ height: `${h}%` }} className="w-full bg-emerald-100 rounded-t hover:bg-emerald-200 transition-all relative group">
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded">{h * 5}kg</div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>
            </div>

            {/* RECENT HEATMAPS */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-slate-900">Recent Heatmap Captures</h3>
                    <button className="text-sm text-emerald-600 font-medium hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative group cursor-pointer" onClick={onViewResults}>
                            <img src={`https://images.unsplash.com/photo-1563205764-647e2974309f?q=80&w=400&auto=format&fit=crop`} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            <div className="absolute bottom-2 left-2 text-white text-xs">Camera 0{i} • 2m ago</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
