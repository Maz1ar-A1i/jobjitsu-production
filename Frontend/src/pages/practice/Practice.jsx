import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRACTICE_DATA } from '../../data/practiceData';
import CompilerModal from '../../components/PracticeCompiler/CompilerModal';

// Pre-defined domains
const DOMAINS = [
  { id: 'frontend', label: 'Frontend', icon: 'html' },
  { id: 'backend', label: 'Backend', icon: 'dns' },
  { id: 'datascience', label: 'Data Science', icon: 'analytics' },
  { id: 'hr', label: 'HR / Behavioral', icon: 'groups' },
];

const INITIAL_CHECKLIST = [
  { id: 1, text: 'Review Resume & Experiences', checked: false },
  { id: 2, text: 'Research the Company', checked: false },
  { id: 3, text: 'Prepare the "Tell me about yourself" pitch', checked: false },
  { id: 4, text: 'Have 3 questions ready to ask the interviewer', checked: false },
  { id: 5, text: 'Test Camera and Microphone', checked: false },
];

export default function Practice() {
  const navigate = useNavigate();
  const [activeDomain, setActiveDomain] = useState('frontend');
  const [activeTab, setActiveTab] = useState('technical');
  const [revealedHints, setRevealedHints] = useState({});
  const [compilerSnippet, setCompilerSnippet] = useState(null);
  const [isCompilerOpen, setIsCompilerOpen] = useState(false);
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('jobjitsu_checklist');
    return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
  });

  const currentData = PRACTICE_DATA[activeDomain] || PRACTICE_DATA['frontend'];

  useEffect(() => {
    localStorage.setItem('jobjitsu_checklist', JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    setRevealedHints({});
    if (activeDomain === 'hr') {
      setActiveTab('behavioral');
    } else {
      setActiveTab('technical');
    }
  }, [activeDomain]);

  const toggleHint = (idx) => {
    setRevealedHints(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleChecklist = (id) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleOpenCompiler = (snippet) => {
    setCompilerSnippet(snippet);
    setIsCompilerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0b1326] bg-mesh text-on-surface font-body selection:bg-primary/30 relative overflow-hidden flex flex-col">
      {/* Decorative Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-variant/40 backdrop-blur-xl flex justify-between items-center px-10 h-16 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-on-primary text-xl">psychology</span>
          </div>
          <h1 className="text-xl font-headline font-bold text-on-surface tracking-tight">Practice <span className="text-primary/80 italic">Hub</span></h1>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Exit Hub</span>
        </button>
      </header>

      <main className="flex-1 mt-16 p-10 flex flex-col gap-8 relative z-10 w-full max-w-[1600px] mx-auto">
        {/* Welcome Section */}
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tighter">Ready to <span className="text-primary">Master</span> Your Tech?</h2>
          <p className="text-sm text-on-surface-variant/60 font-medium">Select a vocational domain and prepare for your interview.</p>
        </div>

        {/* Domain Selection Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {DOMAINS.map(d => (
            <button
              key={d.id}
              onClick={() => setActiveDomain(d.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl border transition-all duration-300 whitespace-nowrap group ${
                activeDomain === d.id 
                  ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(195,192,255,0.2)]' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span className={`material-symbols-outlined text-lg ${activeDomain === d.id ? 'text-primary' : 'text-on-surface-variant/40 group-hover:text-on-surface-variant'}`}>{d.icon}</span>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${activeDomain === d.id ? 'text-on-surface' : 'text-on-surface-variant/60'}`}>{d.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            
            {/* Section: Questions Matrix */}
            <div className="glass-panel p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  <h3 className="text-lg font-headline font-bold text-on-surface">Question Bank</h3>
                </div>
                
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                  {activeDomain !== 'hr' && (
                    <button 
                      onClick={() => setActiveTab('technical')}
                      className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'technical' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant/60 hover:text-on-surface'}`}
                    >
                      Technical
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveTab('behavioral')}
                    className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'behavioral' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant/60 hover:text-on-surface'}`}
                  >
                    Behavioral
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {(activeTab === 'technical' ? currentData.technicalQuestions : currentData.behavioralQuestions).map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4 group hover:border-primary/30 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <span className="text-[10px] font-black text-primary/40 mt-1 uppercase tracking-tighter tabular-nums">Q{idx + 1}</span>
                      <p className="text-sm font-medium leading-relaxed text-on-surface/90">{item.q}</p>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => toggleHint(idx)}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">{revealedHints[idx] ? 'visibility_off' : 'lightbulb'}</span>
                        {revealedHints[idx] ? 'Hide Tip' : 'Show AI Hint'}
                      </button>
                      
                      {revealedHints[idx] && (
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 animate-in slide-in-from-top-2 duration-300">
                          <p className="text-[13px] text-on-surface-variant leading-relaxed italic border-l-2 border-primary pl-4">
                            {item.hint}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Code Workouts */}
            {currentData.codeSnippets && currentData.codeSnippets.length > 0 && (
              <div className="glass-panel p-8 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">code_blocks</span>
                  <h3 className="text-lg font-headline font-bold text-on-surface">Technical Challenges</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentData.codeSnippets.map((snippet, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-5 group hover:border-secondary/30 transition-all">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-bold text-on-surface leading-tight">{snippet.title}</h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                          snippet.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                          snippet.difficulty === 'Medium' ? 'bg-secondary/10 text-secondary' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {snippet.difficulty}
                        </span>
                      </div>
                      
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5 overflow-hidden">
                        <pre className="text-[11px] text-secondary/70 font-mono leading-relaxed truncate opacity-60">
                          {snippet.starterCode}
                        </pre>
                      </div>

                      <button 
                        onClick={() => handleOpenCompiler(snippet)}
                        className="w-full h-10 bg-secondary/10 hover:bg-secondary text-secondary hover:text-on-primary rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">play_arrow</span>
                        Launch Code Editor
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section: Demo Transmissions */}
            {currentData.videos && currentData.videos.length > 0 && (
              <div className="glass-panel p-8 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">movie</span>
                  <h3 className="text-lg font-headline font-bold text-on-surface">Interview Prep Videos</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentData.videos.map((vid, idx) => (
                    <div key={idx} className="group flex flex-col gap-3">
                      <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/40 relative shadow-2xl group-hover:border-primary/40 transition-all">
                        <iframe
                          className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                          src={`https://www.youtube.com/embed/${vid.youtubeId}`}
                          title={vid.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="flex flex-col gap-1 px-1">
                        <p className="text-[13px] font-bold text-on-surface/90 truncate">{vid.title}</p>
                        <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Runtime: {vid.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            
            {/* Guidelines Station */}
            <div className="glass-panel p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                <h3 className="text-base font-headline font-bold text-on-surface">{activeDomain.toUpperCase()} GUIDELINES</h3>
              </div>

              <div className="flex flex-col gap-4">
                {currentData.guidelines.map((guide, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">check_circle</span>
                    <p className="text-[13px] text-on-surface-variant/90 leading-tight font-medium">{guide}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist Terminal */}
            <div className="glass-panel p-8 flex flex-col gap-6 sticky top-24">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">task_alt</span>
                  <h3 className="text-base font-headline font-bold text-on-surface">Checklist</h3>
                </div>
                <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{checklist.filter(c => c.checked).length} / {checklist.length}</span>
              </div>

              <div className="flex flex-col gap-3">
                {checklist.map(item => (
                  <label 
                    key={item.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      item.checked 
                        ? 'bg-secondary/10 border-secondary/30' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        checked={item.checked} 
                        onChange={() => toggleChecklist(item.id)}
                        className="peer appearance-none w-5 h-5 rounded-md border border-white/20 checked:bg-secondary checked:border-secondary transition-all cursor-pointer"
                      />
                      <span className="material-symbols-outlined absolute text-on-primary text-base opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-[2px]">check</span>
                    </div>
                    <span className={`text-[13px] font-medium transition-all ${
                      item.checked ? 'text-secondary line-through opacity-60' : 'text-on-surface-variant'
                    }`}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary shadow-[0_0_10px_rgba(76,215,246,0.6)] transition-all duration-1000"
                    style={{ width: `${(checklist.filter(c => c.checked).length / checklist.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">Preparation Score</span>
                  <span className="text-[9px] font-bold text-secondary">{Math.round((checklist.filter(c => c.checked).length / checklist.length) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* In-App Compiler Modal */}
      <CompilerModal 
        isOpen={isCompilerOpen} 
        onClose={() => setIsCompilerOpen(false)} 
        snippet={compilerSnippet} 
      />
    </div>
  );
}
