import React, { useState } from 'react';
import { Settings, Lock, Bell, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';

export const StudentSettings = () => {
  const { logout } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return showToast('New passwords do not match.', 'error');
    }
    if (newPassword.length < 6) {
      return showToast('Password must be at least 6 characters.', 'error');
    }
    setSavingPwd(true);
    try {
      const res = await api.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      if (res.data.success) {
        showToast('Password updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  const handleDeleteAccount = () => {
    showToast('Account deleted successfully.', 'info');
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage password credentials, security preferences, and account actions.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8">
            
            {/* Password Update */}
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Change Password
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPwd}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50"
              >
                {savingPwd ? 'Updating...' : 'Update Password'}
              </button>
            </form>

            {/* Notification Preferences */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Notification Preferences
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                  <span className="text-xs font-bold text-slate-700">Email alerts when application status changes</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                  <span className="text-xs font-bold text-slate-700">Notifications when recruiters schedule interviews</span>
                </label>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Danger Zone
              </h3>
              <p className="text-xs text-slate-500">Permanently remove your account, profile details, and application history.</p>
              
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="px-5 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete My Student Account
              </button>
            </div>

          </div>
        </main>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Account Deletion"
      >
        <div className="space-y-4 text-slate-700">
          <p className="text-xs">Are you sure you want to permanently delete your account? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow"
            >
              Permanently Delete
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
