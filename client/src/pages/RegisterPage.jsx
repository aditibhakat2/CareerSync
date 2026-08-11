import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Building, Mail, Lock, Phone, GraduationCap, Globe, MapPin, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const RegisterPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('Student');
  const [loading, setLoading] = useState(false);

  // Student Form State
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    college: '',
    degree: 'B.Tech',
    branch: 'Computer Science',
    passing_year: '2026',
    cgpa: '8.50'
  });

  // Company Form State
  const [companyData, setCompanyData] = useState({
    company_name: '',
    hr_name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    description: '',
    password: '',
    confirmPassword: ''
  });

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (studentData.password !== studentData.confirmPassword) {
      return showToast('Passwords do not match.', 'error');
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register/student', studentData);
      if (res.data.success) {
        showToast('Registration successful!', 'success');
        login(res.data.user, res.data.token);
        navigate('/student/dashboard');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    if (companyData.password !== companyData.confirmPassword) {
      return showToast('Passwords do not match.', 'error');
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register/company', companyData);
      if (res.data.success) {
        showToast('Company registered successfully! Account is pending verification.', 'success');
        login(res.data.user, res.data.token);
        navigate('/company/dashboard');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Company registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Your CareerSync Account</h2>
            <p className="text-xs text-slate-500 font-medium">Join thousands of students and recruiters today</p>
          </div>

          {/* Account Role Selector */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('Student')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                role === 'Student' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              Student Registration
            </button>
            <button
              type="button"
              onClick={() => setRole('Company')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                role === 'Company' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-4 h-4" />
              Company / Recruiter Registration
            </button>
          </div>

          {/* Student Registration Form */}
          {role === 'Student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={studentData.name}
                    onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="Alex Johnson"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={studentData.email}
                    onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="alex@student.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={studentData.phone}
                    onChange={(e) => setStudentData({ ...studentData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="+1 555-0101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">College / University *</label>
                  <input
                    type="text"
                    required
                    value={studentData.college}
                    onChange={(e) => setStudentData({ ...studentData, college: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="Stanford University"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Degree</label>
                  <input
                    type="text"
                    value={studentData.degree}
                    onChange={(e) => setStudentData({ ...studentData, degree: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="B.Tech"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch</label>
                  <input
                    type="text"
                    value={studentData.branch}
                    onChange={(e) => setStudentData({ ...studentData, branch: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Passing Year</label>
                  <input
                    type="number"
                    value={studentData.passing_year}
                    onChange={(e) => setStudentData({ ...studentData, passing_year: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={studentData.password}
                    onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={studentData.confirmPassword}
                    onChange={(e) => setStudentData({ ...studentData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Student Account...' : 'Register Student Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Company Registration Form */
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyData.company_name}
                    onChange={(e) => setCompanyData({ ...companyData, company_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="TechCorp Innovations"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">HR Representative Name *</label>
                  <input
                    type="text"
                    required
                    value={companyData.hr_name}
                    onChange={(e) => setCompanyData({ ...companyData, hr_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="Sarah Jenkins"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Email *</label>
                  <input
                    type="email"
                    required
                    value={companyData.email}
                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="hr@techcorp.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="+1 555-0192"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Website</label>
                  <input
                    type="url"
                    value={companyData.website}
                    onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="https://techcorp.example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Office Address</label>
                  <input
                    type="text"
                    value={companyData.address}
                    onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="Bengaluru, Karnataka"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Description</label>
                <textarea
                  rows="2"
                  value={companyData.description}
                  onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                  placeholder="Brief summary of your company culture and domain focus..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={companyData.password}
                    onChange={(e) => setCompanyData({ ...companyData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={companyData.confirmPassword}
                    onChange={(e) => setCompanyData({ ...companyData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-slate-800"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Recruiter Account...' : 'Register Recruiter Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
