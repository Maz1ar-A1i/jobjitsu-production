import React, { Suspense } from 'react';
import { AVATAR_ROLES } from '../../utils/AvatarOrchestrator';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import Avatar3D from './Avatar3D';

const AvatarPanel = ({ activeAvatar, audioData, onSpeechEnd }) => {
    const avatars = Object.values(AVATAR_ROLES).map(role => ({
        ...role,
        color: role.id === 'hr' ? 'primary' : role.id === 'technical' ? 'secondary' : 'primary',
        emoji: role.id === 'hr' ? '👩‍💼' : role.id === 'technical' ? '👨‍💻' : '🧑‍🏫'
    }));

    return (
        <div className="flex flex-row justify-center items-stretch gap-5 w-full h-full min-h-[400px]">
            {avatars.map((avatar) => {
                const isSpeaking = activeAvatar === avatar.id;

                return (
                    <div
                        key={avatar.id}
                        className={`flex-1 flex flex-col items-center glass-panel rounded-2xl border transition-all duration-500 relative overflow-hidden group ${isSpeaking 
                            ? 'border-primary shadow-[0_0_40px_rgba(195,192,255,0.1)] ring-1 ring-primary/30 z-10' 
                            : 'border-white/5 opacity-40 grayscale hover:opacity-60 hover:grayscale-0'
                        }`}
                    >
                        {/* Title Bar */}
                        <div className={`w-full py-3 px-4 text-center border-b transition-colors ${isSpeaking ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/5'}`}>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${isSpeaking ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                                {avatar.name}
                            </span>
                        </div>

                        {/* Speaking Indicator */}
                        {isSpeaking && audioData?.base64 && (
                            <div className="absolute top-14 left-4 z-20 flex items-center gap-2 bg-primary/20 backdrop-blur-md rounded-full px-3 py-1 border border-primary/30 shadow-lg">
                                <div className="flex gap-1">
                                    <span className="w-1 h-3 bg-primary rounded-full animate-[voice_0.5s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1 h-5 bg-primary rounded-full animate-[voice_0.5s_ease-in-out_infinite]" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1 h-3 bg-primary rounded-full animate-[voice_0.5s_ease-in-out_infinite]" style={{ animationDelay: '300ms' }}></span>
                                </div>
                                <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Live Audio</span>
                            </div>
                        )}

                        {/* 3D Canvas */}
                        <div className="w-full flex-grow relative bg-[#060e20]">
                            {/* Inner Glow */}
                            <div className={`absolute inset-0 transition-opacity duration-1000 ${isSpeaking ? 'opacity-20' : 'opacity-0'} bg-radial-gradient from-primary/30 to-transparent pointer-events-none`} />
                            
                            <Canvas camera={{ position: [0, 1.25, 2.0], fov: 45 }} className="w-full h-full">
                                <ambientLight intensity={0.4} />
                                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#c3c0ff" />
                                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4cd7f6" />

                                <Suspense fallback={null}>
                                    <Avatar3D
                                        avatarId={avatar.id}
                                        audioBase64={isSpeaking ? audioData?.base64 : null}
                                        visemes={isSpeaking ? audioData?.visemes : null}
                                        onSpeechEnd={isSpeaking ? onSpeechEnd : undefined}
                                    />
                                    <ContactShadows opacity={0.6} scale={5} blur={3} far={4} color="#000000" position={[0, -1, 0]} />
                                </Suspense>
                                <OrbitControls
                                    enableZoom={false}
                                    enablePan={false}
                                    enableRotate={false}
                                    target={[0, 1.2, 0]}
                                />
                            </Canvas>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AvatarPanel;

