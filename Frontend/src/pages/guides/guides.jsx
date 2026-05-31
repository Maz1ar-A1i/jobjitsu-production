import React from 'react';
import { useNavigate } from 'react-router-dom';

const MaterialIcon = ({ icon, className = "", fill = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
  >
    {icon}
  </span>
);

export default function Guides() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c3c0ff] to-[#4f46e5] flex items-center justify-center text-on-primary shadow-lg shadow-indigo-900/40 group-hover:scale-110 transition-transform">
              <MaterialIcon icon="psychology" fill />
            </div>
            <div>
              <h1 className="font-headline font-extrabold text-xl bg-gradient-to-br from-[#c3c0ff] to-[#4f46e5] bg-clip-text text-transparent tracking-tighter">JobJitsu</h1>
            </div>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface-variant text-sm font-bold uppercase tracking-widest text-on-surface-variant transition-all active:scale-95"
          >
            <MaterialIcon icon="arrow_back" className="text-base" />
            Back
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 relative z-10 space-y-12">
        <section className="text-center space-y-6 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-headline font-black text-on-surface tracking-tight">
            Platform Guides
          </h1>
          <p className="text-lg text-on-surface-variant font-medium max-w-2xl mx-auto">
            Learn how to maximize your interview success using JobJitsu.
          </p>
        </section>

        <section className="space-y-8">
          {[
            { title: "Getting Started with AI Mock Interviews", desc: "Learn how to set up your profile, choose your domain, and start your first AI-driven interview session.", icon: "mic" },
            { title: "Understanding Your Analytics", desc: "A deep dive into how our scoring system works and what your skill radar chart actually means for your career.", icon: "analytics" },
            { title: "Using the Practice Hub", desc: "How to effectively utilize curated questions, coding environments, and behavioral prep materials.", icon: "fitness_center" },
          ].map((guide, idx) => (
            <div key={idx} className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors group cursor-pointer shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                  <MaterialIcon icon={guide.icon} className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{guide.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{guide.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="w-full py-8 mt-12 border-t border-outline-variant/10 flex justify-center items-center relative z-10 bg-surface-container-lowest">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/40">
          © 2026 JobJitsu. AI Career Orchestration.
        </p>
      </footer>
    </div>
  );
}
