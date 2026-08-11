import React, { useState } from 'react';
import { Settings, Lock, Bell, Trash2, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Modal } from '../../components/common/Modal';

export const CompanySettings = () => {
  const { showToast } = useToast();
  const { logout } = useAuth();

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [savingPwd, setSavingPwd] = useState(false);

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    new_applicant: true,
    application_status: true,
    weekly_report: false,
    platform_updates: true
  });
  const [savingNotif, setSavingNotif] = useState(false);

  // Delete Account Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast('New passwords do not match.', 'error');
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
        showToast('Password updated successfully!', 'success');
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  const handleNotificationSave = async () => {
    setSavingNotif(true);
    try {
      await api.put('/company/notification-preferences', notifications);
      showToast('Notification preferences saved.', 'success');
    } catch {
      showToast('Failed to save preferences.', 'error');
    } finally {
      setSavingNotif(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast('Please type DELETE to confirm.', 'error');
      return;
    }
    try {
      await api.delete('/auth/delete-account');
      showToast('Account deleted successfully.', 'info');
      setTimeout(() => {
        logout();
        window.location.href = '/';
      }, 1500);
    } catch {
      showToast('Failed to delete account.', 'error');
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
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${checked ? 'bg-primary' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const PwdInput = ({ label, name, value, onChange, show, onToggle }) => (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          required
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm pr-10"
        />
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
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Company Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your account security, notifications, and preferences.</p>
          </div>

          <div className="space-y-6">
            {/* Change Password */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Change Password</h2>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <PwdInput
                  label="Current Password"
                  name="current_password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  show={showPwd.current}
                  onToggle={() => setShowPwd({ ...showPwd, current: !showPwd.current })}
                />
                <PwdInput
                  label="New Password"
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  show={showPwd.new}
                  onToggle={() => setShowPwd({ ...showPwd, new: !showPwd.new })}
                />
                <PwdInput
                  label="Confirm New Password"
                  name="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  show={showPwd.confirm}
                  onToggle={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })}
                />
                <button
                  type="submit"
                  disabled={savingPwd}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {savingPwd ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Notification Preferences</h2>
              </div>
              <ToggleSwitch
                label="New Applicant Alerts"
                description="Get notified when a candidate applies to your jobs."
                checked={notifications.new_applicant}
                onChange={() => setNotifications({ ...notifications, new_applicant: !notifications.new_applicant })}
              />
              <ToggleSwitch
                label="Application Status Updates"
                description="Stay informed when candidates withdraw or update their applications."
                checked={notifications.application_status}
                onChange={() => setNotifications({ ...notifications, application_status: !notifications.application_status })}
              />
              <ToggleSwitch
                label="Weekly Hiring Reports"
                description="Receive a weekly summary of your applicant pipeline."
                checked={notifications.weekly_report}
                onChange={() => setNotifications({ ...notifications, weekly_report: !notifications.weekly_report })}
              />
              <ToggleSwitch
                label="Platform Updates"
                description="Important announcements from the CareerSync team."
                checked={notifications.platform_updates}
                onChange={() => setNotifications({ ...notifications, platform_updates: !notifications.platform_updates })}
              />
              <button
                onClick={handleNotificationSave}
                disabled={savingNotif}
                className="mt-5 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-md"
              >
                {savingNotif ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                </div>
                <h2 className="text-base font-bold text-rose-700">Danger Zone</h2>
              </div>
              <p className="text-sm text-slate-600 mb-4">Permanently delete your company account and all associated data including job postings and applications. This action is irreversible.</p>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Delete Company Account
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Account Deletion">
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">
            ⚠ This will permanently delete your company account, all job postings, and applicant data.
          </div>
          <p className="text-sm text-slate-600">
            To confirm, type <strong>DELETE</strong> below:
          </p>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl">Cancel</button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE'}
              className="px-4 py-2 bg-rose-600 disabled:bg-rose-300 text-white text-xs font-bold rounded-xl shadow"
            >
              Permanently Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
