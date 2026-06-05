import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoaderSpinner from '../../components/common/loader/loader.spinner';

const MaterialIcon = ({ icon, className = "", fill = false }) => (
    <span
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    >
        {icon}
    </span>
);

const SessionFeedback = () => {
    const { id: sessionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [feedbackData, setFeedbackData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch(`${apiUrl}/session/${sessionId}/feedback`, { headers });
                const data = await response.json();

                if (response.ok) {
                    setFeedbackData(data);
                } else {
                    setError(data.message || "Failed to load session feedback");
                }
            } catch (err) {
                console.error("Error fetching session feedback:", err);
                setError("Something went wrong. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        if (sessionId) {
            fetchFeedback();
        }
    }, [sessionId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b1326] flex flex-col items-center justify-center">
                <LoaderSpinner size={50} color="#4cd7f6" />
                <p className="mt-6 text-on-surface-variant font-bold uppercase tracking-[0.2em] animate-pulse text-sm">
                    Reconstructing Session Analysis...
                </p>
            </div>
        );
    }

    if (error || !feedbackData) {
        return (
            <div className="min-h-screen bg-[#0b1326] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-2xl bg-error/10 flex items-center justify-center text-error mb-6">
                    <MaterialIcon icon="error_outline" className="text-4xl" />
                </div>
                <h2 className="text-2xl font-headline font-bold text-white mb-2">Session Not Found</h2>
                <p className="text-on-surface-variant mb-8 max-w-md">{error || "We couldn't retrieve the requested session data."}</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 bg-surface-container-high text-white rounded-xl font-bold hover:bg-surface-container-highest transition-all"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b1326] bg-mesh text-on-surface font-body selection:bg-primary/30 relative overflow-hidden flex flex-col">
            {/* Decorative Background Blurs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-surface-variant/40 backdrop-blur-xl flex justify-between items-center px-10 h-16 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                        <MaterialIcon icon="history" className="text-on-primary text-xl" fill />
                    </div>
                    <h1 className="text-xl font-headline font-bold text-on-surface tracking-tight">Session <span className="text-primary/80 italic">Archive</span></h1>
                </div>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-on-surface/70 uppercase tracking-widest transition-all"
                >
                    <MaterialIcon icon="arrow_back" className="text-base" />
                    Dashboard
                </button>
            </header>

            <main className="flex-grow pt-28 pb-20 px-6 md:px-10 max-w-7xl mx-auto w-full relative z-10 space-y-8 animate-fade-in">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-headline font-extrabold text-[#4cd7f6] mb-2 tracking-tight">Performance Review</h2>
                    <p className="text-on-surface-variant/70 text-lg uppercase tracking-widest text-[10px] font-bold">Session ID: {sessionId}</p>
                </div>

                {/* Performance Summary Header Card */}
                <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/10 relative overflow-hidden group shadow-2xl">
                    <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-primary uppercase tracking-[0.4em]">Hiring Recommendation</h3>
                            <p className="text-4xl md:text-5xl font-headline font-black text-on-surface leading-tight transition-all group-hover:text-primary tracking-tight">
                                {feedbackData.hiring_recommendation}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                                <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-headline font-black text-secondary tracking-tighter">{feedbackData.overallScore}</span>
                                <span className="text-white/20 text-xl font-bold">/100</span>
                                </div>
                                <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-secondary to-[#4cd7f6] shadow-[0_0_15px_rgba(76,215,246,0.5)]" style={{ width: `${feedbackData.overallScore}%` }} />
                                </div>
                        </div>
                    </div>
                    <div className="mt-10 border-t border-white/5 pt-10 text-on-surface-variant/90 text-xl md:text-2xl leading-relaxed max-w-5xl italic font-medium">
                        "{feedbackData.overall_summary}"
                    </div>
                </div>

                {/* Feedback Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { id: 'hr', title: 'HR & Cultural Analysis', color: 'primary', icon: 'diversity_3' },
                        { id: 'technical', title: 'Technical Capability', color: 'secondary', icon: 'code' },
                        { id: 'team_lead', title: 'Lead & Leadership', color: 'tertiary', icon: 'groups' }
                    ].map((avatar) => (
                        <div key={avatar.id} className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col gap-6 hover:bg-white/[0.03] hover:border-white/20 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${avatar.color}/10 text-${avatar.color} shadow-lg shadow-${avatar.color}/5 group-hover:scale-110 transition-transform`}>
                                    <MaterialIcon icon={avatar.icon} className="text-3xl" fill />
                                </div>
                                <h4 className="text-lg font-bold text-on-surface/90 font-headline">{avatar.title}</h4>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-green-400 font-black uppercase tracking-widest text-[10px]">
                                        <MaterialIcon icon="trending_up" className="text-sm" />
                                        Primary Strengths
                                    </div>
                                    <ul className="space-y-2 list-none">
                                        {feedbackData.strengths_by_avatar?.[avatar.id]?.map((s, i) => (
                                            <li key={i} className="pl-5 relative before:absolute before:left-0 before:top-[0.6rem] before:w-2 before:h-2 before:bg-green-400/30 before:rounded-full text-on-surface-variant/80 text-sm leading-relaxed font-medium italic">
                                                {s}
                                            </li>
                                        )) || <li className="text-white/10 text-xs italic">Metric not available</li>}
                                    </ul>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-red-400 font-black uppercase tracking-widest text-[10px]">
                                        <MaterialIcon icon="priority_high" className="text-sm" />
                                        Key Improvements
                                    </div>
                                    <ul className="space-y-2 list-none">
                                        {feedbackData.weak_areas_by_avatar?.[avatar.id]?.map((s, i) => (
                                            <li key={i} className="pl-5 relative before:absolute before:left-0 before:top-[0.6rem] before:w-2 before:h-2 before:bg-red-400/30 before:rounded-full text-on-surface-variant/80 text-sm leading-relaxed font-medium italic">
                                                {s}
                                            </li>
                                        )) || <li className="text-white/10 text-xs italic">Metric not available</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Detailed Question Logic Board */}
                <div className="space-y-8 pt-12">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-1 bg-primary/20 rounded-full" />
                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-white/30">Session Transcript & Analysis</h3>
                        <div className="flex-grow h-px bg-white/5" />
                    </div>
                    
                    <div className="space-y-8">
                        {feedbackData.questions?.map((q, idx) => (
                            <div key={idx} className="glass-panel rounded-[2rem] border border-white/5 p-8 md:p-10 hover:border-white/20 transition-all group relative overflow-hidden shadow-xl">
                                {/* Avatar Badge */}
                                <div className="absolute top-0 right-0 py-3 px-8 bg-white/5 border-bl border-white/5 rounded-bl-[2rem] flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${q.avatar_id === 'hr' ? 'bg-primary' : q.avatar_id === 'technical' ? 'bg-secondary' : 'bg-tertiary'}`} />
                                    <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">{q.avatar_id} Specialist</span>
                                </div>

                                <div className="flex flex-col gap-8 relative z-10">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h4 className="text-[11px] font-black text-primary/40 uppercase tracking-[0.3em]">Query Phase {idx + 1}</h4>
                                            <p className="text-2xl md:text-3xl font-headline font-bold text-on-surface leading-tight tracking-tight">
                                                "{q.question_text}"
                                            </p>
                                        </div>
                                        <div className="p-6 md:p-8 bg-white/[0.03] rounded-3xl border border-white/5 border-l-4 border-l-secondary shadow-inner italic text-on-surface/80 leading-relaxed text-lg md:text-xl font-medium">
                                            "{q.response.transcript || "(No audible response detected)"}"
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t border-white/5 items-center">
                                        {/* Metric: Score */}
                                        {(() => {
                                            const displayScore = q.response.analysis.clarityScore ?? q.response.analysis.score ?? 0;
                                            const scoreColor = displayScore === 0 ? 'text-red-400' : 'text-secondary';
                                            return (
                                                <div className="flex flex-col gap-1 bg-white/5 p-4 rounded-2xl border border-white/5 text-center md:text-left">
                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Response Weight</span>
                                                    <div className="flex items-baseline justify-center md:justify-start gap-1">
                                                        <span className={`text-4xl font-headline font-black tracking-tighter ${scoreColor}`}>{displayScore}</span>
                                                        <span className="text-[12px] text-white/20 font-bold">pts</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Metric: Behavioral Feedback */}
                                        <div className="md:col-span-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <MaterialIcon icon="insights" className="text-primary text-lg" />
                                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">AI Performance Synthesis</span>
                                            </div>
                                            <p className="text-sm md:text-base text-on-surface-variant/80 leading-relaxed italic font-medium">
                                                {q.response.analysis.feedback}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-16">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group relative px-12 py-5 bg-white/5 hover:bg-white/10 text-on-surface font-headline font-extrabold text-xl rounded-2xl transition-all border border-white/10 hover:border-white/30 active:scale-95 flex items-center gap-4 w-full md:w-auto justify-center"
                    >
                        <MaterialIcon icon="arrow_back" className="transition-transform group-hover:-translate-x-1" />
                        <span>Dashboard</span>
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="group relative px-12 py-5 bg-gradient-to-r from-primary to-secondary text-on-primary font-headline font-extrabold text-xl rounded-2xl transition-all shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/40 active:scale-95 flex items-center gap-4 w-full md:w-auto justify-center"
                    >
                        <MaterialIcon icon="print" className="transition-transform group-hover:scale-110" fill />
                        <span>Export Report</span>
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-8 border-t border-outline-variant/10 flex justify-center items-center relative z-10 bg-surface-container-lowest/30">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/40">
                    © 2026 JobJitsu. Confidential AI Career Analysis.
                </p>
            </footer>
        </div>
    );
};

export default SessionFeedback;
