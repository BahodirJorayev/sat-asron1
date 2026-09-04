import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Lock, Mail, ArrowRight, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AdminCredentials } from '../data/blogAndBrandingData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  adminCredentials: AdminCredentials;
  onAdminLoginSuccess?: () => void;
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  adminCredentials,
  onAdminLoginSuccess,
  onSuccess,
}) => {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const inputUser = emailOrUser.trim();
    const inputPass = password.trim();

    const validEmail = adminCredentials.adminEmail.trim();
    const validPass = adminCredentials.adminPass.trim();

    // Check if matches configured admin credentials or default Bahodir / Bahodir2008
    const isUserMatch =
      inputUser.toLowerCase() === validEmail.toLowerCase() ||
      inputUser.toLowerCase() === 'bahodir' ||
      inputUser.toLowerCase() === 'admin';

    const isPassMatch =
      inputPass === validPass ||
      inputPass === 'Bahodir2008';

    if (isUserMatch && isPassMatch) {
      if (onAdminLoginSuccess) onAdminLoginSuccess();
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError('Noto‘g‘ri login yoki parol kiritildi.');
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200 font-sans overflow-y-auto overscroll-contain"
    >
      <div className="bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-[#0F172A] dark:text-[#F8FAFC] relative max-h-[90vh] sm:max-h-[86vh] my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer z-20 border border-[#E2E8F0] dark:border-[#1E293B]"
          title="Yopish (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#F8FAFC] dark:bg-[#0A0F1D] border-b border-[#E2E8F0] dark:border-[#1E293B] text-center space-y-2 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-[#0F172A] dark:bg-[#1E293B] text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md">
            <ShieldAlert className="w-6 h-6 text-[#E07A5F]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Admin Boshqaruv Portali
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-xs mx-auto">
            Platforma sozlamalari, kurs mocklari va foydalanuvchilarni boshqarish uchun tizimga kiring.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-5 bg-white dark:bg-[#121A2F]">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1">
                Admin Login
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  placeholder="Admin login..."
                  required
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#E07A5F] focus:ring-2 focus:ring-[#E07A5F]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1">
                Admin Parol
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="off"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#E07A5F] focus:ring-2 focus:ring-[#E07A5F]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#0F172A] dark:bg-[#E07A5F] hover:bg-[#1E293B] dark:hover:bg-[#c96a51] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Tizimga Kirish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
