import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, GraduationCap, Upload, Save, Linkedin, Github, Globe, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Loader } from '../../components/common/Loader';

export const StudentProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    degree: '',
    branch: '',
    passing_year: '',
    cgpa: '',
    skills: '',
    linkedin: '',
    github: '',
    portfolio: ''
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data.success && res.data.profile) {
        const p = res.data.profile;
        setFormData({
          name: p.name || '',
          email: p.email || '',
          phone: p.phone || '',
          college: p.college || '',
          degree: p.degree || '',
          branch: p.branch || '',
          passing_year: p.passing_year || '',
          cgpa: p.cgpa || '',
          skills: p.skills || '',
          linkedin: p.linkedin || '',
          github: p.github || '',
          portfolio: p.portfolio || ''
        });
      }
    } catch (err) {
      showToast('Error loading student profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));

      if (profilePhoto) data.append('profile_photo', profilePhoto);
      if (resumeFile) data.append('resume', resumeFile);

      const res = await api.put('/auth/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        showToast('Profile updated successfully!', 'success');
        updateUserProfile({ name: formData.name });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Profile update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Profile</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your academic credentials, skills, links, and ATS resume uploads.</p>
          </div>

          {loading ? (
            <Loader label="Fetching profile data..." />
          ) : (
            <form onSubmit={handleSave} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8">
              
              {/* Profile Photo & Summary */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 text-primary flex items-center justify-center font-extrabold text-3xl overflow-hidden shadow-inner">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <label className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white text-xs font-semibold">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePhoto(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <h3 className="text-xl font-bold text-slate-900">{formData.name || 'Student Name'}</h3>
                  <p className="text-xs text-slate-500">{formData.degree} in {formData.branch} • {formData.college}</p>
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">
                    Placement Active
                  </span>
                </div>
              </div>

              {/* Basic Personal Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Personal Information</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={formData.email}
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">College / University</label>
                    <input
                      type="text"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Credentials */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Academic Details</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Degree</label>
                    <input
                      type="text"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Branch / Major</label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Passing Year</label>
                    <input
                      type="number"
                      value={formData.passing_year}
                      onChange={(e) => setFormData({ ...formData, passing_year: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">CGPA / Percentage</label>
                    <input
                      type="text"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Skills (Comma Separated)</label>
                  <textarea
                    rows="2"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="React, Node.js, JavaScript, Python, MySQL, Tailwind CSS, REST APIs"
                  ></textarea>
                </div>
              </div>

              {/* Online Links */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Professional Profiles & Links</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                      placeholder="https://linkedin.com/in/alexjohnson"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Profile</label>
                    <input
                      type="url"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                      placeholder="https://github.com/alexjohnson"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio Website</label>
                    <input
                      type="url"
                      value={formData.portfolio}
                      onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                      placeholder="https://alexjohnson.dev"
                    />
                  </div>
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Resume Upload (PDF)</h4>
                
                <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">
                        {resumeFile ? resumeFile.name : 'Upload PDF Resume'}
                      </h5>
                      <p className="text-[11px] text-slate-500">Only PDF documents up to 10MB allowed</p>
                    </div>
                  </div>
                  <label className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold rounded-xl cursor-pointer shadow-sm">
                    Select File
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving Profile...' : 'Save Profile Changes'}
                </button>
              </div>

            </form>
          )}

        </main>
      </div>
    </div>
  );
};
