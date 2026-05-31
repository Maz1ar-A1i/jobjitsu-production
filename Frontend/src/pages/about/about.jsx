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

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
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

      <main className="max-w-4xl mx-auto px-6 py-16 relative z-10 space-y-16">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-4 border-primary/30">
            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4CD7F6] animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">About The Project</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-black text-on-surface tracking-tight leading-tight">
            Precision Intelligence for the <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">Modern Career</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant font-medium max-w-2xl mx-auto leading-relaxed">
            JobJitsu is an advanced AI-powered career co-pilot designed to simulate real-world interviews, provide instantaneous actionable feedback, and track your career growth trajectory.
          </p>
        </section>

        {/* Mission Statement */}
        <section className="glass-panel p-8 md:p-12 rounded-[2rem] border border-outline-variant/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-tertiary/10 rounded-full blur-[80px] group-hover:bg-tertiary/20 transition-colors duration-700" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary border border-tertiary/20">
                <MaterialIcon icon="rocket_launch" />
              </div>
              <h2 className="text-2xl font-headline font-bold text-white">Our Mission</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed font-medium">
              We believe that getting your dream job shouldn't be limited by a lack of interview practice or opaque feedback loops. JobJitsu democratizes career coaching by leveraging state-of-the-art Generative AI. We analyze your responses in real-time, focusing on clarity, technical depth, and confidence, effectively turning every practice session into a quantifiable stepping stone towards success.
            </p>
          </div>
        </section>

        {/* Core Features Grid */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant/20">
              <MaterialIcon icon="layers" className="text-lg" />
            </div>
            <h2 className="text-xl font-headline font-bold text-white">Platform Ecosystem</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "AI Mock Interviews", desc: "Dynamic, conversational interviews that adapt to your role, experience level, and responses.", icon: "mic", color: "primary" },
              { title: "Real-Time Feedback", desc: "Granular scoring on communication, technical accuracy, and emotional delivery.", icon: "bolt", color: "secondary" },
              { title: "Progress Analytics", desc: "Visual tracking of your strengths and weaknesses over time via intuitive dashboards.", icon: "analytics", color: "tertiary" },
              { title: "Practice Hub", desc: "A curated library of domain-specific questions, coding environments, and mock videos.", icon: "fitness_center", color: "primary-container" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-surface-container-low p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                <MaterialIcon icon={feature.icon} className={`text-${feature.color} mb-4 text-3xl opacity-80 group-hover:opacity-100 transition-opacity`} />
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Stack */}
        <section className="bg-surface-container p-8 md:p-12 rounded-[2rem] border border-white/5 space-y-8">
          <h2 className="text-2xl font-headline font-bold text-white text-center">Built for the Synthetic Era</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {["React", "Node.js", "Express", "MongoDB", "Redux", "Tailwind CSS", "Recharts", "WebRTC", "Generative AI"].map((tech) => (
              <div key={tech} className="px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant/10 text-xs font-black uppercase tracking-widest text-on-surface-variant/80 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm cursor-default">
                {tech}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Simple Footer */}
      <footer className="w-full py-8 mt-12 border-t border-outline-variant/10 flex justify-center items-center relative z-10 bg-surface-container-lowest">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/40">
          © 2026 JobJitsu. AI Career Orchestration.
        </p>
      </footer>
    </div>
  );
}
