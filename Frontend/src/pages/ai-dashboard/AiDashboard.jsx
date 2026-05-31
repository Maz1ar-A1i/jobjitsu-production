import React from 'react';
import Chatbot from '../../components/Chatbot/Chatbot';
import { useNavigate } from 'react-router-dom';

const AiDashboard = () => {
    const navigate = useNavigate();

    const QUICK_TOOLS = [
        {
            id: 'builder',
            title: 'Resume Builder',
            desc: 'AI-driven templates for professional resume creation.',
            icon: 'edit_document',
            route: '/resume-builder',
            color: 'primary'
        },
        {
            id: 'analyzer',
            title: 'Resume Analyzer',
            desc: 'Scan your resume through our AI analysis for instant optimization.',
            icon: 'troubleshoot',
            route: '/resume-analyzer',
            color: 'secondary'
        },
        {
            id: 'interview',
            title: 'Mock Interview',
            desc: 'Engage with AI Interviewers for real-time behavioral training.',
            icon: 'record_voice_over',
            route: '/session',
            color: 'primary'
        }
    ];

    return (
        <div className="min-h-screen bg-[#0b1326] bg-mesh text-on-surface font-body selection:bg-primary/30 relative overflow-hidden flex flex-col">
            {/* Decorative Background Blurs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Top Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-surface-variant/40 backdrop-blur-xl flex justify-between items-center px-10 h-16 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-on-primary text-xl">auto_awesome</span>
                    </div>
                    <h1 className="text-xl font-headline font-bold text-on-surface tracking-tight">AI <span className="text-primary/80 italic">Assistant</span></h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">AI Engine: Ready</span>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
                    >
                        <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Return</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 mt-16 p-10 flex flex-col gap-8 relative z-10 w-full max-w-[1700px] mx-auto overflow-hidden">
                {/* Section Header */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tighter uppercase">AI <span className="text-primary italic">Assistant</span> Console</h2>
                    <p className="text-sm text-on-surface-variant/60 font-medium font-body italic border-l-2 border-primary/40 pl-4 max-w-xl">
                        Optimize your professional trajectory through our AI-powered assistance. Powered by Gemini.
                    </p>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden min-h-0">
                    {/* Left Pane: Chat Terminal */}
                    <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col h-[70vh] lg:h-full min-h-[500px]">
                        <div className="flex-1 rounded-3xl overflow-hidden glass-panel border border-white/5">
                            <Chatbot isFloating={false} />
                        </div>
                    </div>

                    {/* AI Modules */}
                    <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
                        <div className="flex items-center gap-3 px-2">
                            <span className="material-symbols-outlined text-sm text-on-surface-variant/40">grid_view</span>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60">Assistant Modules</h3>
                        </div>
                        
                        <div className="flex flex-col gap-5">
                            {QUICK_TOOLS.map(tool => (
                                <div 
                                    key={tool.id}
                                    onClick={() => navigate(tool.route)}
                                    className="glass-panel p-6 flex flex-col gap-4 cursor-pointer group hover:bg-white/[0.08] transition-all duration-300 relative overflow-hidden"
                                >
                                    {/* Neon Corner Glow */}
                                    <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none bg-${tool.color}`} />
                                    
                                    <div className="flex items-start justify-between relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110 ${
                                            tool.color === 'primary' 
                                                ? 'bg-primary/20 text-primary shadow-primary/10' 
                                                : 'bg-secondary/20 text-secondary shadow-secondary/10'
                                        }`}>
                                            <span className="material-symbols-outlined text-2xl">{tool.icon}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-on-surface-variant opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_right_alt</span>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1 relative z-10">
                                        <h4 className="text-base font-headline font-bold text-on-surface group-hover:text-primary transition-colors">{tool.title}</h4>
                                        <p className="text-[13px] text-on-surface-variant/60 leading-relaxed font-medium">{tool.desc}</p>
                                    </div>

                                    {/* Pulse Marker */}
                                    <div className={`h-0.5 w-0 group-hover:w-full transition-all duration-500 absolute bottom-0 left-0 ${
                                        tool.color === 'primary' ? 'bg-primary shadow-[0_0_10px_#c3c0ff]' : 'bg-secondary shadow-[0_0_10px_#4cd7f6]'
                                    }`} />
                                </div>
                            ))}
                        </div>

                        {/* Status Module */}
                        <div className="mt-auto glass-panel p-6 border-dashed border-white/10 flex items-center gap-4 bg-transparent">
                            <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl animate-spin-slow">orbit</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">AI Assistant Status</span>
                                <span className="text-[9px] font-medium text-on-surface-variant/40 italic leading-tight">Analyzing performance metrics...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AiDashboard;
