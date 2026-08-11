import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusSquare, Plus, Trash2, HelpCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';

export const PostJob = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    responsibilities: '',
    required_skills: '',
    salary: '₹8 LPA – ₹12 LPA',
    experience: '0–2 years',
    location: 'Bengaluru, Karnataka',
    job_type: 'Full Time',
    remote_option: 'Hybrid',
    deadline: '2026-12-31',
    vacancies: '2',
    education: 'B.Tech / B.E. in CS/IT'
  });

  // Application Questions State
  const [questions, setQuestions] = useState([
    { question_text: '', is_required: true },
    { question_text: '', is_required: true },
  ]);

  const addQuestion = () => {
    if (questions.length >= 5) {
      showToast('Maximum 5 questions allowed per job.', 'info');
      return;
    }
    setQuestions(prev => [...prev, { question_text: '', is_required: true }]);
  };

  const removeQuestion = (idx) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out blank questions before submitting
      const validQuestions = questions.filter(q => q.question_text.trim());
      const payload = {
        ...jobData,
        application_questions: JSON.stringify(validQuestions),
      };

      const res = await api.post('/company/post-job', payload);
      if (res.data.success) {
        showToast('Job posting created successfully!', 'success');
        navigate('/company/jobs');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post job.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Post a New Job Opening</h1>
            <p className="text-sm text-slate-500 mt-1">Publish job postings to connect with qualified student candidates.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobData.title}
                  onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Frontend Developer (React)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Salary Offered *</label>
                <input
                  type="text"
                  required
                  value={jobData.salary}
                  onChange={(e) => setJobData({ ...jobData, salary: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. ₹8 LPA – ₹12 LPA"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Overview & Description *</label>
              <textarea
                rows="3"
                required
                value={jobData.description}
                onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                placeholder="Describe key responsibilities and expectations for this role..."
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Key Responsibilities</label>
              <textarea
                rows="2"
                value={jobData.responsibilities}
                onChange={(e) => setJobData({ ...jobData, responsibilities: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                placeholder="Write clear action points separated by semicolons..."
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills (Comma Separated) *</label>
              <input
                type="text"
                required
                value={jobData.required_skills}
                onChange={(e) => setJobData({ ...jobData, required_skills: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                placeholder="React, Node.js, JavaScript, MySQL, Tailwind CSS"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Type</label>
                <select
                  value={jobData.job_type}
                  onChange={(e) => setJobData({ ...jobData, job_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remote Option</label>
                <select
                  value={jobData.remote_option}
                  onChange={(e) => setJobData({ ...jobData, remote_option: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Experience Level</label>
                <input
                  type="text"
                  value={jobData.experience}
                  onChange={(e) => setJobData({ ...jobData, experience: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Fresher / 0-2 years"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Office Location *</label>
                <input
                  type="text"
                  required
                  value={jobData.location}
                  onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Bengaluru, Karnataka"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Number of Vacancies</label>
                <input
                  type="number"
                  value={jobData.vacancies}
                  onChange={(e) => setJobData({ ...jobData, vacancies: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Application Deadline</label>
                <input
                  type="date"
                  value={jobData.deadline}
                  onChange={(e) => setJobData({ ...jobData, deadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Application Questions Section */}
            <div className="pt-2 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Application Questions</h3>
                    <p className="text-xs text-slate-500">Add 2–5 questions candidates must answer when applying.</p>
                  </div>
                </div>
                {questions.length < 5 && (
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary border border-primary/30 hover:bg-primary/5 rounded-xl transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Question
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={q.question_text}
                        onChange={(e) => updateQuestion(idx, 'question_text', e.target.value)}
                        placeholder={`Question ${idx + 1} — e.g. Why do you want to join us?`}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-primary"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`req-${idx}`}
                          checked={q.is_required}
                          onChange={(e) => updateQuestion(idx, 'is_required', e.target.checked)}
                          className="w-3.5 h-3.5 accent-primary"
                        />
                        <label htmlFor={`req-${idx}`} className="text-xs font-semibold text-slate-600">Required</label>
                      </div>
                    </div>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2"
              >
                <PlusSquare className="w-4 h-4" />
                {loading ? 'Publishing Job Posting...' : 'Publish Job Posting'}
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
};
