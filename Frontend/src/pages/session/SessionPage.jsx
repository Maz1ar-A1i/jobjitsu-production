import React, { useState, useEffect, useRef, useCallback } from 'react';
import AvatarPanel from '../../components/session/AvatarPanel';
import CameraPreview from '../../components/session/CameraPreview';
import CandidateFeedback from '../../components/session/CandidateFeedback';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { AvatarOrchestrator } from '../../utils/AvatarOrchestrator';

// ─── Interview Phase Constants ───────────────────────────────────────────────
const PHASE = {
    AVATAR_SPEAKING: 'avatar_speaking',
    LISTENING: 'listening',
    PROCESSING: 'processing',
};

const SILENCE_TIMEOUT_MS = 5000; // 5 seconds of silence before auto-submit

const SessionPage = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('initializing'); // initializing, selection, ready, active, completed
    const [activeAvatar, setActiveAvatar] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [mediaStream, setMediaStream] = useState(null);

    // Orchestrator
    const orchestrator = useRef(new AvatarOrchestrator());
    const [currentQuestionText, setCurrentQuestionText] = useState("");
    const [questionsAskedCount, setQuestionsAskedCount] = useState(0);

    // ─── Interview Phase State Machine ───────────────────────────────────────
    const [interviewPhase, setInterviewPhase] = useState(PHASE.AVATAR_SPEAKING);

    // ─── STT State (Deepgram WebSocket streaming) ────────────────────────────
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const [isListening, setIsListening] = useState(false);
    const transcriptRef = useRef("");
    const dgSocketRef = useRef(null);
    const micStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    // ─── Silence detection ───────────────────────────────────────────────────
    const silenceTimerRef = useRef(null);
    const [silenceCountdown, setSilenceCountdown] = useState(null);
    const silenceCountdownIntervalRef = useRef(null);
    const lastSpeechTimeRef = useRef(Date.now());
    const hasSpokenRef = useRef(false); // Track if user spoke at all

    // ─── Session config ──────────────────────────────────────────────────────
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState('Mid');

    // ─── Feedback ────────────────────────────────────────────────────────────
    const [currentFeedback, setCurrentFeedback] = useState(null);
    const [feedbackData, setFeedbackData] = useState(null);

    // ─── Audio & Lip-Sync ────────────────────────────────────────────────────
    const [audioData, setAudioData] = useState({ base64: null, visemes: [] });

    // ─── Face Analysis ───────────────────────────────────────────────────────
    const [faceMetrics, setFaceMetrics] = useState({ face_detected: false, eye_contact: null, head_pose: null, expression: null });
    const captureCanvasRef = useRef(null);
    const videoElRef = useRef(null);

    // ─── Pause ───────────────────────────────────────────────────────────────
    const [isPaused, setIsPaused] = useState(false);

    // Guard against double-submissions
    const isSubmittingRef = useRef(false);

    // ─── State Refs (to prevent stale closures in async handlers) ────────────
    const sessionIdRef = useRef(sessionId);
    const activeAvatarRef = useRef(activeAvatar);
    const currentQuestionTextRef = useRef(currentQuestionText);
    const faceMetricsRef = useRef(faceMetrics);
    const questionsAskedCountRef = useRef(questionsAskedCount);
    const isPausedRef = useRef(isPaused);
    const statusRef = useRef(status);

    useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
    useEffect(() => { activeAvatarRef.current = activeAvatar; }, [activeAvatar]);
    useEffect(() => { currentQuestionTextRef.current = currentQuestionText; }, [currentQuestionText]);
    useEffect(() => { faceMetricsRef.current = faceMetrics; }, [faceMetrics]);
    useEffect(() => { questionsAskedCountRef.current = questionsAskedCount; }, [questionsAskedCount]);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    useEffect(() => { statusRef.current = status; }, [status]);



    useEffect(() => {
        console.log('SessionPage mounted');
        setStatus('selection');
    }, []);

    // ────────────────────────────────────────────────────────────────────────
    // Deepgram WebSocket Streaming — REF-BASED (no stale closures)
    // ────────────────────────────────────────────────────────────────────────

    // ─── Core action ref: always points to the LATEST version of doAutoSubmit ──
    // This ref is the key fix. All timers & WS callbacks call through this ref
    // so they never capture a stale version of submitAnswer / nextQuestion / etc.
    const doAutoSubmitRef = useRef(null);

    // ─── Stop silence detection timer ────────────────────────────────────────
    const stopSilenceDetectionTimer = useCallback(() => {
        if (silenceTimerRef.current) {
            clearInterval(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        setSilenceCountdown(null);
    }, []);

    // ─── Reset silence detection timer (on speech) ───────────────────────────
    const resetSilenceDetectionTimer = useCallback(() => {
        lastSpeechTimeRef.current = Date.now();
    }, []);

    // ─── Stop Deepgram streaming ─────────────────────────────────────────────
    const stopDeepgramStreaming = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try { mediaRecorderRef.current.stop(); } catch (err) { /* ignore */ }
            mediaRecorderRef.current = null;
        }
        if (dgSocketRef.current) {
            if (dgSocketRef.current.readyState === WebSocket.OPEN) {
                dgSocketRef.current.close();
            }
            dgSocketRef.current = null;
        }
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(track => track.stop());
            micStreamRef.current = null;
        }
        setIsListening(false);
        stopSilenceDetectionTimer();
    }, [stopSilenceDetectionTimer]);

    // ─── Start silence detection timer ───────────────────────────────────────
    const startSilenceDetectionTimer = useCallback(() => {
        stopSilenceDetectionTimer();
        lastSpeechTimeRef.current = Date.now();
        setSilenceCountdown(SILENCE_TIMEOUT_MS / 1000);

        silenceTimerRef.current = setInterval(() => {
            if (isPausedRef.current) {
                lastSpeechTimeRef.current = Date.now();
                return;
            }
            const elapsed = Date.now() - lastSpeechTimeRef.current;
            const remaining = Math.max(0, Math.ceil((SILENCE_TIMEOUT_MS - elapsed) / 1000));
            setSilenceCountdown(remaining);

            if (elapsed >= SILENCE_TIMEOUT_MS) {
                console.log('[Session] Client-side silence limit reached (5s). Auto-submitting.');
                clearInterval(silenceTimerRef.current);
                silenceTimerRef.current = null;
                setSilenceCountdown(null);
                // Call through the ref — always latest version
                if (doAutoSubmitRef.current) doAutoSubmitRef.current();
            }
        }, 250);
    }, [stopSilenceDetectionTimer]);

    // ─── Start Deepgram WebSocket streaming ──────────────────────────────────
    const startDeepgramStreaming = useCallback(async () => {
        if (isPausedRef.current) return;

        // Clean up any prior connection
        stopDeepgramStreaming();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            });
            micStreamRef.current = stream;

            const dgKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
            if (!dgKey) {
                console.error('[Deepgram] No API key found in VITE_DEEPGRAM_API_KEY');
                return;
            }

            // Note: endpointing is set to 300ms (fast VAD cut), but we rely on
            // our own client-side 5s timer for the actual auto-submit.
            // utterance_end_ms=5000 serves as a secondary server-side signal.
            const wsUrl = `wss://api.deepgram.com/v1/listen?` +
                `model=nova-2&` +
                `language=en&` +
                `smart_format=true&` +
                `interim_results=true&` +
                `endpointing=300&` +
                `vad_events=true&` +
                `utterance_end_ms=${SILENCE_TIMEOUT_MS}`;

            console.log('[Deepgram] Connecting to WebSocket...');
            const ws = new WebSocket(wsUrl, ['token', dgKey]);
            dgSocketRef.current = ws;

            ws.onopen = () => {
                console.log('[Deepgram] ✅ WebSocket connected — streaming started');
                setIsListening(true);
                setInterviewPhase(PHASE.LISTENING);
                hasSpokenRef.current = false;
                lastSpeechTimeRef.current = Date.now();

                startSilenceDetectionTimer();

                // Create MediaRecorder to stream mic audio to Deepgram
                const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm';
                console.log('[Deepgram] Using MIME type:', mimeType);
                const recorder = new MediaRecorder(stream, { mimeType });
                mediaRecorderRef.current = recorder;

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
                        ws.send(e.data);
                    }
                };

                recorder.start(250); // Send audio chunks every 250ms
                console.log('[Deepgram] MediaRecorder started (250ms chunks)');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // VAD: Speech started — reset silence timer
                    if (data.type === 'SpeechStarted') {
                        console.log('[Deepgram] 🎙 Speech detected — resetting silence timer');
                        hasSpokenRef.current = true;
                        resetSilenceDetectionTimer();
                        return;
                    }

                    // Utterance End — server says user has been silent for utterance_end_ms
                    if (data.type === 'UtteranceEnd') {
                        console.log('[Deepgram] ⏸ UtteranceEnd — user silent for 5s');
                        if (hasSpokenRef.current && doAutoSubmitRef.current) {
                            doAutoSubmitRef.current();
                        }
                        return;
                    }

                    // Transcript results
                    if (data.channel?.alternatives?.length > 0) {
                        const text = data.channel.alternatives[0].transcript || '';

                        if (text) {
                            hasSpokenRef.current = true;
                            resetSilenceDetectionTimer();

                            if (data.is_final) {
                                console.log('[Deepgram] 📝 Final:', text);
                                setTranscript(prev => {
                                    const updated = prev ? `${prev} ${text}` : text;
                                    transcriptRef.current = updated;
                                    return updated;
                                });
                                setInterimTranscript("");
                            } else {
                                setInterimTranscript(text);
                            }
                        }

                        // speech_final with endpointing=300ms fires quickly.
                        // Do NOT auto-submit on speech_final — we only use our 5s timer
                        // and the UtteranceEnd event for auto-submit.
                    }
                } catch (err) {
                    console.warn('[Deepgram] Message parse error:', err);
                }
            };

            ws.onerror = (err) => {
                console.error('[Deepgram] ❌ WebSocket error:', err);
            };

            ws.onclose = (event) => {
                console.log('[Deepgram] WebSocket closed:', event.code, event.reason);
                setIsListening(false);
                stopSilenceDetectionTimer();
            };

        } catch (err) {
            console.error('[Deepgram] Error starting streaming:', err);
            alert("Microphone access denied or error occurred.");
        }
    }, [startSilenceDetectionTimer, stopDeepgramStreaming, resetSilenceDetectionTimer]);

    // ─── Avatar finished speaking → auto-open mic ────────────────────────────
    const handleSpeechEnd = useCallback(() => {
        console.log('[Session] Avatar finished speaking — auto-opening mic');
        if (statusRef.current === 'active' && !isPausedRef.current) {
            setTranscript("");
            setInterimTranscript("");
            transcriptRef.current = "";
            isSubmittingRef.current = false;
            // Small delay to let the TTS audio fully release before mic opens
            setTimeout(() => {
                startDeepgramStreaming();
            }, 800);
        }
    }, [startDeepgramStreaming]);

    // ─── TTS ─────────────────────────────────────────────────────────────────
    async function fetchAndPlayAudio(text, avatarId) {
        setInterviewPhase(PHASE.AVATAR_SPEAKING);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${apiUrl}/session/generate-audio`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ text, avatar_id: avatarId })
            });

            if (res.ok) {
                const data = await res.json();
                setAudioData({ base64: data.audioBase64, visemes: data.visemes });
            } else {
                console.warn("TTS failed, using browser fallback");
                fallbackTTS(text);
            }
        } catch (err) {
            console.error("Audio generation failed:", err);
            fallbackTTS(text);
        }
    }

    function fallbackTTS(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => handleSpeechEnd();
            window.speechSynthesis.speak(utterance);
        } else {
            setTimeout(() => handleSpeechEnd(), 1000);
        }
    }

    // ─── Session Initialization ──────────────────────────────────────────────

    const handleStartSession = async () => {
        if (!selectedDomain) {
            alert("Please select a domain.");
            return;
        }

        setStatus('initializing');
        try {
            const payload = {
                domain: selectedDomain,
                experienceLevel: selectedLevel
            };

            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${apiUrl}/session/init`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setSessionId(data.session_id);
                if (data.first_question) {
                    setActiveAvatar(data.first_question.avatar);
                    setCurrentQuestionText(data.first_question.text);
                    setQuestionsAskedCount(1);
                }
                setStatus('ready');
            } else {
                alert(`Failed: ${data.message}`);
                setStatus('selection');
            }
        } catch (error) {
            console.error('Error initializing session:', error);
            setStatus('selection');
        }
    };

    const handleStreamReady = useCallback((stream) => {
        setMediaStream(stream);
    }, []);

    const handleVideoReady = useCallback((videoEl) => {
        videoElRef.current = videoEl;
    }, []);

    // ─── Face analysis polling ───────────────────────────────────────────────
    useEffect(() => {
        if (status !== 'active') return;

        const ML_URL = 'http://localhost:8000';

        const captureAndAnalyze = async () => {
            const videoEl = videoElRef.current;
            const canvas = captureCanvasRef.current;
            if (!videoEl || !canvas || videoEl.readyState < 2) return;

            canvas.width = videoEl.videoWidth || 640;
            canvas.height = videoEl.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(videoEl, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();

            canvas.toBlob(async (blob) => {
                if (!blob) return;
                try {
                    const form = new FormData();
                    form.append('file', blob, 'frame.jpg');
                    const res = await fetch(`${ML_URL}/analyze/frame`, { method: 'POST', body: form });
                    if (res.ok) {
                        const data = await res.json();
                        setFaceMetrics(data);
                    }
                } catch (err) {
                    console.warn('[FaceAnalysis] ML service unreachable:', err.message);
                }
            }, 'image/jpeg', 0.7);
        };

        const intervalId = setInterval(captureAndAnalyze, 2000);
        return () => clearInterval(intervalId);
    }, [status]);

    // ─── Start the interview ─────────────────────────────────────────────────

    const startInterview = () => {
        setStatus('active');
        setInterviewPhase(PHASE.AVATAR_SPEAKING);
        fetchAndPlayAudio(currentQuestionText, activeAvatar);
    };

    // ─── Submit Answer ───────────────────────────────────────────────────────

    async function submitAnswer() {
        const currentTranscript = transcriptRef.current || "(No answer provided)";
        setInterviewPhase(PHASE.PROCESSING);
        setTranscript("");
        setInterimTranscript("");
        transcriptRef.current = "";

        console.log("[Session] Submitting transcript:", currentTranscript.substring(0, 80) + "...");

        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${apiUrl}/session/response`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    session_id: sessionIdRef.current,
                    avatar_id: activeAvatarRef.current,
                    question_text: currentQuestionTextRef.current,
                    response_data: {
                        audioUrl: "streamed_audio",
                        transcript: currentTranscript,
                        durationSeconds: 0,
                        faceMetrics: faceMetricsRef.current,
                    }
                })
            });

            const data = await res.json();
            if (res.ok) {
                await nextQuestion();
            }
        } catch (error) {
            console.error("Error saving response:", error);
            // Still try to move forward
            await nextQuestion();
        }
    }

    // Keep the doAutoSubmitRef updated on every render so callback/timers never use stale closures
    useEffect(() => {
        doAutoSubmitRef.current = () => {
            if (isSubmittingRef.current) return;
            isSubmittingRef.current = true;
            console.log('[Session] Auto-submitting response...');
            stopDeepgramStreaming();
            submitAnswer();
        };
    });

    // ─── Next Question ───────────────────────────────────────────────────────

    async function nextQuestion() {
        setCurrentFeedback(null);
        setTranscript("");
        setInterimTranscript("");
        setIsListening(false);
        isSubmittingRef.current = false;

        let nextAvatar = activeAvatarRef.current;
        let nextCount = questionsAskedCountRef.current;

        if (nextCount >= 5) {
            const nextAvatarId = orchestrator.current.getNextAvatar(nextAvatar);

            if (nextAvatarId === 'hr' && nextAvatar === 'team_lead') {
                await endSession();
                return;
            }

            nextAvatar = nextAvatarId;
            nextCount = 0;
            setActiveAvatar(nextAvatar);
            setQuestionsAskedCount(0);
        }

        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${apiUrl}/session/next-question`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    session_id: sessionIdRef.current,
                    avatar_id: nextAvatar,
                    current_question_count: nextCount
                })
            });

            const data = await res.json();
            if (res.ok) {
                setCurrentQuestionText(data.question);
                setQuestionsAskedCount(nextCount + 1);
                setInterviewPhase(PHASE.AVATAR_SPEAKING);
                fetchAndPlayAudio(data.question, nextAvatar);
            }
        } catch (error) {
            console.error("Error fetching next question:", error);
        }
    }

    // ─── Manual Skip ─────────────────────────────────────────────────────────

    const handleSkipQuestion = () => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        stopDeepgramStreaming();
        submitAnswer();
    };

    // ─── Pause / Resume ──────────────────────────────────────────────────────

    const togglePause = () => {
        if (isPaused) {
            setIsPaused(false);
            if (interviewPhase === PHASE.LISTENING) {
                startDeepgramStreaming();
            }
        } else {
            setIsPaused(true);
            stopDeepgramStreaming();
        }
    };

    // ─── End Session ─────────────────────────────────────────────────────────

    async function endSession() {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        stopDeepgramStreaming();

        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            await fetch(`${apiUrl}/session/end`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ session_id: sessionIdRef.current })
            });

            setStatus('completed');
            setActiveAvatar(null);

            const feedbackRes = await fetch(`${apiUrl}/session/${sessionIdRef.current}/feedback`, { headers });
            const data = await feedbackRes.json();
            setFeedbackData(data);
        } catch (error) {
            console.error('Error ending session:', error);
        }
    }

    // ─── Cleanup on unmount ──────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            stopDeepgramStreaming();
            stopSilenceDetectionTimer();
        };
    }, [stopDeepgramStreaming, stopSilenceDetectionTimer]);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

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
                    <h1 className="text-xl font-headline font-bold text-on-surface tracking-tight">AI Interview <span className="text-primary/80 italic">Assistant</span></h1>
                </div>

                <div className="flex items-center gap-6">
                    {status === 'active' && (
                        <div className="flex items-center gap-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                            <span className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest">Question</span>
                            <span className="text-sm font-bold text-primary font-headline">
                                {questionsAskedCount} <span className="text-white/20">/</span> 5
                            </span>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-surface-container/40 border border-white/5 shadow-inner">
                        <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-white/20'}`}></span>
                        <span className="text-xs font-bold text-on-surface/80 uppercase tracking-widest">
                            {status === 'active' ? (isPaused ? 'Paused' : 'Live Session') : status === 'completed' ? 'Analysis Complete' : 'System Ready'}
                        </span>
                    </div>

                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 flex items-center justify-center text-on-surface/70 hover:bg-white/5 rounded-xl transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            </header>

            {/* Domain/Level Selection Modal */}
            {status === 'selection' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0b1326]/80 backdrop-blur-md animate-fade-in">
                    <div className="glass-panel p-10 rounded-[2.5rem] max-w-4xl w-full border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />

                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-headline font-extrabold text-on-surface mb-3 tracking-tight">Configure Your Session</h2>
                            <p className="text-on-surface-variant/70 text-lg">Select your specialization and mastery level for the AI Career Assistant.</p>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">Vocational Domain</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {['Java Developer', 'Full Stack Developer', 'AI / ML Engineer'].map((domain) => (
                                        <button
                                            key={domain}
                                            onClick={() => setSelectedDomain(domain)}
                                            className={`group p-6 rounded-2xl border transition-all text-left relative overflow-hidden ${selectedDomain === domain
                                                ? 'bg-primary/10 border-primary shadow-[0_0_30px_rgba(195,192,255,0.15)] ring-1 ring-primary/40'
                                                : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/[0.08]'
                                                }`}
                                        >
                                            <div className="flex flex-col gap-1 relative z-10">
                                                <span className={`text-base font-bold transition-colors ${selectedDomain === domain ? 'text-primary' : 'text-on-surface/80 group-hover:text-on-surface'}`}>
                                                    {domain}
                                                </span>
                                                <span className="text-xs text-on-surface-variant/50">Industry Standard Evaluation</span>
                                            </div>
                                            {selectedDomain === domain && (
                                                <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40">
                                                    <span className="material-symbols-outlined text-on-primary text-xs">check</span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] ml-2">Experience Level</label>
                                <div className="flex gap-4">
                                    {['Junior', 'Mid', 'Senior'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setSelectedLevel(level)}
                                            className={`flex-1 py-4 px-6 rounded-xl font-bold text-sm transition-all border ${selectedLevel === level
                                                ? 'bg-secondary text-on-secondary border-secondary shadow-lg shadow-secondary/20 scale-105'
                                                : 'bg-white/5 text-on-surface-variant/60 border-white/10 hover:bg-white/10 hover:text-on-surface'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleStartSession}
                                disabled={!selectedDomain}
                                className={`w-full py-5 rounded-2xl font-headline font-extrabold text-xl transition-all transform active:scale-95 ${selectedDomain
                                    ? 'bg-gradient-to-r from-primary to-secondary text-on-primary shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1'
                                    : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                    }`}
                            >
                                Start AI Session
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {status === 'initializing' && (
                <div className="p-4 bg-yellow-100 text-yellow-800 rounded mb-4">
                    Initializing Session with {selectedDomain} ({selectedLevel})...
                </div>
            )}

            <main className="flex-grow flex flex-col pt-20 pb-10 px-10 gap-6 overflow-hidden">
                {/* TOP SECTION: Avatars + Camera */}
                <div className="flex-[3] flex flex-col lg:flex-row gap-6 min-h-[400px] max-h-[55vh]">
                    <div className="flex-[3] min-w-0">
                        <AvatarPanel activeAvatar={activeAvatar} audioData={audioData} onSpeechEnd={handleSpeechEnd} />
                    </div>

                    <div className="flex-[1] glass-panel rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl flex flex-col group">
                        <div className="w-full py-3 px-4 text-center border-b bg-white/5 border-white/5 backdrop-blur-md">
                            <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-[0.2em]">Live Stream (You)</span>
                        </div>
                        <div className="flex-grow relative h-full w-full bg-black/40">
                            <CameraPreview onStreamReady={handleStreamReady} onVideoReady={handleVideoReady} />
                            
                            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-primary/40 rounded-tl pointer-events-none group-hover:border-primary transition-colors" />
                            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-primary/40 rounded-tr pointer-events-none group-hover:border-primary transition-colors" />
                            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-primary/40 rounded-bl pointer-events-none group-hover:border-primary transition-colors" />
                            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-primary/40 rounded-br pointer-events-none group-hover:border-primary transition-colors" />
                        </div>
                        <div className="p-1 px-3 bg-primary/5 border-t border-white/5">
                            <CandidateFeedback metrics={faceMetrics} isActive={status === 'active'} />
                        </div>
                    </div>
                    <canvas ref={captureCanvasRef} className="hidden" aria-hidden="true" />
                </div>

                {/* BOTTOM SECTION: Question + Auto-Flow Controls */}
                <div className="flex-[1.5] glass-panel rounded-3xl border border-white/10 shadow-2xl p-8 flex flex-col relative overflow-hidden">
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative z-10 w-full flex flex-col h-full">
                        {/* READY STATE */}
                        {status === 'ready' && (
                            <div className="flex flex-col items-center justify-center flex-grow gap-6 animate-fade-in text-center">
                                <div className="space-y-3">
                                    <h3 className="text-3xl font-headline font-extrabold text-on-surface">AI Connection Established</h3>
                                    <p className="text-on-surface-variant/70 text-lg max-w-lg mx-auto italic">Ready to begin your vocational evaluation? The mentors are awaiting your signal.</p>
                                    <p className="text-on-surface-variant/40 text-sm max-w-md mx-auto mt-2">
                                        🎤 Your microphone will <strong className="text-primary">automatically open</strong> after each question. Just speak naturally — no buttons needed.
                                    </p>
                                </div>
                                <button
                                    onClick={startInterview}
                                    className="group relative px-12 py-5 bg-gradient-to-r from-primary to-secondary text-on-primary font-headline font-extrabold text-xl rounded-2xl transition-all shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 active:scale-95"
                                >
                                    <span className="relative z-10">Start Interview Session</span>
                                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        )}

                        {/* ACTIVE STATE */}
                        {status === 'active' && !currentFeedback && (
                            <div className="animate-fade-in h-full flex flex-col">
                                {/* Avatar + Question Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${activeAvatar === 'hr' ? 'bg-primary/20 text-primary' : activeAvatar === 'technical' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                                        <span className="material-symbols-outlined">
                                            {activeAvatar === 'hr' ? 'person' : activeAvatar === 'technical' ? 'terminal' : 'supervisor_account'}
                                        </span>
                                    </div>
                                    <h2 className="text-xs font-bold text-on-surface-variant/60 tracking-[0.2em] uppercase">
                                        {activeAvatar === 'hr' && "HR Manager"}
                                        {activeAvatar === 'technical' && "Technical Lead"}
                                        {activeAvatar === 'team_lead' && "Team Lead"}
                                    </h2>

                                    {/* Phase indicator */}
                                    <div className="ml-auto flex items-center gap-2">
                                        {interviewPhase === PHASE.AVATAR_SPEAKING && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                                <div className="flex gap-0.5">
                                                    {[...Array(3)].map((_, i) => (
                                                        <div key={i} className="w-1 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Speaking</span>
                                            </div>
                                        )}
                                        {interviewPhase === PHASE.LISTENING && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Listening</span>
                                                {silenceCountdown !== null && silenceCountdown <= 3 && (
                                                    <span className="text-[10px] font-bold text-red-300 ml-1">{silenceCountdown}s</span>
                                                )}
                                            </div>
                                        )}
                                        {interviewPhase === PHASE.PROCESSING && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                                                <span className="material-symbols-outlined text-yellow-500 text-sm animate-spin">sync</span>
                                                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Processing</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Question Text */}
                                <div className="flex-grow">
                                    <p className="text-2xl md:text-3xl font-headline font-bold text-on-surface leading-tight">
                                        "{currentQuestionText}"
                                    </p>
                                </div>

                                {/* Live Transcript + Controls */}
                                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-end justify-between gap-6 pb-2">
                                    <div className="flex-1 space-y-4 w-full">
                                        {/* Status Row */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className={`w-1 h-3 rounded-full transition-all duration-200 ${isListening ? 'bg-red-500 animate-pulse' : interviewPhase === PHASE.PROCESSING ? 'bg-yellow-500 animate-pulse' : 'bg-white/10'}`} style={{ animationDelay: `${i * 100}ms` }} />
                                                ))}
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                                isListening ? 'text-red-500' : 
                                                interviewPhase === PHASE.PROCESSING ? 'text-yellow-500' : 
                                                interviewPhase === PHASE.AVATAR_SPEAKING ? 'text-primary' :
                                                'text-on-surface-variant/40'
                                            }`}>
                                                {interviewPhase === PHASE.AVATAR_SPEAKING && 'Interviewer Speaking...'}
                                                {interviewPhase === PHASE.LISTENING && (isPaused ? 'Paused' : 'Your Turn — Speak Now')}
                                                {interviewPhase === PHASE.PROCESSING && 'Analyzing Response...'}
                                            </span>

                                            {/* Silence countdown (visible during listening) */}
                                            {isListening && silenceCountdown !== null && !isPaused && (
                                                <div className="ml-auto flex items-center gap-2">
                                                    <span className="text-[10px] text-on-surface-variant/40 italic">
                                                        {hasSpokenRef.current
                                                            ? `Next question in ${silenceCountdown}s of silence`
                                                            : `Waiting for your answer (${silenceCountdown}s)`
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Live Transcript Display */}
                                        <div className={`glass-panel p-4 rounded-2xl border min-h-[80px] transition-all duration-300 ${
                                            isListening ? 'bg-red-500/5 border-red-500/10' : 'bg-white/5 border-white/5'
                                        }`}>
                                            <p className={`text-lg transition-colors ${transcript || interimTranscript ? 'text-on-surface' : 'text-on-surface-variant/30 italic'}`}>
                                                {transcript}
                                                {interimTranscript && (
                                                    <span className="text-on-surface-variant/50 italic"> {interimTranscript}</span>
                                                )}
                                                {!transcript && !interimTranscript && (
                                                    interviewPhase === PHASE.AVATAR_SPEAKING
                                                        ? "Listen to the question..."
                                                        : interviewPhase === PHASE.LISTENING
                                                            ? "🎤 Speak now — your answer will appear here..."
                                                            : "Processing your response..."
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Control buttons (minimal — mostly auto-flow) */}
                                    <div className="flex gap-3 shrink-0">
                                        {/* Pause/Resume */}
                                        {interviewPhase === PHASE.LISTENING && (
                                            <button
                                                onClick={togglePause}
                                                className={`group flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all border ${
                                                    isPaused
                                                        ? 'border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20'
                                                        : 'border-white/10 text-on-surface-variant/60 hover:bg-white/5 hover:text-on-surface'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-lg">
                                                    {isPaused ? 'play_arrow' : 'pause'}
                                                </span>
                                                <span>{isPaused ? 'Resume' : 'Pause'}</span>
                                            </button>
                                        )}

                                        {/* Skip / Next Question */}
                                        {interviewPhase === PHASE.LISTENING && !isPaused && (
                                            <button
                                                onClick={handleSkipQuestion}
                                                className="group flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all border border-white/10 text-on-surface-variant/60 hover:bg-white/5 hover:text-on-surface"
                                            >
                                                <span className="material-symbols-outlined text-lg">skip_next</span>
                                                <span>Next</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* COMPLETED STATE */}
                        {status === 'completed' && (
                            <div className="animate-fade-in w-full h-full flex flex-col">
                                <div className="text-center mb-10">
                                    <h2 className="text-4xl font-headline font-extrabold text-[#4cd7f6] mb-2 tracking-tight">Interview Analysis Complete</h2>
                                    <p className="text-on-surface-variant/70 text-lg">Analysis processed successfully. Review your performance review below.</p>
                                </div>

                                {!feedbackData ? (
                                    <div className="flex flex-col items-center justify-center flex-grow py-12">
                                        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(195,192,255,0.2)]"></div>
                                        <p className="text-on-surface-variant/80 font-bold uppercase tracking-[0.2em] animate-pulse text-sm">Generating Final Report...</p>
                                    </div>
                                ) : (
                                    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-4 text-left">
                                        {/* Performance Summary Header Card */}
                                        <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
                                            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-[60px]" />
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                                <div className="space-y-2">
                                                    <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Hiring Recommendation</h3>
                                                    <p className="text-4xl font-headline font-extrabold text-on-surface leading-tight transition-all group-hover:text-primary">
                                                        {feedbackData.hiring_recommendation}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                     <div className="flex items-baseline gap-2">
                                                        <span className="text-4xl font-headline font-extrabold text-secondary tracking-tighter">{feedbackData.overallScore}</span>
                                                        <span className="text-white/30 text-lg">/100</span>
                                                     </div>
                                                     <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-secondary" style={{ width: `${feedbackData.overallScore}%` }} />
                                                     </div>
                                                </div>
                                            </div>
                                            <div className="mt-6 border-t border-white/5 pt-6 text-on-surface-variant/80 text-lg leading-relaxed max-w-4xl italic">
                                                "{feedbackData.overall_summary}"
                                            </div>
                                        </div>

                                        {/* Feedback Bento Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {[
                                                { id: 'hr', title: 'HR Manager Analysis', color: 'primary' },
                                                { id: 'technical', title: 'Technical Capability', color: 'secondary' },
                                                { id: 'team_lead', title: 'Cultural & Leadership', color: 'primary' }
                                            ].map((avatar) => (
                                                <div key={avatar.id} className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-5 hover:bg-white/5 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${avatar.color}/10 text-${avatar.color}`}>
                                                            <span className="material-symbols-outlined">{avatar.id === 'hr' ? 'diversity_3' : avatar.id === 'technical' ? 'code' : 'groups'}</span>
                                                        </div>
                                                        <h4 className="text-sm font-bold text-on-surface/90">{avatar.title}</h4>
                                                    </div>

                                                    <div className="space-y-4 text-xs">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-green-400/80 font-bold uppercase tracking-widest text-[9px]">
                                                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                                                Primary Strengths
                                                            </div>
                                                            <ul className="space-y-1.5 list-none">
                                                                {feedbackData.strengths_by_avatar?.[avatar.id]?.map((s, i) => (
                                                                    <li key={i} className="pl-4 relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:bg-green-400/40 before:rounded-full text-on-surface-variant/70 italic leading-snug">
                                                                        {s}
                                                                    </li>
                                                                )) || <li className="text-white/20">Metric not available</li>}
                                                            </ul>
                                                        </div>
                                                        
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-red-400/80 font-bold uppercase tracking-widest text-[9px]">
                                                                <span className="material-symbols-outlined text-sm">priority_high</span>
                                                                Key Improvements
                                                            </div>
                                                            <ul className="space-y-1.5 list-none">
                                                                {feedbackData.weak_areas_by_avatar?.[avatar.id]?.map((s, i) => (
                                                                    <li key={i} className="pl-4 relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:bg-red-400/40 before:rounded-full text-on-surface-variant/70 italic leading-snug">
                                                                        {s}
                                                                    </li>
                                                                )) || <li className="text-white/20">Metric not available</li>}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Detailed Question Breakdown */}
                                        <div className="space-y-6 pt-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-0.5 bg-primary/20 rounded-full" />
                                                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Detailed Breakdown</h3>
                                            </div>
                                            
                                            <div className="space-y-6">
                                                {feedbackData.questions?.map((q, idx) => (
                                                    <div key={idx} className="glass-panel rounded-3xl border border-white/5 p-8 hover:border-white/20 transition-all group relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 py-2 px-6 bg-white/5 border-bl border-white/5 rounded-bl-3xl">
                                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{q.avatar_id} Section</span>
                                                        </div>

                                                        <div className="flex flex-col gap-6 relative z-10">
                                                            <div className="space-y-4">
                                                                <div className="space-y-1">
                                                                    <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Question {idx + 1}</span>
                                                                    <p className="text-lg font-headline font-bold text-on-surface">"{q.question_text}"</p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Your Response</span>
                                                                    <p className="text-base text-on-surface-variant/80 italic leading-relaxed">"{q.response?.transcript || 'No transcript available'}"</p>
                                                                </div>
                                                            </div>

                                                            {q.response?.analysis && (
                                                                <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">AI Assessment</span>
                                                                        <div className="flex items-baseline gap-1">
                                                                            <span className={`text-2xl font-headline font-extrabold ${(q.response.analysis.clarityScore ?? 0) === 0 ? 'text-red-400' : 'text-secondary'}`}>{q.response.analysis.clarityScore ?? 0}</span>
                                                                            <span className="text-white/20 text-sm">/100</span>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm text-on-surface-variant/70">{q.response.analysis.feedback}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Footer */}
                                        <div className="flex justify-center pt-6">
                                            <button
                                                onClick={() => navigate('/ai-dashboard')}
                                                className="px-10 py-4 bg-gradient-to-r from-primary to-secondary text-on-primary font-headline font-extrabold text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl active:scale-95 transition-all"
                                            >
                                                Return to Dashboard
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SessionPage;
