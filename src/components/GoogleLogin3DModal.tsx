import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Chrome, ArrowRight, X } from 'lucide-react';

interface GoogleLogin3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
}

export const GoogleLogin3DModal: React.FC<GoogleLogin3DModalProps> = ({ isOpen, onClose, onGoogleLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateX: 20, y: 30 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotateX: -20, y: 30 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/50 border border-indigo-500/30 shadow-[0_25px_60px_-15px_rgba(79,70,229,0.3)] backdrop-blur-2xl text-slate-100 overflow-hidden"
      >
        {/* Glowing 3D Background Orb */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
          {/* 3D Floating Icon Badge */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 border border-white/20"
          >
            <Chrome className="w-8 h-8 text-white" />
          </motion.div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-white">Sign in with Google</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Securely connect your Google account to sync your Alpha AI workspace, tasks, and notes across devices.
            </p>
          </div>

          {/* 3D Interactive Login Button */}
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0px 10px 25px rgba(79, 70, 229, 0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onGoogleLogin}
            className="w-full py-3.5 px-6 rounded-2xl bg-white text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 shadow-xl transition-all hover:bg-slate-100"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
            <ArrowRight className="w-4 h-4 ml-auto text-slate-500" />
          </motion.button>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>End-to-end encrypted & secure OAuth 2.0 authentication</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
