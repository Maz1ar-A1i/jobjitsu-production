
import React, { useEffect, useRef, useState } from 'react';

const CameraPreview = ({ onStreamReady, onVideoReady }) => {
    const videoRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let currentStream = null;
        let isMounted = true;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: true
                });

                if (!isMounted) {
                    // Component unmounted before stream was ready
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                currentStream = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Explicitly play to avoid black screen on some browsers
                    videoRef.current.play()
                        .then(() => {
                            if (onVideoReady && videoRef.current) {
                                onVideoReady(videoRef.current);
                            }
                        })
                        .catch(e => console.error("Error playing video:", e));
                }

                if (onStreamReady) {
                    onStreamReady(stream);
                }
                setLoading(false);
            } catch (err) {
                console.error("Error accessing media devices:", err);
                if (isMounted) {
                    setError(`${err.name}: ${err.message}`);
                    setLoading(false);
                }
            }
        };

        startCamera();

        // Cleanup function
        return () => {
            isMounted = false;
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onStreamReady]);

    if (error) {
        return (
            <div className="w-full h-full bg-[#060e20] rounded-2xl flex flex-col items-center justify-center text-red-400 p-8 text-center border border-red-500/20 glass-panel">
                <span className="material-symbols-outlined text-4xl mb-3 opacity-50">videocam_off</span>
                <p className="font-headline font-bold text-lg mb-1">Optical Link Failed</p>
                <p className="text-xs text-on-surface-variant/60 max-w-[200px] leading-relaxed">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden bg-black group">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}
            />
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060e20]">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] animate-pulse">Initializing Lens...</span>
                </div>
            )}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                <span className="text-[9px] font-bold text-white uppercase tracking-widest">Live Feed</span>
            </div>
        </div>
    );
};

export default CameraPreview;
