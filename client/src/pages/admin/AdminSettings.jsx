import React, { useState } from 'react';
import { Settings, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';

export const AdminSettings = () => {
  const { showToast } = useToast();

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [savingPwd, setSavingPwd] = useState(false);

  const [platformSettings, setPlatformSettings] = useState({
    allow_registrations: true,
    require_company_verification: true,
    maintenance_mode: false,
    max_jobs_per_company: 20,
  });
  const [savingPlatform, setSavingPlatform] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
    setSavingPwd(true);
    try {
      const res = await api.put('/auth/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      if (res.data.success) {
        showToast('Admin password updated!', 'success');
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  const handlePlatformSave = async () => {
    setSavingPlatform(true);
    try {
      await api.put('/admin/platform-settings', platformSettings);
      showToast('Platform settings saved successfully.', 'success');
    } catch {
      showToast('Failed to save platform settings.', 'error');
    } finally {
      setSavingPlatform(false);
    }
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-primary' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const PwdInput = ({ label, name, value, onChange, show, onToggle }) => (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} name={name} value={value} onChange={onChange} required
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm pr-10" />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage admin credentials and global platform configuration.</p>
          </div>

          <div className="space-y-6">
            {/* Change Admin Password */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Change Admin Password</h2>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <PwdInput label="Current Password" name="current_password" value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  show={showPwd.current} onToggle={() => setShowPwd({ ...showPwd, current: !showPwd.current })} />
                <PwdInput label="New Password" name="new_password" value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  show={showPwd.new} onToggle={() => setShowPwd({ ...showPwd, new: !showPwd.new })} />
                <PwdInput label="Confirm New Password" name="confirm_password" value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  show={showPwd.confirm} onToggle={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })} />
                <button type="submit" disabled={savingPwd}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-md">
                  {savingPwd ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Platform Configuration */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-4 h-4 text-violet-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Platform Configuration</h2>
              </div>
              <ToggleSwitch
                label="Allow New Registrations"
                description="Toggle student and company registrations on or off."
                checked={platformSettings.allow_registrations}
                onChange={() => setPlatformSettings({ ...platformSettings, allow_registrations: !platformSettings.allow_registrations })}
              />
              <ToggleSwitch
                label="Require Company Verification"
                description="New companies must be verified by admin before posting jobs."
                checked={platformSettings.require_company_verification}
                onChange={() => setPlatformSettings({ ...platformSettings, require_company_verification: !platformSettings.require_company_verification })}
              />
              <ToggleSwitch
                label="Maintenance Mode"
                description="Put the platform into read-only maintenance mode."
                checked={platformSettings.maintenance_mode}
                onChange={() => setPlatformSettings({ ...platformSettings, maintenance_mode: !platformSettings.maintenance_mode })}
              />
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Max Job Postings per Company</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={platformSettings.max_jobs_per_company}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, max_jobs_per_company: parseInt(e.target.value) })}
                  className="w-32 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                />
              </div>
              <button
                onClick={handlePlatformSave}
                disabled={savingPlatform}
                className="mt-5 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-md"
              >
                {savingPlatform ? 'Saving...' : 'Save Platform Settings'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
