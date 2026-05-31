import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJobs } from '../../services/apis/jobApi';

const Jobs = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('developer');
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const data = await fetchJobs(query);
            setJobs(data.data || []);
        } catch (err) {
            setError('Neural uplink failed. Please retry initialization.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleSearch();
    }, []);

    return (
        <div className="min-h-screen bg-[#0b1326] bg-mesh text-on-surface font-body selection:bg-primary/30 relative overflow-hidden flex flex-col">
            {/* Decorative Background Blurs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Top Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-surface-variant/40 backdrop-blur-xl flex justify-between items-center px-10 h-16 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-on-primary text-xl font-bold">work</span>
                    </div>
                    <h1 className="text-xl font-headline font-bold text-on-surface tracking-tight">Neural <span className="text-primary/80 italic">Market</span></h1>
                </div>

                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
                >
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Exit Hub</span>
                </button>
            </header>

            <main className="flex-1 mt-16 p-10 flex flex-col gap-10 relative z-10 w-full max-w-[1200px] mx-auto overflow-y-auto custom-scrollbar pb-32">
                {/* Search Deployment Station */}
                <div className="flex flex-col gap-8 text-center pt-8">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tighter uppercase">Market <span className="text-primary italic">Intelligence</span> Explorer</h2>
                        <p className="text-sm text-on-surface-variant/60 font-medium font-body italic">
                            Query the global talent grid for optimized career deployments.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="max-w-[700px] mx-auto w-full group relative">
                        <div className="absolute inset-x-0 bottom-[-20px] h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity blur-[1px]" />
                        <div className="glass-panel p-2 pl-6 flex items-center gap-4 border border-white/5 shadow-2xl group-focus-within:border-primary/30 transition-all">
                            <span className="material-symbols-outlined text-on-surface-variant/40 group-focus-within:text-primary transition-colors">hub</span>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search explicitly e.g. 'Senior Frontend in London'..."
                                className="flex-1 bg-transparent border-none outline-none text-on-surface font-medium placeholder:text-on-surface-variant/20 py-3"
                            />
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-primary hover:bg-primary-dark text-on-primary px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all active:scale-95 disabled:opacity-20 shadow-lg shadow-primary/20"
                            >
                                {loading ? (
                                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                ) : (
                                    <span className="material-symbols-outlined text-sm">travel_explore</span>
                                )}
                                {loading ? 'Scanning...' : 'Execute Query'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Market Feed Grid */}
                <div className="flex flex-col gap-6">
                    {error && (
                        <div className="glass-panel p-8 border border-red-500/10 text-center">
                            <span className="material-symbols-outlined text-red-400 text-3xl mb-4">report_problem</span>
                            <p className="text-on-surface-variant italic">{error}</p>
                        </div>
                    )}

                    {!loading && !error && jobs.length === 0 && (
                        <div className="glass-panel p-20 border border-white/5 text-center bg-white/[0.02]">
                            <span className="material-symbols-outlined text-on-surface-variant/20 text-6xl mb-6">dynamic_feed</span>
                            <p className="text-lg text-on-surface-variant/40 font-bold uppercase tracking-[0.3em]">No Deployment Modules Found</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <div key={job.job_id} className="glass-panel p-6 border border-white/5 flex flex-col gap-6 hover:border-primary/20 transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-primary/10 transition-colors" />
                                
                                <div className="flex gap-4 items-start relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-primary/30 transition-colors">
                                        {job.employer_logo ? (
                                            <img src={job.employer_logo} alt={job.employer_name} className="w-10 h-10 object-contain p-1" />
                                        ) : (
                                            <span className="text-xl font-black text-on-surface-variant/20 uppercase">{job.employer_name?.[0] || 'J'}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <h3 className="font-headline font-black text-on-surface tracking-tight text-sm truncate uppercase group-hover:text-primary transition-colors">{job.job_title}</h3>
                                        <p className="text-[11px] font-bold text-primary/60 uppercase tracking-widest truncate">{job.employer_name}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 flex-1">
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                            <span className="material-symbols-outlined text-[12px] text-secondary">location_on</span>
                                            <span className="text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wider">{job.job_city || 'Global'}, {job.job_country}</span>
                                        </div>
                                        {job.job_employment_type && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{job.job_employment_type.replace('_', ' ')}</span>
                                            </div>
                                        )}
                                        {job.job_is_remote && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20 animate-pulse">
                                                <div className="w-1 h-1 rounded-full bg-secondary shadow-lg shadow-secondary/50" />
                                                <span className="text-[9px] font-black text-secondary uppercase tracking-[0.2em]">Remote</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-on-surface-variant/50 font-medium leading-relaxed italic border-l border-white/10 pl-3">
                                        {job.job_description ? job.job_description.slice(0, 160) + '...' : 'Mission particulars classified. Initialize uplink for full telemetry.'}
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    <a
                                        href={job.job_apply_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full h-10 flex items-center justify-center bg-white/5 hover:bg-primary border border-white/10 hover:border-primary text-on-surface hover:text-on-primary rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all group/btn"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Initialize Uplink
                                            <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">rocket_launch</span>
                                        </span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Jobs;
