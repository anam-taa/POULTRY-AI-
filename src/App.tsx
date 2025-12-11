import { useState } from 'react';
import type { UserRole, ViewState } from './types';
import { Sidebar } from './components/Sidebar';
import { Auth } from './components/Auth';
import { Dashboard } from './features/Dashboard';
import { Upload } from './features/Upload';
import { Results } from './features/Results';
import { FlockMgmt } from './features/Flock';
import { Dealer } from './features/Dealer';
import { Vet } from './features/Vet';
import { Admin } from './features/Admin'; // I will fix the class typo here if I modify the file again, but imports are fine.

function App() {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: UserRole } | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [uploadedImage, setUploadedImage] = useState<string | ArrayBuffer | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const onLogin = (user: { name: string; role: UserRole }) => {
    setCurrentUser(user);
    const role = user.role;
    if (role === 'farmer') setCurrentView('dashboard');
    else if (role === 'dealer') setCurrentView('dealer');
    else if (role === 'vet') setCurrentView('vet');
    else if (role === 'admin') setCurrentView('admin');
  };

  const onLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    setUploadedImage(null);
  };

  const onNavigate = (view: ViewState) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const onAnalysisComplete = (image: string | ArrayBuffer) => {
    setUploadedImage(image);
    setCurrentView('results');
  };

  const getViewTitle = () => {
    const v = currentView;
    if (v === 'dashboard') return 'Farm Overview';
    if (v === 'upload') return 'Image Analysis';
    if (v === 'results') return 'AI Analysis Results';
    if (v === 'flock') return 'Flock Management';
    if (v === 'dealer') return 'Dealer Dashboard';
    if (v === 'vet') return 'Veterinarian Portal';
    if (v === 'admin') return 'System Administration';
    return 'Poultry AI';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* 1. AUTHENTICATION SCREENS */}
      {!currentUser && <Auth onLoginSuccess={onLogin} />}

      {/* 2. MAIN APPLICATION */}
      {currentUser && (
        <div className="flex h-screen overflow-hidden">

          {/* SIDEBAR */}
          <Sidebar
            currentUser={currentUser}
            currentView={currentView}
            onNavigate={onNavigate}
            onLogout={onLogout}
          />

          {/* MAIN CONTENT */}
          <main className="flex-1 flex flex-col min-w-0 bg-slate-100 overflow-hidden">

            {/* MOBILE HEADER */}
            <div className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4">
              <span className="font-bold">Poultry AI</span>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300">☰</button>
            </div>

            {/* CONTENT SCROLL AREA */}
            <div className="flex-1 overflow-auto p-4 md:p-8">

              {/* HEADER SECTION */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 capitalize">{getViewTitle()}</h1>
                  <p className="text-sm text-slate-500">Real-time production data and AI analysis.</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-white rounded-full shadow hover:bg-slate-50 text-slate-600 relative">
                    🔔
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                  </button>
                  <button className="p-2 bg-white rounded-full shadow hover:bg-slate-50 text-slate-600">⚙️</button>
                </div>
              </div>

              {/* VIEW SWITCHER */}
              {currentView === 'dashboard' && <Dashboard onViewResults={() => onNavigate('results')} />}
              {currentView === 'upload' && <Upload onAnalysisComplete={onAnalysisComplete} />}
              {currentView === 'results' && <Results image={uploadedImage} onNewUpload={() => onNavigate('upload')} />}
              {currentView === 'flock' && <FlockMgmt />}
              {currentView === 'dealer' && <Dealer />}
              {currentView === 'vet' && <Vet />}
              {currentView === 'admin' && <Admin />}

            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
