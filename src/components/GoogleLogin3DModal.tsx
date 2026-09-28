import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShieldCheck, Chrome, ArrowRight, X, Loader2, AlertCircle } from 'lucide-react';

interface GoogleLogin3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
  loading?: boolean;
  error?: string | null;
}

export const GoogleLogin3DModal: React.FC<GoogleLogin3DModalProps> = ({
  isOpen,
  onClose,
  onGoogleLogin,
  loading = false,
  error = null
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          {/* Background glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-600/20 rounded-full blur-[100px]" />
          </motion.div>

          {/* 3D Card */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.82,
              rotateX: 18,
              y: 35
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: 0,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.88,
              rotateX: -10,
              y: 20
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 22,
              mass: 0.8
            }}
            style={{
              transformPerspective: 1200
            }}
            className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/80 p-7 text-slate-100 shadow-2xl"
          >
            {/* Top shine */}
            <motion.div
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '120%', opacity: [0, 0.35, 0] }}
              transition={{
                duration: 2.2,
                delay: 0.35,
                ease: 'easeInOut'
              }}
              className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] pointer-events-none"
            />

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Close Google sign in"
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Floating Google icon */}
              <motion.div
                animate={{
                  y: [0, -7, 0],
                  rotateY: [0, 8, 0, -8, 0]
                }}
                transition={{
                  y: {
                    repeat: Infinity,
                    duration: 3.2,
                    ease: 'easeInOut'
                  },
                  rotateY: {
                    repeat: Infinity,
                    duration: 5,
                    ease: 'easeInOut'
                  }
                }}
                style={{
                  transformPerspective: 800
                }}
                className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/15 bg-white/10 shadow-[0_20px_50px_rgba(79,70,229,0.35)] backdrop-blur-xl"
              >
                {/* Icon glow */}
                <motion.div
                  animate={{
                    scale: [0.9, 1.08, 0.9],
                    opacity: [0.35, 0.65, 0.35]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.8,
                    ease: 'easeInOut'
                  }}
                  className="absolute inset-2 rounded-[20px] bg-indigo-500/30 blur-xl"
                />

                <Chrome className="relative z-10 h-10 w-10 text-white" />
              </motion.div>

              {/* Heading */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">
                  Sign in with Google
                </h3>

                <p className="mx-auto max-w-sm text-sm leading-6 text-slate-400">
                  Securely connect your Google account to continue using Alpha AI.
                </p>
              </div>

              {/* Error */}
              <AnimatePresence initial={false}>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    className="mt-5 flex w-full items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-left"
                  >
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                    <p className="text-xs leading-5 text-red-300">
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Google button */}
              <motion.button
                type="button"
                onClick={onGoogleLogin}
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, y: -2 } : undefined}
                whileTap={!loading ? { scale: 0.98, y: 1 } : undefined}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 20
                }}
                className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 font-semibold text-slate-900 shadow-xl transition-shadow hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    {/* Google-style G */}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="#4285F4"
                        d="M21.35 12.27c0-.78-.07-1.53-.22-2.27H12v4.3h5.25a4.49 4.49 0 0 1-1.95 2.95v2.45h3.16c1.85-1.7 2.89-4.2 2.89-7.43Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 21.75c2.65 0 4.88-.87 6.51-2.35l-3.16-2.45c-.87.58-1.98.93-3.35.93-2.57 0-4.74-1.74-5.52-4.08H3.22v2.53A9.84 9.84 0 0 0 12 21.75Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M6.48 13.8A5.91 5.91 0 0 1 6.16 12c0-.62.11-1.22.32-1.8V7.67H3.22A9.84 9.84 0 0 0 2.25 12c0 1.58.38 3.08.97 4.33l3.26-2.53Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 6.12c1.44 0 2.73.5 3.75 1.48l2.81-2.81C16.88 3.14 14.65 2.25 12 2.25a9.84 9.84 0 0 0-8.78 5.42l3.26 2.53C7.26 7.86 9.43 6.12 12 6.12Z"
                      />
                    </svg>

                    <span>Continue with Google</span>

                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>

              {/* Security info */}
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Google sign-in powered by Firebase Authentication</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
