
import React, { useState, useEffect } from 'react';
import { Save, Layout, Loader2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../../application/hooks/useSettings';

const PlatformSettings: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { settings, loading: settingsLoading, updateSettings, error } = useSettings();
  const [localSettings, setLocalSettings] = useState({
      name: '',
      gstin: '',
      pan: '',
      address: ''
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
        setLocalSettings({
            name: settings.name || 'ATC Platform Solutions Private Limited',
            gstin: settings.gstin || '27AABCU1234A1Z5',
            pan: settings.pan || 'AABCU1234A',
            address: settings.address || 'Level 4, Sky Tower, Business Bay, Pune, Maharashtra 411001, India'
        });
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setLocalSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
      setSaving(true);
      setSuccess(false);
      try {
          await updateSettings(localSettings);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
          console.error("Failed to save settings", err);
          alert("Failed to save settings");
      } finally {
          setSaving(false);
      }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-bold border
    ${isDarkMode 
      ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-accent/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-accent/50 focus:ring-2 focus:ring-accent/10'
    }`;
    
  const labelClass = `block text-[10px] font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`;

  return (
    <div className="p-8 space-y-8 min-h-screen pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Global Parameters</h1>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
              {settingsLoading ? 'Synchronizing governance defaults...' : 'Platform-wide governance & logic defaults'}
          </p>
        </div>
        <button 
            onClick={handleSave}
            disabled={saving || settingsLoading}
            className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {success ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="w-full">
        <GlassCard className="min-h-[600px] border-l-4 border-l-accent-strong">
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">ATC Platform Identity</h2>
                <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5 flex items-center justify-center text-gray-400">
                    <Layout size={32} />
                </div>
            </div>
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-bold">
                    Error loading settings: {error.message}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-2">
                <label className={labelClass}>Legal Business Name</label>
                <input 
                    type="text" 
                    name="name" 
                    value={localSettings.name} 
                    onChange={handleChange} 
                    className={inputClass} 
                />
                </div>
                <div>
                <label className={labelClass}>GSTIN (Tax ID)</label>
                <input 
                    type="text" 
                    name="gstin" 
                    value={localSettings.gstin} 
                    onChange={handleChange} 
                    className={`${inputClass} font-mono uppercase`} 
                />
                </div>
                <div>
                <label className={labelClass}>PAN (Income Tax)</label>
                <input 
                    type="text" 
                    name="pan" 
                    value={localSettings.pan} 
                    onChange={handleChange} 
                    className={`${inputClass} font-mono uppercase`} 
                />
                </div>
                <div className="col-span-2">
                <label className={labelClass}>Registered Office Address</label>
                <textarea 
                    rows={3} 
                    name="address" 
                    value={localSettings.address} 
                    onChange={handleChange} 
                    className={inputClass} 
                />
                </div>
            </div>
            </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default PlatformSettings;
