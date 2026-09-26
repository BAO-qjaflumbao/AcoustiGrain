import React, { useState } from 'react';
import { 
  firebaseLoginUser, 
  firebaseRegisterUser,
  firebaseGoogleLogin
} from '../services/firebaseService';
import { 
  Lock, 
  User, 
  ArrowRight, 
  Building2,
  ShieldCheck,
  Eye,
  UserPlus,
  LogIn,
  Loader2
} from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  
  // Login Form States (Starting 100% empty)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginWarehouse, setLoginWarehouse] = useState('NFA Warehouse #4 - Quezon City Hub');
  const [loginRole, setLoginRole] = useState('NFA Inspector (Admin)');

  // Registration Form States (Starting 100% empty)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regWarehouse, setRegWarehouse] = useState('NFA Warehouse #4 - Quezon City Hub');
  const [regRole, setRegRole] = useState('NFA Inspector (Admin)');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Login Submit via Firebase Auth
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter your email and password to log in.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    const result = await firebaseLoginUser(
      loginEmail.trim(), 
      loginPassword.trim(), 
      loginRole, 
      loginWarehouse
    );

    setIsSubmitting(false);

    if (result.success) {
      onLogin(result.user);
    } else {
      setError(result.error);
    }
  };

  // Handle Registration Submit via Firebase Auth
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Please fill in all required registration fields.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const result = await firebaseRegisterUser(
      regEmail.trim(),
      regPassword.trim(),
      regName.trim(),
      regRole,
      regWarehouse
    );

    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg('Account registered successfully! Signing in...');
      setTimeout(() => {
        onLogin(result.user);
      }, 1000);
    } else {
      setError(result.error);
    }
  };

  // Handle Google / Gmail Sign-In
  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleSubmitting(true);

    const activeRole = authMode === 'login' ? loginRole : regRole;
    const activeWarehouse = authMode === 'login' ? loginWarehouse : regWarehouse;

    const result = await firebaseGoogleLogin(activeRole, activeWarehouse);
    setIsGoogleSubmitting(false);

    if (result.success) {
      onLogin(result.user);
    } else {
      setError(result.error);
    }
  };

  const handleDemoLogin = (selectedRole) => {
    const demoEmail = selectedRole.includes('Admin') ? 'nfa_admin@gov.ph' : 'operator@nfa.gov.ph';
    onLogin({ 
      email: demoEmail, 
      warehouse: loginWarehouse, 
      role: selectedRole,
      name: selectedRole.includes('Admin') ? 'NFA Lead Inspector' : 'Warehouse Operator'
    });
  };

  return (
    <div className="min-h-screen bg-husk text-ink-900 flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-grain-500 selection:text-white">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-paper border border-ink-100 rounded-2xl shadow-card overflow-hidden">
        
        {/* Left Side: AuthBrandPanel from BAO-qjaflumbao/AcoustiGrain */}
        <div className="relative hidden overflow-hidden border-r border-ink-100 bg-husk lg:flex lg:flex-col lg:justify-between p-10">
          <div className="absolute inset-0 bg-weave pointer-events-none" aria-hidden="true" />

          {/* Logo Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-grain-500 font-display text-sm font-bold text-white shadow-sm">
                AG
              </span>
              <div>
                <span className="font-display text-lg font-bold tracking-tight text-ink-900 block">
                  AcoustiGrain
                </span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-ink-400 block">
                  Bio-Acoustic Infestation System
                </span>
              </div>
            </div>
          </div>

          {/* Signature Acoustic Waveform & Wedge Illustration */}
          <div className="relative z-10 flex flex-1 items-center justify-center py-6">
            <svg viewBox="0 0 420 280" className="w-full max-w-sm" role="img" aria-label="Acoustic waveform resolving into an infestation status reading">
              {/* Rice Sacks Stack */}
              <rect x="30" y="120" width="110" height="90" rx="6" fill="#F3E9CE" stroke="#D6B876" strokeWidth="1.5" />
              <rect x="30" y="100" width="110" height="18" rx="4" fill="#E6D3A1" stroke="#D6B876" strokeWidth="1.5" />
              <rect x="150" y="120" width="110" height="90" rx="6" fill="#F3E9CE" stroke="#D6B876" strokeWidth="1.5" />
              <rect x="150" y="100" width="110" height="18" rx="4" fill="#E6D3A1" stroke="#D6B876" strokeWidth="1.5" />

              {/* Tapered Wedge inserted between sacks */}
              <polygon points="140,95 168,150 140,205" fill="#AC7F35" stroke="#6B4C1F" strokeWidth="1.5" />
              <circle cx="146" cy="150" r="3" fill="#FBF7ED" />

              {/* 3-5 kHz Acoustic Waveform rising from wedge tip */}
              <path
                d="M168 150 C 190 150, 190 110, 210 110 C 230 110, 230 190, 250 190 C 270 190, 270 130, 290 130 C 305 130, 305 150, 320 150"
                fill="none"
                stroke="#AC7F35"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Resolves into status dot */}
              <circle cx="360" cy="150" r="10" fill="#1E8E5A" className="pulse-dot" />
              <circle cx="360" cy="150" r="18" fill="none" stroke="#1E8E5A" strokeWidth="1" opacity="0.4" />

              <line x1="320" y1="150" x2="342" y2="150" stroke="#736A5E" strokeWidth="1.5" strokeDasharray="3 4" />
            </svg>
          </div>

          {/* Quote Footer */}
          <div className="relative z-10 border-t border-ink-100/70 pt-6">
            <p className="font-display text-xl font-semibold leading-snug text-ink-800">
              Hear the infestation<br />before you see it.
            </p>
            <p className="mt-2 text-xs text-ink-400 leading-relaxed">
              A single non-invasive wedge listens between your 50kg rice sacks and isolates the 3–5 kHz feeding signature of <em>Sitophilus oryzae</em> from warehouse noise — in real time.
            </p>
          </div>
        </div>

        {/* Right Side: Log In / Register Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center space-y-5 bg-paper">
          
          {/* Mode Switcher Tabs */}
          <div className="flex bg-husk p-1 rounded-lg border border-ink-100 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-md flex items-center justify-center space-x-1.5 transition ${
                authMode === 'login' 
                  ? 'bg-paper text-grain-700 shadow-card font-bold' 
                  : 'text-ink-400 hover:text-ink-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-md flex items-center justify-center space-x-1.5 transition ${
                authMode === 'register' 
                  ? 'bg-paper text-grain-700 shadow-card font-bold' 
                  : 'text-ink-400 hover:text-ink-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold text-ink-900">
              {authMode === 'login' ? 'Storage Monitor Access' : 'Register Operator Account'}
            </h3>
            <p className="text-xs text-ink-400 mt-0.5">
              {authMode === 'login' 
                ? 'Sign in via Google / Gmail or Email Password.' 
                : 'Create an Inspector or Operator account in Firebase.'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-critical/10 border border-critical/30 text-critical rounded-lg text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-safe/10 border border-safe/30 text-safe rounded-lg text-xs font-medium">
              {successMsg}
            </div>
          )}

          {/* Google / Gmail Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting}
            className="w-full py-2.5 px-4 bg-paper hover:bg-husk border border-ink-100 text-ink-800 font-medium rounded-lg text-xs flex items-center justify-center space-x-2.5 transition shadow-card cursor-pointer disabled:opacity-50"
          >
            {isGoogleSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-grain-500" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google / Gmail</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2 text-[11px] text-ink-400 my-1">
            <span className="h-px bg-ink-100 flex-1" />
            <span className="font-mono uppercase tracking-wider">or email access</span>
            <span className="h-px bg-ink-100 flex-1" />
          </div>

          {/* TAB 1: LOG IN FORM */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs" autoComplete="off">
              {/* Storage Facility Select */}
              <div>
                <label className="block text-ink-600 font-medium mb-1">NFA Storage Facility:</label>
                <select
                  value={loginWarehouse}
                  onChange={(e) => setLoginWarehouse(e.target.value)}
                  className="w-full bg-husk border border-ink-100 rounded-lg px-3 py-2 text-ink-800 focus:border-grain-500 outline-none transition"
                >
                  <option value="NFA Warehouse #4 - Quezon City Hub">NFA Warehouse #4 - Quezon City Hub</option>
                  <option value="NFA Grain Silo Alpha - Bulacan Hub">NFA Grain Silo Alpha - Bulacan Hub</option>
                </select>
              </div>

              {/* Email Input (Starts Blank) */}
              <div>
                <label className="block text-ink-600 font-medium mb-1">Email Address:</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter email address"
                  autoComplete="off"
                  className="w-full bg-husk border border-ink-100 rounded-lg px-3 py-2 text-ink-800 focus:border-grain-500 outline-none transition"
                />
              </div>

              {/* Password Input (Starts Blank) */}
              <div>
                <label className="block text-ink-600 font-medium mb-1">Password:</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="new-password"
                  className="w-full bg-husk border border-ink-100 rounded-lg px-3 py-2 text-ink-800 focus:border-grain-500 outline-none transition"
                />
              </div>

              {/* Access Role Selector */}
              <div>
                <label className="block text-ink-600 font-medium mb-1">Access Role:</label>
                <select
                  value={loginRole}
                  onChange={(e) => setLoginRole(e.target.value)}
                  className="w-full bg-husk border border-ink-100 rounded-lg px-3 py-2 text-ink-800 focus:border-grain-500 outline-none transition"
                >
                  <option value="NFA Inspector (Admin)">NFA Inspector (Full System Admin)</option>
                  <option value="Warehouse Operator">Warehouse Operator (Read-Only Mode)</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-grain-500 hover:bg-grain-600 text-white font-semibold rounded-lg shadow-card flex items-center justify-center space-x-2 transition cursor-pointer mt-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Overview</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* TAB 2: REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-2.5 text-xs" autoComplete="off">
              {/* Full Name */}
              <div>
                <label className="block text-ink-600 font-medium mb-1">Full Name / Officer Title:</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Inspector Maria Santos"
                  className="w-full bg-husk border border-ink-100 rounded-lg px-3 py-1.5 text-ink-800 focus:border-grain-500 outline-none transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-ink-600 font-medium mb-1">Email Address:</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-husk border border-ink-100 rounded-lg px-3 py-1.5 text-ink-800 focus:border-grain-500 outline-none transition"
                />
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-ink-600 font-medium mb-1">Password:</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    autoComplete="new-password"
                    className="w-full bg-husk border border-ink-100 rounded-lg px-3 py-1.5 text-ink-800 focus:border-grain-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-ink-600 font-medium mb-1">Confirm Password:</label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    className="w-full bg-husk border border-ink-100 rounded-lg px-3 py-1.5 text-ink-800 focus:border-grain-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Access Role */}
              <div>
                <label className="block text-ink-600 font-medium mb-1">Access Role:</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full bg-husk border border-ink-100 rounded-lg px-3 py-1.5 text-ink-800 focus:border-grain-500 outline-none transition"
                >
                  <option value="NFA Inspector (Admin)">NFA Inspector (Full System Admin)</option>
                  <option value="Warehouse Operator">Warehouse Operator (Read-Only Mode)</option>
                </select>
              </div>

              {/* Facility Select */}
              <div>
                <label className="block text-ink-600 font-medium mb-1">Assigned NFA Facility:</label>
                <select
                  value={regWarehouse}
                  onChange={(e) => setRegWarehouse(e.target.value)}
                  className="w-full bg-husk border border-ink-100 rounded-lg px-3 py-1.5 text-ink-800 focus:border-grain-500 outline-none transition"
                >
                  <option value="NFA Warehouse #4 - Quezon City Hub">NFA Warehouse #4 - Quezon City Hub</option>
                  <option value="NFA Grain Silo Alpha - Bulacan Hub">NFA Grain Silo Alpha - Bulacan Hub</option>
                </select>
              </div>

              {/* Submit Register Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-grain-500 hover:bg-grain-600 text-white font-semibold rounded-lg shadow-card flex items-center justify-center space-x-2 transition cursor-pointer mt-1 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Firebase Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Options */}
          <div className="pt-2 border-t border-ink-100 space-y-1 text-center text-xs">
            <span className="text-ink-400 font-medium block text-[11px]">Quick Demo Access:</span>
            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('NFA Inspector (Admin)')}
                className="px-2.5 py-1 bg-grain-50 hover:bg-grain-100 text-grain-700 border border-grain-200 rounded-md font-semibold text-[11px] transition flex items-center space-x-1"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Admin Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('Warehouse Operator')}
                className="px-2.5 py-1 bg-husk hover:bg-ink-50 text-ink-600 border border-ink-100 rounded-md font-semibold text-[11px] transition flex items-center space-x-1"
              >
                <Eye className="w-3 h-3" />
                <span>Operator Demo</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
