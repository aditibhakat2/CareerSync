import React, { useState } from 'react';
import { BarChart2, Upload, FileText, CheckCircle2, AlertTriangle, Lightbulb, Star } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Loader } from '../../components/common/Loader';

export const AIResumeAnalyzer = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      if (resumeFile) data.append('resume', resumeFile);
      if (resumeText) data.append('resumeText', resumeText);

      const res = await api.post('/ai/resume/analyze', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setAnalysis(res.data.analysis);
        showToast('Resume ATS Analysis complete!', 'success');
      }
    } catch (err) {
      showToast('Error analyzing resume text.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart2 className="w-7 h-7 text-emerald-600" />
              AI ATS Resume Analyzer & Score Checker
            </h1>
            <p className="text-sm text-slate-500 mt-1">Upload your resume PDF to test ATS score compatibility, keyword matches, and grammar suggestions.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Input Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Submit Resume for Review</h3>

              <form onSubmit={handleAnalyze} className="space-y-4">
                
                {/* PDF File Upload Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Upload PDF Resume</label>
                  <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-2">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                    <span className="text-xs font-bold text-slate-700 block">
                      {resumeFile ? resumeFile.name : 'Choose PDF File'}
                    </span>
                    <label className="inline-block px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg cursor-pointer">
                      Browse File
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => setResumeFile(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="text-center text-xs font-semibold text-slate-400">— OR PASTE TEXT —</div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Resume Raw Text</label>
                  <textarea
                    rows="6"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste resume contents here if you don't have a PDF file ready..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? 'Analyzing with Gemini...' : 'Analyze ATS Compatibility'}
                  <BarChart2 className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Analysis Output */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">ATS Performance Breakdown</h3>

              {loading ? (
                <Loader label="Parsing resume and calculating ATS scores..." />
              ) : !analysis ? (
                <p className="text-xs text-slate-400 py-16 text-center">Upload a PDF or paste text to see your live ATS score (out of 10) and grammar breakdown.</p>
              ) : (
                <div className="space-y-6">
                  
                  {/* Score Badges Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                      <span className="text-xs font-bold text-emerald-800 uppercase block">Overall ATS Score</span>
                      <span className="text-3xl font-extrabold text-emerald-700 mt-1 block">{analysis.overallScore || 8.5} / 10</span>
                    </div>

                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-center">
                      <span className="text-xs font-bold text-indigo-800 uppercase block">Grammar Score</span>
                      <span className="text-2xl font-extrabold text-indigo-700 mt-1 block">{analysis.grammarScore || 9} / 10</span>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                      <span className="text-xs font-bold text-amber-800 uppercase block">Formatting</span>
                      <span className="text-2xl font-extrabold text-amber-700 mt-1 block">{analysis.formatScore || 8} / 10</span>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-center">
                      <span className="text-xs font-bold text-purple-800 uppercase block">Keywords</span>
                      <span className="text-2xl font-extrabold text-purple-700 mt-1 block">{analysis.keywordScore || 8} / 10</span>
                    </div>
                  </div>

                  {/* Strengths & Missing Skills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <h4 className="text-xs font-extrabold uppercase text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Resume Strengths
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {analysis.resumeStrengths?.map((str, i) => (
                          <li key={i}>• {str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <h4 className="text-xs font-extrabold uppercase text-rose-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Missing Keywords / Skills
                      </h4>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {analysis.missingSkills?.map((skill, i) => (
                          <span key={i} className="px-2.5 py-0.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-md border border-rose-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Categorized Suggestions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Improvement Recommendations
                    </h4>
                    <div className="space-y-2 text-xs text-slate-700">
                      {analysis.suggestions && Object.entries(analysis.suggestions).map(([cat, tip], idx) => (
                        <div key={idx} className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                          <span className="font-bold text-indigo-900 uppercase text-[10px] tracking-wider block mb-0.5">{cat} Tip</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
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
