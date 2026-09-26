import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
auth,
googleProvider,
signInWithRedirect,
signInWithEmailAndPassword,
createUserWithEmailAndPassword,
sendPasswordResetEmail,
getFriendlyAuthErrorMessage
} from '../lib/firebase';
import { GoogleLogin3DModal } from './GoogleLogin3DModal';
import {
Mail,
Lock,
Eye,
EyeOff,
AlertCircle,
RefreshCw,
Send,
User,
ArrowLeft,
Zap,
UserCheck,
ShieldCheck,
Sparkles
} from 'lucide-react';
interface AuthGateProps {
onUpdateProfile: (updated: UserProfile) => void;
}
type GateTab = 'signin' | 'signup' | 'forgot';
export const AuthGate: React.FC<AuthGateProps> = ({ onUpdateProfile }) => {
const [activeTab, setActiveTab] = useState<GateTab>('signin');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [fullName, setFullName] = useState('');
const [resetEmail, setResetEmail] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [errorMsg, setErrorMsg] = useState<string | null>(null);
const [successMsg, setSuccessMsg] = useState<string | null>(null);
const [show3DGoogleModal, setShow3DGoogleModal] = useState(false);
const clearAlerts = () => {
setErrorMsg(null);
setSuccessMsg(null);
};
const validateEmail = (val: string): boolean => /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(val.trim());
const handleGoogleSignIn = async () => {
clearAlerts();
setLoading(true);
try {
await signInWithRedirect(auth, googleProvider);
// Page navigates away here; App.tsx's onAuthStateChanged picks up the result on return.
} catch (err: any) {
console.error('Google Auth Error:', err);
setErrorMsg(getFriendlyAuthErrorMessage(err.code, err.message));
setLoading(false);
}
};
const handleEmailSignIn = async (e: React.FormEvent) => {
e.preventDefault();
clearAlerts();
if (!validateEmail(email)) {
setErrorMsg('Please enter a valid email address.');
return;
}
if (!password || password.length < 6) {
setErrorMsg('Password must be at least 6 characters long.');
return;
}
setLoading(true);
try {
const result = await signInWithEmailAndPassword(auth, email.trim(), password);
const user = result.user;
const updatedProfile: UserProfile = {
id: user.uid,
name: user.displayName || email.split('@')[0],
email: user.email || email,
avatar: user.photoURL || https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid},
provider: 'email',
isLoggedIn: true,
emailVerified: user.emailVerified,
joinedAt: user.metadata.creationTime || new Date().toISOString()
};
onUpdateProfile(updatedProfile);
} catch (err: any) {
console.error('Email Sign In Error:', err);
setErrorMsg(getFriendlyAuthErrorMessage(err.code));
} finally {
setLoading(false);
}
};
const handleEmailSignUp = async (e: React.FormEvent) => {
e.preventDefault();
clearAlerts();
if (!fullName.trim()) {
setErrorMsg('Please enter your full name.');
return;
}
if (!validateEmail(email)) {
setErrorMsg('Please enter a valid email address.');
return;
}
if (!password || password.length < 6) {
setErrorMsg('Password must be at least 6 characters long.');
return;
}
if (password !== confirmPassword) {
setErrorMsg('Passwords do not match. Please re-enter.');
return;
}
setLoading(true);
try {
const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
const user = result.user;
const defaultAvatar = https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid};
const updatedProfile: UserProfile = {
id: user.uid,
name: fullName.trim(),
email: user.email || email,
avatar: defaultAvatar,
provider: 'email',
isLoggedIn: true,
emailVerified: user.emailVerified,
joinedAt: new Date().toISOString()
};
onUpdateProfile(updatedProfile);
} catch (err: any) {
console.error('Email Sign Up Error:', err);
setErrorMsg(getFriendlyAuthErrorMessage(err.code));
} finally {
setLoading(false);
}
};
const handlePasswordReset = async (e: React.FormEvent) => {
e.preventDefault();
clearAlerts();
if (!validateEmail(resetEmail)) {
setErrorMsg('Please enter a valid email address.');
return;
}
setLoading(true);
try {
await sendPasswordResetEmail(auth, resetEmail.trim());
setSuccessMsg(Password reset link sent to ${resetEmail.trim()}! Please check your inbox.);
setResetEmail('');
} catch (err: any) {
console.error('Password Reset Error:', err);
setErrorMsg(getFriendlyAuthErrorMessage(err.code));
} finally {
setLoading(false);
}
};
return (
<div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950 p-4 overflow-y-auto">
{/* Ambient glow background */}
<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[32rem] h-[32rem] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
<div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
<div className="relative w-full max-w-md my-8">
{/* Brand Header */}
<div className="text-center mb-6 space-y-2">
<div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-600/30">
<Sparkles className="w-8 h-8 text-white" />
</div>
<h1 className="text-2xl font-black text-white">Alpha AI</h1>
<p className="text-xs text-slate-400">Sign in to continue to your workspace</p>
</div>
{/* Card */}
<div className="bg-slate-900 border border-slate-800 rounded-3xl w-full overflow-hidden shadow-2xl relative">
<div className="p-6 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border-b border-slate-800 flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
<ShieldCheck className="w-5 h-5" />
</div>
<div>
<h3 className="font-bold text-sm text-white">
{activeTab === 'forgot' ? 'Reset Your Password' : 'Welcome to Alpha AI'}
</h3>
<p className="text-[11px] text-slate-400">Secure Firebase authentication</p>
</div>
</div>
{errorMsg && (
<div className="mx-6 mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
<AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
<span className="leading-relaxed">{errorMsg}</span>
</div>
)}
{successMsg && (
<div className="mx-6 mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in">
<UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
<span className="leading-relaxed">{successMsg}</span>
</div>
)}
<div className="p-6 space-y-4">
{activeTab !== 'forgot' && (
<div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
<button
type="button"
onClick={() => { setActiveTab('signin'); clearAlerts(); }}
className={flex-1 py-2 rounded-lg text-xs font-semibold transition ${ activeTab === 'signin' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white' }}
>
Sign In
</button>
<button
type="button"
onClick={() => { setActiveTab('signup'); clearAlerts(); }}
className={flex-1 py-2 rounded-lg text-xs font-semibold transition ${ activeTab === 'signup' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white' }}
>
Create Account
</button>
</div>
)}
{activeTab !== 'forgot' && (
<button
type="button"
onClick={() => setShow3DGoogleModal(true)}
disabled={loading}
className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-2.5 px-4 rounded-xl text-xs transition shadow-md hover:shadow-lg disabled:opacity-50"
>
<svg className="w-4 h-4" viewBox="0 0 24 24">
<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
</svg>
{loading ? 'Connecting Google...' : 'Continue with Google'}
</button>
)}
{activeTab !== 'forgot' && (
<div className="relative flex items-center justify-center my-1">
<div className="border-t border-slate-800 w-full" />
<span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
Or Email Credentials
</span>
</div>
)}
{activeTab === 'signin' && (
<form onSubmit={handleEmailSignIn} className="space-y-3.5">
<div>
<label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
<div className="relative">
<Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
<input
type="email"
required
value={email}
onChange={(e) => setEmail(e.target.value)}
placeholder="you@example.com"
className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
/>
</div>
</div>
<div>
<div className="flex items-center justify-between mb-1">
<label className="block text-xs font-semibold text-slate-300">Password</label>
<button
type="button"
onClick={() => { setActiveTab('forgot'); clearAlerts(); }}
className="text-[11px] text-indigo-400 hover:underline font-medium"
>
Forgot password?
</button>
</div>
<div className="relative">
<Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
<input
type={showPassword ? 'text' : 'password'}
required
value={password}
onChange={(e) => setPassword(e.target.value)}
placeholder="••••••••"
className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
/>
<button
type="button"
onClick={() => setShowPassword(!showPassword)}
className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
>
{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
</button>
</div>
</div>
<button
type="submit"
disabled={loading}
className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
>
{loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
Sign In
</button>
</form>
)}
{activeTab === 'signup' && (
<form onSubmit={handleEmailSignUp} className="space-y-3.5">
<div>
<label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
<div className="relative">
<User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
<input
type="text"
required
value={fullName}
onChange={(e) => setFullName(e.target.value)}
placeholder="Your Name"
className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
/>
</div>
</div>
<div>
<label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
<div className="relative">
<Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
<input
type="email"
required
value={email}
onChange={(e) => setEmail(e.target.value)}
placeholder="you@example.com"
className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
/>
</div>
</div>
<div className="grid grid-cols-2 gap-3">
<div>
<label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
<input
type={showPassword ? 'text' : 'password'}
required
value={password}
onChange={(e) => setPassword(e.target.value)}
placeholder="Min 6 chars"
className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
/>
</div>
<div>
<label className="block text-xs font-semibold text-slate-300 mb-1">Confirm</label>
<input
type={showPassword ? 'text' : 'password'}
required
value={confirmPassword}
onChange={(e) => setConfirmPassword(e.target.value)}
placeholder="Repeat password"
className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
/>
</div>
</div>
<button
type="submit"
disabled={loading}
className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
>
{loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
Create Account
</button>
</form>
)}
{activeTab === 'forgot' && (
<div className="space-y-4">
<button
type="button"
onClick={() => { setActiveTab('signin'); clearAlerts(); }}
className="text-slate-400 hover:text-white flex items-center gap-1 text-xs font-semibold"
>
<ArrowLeft className="w-4 h-4" /> Back to Sign In
</button>
<p className="text-xs text-slate-400">
Enter your account email. We'll send you a secure link to reset your password.
</p>
<form onSubmit={handlePasswordReset} className="space-y-3.5">
<div className="relative">
<Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
<input
type="email"
required
value={resetEmail}
onChange={(e) => setResetEmail(e.target.value)}
placeholder="you@example.com"
className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
/>
</div>
<button
type="submit"
disabled={loading}
className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
>
{loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
Send Reset Email
</button>
</form>
</div>
)}
</div>
</div>
</div>
<GoogleLogin3DModal
isOpen={show3DGoogleModal}
onClose={() => setShow3DGoogleModal(false)}
onGoogleLogin={() => {
setShow3DGoogleModal(false);
handleGoogleSignIn();
}}
/>
</div>
);
};
