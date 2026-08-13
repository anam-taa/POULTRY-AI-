import { useEffect, useState } from 'react';
import type { Flock } from '../types';

interface DashboardProps {
    onViewResults: () => void;
    flocks: Flock[];
}

interface DashboardStats {
    total_birds: number;
    flocks_monitored: number;
    health_score: number;
    alerts: string[];
    recent_activity: { id: number; message: string; time: string; type: string }[];
}

/** Ensure ISO string is parsed as UTC (append Z if no timezone offset present) */
const toUTC = (iso: string) => (iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z');

/** Format a UTC ISO timestamp into the user's local date + time */
const fmtTimestamp = (iso: string) =>
    new Date(toUTC(iso)).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

export function Dashboard({ flocks }: DashboardProps) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [now, setNow] = useState(new Date());

    // Tick the clock every minute so "Last Update" stays current
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/dashboard/stats', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    setStats(await response.json());
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;

    // Combined number of birds across flocks
    const totalFlockBirds = flocks.reduce((acc, f) => acc + f.birdCount, 0);

    // Feed Stock calculations based on total birds (0.12 kg per bird per day)
    const feedCapacity = 20000; // kg
    const currentFeedStock = 8250; // kg
    const dailyFeedNeed = totalFlockBirds * 0.12; // kg/day
    const daysRemaining = dailyFeedNeed > 0 ? (currentFeedStock / dailyFeedNeed) : 0;
    const feedPercentage = Math.round((currentFeedStock / feedCapacity) * 100);

    // Format flock start date for UI
    const fmtFlockDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Combined Birds Count Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 flex flex-col justify-between">
                    <div>
                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Birds Counted</div>
                        <div className="mt-2 flex items-baseline font-sans">
                            <span className="text-3xl font-bold text-slate-900">{totalFlockBirds.toLocaleString()}</span>
                            <span className="ml-2 text-sm font-medium text-slate-500">birds</span>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md self-start font-medium">
                        Combined across {flocks.length} different flocks
                    </div>
                </div>

                {/* 2. Feed Stock Status Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500 flex flex-col justify-between">
                    <div>
                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Feed Stock Level</div>
                        <div className="mt-2 flex items-baseline justify-between font-sans">
                            <span className="text-3xl font-bold text-slate-900">{currentFeedStock.toLocaleString()} kg</span>
                            <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{feedPercentage}%</span>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-500">
                        {totalFlockBirds > 0 ? (
                            <span className="font-medium">
                                Est. <strong className="text-slate-800">{daysRemaining.toFixed(1)} days</strong> supply remaining
                            </span>
                        ) : (
                            <span className="text-slate-400 italic">No bird consumption tracked</span>
                        )}
                    </div>
                </div>

                {/* 3. Last Update Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500 flex flex-col justify-between">
                    <div>
                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Last System Update</div>
                        <div className="mt-2">
                            <span className="text-lg font-bold text-slate-900">
                                {stats.recent_activity[0]
                                    ? fmtTimestamp(stats.recent_activity[0].time)
                                    : now.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md self-start font-medium">
                        AI Inference Engine Active
                    </div>
                </div>
            </div>

            {/* FEED STOCK DETAILS & TIMELINE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* A. Feed Stock Diagnostic Details */}
                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span>🌾</span> Feed Stock & Silo Diagnostics
                        </h3>
                        
                        {/* Progress Bar */}
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-500">Silo Capacity (20,000 kg)</span>
                                <span className="text-slate-900 font-sans">{currentFeedStock.toLocaleString()} kg / 20k kg</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        feedPercentage > 50 ? 'bg-emerald-500' : feedPercentage > 25 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${feedPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Silo Metadata */}
                        <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-4 font-sans">
                            <div>
                                <span className="block text-xs text-slate-400 font-sans">Daily Demand</span>
                                <strong className="text-slate-800 font-semibold">{Math.round(dailyFeedNeed).toLocaleString()} kg / day</strong>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-400 font-sans">Exhaustion Forecast</span>
                                <strong className="text-slate-800 font-semibold">
                                    {totalFlockBirds > 0 
                                        ? new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                        : 'N/A'
                                    }
                                </strong>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-400 font-sans">Avg consumption per bird</span>
                                <span className="text-slate-700">120 g / day</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-400 font-sans">Silo Alert Status</span>
                                <span className={`font-semibold ${daysRemaining < 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                                    {daysRemaining < 3 ? 'CRITICAL' : daysRemaining < 6 ? 'REORDER SOON' : 'STABLE'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-4 flex justify-between items-center">
                        <span className="text-xs text-slate-400">Auto-calculated using live flock counts</span>
                        <button className="px-3 py-1.5 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 transition-colors">
                            Order Feed Refill
                        </button>
                    </div>
                </div>

                {/* B. Recent Farm Updates Timeline */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span>📋</span> Recent Farm Updates & Log
                    </h3>
                    <div className="space-y-4">
                        {/* Feed Stock Status Log Entry */}
                        <div className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 hover:bg-slate-50/50 p-2 rounded transition-colors">
                            <div className="text-lg mt-0.5">🌾</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800">Feed Stock checked</p>
                                <p className="text-xs text-slate-600 mt-0.5">
                                    Silo contains {currentFeedStock.toLocaleString()} kg. Sufficient for {daysRemaining.toFixed(1)} days based on current flock.
                                </p>
                            </div>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap self-start">Today</span>
                        </div>

                        {/* Flock Creation Logs */}
                        {flocks.length === 0 ? (
                            <p className="text-slate-500 italic text-sm p-2">No flocks registered to generate creation logs.</p>
                        ) : (
                            // Sort flocks by start date to list latest creations first
                            [...flocks]
                                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                                .map((flock) => (
                                    <div key={flock.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 hover:bg-slate-50/50 p-2 rounded transition-colors font-sans">
                                        <div className="text-lg mt-0.5">🆕</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800">New flock was created: <span className="font-bold text-emerald-600">{flock.name}</span></p>
                                            <p className="text-xs text-slate-600 mt-0.5">
                                                Initialized with {flock.birdCount.toLocaleString()} birds on {fmtFlockDate(flock.startDate)}. Current age is {flock.age} days.
                                            </p>
                                        </div>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap self-start">
                                            {flock.age} days ago
                                        </span>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}
