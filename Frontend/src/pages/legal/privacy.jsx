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

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60">Last Updated: October 2026</p>
        </section>

        <section className="glass-panel p-8 md:p-12 rounded-[2rem] border border-outline-variant/10 shadow-2xl relative overflow-hidden space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-headline font-bold text-white">1. Introduction</h2>
            <p className="text-on-surface-variant leading-relaxed">
              At JobJitsu, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information when you use our AI career orchestration platform. We are committed to transparency and empowering you with control over your data.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-headline font-bold text-white">2. Data Collection</h2>
            <p className="text-on-surface-variant leading-relaxed">
              We collect information you directly provide to us, such as when you create an account, update your profile, or engage with our AI mock interviews. This includes audio recordings of interview sessions, which are processed in real-time to generate your feedback scores.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-headline font-bold text-white">3. How We Use Your Data</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Your data is used exclusively to improve your experience on JobJitsu. Audio recordings are transcribed to analyze communication skills, emotional delivery, and technical accuracy. We do not sell your personal data to third-party advertisers.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-headline font-bold text-white">4. Data Security</h2>
            <p className="text-on-surface-variant leading-relaxed">
              We implement robust security measures, including encryption at rest and in transit, to protect your personal information from unauthorized access, alteration, or destruction.
            </p>
          </div>
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
