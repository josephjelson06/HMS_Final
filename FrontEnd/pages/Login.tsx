
import React, { useState } from 'react';
import { Mail, Lock, Moon, Sun, Zap } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { useTheme } from '../hooks/useTheme';

interface LoginProps {
  onLogin: (role: 'super' | 'hotel') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, if email contains 'hotel' it goes to hotel view, else super admin
    const role = email.toLowerCase().includes('hotel') ? 'hotel' : 'super';
    onLogin(role);
  };

  const inputClass = `w-full px-5 py-4 rounded-2xl outline-none transition-all duration-300 text-sm font-medium border
    ${isDarkMode 
      ? 'bg-[#121212]/40 border-white/5 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10' 
      : 'bg-gray-50 border-gray-100 text-slate-900 placeholder-gray-400 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10'
    }`;
    
  const labelClass = `block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`;

  return (
    <div className={`fixed inset-0 z-[10000] flex items-center justify-center transition-colors duration-700 ${isDarkMode ? 'bg-black' : 'bg-[#f8fafc]'}`}>
      
      {/* Top Right Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="absolute top-8 right-8 p-3 rounded-2xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-md transition-all hover:scale-110 active:scale-95"
      >
        {isDarkMode ? <Sun size={20} className="text-gray-300" /> : <Moon size={20} className="text-slate-600" />}
      </button>

      {/* Main Login Card */}
      <div className="w-full max-w-lg px-6 animate-in fade-in zoom-in-95 duration-700">
        <GlassCard noPadding className="shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.6)] border-white/40 dark:border-white/10">
          <div className="p-10 md:p-14 space-y-10">
            
            {/* Header Section */}
            <div className="text-center md:text-left space-y-4">
              <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-100 text-blue-600'}`}>
                HMS Foundation
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Welcome back</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Sign in to manage your platform or hotel workspace.</p>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className={labelClass}>Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com" 
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********" 
                  className={inputClass}
                  required
                />
              </div>

              <button 
                type="submit"
                className={`w-full py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95
                  ${isDarkMode 
                    ? 'bg-orange-500 text-white shadow-orange-900/20 hover:bg-orange-600' 
                    : 'bg-blue-600 text-white shadow-blue-900/10 hover:bg-blue-700'
                  }`}
              >
                Sign in
              </button>
            </form>
          </div>
        </GlassCard>
      </div>

      {/* Bottom Left Small Logo */}
      <div className="absolute bottom-10 left-10 flex items-center gap-3 opacity-80">
        <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black">
          <span className="font-black text-xs">N</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
