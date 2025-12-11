import type { UserRole, ViewState } from '../types';

interface SidebarProps {
    currentUser: { name: string; role: UserRole } | null;
    currentView: ViewState;
    onNavigate: (view: ViewState) => void;
    onLogout: () => void;
}

export function Sidebar({ currentUser, currentView, onNavigate, onLogout }: SidebarProps) {
    const getNavItems = () => {
        const role = currentUser?.role;
        const common = [
            { view: 'settings', label: 'Settings', icon: '⚙️' }
        ];

        if (role === 'farmer') {
            return [
                { view: 'dashboard', label: 'Dashboard', icon: '📊' },
                { view: 'upload', label: 'Upload Image', icon: '📷' },
                { view: 'flock', label: 'Flock Mgmt', icon: '🐔' },
                { view: 'results', label: 'AI Insights', icon: '🧠' },
                ...common
            ];
        }
        if (role === 'dealer') {
            return [
                { view: 'dealer', label: 'Dealer Portal', icon: '💼' },
                { view: 'flock', label: 'Farms List', icon: '📋' },
                ...common
            ];
        }
        if (role === 'vet') {
            return [
                { view: 'vet', label: 'Vet Dashboard', icon: '🩺' },
                { view: 'results', label: 'Health Reports', icon: '📈' },
                ...common
            ];
        }
        if (role === 'admin') {
            return [
                { view: 'admin', label: 'Admin Console', icon: '🛡️' },
                { view: 'dashboard', label: 'View as User', icon: '👁️' },
                ...common
            ];
        }
        return [];
    };

    const navItems = getNavItems();

    return (
        <aside className="hidden md:flex md:flex-col w-64 bg-slate-900 text-white flex-shrink-0 transition-all duration-300 h-full">
            <div className="p-4 flex items-center gap-3 border-b border-slate-700">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-white">AI</span>
                </div>
                <span className="font-bold text-lg tracking-wide">Poultry AI</span>
            </div>

            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <button
                        key={item.view}
                        onClick={() => onNavigate(item.view as ViewState)}
                        className={`group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${currentView === item.view ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}>
                        <span className="mr-3 text-lg">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-xs">
                        {currentUser?.name?.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-medium">{currentUser?.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{currentUser?.role}</p>
                    </div>
                </div>
                <button onClick={onLogout} className="w-full flex items-center justify-center px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 rounded hover:bg-slate-700">
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
