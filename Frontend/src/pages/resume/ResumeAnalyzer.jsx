import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/* ─── Animated counter hook ─────────────────────────────────────── */
function useCountUp(target, duration = 1200, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start || target === null) return;
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, start, duration]);
    return count;
}

/* ─── Score ring SVG ─────────────────────────────────────────────── */
function ScoreRing({ score, size = 180 }) {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = score === null ? 0 : score / 100;
    const offset = circumference * (1 - pct);

    const color =
        score === null ? '#6b7280' :
        score >= 75 ? '#10b981' :
        score >= 50 ? '#f59e0b' :
        '#ef4444';

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle
                cx={size / 2} cy={size / 2} r={radius}
                fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"
            />
            {/* Progress */}
            <circle
                cx={size / 2} cy={size / 2} r={radius}
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.4s' }}
            />
        </svg>
    );
}

/* ─── Breakdown bar ──────────────────────────────────────────────── */
function BreakdownBar({ label, value, max = 25, icon, delay = 0 }) {
    const pct = value != null ? (value / max) * 100 : 0;
    const color =
        pct >= 75 ? '#10b981' :
        pct >= 50 ? '#f59e0b' :
        '#ef4444';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color }}>{icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>{label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color }}>{value != null ? `${value}/${max}` : '—'}</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: 99,
                    background: color,
                    transition: `width 1.0s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
                    boxShadow: `0 0 8px ${color}60`,
                }} />
            </div>
        </div>
    );
}

/* ─── Score label ────────────────────────────────────────────────── */
function getScoreLabel(score) {
    if (score === null) return { label: 'Awaiting Analysis', color: '#6b7280' };
    if (score >= 85) return { label: 'Excellent — ATS Ready', color: '#10b981' };
    if (score >= 70) return { label: 'Good — Minor Fixes Needed', color: '#34d399' };
    if (score >= 50) return { label: 'Fair — Improvements Needed', color: '#f59e0b' };
    return { label: 'Poor — Significant Work Required', color: '#ef4444' };
}

/* ─── Main component ─────────────────────────────────────────────── */
const ResumeAnalyzer = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [atsScore, setAtsScore] = useState(null);
    const [scoreBreakdown, setScoreBreakdown] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [animateScore, setAnimateScore] = useState(false);

    const displayScore = useCountUp(atsScore, 1200, animateScore);
    const { label: scoreLabel, color: scoreColor } = getScoreLabel(atsScore);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setAnalysis(null);
            setAtsScore(null);
            setScoreBreakdown(null);
            setError(null);
            setAnimateScore(false);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setAnalysis(null);
        setAtsScore(null);
        setScoreBreakdown(null);
        setAnimateScore(false);

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await axios.post('http://localhost:5000/api/ai/analyze-resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000,
            });

            const data = res.data;
            setAnalysis(data.analysis || null);

            const score = typeof data.atsScore === 'number' ? data.atsScore : null;
            setAtsScore(score);
            setScoreBreakdown(data.scoreBreakdown || null);

            // Trigger animation after a brief delay
            setTimeout(() => setAnimateScore(true), 100);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.error || 'Failed to analyze resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const hasSomeResult = analysis || atsScore !== null;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0b1326 0%, #0f1a2e 50%, #0b1326 100%)',
            color: 'rgba(255,255,255,0.9)',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflowX: 'hidden',
        }}>
            {/* Ambient blurs */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(99,102,241,0.08)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(139,92,246,0.08)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

            {/* Header */}
            <header style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
                background: 'rgba(11,19,38,0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0 40px', height: 64,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                    }}>
                        <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 18 }}>troubleshoot</span>
                    </div>
                    <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                        Resume <span style={{ color: '#8b5cf6', fontStyle: 'italic' }}>Analyzer</span>
                    </h1>
                </div>

                <button
                    onClick={() => navigate('/ai-dashboard')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 99, cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                        transition: 'all 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_back</span>
                    Exit Hub
                </button>
            </header>

            {/* Main */}
            <main style={{
                flex: 1, marginTop: 64, padding: '40px 40px 80px',
                maxWidth: 1100, width: '100%', margin: '64px auto 0',
                position: 'relative', zIndex: 1,
                boxSizing: 'border-box',
            }}>
                {/* Page title */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                        Resume <span style={{ color: '#8b5cf6', fontStyle: 'italic' }}>ATS Analysis</span> Center
                    </h2>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0, fontStyle: 'italic' }}>
                        Upload your resume for AI-powered ATS scoring and optimization feedback.
                    </p>
                </div>

                {/* Upload Zone */}
                <div style={{
                    border: `2px dashed ${file ? 'rgba(16,185,129,0.4)' : 'rgba(139,92,246,0.25)'}`,
                    borderRadius: 20,
                    background: file ? 'rgba(16,185,129,0.04)' : 'rgba(139,92,246,0.03)',
                    transition: 'all 0.3s',
                    marginBottom: 24,
                    overflow: 'hidden',
                    cursor: 'pointer',
                }}>
                    <input type="file" accept=".pdf" onChange={handleFileChange} id="file-upload" style={{ display: 'none' }} />
                    <label htmlFor="file-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', cursor: 'pointer' }}>
                        {file ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: 36 }}>check_circle</span>
                                </div>
                                <span style={{ fontSize: 16, fontWeight: 700 }}>{file.name}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(16,185,129,0.6)' }}>PDF Loaded — Click to Swap</span>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ color: '#8b5cf6', fontSize: 36 }}>cloud_upload</span>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Drop Resume Here</div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>PDF files only</div>
                                </div>
                            </div>
                        )}
                    </label>
                </div>

                {/* Analyze Button */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
                    <button
                        onClick={handleAnalyze}
                        disabled={!file || loading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '14px 48px',
                            background: !file || loading ? 'rgba(139,92,246,0.2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none', borderRadius: 16,
                            color: !file || loading ? 'rgba(255,255,255,0.3)' : '#fff',
                            fontSize: 13, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
                            cursor: !file || loading ? 'not-allowed' : 'pointer',
                            boxShadow: file && !loading ? '0 8px 32px rgba(99,102,241,0.35)' : 'none',
                            transition: 'all 0.3s',
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 20, animation: loading ? 'spin 1s linear infinite' : 'none' }}>
                            {loading ? 'sync' : 'analytics'}
                        </span>
                        {loading ? 'Analyzing Resume...' : 'Analyze Resume'}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 12, padding: '14px 20px',
                        marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10,
                        color: '#f87171', fontSize: 13, fontWeight: 500,
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                        {error}
                    </div>
                )}

                {/* Results */}
                {hasSomeResult && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* ATS Score Card */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: 24, padding: 32,
                            display: 'flex', gap: 40, alignItems: 'center',
                            flexWrap: 'wrap',
                            boxShadow: '0 4px 40px rgba(0,0,0,0.3)',
                        }}>
                            {/* Ring */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <ScoreRing score={atsScore} size={180} />
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    gap: 2,
                                }}>
                                    <span style={{
                                        fontSize: atsScore !== null ? 44 : 20,
                                        fontWeight: 900,
                                        color: atsScore !== null ? scoreColor : 'rgba(255,255,255,0.2)',
                                        lineHeight: 1,
                                        transition: 'color 0.4s',
                                        fontVariantNumeric: 'tabular-nums',
                                    }}>
                                        {atsScore !== null ? displayScore : '—'}
                                    </span>
                                    {atsScore !== null && (
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>/100</span>
                                    )}
                                </div>
                            </div>

                            {/* Score info */}
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
                                    ATS Compatibility Score
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: scoreColor, marginBottom: 20, lineHeight: 1.3 }}>
                                    {scoreLabel}
                                </div>

                                {/* Breakdown */}
                                {scoreBreakdown && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <BreakdownBar label="Formatting" value={scoreBreakdown.formatting} icon="format_align_left" delay={0} />
                                        <BreakdownBar label="Keywords" value={scoreBreakdown.keywords} icon="key" delay={100} />
                                        <BreakdownBar label="Experience" value={scoreBreakdown.experience} icon="work" delay={200} />
                                        <BreakdownBar label="Completeness" value={scoreBreakdown.completeness} icon="check_circle" delay={300} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Analysis Panel */}
                        {analysis && (
                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: 24, padding: 36,
                                position: 'relative', overflow: 'hidden',
                                boxShadow: '0 4px 40px rgba(0,0,0,0.3)',
                            }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }} />

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-symbols-outlined" style={{ color: '#8b5cf6', fontSize: 20 }}>psychology</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>AI Analysis Report</div>
                                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>Powered by Cohere command-r</div>
                                    </div>
                                </div>

                                <div
                                    className="prose-analysis"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(analysis)) }}
                                />

                                <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8, opacity: 0.4 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
                                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Analysis Complete</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Global styles for prose and spin */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                .prose-analysis {
                    font-size: 14px;
                    line-height: 1.7;
                    color: rgba(255,255,255,0.82);
                }
                .prose-analysis h1, .prose-analysis h2, .prose-analysis h3 {
                    color: #8b5cf6;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    text-transform: uppercase;
                    margin: 24px 0 10px;
                }
                .prose-analysis h1 { font-size: 16px; }
                .prose-analysis h2 { font-size: 14px; }
                .prose-analysis h3 { font-size: 13px; color: rgba(139,92,246,0.8); }
                .prose-analysis ul, .prose-analysis ol {
                    padding-left: 20px;
                    margin: 8px 0;
                }
                .prose-analysis li {
                    margin: 4px 0;
                    color: rgba(255,255,255,0.75);
                }
                .prose-analysis li::marker { color: #8b5cf6; }
                .prose-analysis strong { color: #a78bfa; }
                .prose-analysis p { margin: 8px 0; }
                .prose-analysis code {
                    background: rgba(139,92,246,0.15);
                    padding: 1px 6px;
                    border-radius: 4px;
                    font-size: 12px;
                    color: #c4b5fd;
                }
            `}</style>
        </div>
    );
};

export default ResumeAnalyzer;
