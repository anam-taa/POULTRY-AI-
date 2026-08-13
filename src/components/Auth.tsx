import { useState } from 'react';
import type { UserRole } from '../types';

interface AuthProps {
    onLoginSuccess: (user: { name: string; role: UserRole }) => void;
}

export function Auth({ onLoginSuccess }: AuthProps) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ role: 'farmer', name: '', email: '', farmName: '', password: '' });

    const quickLogin = async (role: string) => {
        try {
            // Attempt to login with default credentials (username=role, password=role)
            const formData = new FormData();
            formData.append('username', role);
            formData.append('password', role); // Assumes we seeded users with same password

            const response = await fetch('http://localhost:8000/token', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.access_token);
                onLoginSuccess({ name: `${role.charAt(0).toUpperCase() + role.slice(1)} (Demo)`, role: data.role });
            } else {
                // Determine if we should register the demo user (first run)
                // Actually, backend now seeds 'farmer', so this should just work for farmer.
                alert(`Quick Login failed for ${role}. Please register manually.`);
            }
        } catch (error) {
            console.error("Quick login error", error);
        }
    };

    const onLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('username', loginForm.email);
            formData.append('password', loginForm.password);

            const response = await fetch('http://localhost:8000/token', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                // data = { access_token, token_type, role }
                localStorage.setItem('token', data.access_token);
                onLoginSuccess({ name: loginForm.email, role: data.role });
            } else {
                alert("Login failed! Check credentials.");
            }
        } catch (error) {
            console.error(error);
            alert("Connection error");
        }
    };

    const onRegisterSubmit = async () => {
        try {
            const response = await fetch('http://localhost:8000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: registerForm.email || registerForm.name.replace(/\s/g, '').toLowerCase(), // Hacky default username
                    password: registerForm.password
                    // In real app, pass role/farmName too
                })
            });
            if (response.ok) {
                alert("Registration successful! Please login.");
                setMode('login');
            } else {
                const err = await response.json();
                alert("Error: " + err.detail);
            }
        } catch (e) {
            alert("Connection error");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-emerald-900 p-4">

            {/* Login */}
            {mode === 'login' && (
                <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 animate-fade-in">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Poultry AI</h1>
                        <p className="text-slate-500">Smart Farming Intelligence</p>
                    </div>

                    <form onSubmit={onLoginSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email / Mobile</label>
                            <input
                                type="text"
                                value={loginForm.email}
                                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 border p-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="farmer@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            <input
                                type="password"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 border p-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="••••••••"
                            />
                        </div>
                        <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                            Sign In
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <a href="#" onClick={(e) => { e.preventDefault(); setMode('register'); }} className="font-medium text-emerald-600 hover:text-emerald-500">Create new account</a>
                        <div className="mt-4 flex justify-center gap-2">
                            <span className="text-xs text-slate-400">Quick Login:</span>
                            <button onClick={() => quickLogin('farmer')} className="text-xs bg-slate-200 px-2 py-1 rounded">Farmer</button>
                            <button onClick={() => quickLogin('dealer')} className="text-xs bg-slate-200 px-2 py-1 rounded">Dealer</button>
                            <button onClick={() => quickLogin('vet')} className="text-xs bg-slate-200 px-2 py-1 rounded">Vet</button>
                            <button onClick={() => quickLogin('admin')} className="text-xs bg-slate-200 px-2 py-1 rounded">Admin</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Register */}
            {mode === 'register' && (
                <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 animate-fade-in">
                    <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['farmer', 'dealer', 'vet'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRegisterForm({ ...registerForm, role: r })}
                                    className={`py-2 rounded-md text-sm font-medium capitalize transition-colors ${registerForm.role === r ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Username / Email"
                                value={registerForm.email || ''}
                                onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                                className="block w-full rounded-md border-slate-300 bg-slate-50 border p-2"
                            />
                            <input type="text" placeholder="Full Name" className="block w-full rounded-md border-slate-300 bg-slate-50 border p-2" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={registerForm.password}
                                onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                                className="block w-full rounded-md border-slate-300 bg-slate-50 border p-2"
                            />
                        </div>
                        <button onClick={onRegisterSubmit} className="mt-6 w-full py-2 bg-emerald-600 text-white rounded-md">Create Account</button>
                        <button onClick={() => setMode('login')} className="mt-2 w-full py-2 text-slate-500 text-sm">Back to Login</button>
                    </div>
                </div>
            )}
        </div>
    );
}
