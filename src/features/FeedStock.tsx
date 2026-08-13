import { useState } from 'react';
import type { Flock } from '../types';

interface FeedStockProps {
    flocks: Flock[];
}

interface DeliveryLog {
    id: string;
    date: string;
    quantity: number;
    cost: number;
    vendor: string;
    status: 'Delivered' | 'Scheduled';
}

const INITIAL_DELIVERIES: DeliveryLog[] = [
    { id: 'DEL-901', date: '2025-02-05', quantity: 12000, cost: 420000, vendor: 'NutraFeed Solutions', status: 'Delivered' },
    { id: 'DEL-854', date: '2025-01-20', quantity: 10000, cost: 350000, vendor: 'Cargill Agro', status: 'Delivered' },
    { id: 'DEL-721', date: '2025-01-05', quantity: 15000, cost: 525000, vendor: 'NutraFeed Solutions', status: 'Delivered' },
];

export function FeedStock({ flocks }: FeedStockProps) {
    // Silo State
    const [currentStock, setCurrentStock] = useState(8250); // kg
    const siloCapacity = 20000; // kg
    
    // Warning threshold state
    const [warnThreshold, setWarnThreshold] = useState(25); // percentage

    // Deliveries list
    const [deliveries, setDeliveries] = useState<DeliveryLog[]>(INITIAL_DELIVERIES);

    // Manual refill form states
    const [formQty, setFormQty] = useState<number | ''>('');
    const [formCost, setFormCost] = useState<number | ''>('');
    const [formVendor, setFormVendor] = useState('NutraFeed Solutions');
    const [formError, setFormError] = useState('');

    // Active flocks
    const activeFlocks = flocks.filter(f => f.status === 'Active');
    const totalBirds = activeFlocks.reduce((sum, f) => sum + f.birdCount, 0);

    // Calculate consumption dynamically based on flock age
    // Young chicks eat less, mature broilers eat more.
    // Base: 50g/day, increasing by 3.5g per day of age, capped at 160g/day.
    const calculateFlockDailyNeed = (flock: Flock) => {
        const perBirdGrams = 50 + Math.min(110, flock.age * 3.5); // g/bird/day
        return (flock.birdCount * perBirdGrams) / 1000; // kg/day
    };

    const dailyFeedNeed = activeFlocks.reduce((sum, f) => sum + calculateFlockDailyNeed(f), 0);
    const daysRemaining = dailyFeedNeed > 0 ? (currentStock / dailyFeedNeed) : 0;
    const fillPercentage = Math.round((currentStock / siloCapacity) * 100);

    // Determine alert level
    const isLow = fillPercentage < warnThreshold;
    const isCritical = fillPercentage < 10;

    // Form handlers
    const handleQtyChange = (valStr: string) => {
        if (valStr === '') {
            setFormQty('');
            setFormCost('');
            return;
        }
        const val = parseInt(valStr, 10);
        if (isNaN(val) || val < 0) return;
        setFormQty(val);
        // Auto-calculate cost (at ₹35 per kg)
        setFormCost(val * 35);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (formQty === '' || formQty <= 0) {
            setFormError('Please enter a valid quantity.');
            return;
        }

        const maxAllowed = siloCapacity - currentStock;
        if (formQty > maxAllowed) {
            setFormError(`Cannot exceed silo capacity. Max allowed refill is ${maxAllowed.toLocaleString()} kg.`);
            return;
        }

        if (formCost === '' || formCost <= 0) {
            setFormError('Please enter a valid cost.');
            return;
        }

        // Add to stock and logs
        setCurrentStock(prev => Math.min(siloCapacity, prev + formQty));
        
        const newDel: DeliveryLog = {
            id: `DEL-${Math.floor(100 + Math.random() * 900)}`,
            date: new Date().toISOString().split('T')[0],
            quantity: formQty,
            cost: Number(formCost),
            vendor: formVendor || 'Unknown Vendor',
            status: 'Delivered'
        };

        setDeliveries(prev => [newDel, ...prev]);

        // Clear form
        setFormQty('');
        setFormCost('');
        setFormVendor('NutraFeed Solutions');
    };

    const handleResetStock = () => {
        setCurrentStock(3200); // Trigger low stock for demo
    };

    return (
        <div className="space-y-6">
            
            {/* ALERT BANNER */}
            {isCritical ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm animate-pulse flex items-start gap-3">
                    <span className="text-xl">🚨</span>
                    <div>
                        <h4 className="font-bold text-red-800">Critical Low Feed Alert</h4>
                        <p className="text-sm text-red-700 mt-1">
                            Silo level has fallen below 10% ({fillPercentage}%). Refill immediately to prevent feeding disruptions. Remaining feed will last approximately <strong>{daysRemaining.toFixed(1)} days</strong>.
                        </p>
                    </div>
                </div>
            ) : isLow ? (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                        <h4 className="font-bold text-amber-800">Low Feed Warning</h4>
                        <p className="text-sm text-amber-700 mt-1">
                            Feed level ({fillPercentage}%) is below your custom alert threshold ({warnThreshold}%). Reorder suggestion is active. Remaining supply: <strong>{daysRemaining.toFixed(1)} days</strong>.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
                    <span className="text-xl">✓</span>
                    <div>
                        <h4 className="font-bold text-emerald-800">Feed Stock Healthy</h4>
                        <p className="text-sm text-emerald-700 mt-1">
                            Silo contains sufficient stock for the next <strong>{daysRemaining.toFixed(1)} days</strong> at current consumption levels.
                        </p>
                    </div>
                </div>
            )}

            {/* GRID OF DIAGNOSTICS & SILO */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* 1. VISUAL SILO DIAGRAM */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col items-center justify-between min-h-[420px]">
                    <div className="w-full">
                        <h3 className="text-base font-bold text-slate-800 mb-2 text-center">Silo Fill Level</h3>
                        <p className="text-xs text-slate-400 text-center uppercase tracking-wider mb-6">Physical Inventory Gauge</p>
                    </div>

                    {/* Silo Drawing container */}
                    <div className="relative w-44 h-64 flex flex-col justify-end border-x-4 border-t-4 border-slate-700 rounded-t-3xl bg-slate-50 overflow-hidden shadow-inner">
                        {/* Feed representation inside silo */}
                        <div 
                            className={`w-full rounded-t-sm transition-all duration-1000 ease-out flex items-center justify-center text-white font-bold text-lg select-none bg-gradient-to-t ${
                                isCritical 
                                    ? 'from-red-600 to-red-400' 
                                    : isLow 
                                        ? 'from-amber-500 to-amber-300' 
                                        : 'from-emerald-600 to-emerald-400'
                            }`}
                            style={{ height: `${fillPercentage}%` }}
                        >
                            {fillPercentage > 15 && <span className="drop-shadow-md font-sans">{fillPercentage}%</span>}
                        </div>

                        {/* Silo Top Hatch */}
                        <div className="absolute top-0 inset-x-0 h-4 bg-slate-700/10 border-b border-slate-300"></div>

                        {/* Low stock threshold line indicator */}
                        <div 
                            className="absolute inset-x-0 border-t border-dashed border-red-500/70 flex justify-end pr-2 text-[9px] font-bold text-red-500/80"
                            style={{ bottom: `${warnThreshold}%` }}
                        >
                            <span>Warn Threshold ({warnThreshold}%)</span>
                        </div>
                    </div>

                    {/* Silo Bottom Conical discharge pipe representation */}
                    <div className="w-0 h-0 border-l-[88px] border-l-transparent border-r-[88px] border-r-transparent border-t-[32px] border-t-slate-700"></div>
                    
                    <div className="mt-4 text-center font-sans">
                        <span className="block text-2xl font-bold text-slate-900">{currentStock.toLocaleString()} kg</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Remaining Weight</span>
                    </div>
                </div>

                {/* 2. OPERATIONAL DIAGNOSTICS */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col justify-between min-h-[420px]">
                    <div>
                        <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span>📊</span> Operational Calculations
                        </h3>

                        <div className="space-y-4 font-sans">
                            {/* Combined Birds count */}
                            <div className="flex justify-between border-b border-slate-100 pb-2.5">
                                <span className="text-sm text-slate-500">Active Birds Counted</span>
                                <strong className="text-slate-800">{totalBirds.toLocaleString()}</strong>
                            </div>

                            {/* Base consumption rate */}
                            <div className="flex justify-between border-b border-slate-100 pb-2.5">
                                <span className="text-sm text-slate-500">Active Flocks</span>
                                <strong className="text-slate-800">{activeFlocks.length} flocks</strong>
                            </div>

                            {/* Total daily consumption */}
                            <div className="flex justify-between border-b border-slate-100 pb-2.5">
                                <span className="text-sm text-slate-500">Estimated Daily Demand</span>
                                <strong className="text-amber-600 font-semibold">{Math.round(dailyFeedNeed).toLocaleString()} kg / day</strong>
                            </div>

                            {/* Exhaustion Forecast */}
                            <div className="flex justify-between border-b border-slate-100 pb-2.5">
                                <span className="text-sm text-slate-500">Exhaustion Forecast</span>
                                <strong className="text-slate-800">
                                    {totalBirds > 0 
                                        ? new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { 
                                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
                                          })
                                        : 'N/A'
                                    }
                                </strong>
                            </div>

                            {/* Expiry alerts */}
                            <div className="flex justify-between border-b border-slate-100 pb-2.5">
                                <span className="text-sm text-slate-500">Silo Status</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                    isCritical 
                                        ? 'bg-red-100 text-red-800' 
                                        : isLow 
                                            ? 'bg-amber-100 text-amber-800' 
                                            : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                    {isCritical ? 'Critical Low' : isLow ? 'Reorder Alert' : 'Normal'}
                                </span>
                            </div>
                        </div>

                        {/* Adjust Warning threshold */}
                        <div className="mt-8 pt-4 border-t border-slate-100 space-y-2">
                            <div className="flex justify-between text-xs font-medium text-slate-500">
                                <span>Adjust Custom Warning Threshold</span>
                                <span className="text-slate-800 font-bold">{warnThreshold}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="10" 
                                max="40" 
                                value={warnThreshold} 
                                onChange={e => setWarnThreshold(Number(e.target.value))}
                                className="w-full accent-emerald-600 cursor-pointer"
                            />
                            <p className="text-[10px] text-slate-400">Triggers visual alerts when capacity drops below this setting.</p>
                        </div>
                    </div>

                    <div className="mt-6 text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        💡 <strong>Age-weighted demand:</strong> Broilers consume around 50g of feed daily in their first week, scaling to 160g at full maturity.
                    </div>
                </div>

                {/* 3. MANUAL REFILL CONTROLS */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col justify-between min-h-[420px]">
                    <div>
                        <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span>🌾</span> Record Feed Delivery
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Manually enter new feed delivery details to update silo stock levels.
                        </p>

                        <form onSubmit={handleManualSubmit} className="space-y-3 font-sans">
                            {/* Quantity */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Quantity (kg)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        min="1"
                                        placeholder="e.g. 5000"
                                        value={formQty}
                                        onChange={e => handleQtyChange(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-sans"
                                        required
                                    />
                                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-sans">kg</span>
                                </div>
                            </div>

                            {/* Cost */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Total Cost (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-500 font-sans">₹</span>
                                    <input 
                                        type="number" 
                                        min="0"
                                        placeholder="Auto-calculates @ ₹35/kg"
                                        value={formCost}
                                        onChange={e => setFormCost(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="w-full border border-slate-300 rounded-lg pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-sans"
                                        required
                                    />
                                </div>
                                <span className="text-[10px] text-slate-400">Assumes standard feed cost of ₹35/kg. Editable.</span>
                            </div>

                            {/* Vendor */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Vendor Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Vendor"
                                    value={formVendor}
                                    onChange={e => setFormVendor(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-sans"
                                />
                            </div>

                            {formError && (
                                <p className="text-xs text-red-500 font-semibold">{formError}</p>
                            )}

                            <button 
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 text-sm font-semibold transition-colors mt-2"
                            >
                                Record Manual Delivery
                            </button>
                        </form>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-2">
                        <button 
                            onClick={handleResetStock}
                            className="w-full px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                            ⚠️ Simulate Low Stock Alert (3,200 kg)
                        </button>
                    </div>
                </div>

            </div>

            {/* DELIVERIES LOG TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="text-sm font-bold text-slate-800">Silo Feed Delivery History</h3>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-semibold">{deliveries.length} Records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-100/55 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">Delivery ID</th>
                                <th className="px-6 py-3">Refill Date</th>
                                <th className="px-6 py-3">Quantity</th>
                                <th className="px-6 py-3">Cost (Est)</th>
                                <th className="px-6 py-3">Feed Vendor</th>
                                <th className="px-6 py-3">Delivery Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-sans">
                            {deliveries.map(del => (
                                <tr key={del.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-500 text-xs font-bold">#{del.id}</td>
                                    <td className="px-6 py-4 text-slate-700">{del.date}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-900">{del.quantity.toLocaleString()} kg</td>
                                    <td className="px-6 py-4 text-emerald-600 font-semibold">₹{del.cost.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-slate-600">{del.vendor}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            del.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {del.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
