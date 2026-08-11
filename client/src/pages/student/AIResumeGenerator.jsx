import React, { useState } from 'react';
import { Sparkles, Copy, Download, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Loader } from '../../components/common/Loader';

export const AIResumeGenerator = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState(null);

  const [form, setForm] = useState({
    careerGoal: 'Full Stack Developer',
    education: 'B.Tech Computer Science (CGPA: 3.85)',
    skills: 'React, Node.js, JavaScript, Python, MySQL, Tailwind CSS, REST APIs',
    projects: 'CareerSync AI Platform, E-Commerce Microservice API',
    experience: 'Software Developer Intern at TechCorp Innovations',
    achievements: 'Winner of University Hackathon 2025'
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/ai/resume/generate', form);
      if (res.data.success) {
        setGeneratedOutput(res.data.data);
        showToast('AI Resume Content Generated successfully!', 'success');
      }
    } catch (err) {
      showToast('Error generating AI resume content.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-secondary" />
              AI Resume Content Generator
            </h1>
            <p className="text-sm text-slate-500 mt-1">Let Google Gemini AI generate professional ATS-optimized summaries, career objectives, and bullet points.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Input Form */}
            <form onSubmit={handleGenerate} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Enter Your Background Details</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Role / Career Goal</label>
                <input
                  type="text"
                  required
                  value={form.careerGoal}
                  onChange={(e) => setForm({ ...form, careerGoal: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Software Engineer / Full Stack Developer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Education Details</label>
                <input
                  type="text"
                  value={form.education}
                  onChange={(e) => setForm({ ...form, education: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Skills</label>
                <textarea
                  rows="2"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Projects</label>
                <input
                  type="text"
                  value={form.projects}
                  onChange={(e) => setForm({ ...form, projects: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Experience / Internships</label>
                <input
                  type="text"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-secondary hover:bg-secondary/90 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'AI is Generating Content...' : 'Generate Resume Wording with Gemini'}
                <Sparkles className="w-4 h-4" />
              </button>
            </form>

            {/* Generated Output Pane */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>AI Generated Content</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">Gemini 2.5</span>
              </h3>

              {loading ? (
                <Loader label="Gemini AI is analyzing your skills and generating wording..." />
              ) : !generatedOutput ? (
                <p className="text-xs text-slate-400 py-12 text-center">Fill in your background details on the left and click Generate to see AI resume phrasing.</p>
              ) : (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  
                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Professional Summary</h4>
                      <button
                        onClick={() => copyToClipboard(generatedOutput.professionalSummary)}
                        className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                    </div>
                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      {generatedOutput.professionalSummary}
                    </p>
                  </div>

                  {/* Career Objective */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Career Objective</h4>
                      <button
                        onClick={() => copyToClipboard(generatedOutput.careerObjective)}
                        className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                    </div>
                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      {generatedOutput.careerObjective}
                    </p>
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Impactful Project Bullet Points</h4>
                    <ul className="space-y-2">
                      {generatedOutput.projectDescriptions?.map((bullet, idx) => (
                        <li key={idx} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};
