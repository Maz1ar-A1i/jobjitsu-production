import React from 'react';

/**
 * Displays live face-analysis metrics from the ML service.
 * Props:
 *   metrics: { eye_contact: number|null, head_pose: string|null, expression: string|null, face_detected: bool }
 *   isActive: bool – only show when session is active
 */const CandidateFeedback = ({ metrics, isActive }) => {
    if (!isActive) return null;

    const { face_detected, eye_contact, head_pose, expression } = metrics || {};

    // ── Eye Contact Analysis ──────────────────────────────────────────────────────
    const eyePct = eye_contact != null ? Math.round(eye_contact * 100) : null;
    const eyeColor =
        eyePct == null ? 'text-white/20' :
            eyePct >= 70 ? 'text-primary' :
                eyePct >= 40 ? 'text-secondary' : 'text-red-400';
    const eyeBg =
        eyePct == null ? 'bg-white/5 border-white/5' :
            eyePct >= 70 ? 'bg-primary/5 border-primary/20' :
                eyePct >= 40 ? 'bg-secondary/5 border-secondary/20' : 'bg-red-400/5 border-red-400/20';

    // ── Head Pose Analysis ────────────────────────────────────────────────────────
    const poseIcon =
        head_pose === 'straight' ? 'center_focus_strong' :
            head_pose === 'looking down' ? 'arrow_downward' :
                head_pose === 'looking up' ? 'arrow_upward' :
                    head_pose?.startsWith('slight') ? 'north_east' : 'sync_problem';
    
    const poseColor =
        head_pose === 'straight' ? 'text-primary' :
            head_pose?.startsWith('slight') ? 'text-secondary' :
                head_pose != null ? 'text-red-400' : 'text-white/20';

    const poseBg =
        head_pose === 'straight' ? 'bg-primary/5 border-primary/20' :
            head_pose?.startsWith('slight') ? 'bg-secondary/5 border-secondary/20' :
                head_pose != null ? 'bg-red-400/5 border-red-400/20' : 'bg-white/5 border-white/5';

    // ── Expression Analysis ───────────────────────────────────────────────────────
    const exprIcon =
        expression === 'smile' ? 'sentiment_very_satisfied' :
            expression === 'neutral' ? 'sentiment_neutral' :
                expression === 'frown' ? 'sentiment_very_dissatisfied' :
                    expression === 'surprised' ? 'sentiment_satisfied' :
                        expression === 'confused' ? 'help_outline' :
                            expression === 'concerned' ? 'report_problem' : 'pending';

    const exprColor =
        expression === 'smile' ? 'text-primary' :
            expression === 'neutral' ? 'text-primary/60' :
                expression === 'frown' ? 'text-red-400' :
                    expression === 'surprised' ? 'text-secondary' :
                        expression === 'confused' ? 'text-secondary/60' :
                            expression === 'concerned' ? 'text-secondary/80' : 'text-white/20';

    return (
        <div className="w-full flex flex-col gap-3 py-2">
            {/* AI Tracking Status */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${face_detected ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(195,192,255,0.8)]' : 'bg-white/10'}`} />
                    <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">
                        {face_detected ? 'AI Tracking Active' : 'Searching for Face'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {/* Eye Contact Segment */}
                <div className={`rounded-xl border p-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-500 ${eyeBg}`}>
                    <span className={`material-symbols-outlined text-lg ${eyeColor}`}>visibility</span>
                    <div className="flex flex-col items-center leading-none">
                        <span className={`text-sm font-headline font-extrabold tracking-tighter tabular-nums ${eyeColor}`}>
                            {eyePct != null ? `${eyePct}%` : '—'}
                        </span>
                        <span className="text-[8px] text-on-surface-variant/30 font-bold uppercase tracking-widest mt-1">Focus</span>
                    </div>
                </div>

                {/* Head Pose Segment */}
                <div className={`rounded-xl border p-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-500 ${poseBg}`}>
                    <span className={`material-symbols-outlined text-lg ${poseColor}`}>{poseIcon}</span>
                    <div className="flex flex-col items-center leading-none">
                        <span className={`text-[10px] font-bold text-center leading-tight truncate w-full ${poseColor}`}>
                            {head_pose ? head_pose.replace('looking ', '').replace('slight ', 'S. ') : '—'}
                        </span>
                        <span className="text-[8px] text-on-surface-variant/30 font-bold uppercase tracking-widest mt-1">Pose</span>
                    </div>
                </div>

                {/* Expression Segment */}
                <div className={`rounded-xl border p-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-500 ${expression ? 'bg-primary/5 border-primary/20' : 'bg-white/5 border-white/5'}`}>
                    <span className={`material-symbols-outlined text-lg ${exprColor}`}>{exprIcon}</span>
                    <div className="flex flex-col items-center leading-none">
                        <span className={`text-[10px] font-bold text-center leading-tight truncate w-full ${exprColor}`}>
                            {expression || '—'}
                        </span>
                        <span className="text-[8px] text-on-surface-variant/30 font-bold uppercase tracking-widest mt-1">Status</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateFeedback;
