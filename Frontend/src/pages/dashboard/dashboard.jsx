import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/slice/authSlice";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import logoImage from "../../assets/images/favicon.png";
import { fetchDashboardStats } from "../../services/apis/dashboardApi";
import FloatingChat from "../../components/Chatbot/FloatingChat";

const MOTIVATIONAL_QUOTES = [
  "Every interview is a chance to grow. Keep pushing forward! 🚀",
  "Practice makes perfect — your next session could be your breakthrough! 💪",
  "Success is the sum of small efforts, repeated day in and day out. ⭐",
  "The only way to do great work is to love what you do. 🔥",
  "Your preparation today is tomorrow's performance. 🎯",
  "Believe in yourself — you've got this! 🌟",
];

const MaterialIcon = ({ icon, className = "", fill = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
  >
    {icon}
  </span>
);

export default function DashboardLayout() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth?.currentUser);
  const displayName = currentUser?.name || currentUser?.username || "Guest User";
  const displayEmail = currentUser?.email || "guest@example.com";
  const avatarLetter = (displayName || "G").charAt(0).toUpperCase();
  const firstName = displayName.split(" ")[0];

  const [quote] = useState(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDashboardStats(currentUser?.id);
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
        setStats({
          quickStats: { totalSessions: 0, avgScore: 0, bestScore: 0, streak: 0 },
          dailyProgress: [],
          skillRadar: [
            { skill: 'Communication', value: 0 },
            { skill: 'Technical', value: 0 },
            { skill: 'Confidence', value: 0 },
            { skill: 'Eye Contact', value: 0 },
            { skill: 'Body Language', value: 0 },
            { skill: 'Emotional Control', value: 0 },
          ],
          strengths: [],
          improvements: [],
          recentSessions: [],
          topDomains: [],
        });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [currentUser]);

  // Job searching is handled on the dedicated /jobs page to avoid exhausting the API key.

  const scoreColor = (score) => {
    if (score >= 75) return "#22c55e"; // success
    if (score >= 55) return "#f59e0b"; // warning
    return "#ef4444"; // error
  };


  const avatarUrl = `https://robohash.org/${displayEmail}?set=set2`;
  const qs = stats?.quickStats || { totalSessions: 0, avgScore: 0, streak: 0, bestScore: 0 };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface font-body selection:bg-primary/30">
      <FloatingChat />

      {/* SideNavBar (Authority: JSON) */}
      <aside className="fixed left-0 top-0 h-full w-64 z-50 bg-[#0b1326] flex flex-col py-8 border-r border-white/5 shadow-2xl">
        <div className="px-6 mb-10 flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c3c0ff] to-[#4f46e5] flex items-center justify-center text-on-primary shadow-lg shadow-indigo-900/40 group-hover:scale-110 transition-transform">
            <MaterialIcon icon="psychology" fill />
          </div>
          <div>
            <h1 className="font-headline font-extrabold text-xl bg-gradient-to-br from-[#c3c0ff] to-[#4f46e5] bg-clip-text text-transparent tracking-tighter">JobJitsu</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#dae2fd]/40 font-bold leading-none mt-1">Your Career Copilot</p>
          </div>
        </div>

        <nav className="flex-grow space-y-1 px-4">
          {[
            { to: '/dashboard', icon: 'dashboard', label: 'Dashboard', active: true },
            { to: '/session', icon: 'mic', label: 'Sessions' },
            { to: '/practice', icon: 'fitness_center', label: 'Practice Hub' },
            { to: '/ai-dashboard', icon: 'smart_toy', label: 'AI Assistant' },
            { to: '/jobs', icon: 'work_outline', label: 'Jobs' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className={`w-full py-3 px-4 flex items-center gap-3 font-body font-medium text-sm transition-all duration-200 group ${
                item.active 
                  ? 'text-[#c3c0ff] bg-[#222a3d] border-r-2 border-[#c3c0ff]' 
                  : 'text-[#dae2fd]/50 hover:text-[#dae2fd] hover:bg-[#171f33]'
              }`}
            >
              <MaterialIcon icon={item.icon} className="text-xl" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 mt-auto space-y-1">
          <button 
            onClick={() => navigate('/session')}
            className="w-full mb-6 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-indigo-950/40 hover:brightness-110"
          >
            <MaterialIcon icon="add" className="text-sm" />
            New Session
          </button>
          
          <button 
            onClick={() => navigate('/about')}
            className="w-full text-[#dae2fd]/50 hover:text-[#dae2fd] py-3 px-4 flex items-center gap-3 text-sm font-medium transition-all"
          >
            <MaterialIcon icon="info" className="text-xl" />
            <span>About</span>
          </button>
          
          <button 
            onClick={() => { dispatch(logout()); navigate('/login'); }}
            className="w-full text-[#dae2fd]/50 hover:text-[#dae2fd] py-3 px-4 flex items-center gap-3 text-sm font-medium transition-all"
          >
            <MaterialIcon icon="logout" className="text-xl" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 ml-64 min-h-screen bg-[#0b1326] relative overflow-x-hidden">
        {/* TopAppBar (Authority: JSON) */}
        <header className="fixed top-0 left-64 right-0 z-40 bg-surface-variant/80 backdrop-blur-xl flex justify-end items-center px-10 h-16 border-b border-white/5 shadow-2xl shadow-indigo-900/10">
          <div className="flex items-center gap-6">
            <div className="flex gap-2">

              <button 
                onClick={() => navigate('/account')}
                className="w-10 h-10 flex items-center justify-center text-[#dae2fd]/70 hover:bg-white/5 rounded-xl transition-all active:scale-90"
              >
                <MaterialIcon icon="settings" />
              </button>
            </div>
            
            <div className="relative group">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="h-9 w-9 rounded-full overflow-hidden bg-surface-container-high border-2 border-primary/20 hover:border-primary transition-all p-0.5"
              >
                <img src={avatarUrl} alt="Account" className="w-full h-full object-cover rounded-full" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-64 bg-[#171f33] border border-white/10 rounded-2xl shadow-2xl p-4 z-[100] animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-4 p-2">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-white/5">
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black truncate text-white uppercase tracking-wider">{displayName}</p>
                      <p className="text-[9px] text-[#dae2fd]/40 font-bold truncate tracking-widest leading-tight">{displayEmail}</p>
                    </div>
                  </div>
                  <div className="space-y-1">

                    <button 
                      onClick={() => { setShowDropdown(false); dispatch(logout()); navigate('/login'); }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-error/5 text-error hover:bg-error/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                      <MaterialIcon icon="logout" className="text-lg opacity-60" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="pt-24 pb-12 px-10 w-full space-y-10 relative z-10 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <p className="text-on-surface-variant font-black uppercase tracking-widest text-sm">Updating your dashboard...</p>
            </div>
          ) : (
            <>
              {/* Welcome Message */}
              <div className="flex flex-col gap-2 animate-fade-in-up">
                <h2 className="font-headline font-extrabold text-4xl text-on-surface tracking-tight">
                  Welcome back, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{firstName}! ✨</span>
                </h2>
                <p className="text-on-surface-variant/70 text-lg font-medium max-w-xl italic">
                  "{quote}" 🔥
                </p>
              </div>

              {/* Stats Row: Bento Grid Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Sessions", value: qs.totalSessions, sub: "+0 this week", color: "primary", icon: "analytics" },
                  { label: "Avg Score", value: `${qs.avgScore}%`, sub: "Improving", color: "secondary", icon: "trending_up" },
                  { label: "Day Streak", value: qs.streak, sub: "Keep it up!", color: "tertiary", icon: "bolt" },
                  { label: "Best Score", value: qs.bestScore, sub: "Target: 80", color: "primary-container", icon: "stars" }
                ].map((stat, i) => (
                  <div key={i} className="bg-surface-container p-6 rounded-2xl flex flex-col gap-1 relative overflow-hidden group border border-white/5 hover:border-white/10 transition-all shadow-xl">
                    <div className={`absolute -right-4 -top-4 w-16 h-16 bg-${stat.color}/10 rounded-full blur-2xl group-hover:bg-${stat.color}/20 transition-colors`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-outline/60">{stat.label}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-headline font-bold text-white">{stat.value}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-tighter ${
                        stat.color === 'primary' ? 'text-secondary' : 
                        stat.color === 'secondary' ? 'text-tertiary' : 
                        stat.color === 'tertiary' ? 'text-primary' : 'text-outline/40'
                      }`}>{stat.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Daily Progress */}
                <div className="lg:col-span-3 bg-surface-container p-8 rounded-2xl border border-white/5 space-y-6 shadow-xl">
                  <div className="flex justify-between items-center">
                    <h3 className="font-headline font-bold text-lg text-white">Daily Progress</h3>
                    <div className="flex gap-2 items-center">
                      <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(195,192,255,0.5)]" />
                      <span className="text-[10px] text-outline font-black uppercase tracking-widest">Performance Trend</span>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    {stats.dailyProgress.length > 0 ? (
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={stats.dailyProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                           <defs>
                             <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#c3c0ff" stopOpacity={0.3} />
                               <stop offset="95%" stopColor="#c3c0ff" stopOpacity={0} />
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="6 6" stroke="rgba(255,255,255,0.03)" vertical={false} />
                           <XAxis
                             dataKey="date"
                             axisLine={false}
                             tickLine={false}
                             tick={{ fill: '#918fa1', fontSize: 10, fontWeight: 900 }}
                             tickFormatter={formatDate}
                             dy={10}
                           />
                           <YAxis
                             domain={[0, 100]}
                             axisLine={false}
                             tickLine={false}
                             tick={{ fill: '#918fa1', fontSize: 10, fontWeight: 900 }}
                             dx={-10}
                           />
                           <RechartsTooltip
                             contentStyle={{
                               background: '#171f33',
                               border: '1px solid rgba(255,255,255,0.1)',
                               borderRadius: '1rem',
                               padding: '12px'
                             }}
                             labelStyle={{ color: '#c3c0ff', fontWeight: 900, marginBottom: '4px', fontSize: '10px' }}
                             itemStyle={{ color: '#fff', fontWeight: 700, fontSize: '12px' }}
                           />
                           <Area
                             type="monotone"
                             dataKey="score"
                             stroke="#c3c0ff"
                             strokeWidth={3}
                             fill="url(#scoreGradient)"
                             dot={{ r: 4, fill: '#0b1326', stroke: '#c3c0ff', strokeWidth: 2 }}
                           />
                         </AreaChart>
                       </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full opacity-20">
                         <MaterialIcon icon="bolt" className="text-4xl mb-2" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Awaiting session feedback...</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between px-4 text-[10px] font-black text-outline/40 tracking-widest uppercase">
                    <span>Performance Trends</span>
                  </div>
                </div>

                {/* Skill Breakdown */}
                <div className="lg:col-span-2 bg-surface-container p-8 rounded-2xl border border-white/5 space-y-8 flex flex-col shadow-xl">
                  <h3 className="font-headline font-bold text-lg text-white">Skill Matrix</h3>
                  <div className="flex-1 flex items-center justify-center relative py-2">
                    {stats.skillRadar.some(s => s.value > 0) ? (
                       <ResponsiveContainer width="100%" height="100%">
                         <RadarChart data={stats.skillRadar} outerRadius="70%">
                           <PolarGrid stroke="rgba(255,255,255,0.05)" />
                           <PolarAngleAxis
                             dataKey="skill"
                             tick={{ fill: '#918fa1', fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }}
                           />
                           <Radar
                             name="Skill"
                             dataKey="value"
                             stroke="#4cd7f6"
                             fill="#4cd7f6"
                             fillOpacity={0.2}
                             strokeWidth={3}
                           />
                         </RadarChart>
                       </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full opacity-20">
                         <div className="w-32 h-32 border border-white/5 radar-grid rotate-12 flex items-center justify-center">
                           <MaterialIcon icon="target" className="text-3xl" />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest mt-4">Awaiting assessment...</p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest text-outline">
                    <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(76,215,246,0.5)]"></span> Confidence: 72%</div>
                    <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(251,171,255,0.5)]"></span> Technical: 45%</div>
                  </div>
                </div>
              </div>

              {/* Insights Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Strengths */}
                <div className="bg-surface-container-low p-8 rounded-2xl border-l-4 border-secondary/40 shadow-xl space-y-6">
                  <div className="flex items-center gap-3">
                    <MaterialIcon icon="verified" className="text-secondary" fill />
                    <h3 className="font-headline font-bold text-lg text-white">Your Strengths</h3>
                  </div>
                  <ul className="space-y-6">
                    {stats.strengths.length > 0 ? stats.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(76,215,246,0.5)] flex-shrink-0" />
                        <p className="text-xs font-bold text-on-surface-variant leading-relaxed tracking-tight">{s.text}</p>
                      </li>
                    )) : (
                      <p className="text-[10px] text-outline uppercase tracking-widest opacity-40 italic">Analyzing your strengths...</p>
                    )}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="bg-surface-container-low p-8 rounded-2xl border-l-4 border-error/40 shadow-xl space-y-6">
                  <div className="flex items-center gap-3">
                    <MaterialIcon icon="warning" className="text-error" fill />
                    <h3 className="font-headline font-bold text-lg text-white">Areas to Improve</h3>
                  </div>
                  <ul className="space-y-6">
                    {stats.improvements.length > 0 ? stats.improvements.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-error shadow-[0_0_8px_rgba(255,180,171,0.5)] flex-shrink-0" />
                        <p className="text-xs font-bold text-on-surface-variant leading-relaxed tracking-tight">{s.text}</p>
                      </li>
                    )) : (
                      <p className="text-[10px] text-outline uppercase tracking-widest opacity-40 italic">Analyzing growth vectors...</p>
                    )}
                  </ul>
                </div>

                {/* Job Board CTA — search happens on /jobs, not here */}
                <div className="bg-surface-container p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col justify-between gap-6">
                  <div className="space-y-2">
                    <h3 className="font-headline font-bold text-lg text-white">Job Board</h3>
                    <p className="text-[11px] text-on-surface-variant/60 font-medium leading-relaxed">
                      Search thousands of live job listings tailored to your skills and domain. Use filters, keywords, and location to find your next opportunity.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-outline/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(76,215,246,0.5)]"></span> Real-time listings via JSearch
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-outline/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(195,192,255,0.5)]"></span> Filter by title, location &amp; type
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-outline/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(251,171,255,0.5)]"></span> Direct apply links
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/jobs')}
                    className="w-full bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 border border-primary/30 hover:border-primary/50 text-primary py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <MaterialIcon icon="work_outline" className="text-base" />
                    Browse Job Listings
                  </button>
                </div>
              </div>

              {/* Recent Sessions Table */}
              <div className="bg-surface-container rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <div className="px-8 py-6 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
                  <h3 className="font-headline font-bold text-lg text-white">Session History</h3>
                  <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:brightness-125 transition-all">Export Archive</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] font-extrabold text-outline uppercase tracking-[0.2em] bg-surface-container-low/50">
                        <th className="px-8 py-5">Core Domain</th>
                        <th className="px-8 py-5">Proficiency</th>
                        <th className="px-8 py-5">Date</th>
                        <th className="px-8 py-5 text-center">Score %</th>
                        <th className="px-8 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats.recentSessions.length > 0 ? stats.recentSessions.map((s, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-6 flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                              <MaterialIcon icon="bolt" className="text-xl" />
                            </div>
                            <span className="text-[13px] font-black text-white">{s.domain || s.title || `Session Cycle ${i+1}`}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="bg-primary/10 text-primary-fixed-dim px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border border-primary/20">Expert</span>
                          </td>
                          <td className="px-8 py-6 text-[10px] font-black text-outline uppercase tracking-widest">{formatDate(s.date)}</td>
                          <td className="px-8 py-6">
                            <div className="max-w-[120px] mx-auto">
                              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-1.5">
                                <div 
                                  className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_8px_rgba(195,192,255,0.4)]" 
                                  style={{ width: `${s.avgScore}%` }} 
                                />
                              </div>
                              <p className="text-center font-black text-[10px] text-on-surface tracking-tighter opacity-80">{s.avgScore}%</p>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => navigate(`/session/${s.id}/feedback`)}
                              className="bg-surface-container-high hover:bg-surface-container-highest text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-indigo-500/30 active:scale-95 flex items-center gap-2 ml-auto"
                            >
                              Review Session <MaterialIcon icon="chevron_right" className="text-base" />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="px-8 py-16 text-center opacity-30 italic font-bold uppercase tracking-widest text-[11px]">
                            Session history is currently empty. Awaiting first session.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

