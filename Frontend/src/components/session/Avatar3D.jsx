import React, { useEffect, useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

// Map Azure Viseme IDs (0-21) to Ready Player Me Oculus Visemes
// Ref: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis-viseme
const azureVisemeToRPM = {
    0: 'viseme_sil',
    1: 'viseme_aa',
    2: 'viseme_aa',
    3: 'viseme_O',
    4: 'viseme_E',
    5: 'viseme_RR', // er
    6: 'viseme_I', // ih
    7: 'viseme_U', // uw
    8: 'viseme_O',
    9: 'viseme_aa',
    10: 'viseme_O',
    11: 'viseme_aa', // ae
    12: 'viseme_aa',
    13: 'viseme_RR',
    14: 'viseme_nn',
    15: 'viseme_SS',
    16: 'viseme_CH',
    17: 'viseme_TH',
    18: 'viseme_FF',
    19: 'viseme_DD',
    20: 'viseme_kk',
    21: 'viseme_PP',
};

// Fallback: Map Azure Visemes to a single 'mouthOpen' intensity (0.0 to 1.0)
const visemeToMouthOpen = {
    0: 0.0, // Silence
    1: 0.8, 2: 0.8, 3: 0.7, 4: 0.6, 8: 1.0, 9: 0.9, 10: 0.8, 11: 0.9, 12: 1.0, // Open vowels (a, o, etc)
    5: 0.4, 6: 0.4, 7: 0.5, 13: 0.4, // Closed vowels (i, u, er)
    14: 0.2, 15: 0.2, 16: 0.3, 17: 0.2, // Alveolar/Dental consonants (t, s, th, ch)
    18: 0.3, // Labiodental (f, v)
    19: 0.3, 20: 0.3, // Velar (k, g)
    21: 0.0, // Bilabial (p, b, m) - mouth closed
};


export default function Avatar3D({ avatarId, audioBase64, visemes, onSpeechEnd }) {
    // Determine which model to load
    let modelPath = '/models/hr.glb';
    if (avatarId === 'technical') modelPath = '/models/technical.glb';
    else if (avatarId === 'team_lead') modelPath = '/models/team_lead.glb';

    const { scene, nodes, materials } = useGLTF(modelPath);

    const AVATAR_CONFIG = {
        hr: { scale: [2.5, 2.5, 2.5], position: [0, -2.8, 0] },
        technical: { scale: [2.5, 2.5, 2.5], position: [0, -2.8, 0] },
        team_lead: { scale: [2.5, 2.5, 2.5], position: [0, -2.8, 0] }
    };
    const { scale, position } = AVATAR_CONFIG[avatarId] || AVATAR_CONFIG.hr;

    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    // Keep a stable ref for the callback to avoid stale closure issues
    const onSpeechEndRef = useRef(onSpeechEnd);
    useEffect(() => { onSpeechEndRef.current = onSpeechEnd; }, [onSpeechEnd]);

    // Play audio when base64 arrives
    useEffect(() => {
        if (audioBase64) {
            const audioSrc = `data:audio/mp3;base64,${audioBase64}`;
            const audio = new Audio(audioSrc);
            audioRef.current = audio;

            audio.onplay = () => setIsPlaying(true);
            audio.onended = () => {
                setIsPlaying(false);
                // Reset face
                const headNode = nodes.Wolf3D_Head || nodes.Wolf3D_Avatar;
                if (headNode && headNode.morphTargetInfluences) {
                    headNode.morphTargetInfluences.fill(0);
                }
                if (nodes.Wolf3D_Teeth && nodes.Wolf3D_Teeth.morphTargetInfluences) {
                    nodes.Wolf3D_Teeth.morphTargetInfluences.fill(0);
                }
                // Notify parent that the avatar has finished speaking
                if (onSpeechEndRef.current) {
                    console.log('[Avatar3D] TTS ended — firing onSpeechEnd');
                    onSpeechEndRef.current();
                }
            };

            audio.play().catch(err => {
                console.error('[Avatar3D] Audio play failed:', err);
                // Even if audio fails to play, notify parent so the flow continues
                if (onSpeechEndRef.current) {
                    onSpeechEndRef.current();
                }
            });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [audioBase64]);

    // Lip Sync animation loop
    useFrame(() => {
        const headNode = nodes.Wolf3D_Head || nodes.Wolf3D_Avatar;
        if (!isPlaying || !audioRef.current || !visemes || !headNode || !visemes.length) return;

        const currentTimeMs = audioRef.current.currentTime * 1000;

        // Find current viseme
        let currentVisemeId = 0; // default silence
        for (let i = 0; i < visemes.length; i++) {
            if (currentTimeMs >= visemes[i].audioOffsetMs) {
                currentVisemeId = visemes[i].visemeId;
            } else {
                break; // Since it's sorted by time
            }
        }

        const targetMorphName = azureVisemeToRPM[currentVisemeId];
        const mouthOpenTarget = visemeToMouthOpen[currentVisemeId] || 0;

        // Apply smoothing to morph targets so it doesn't snap instantly
        const headMorphs = headNode.morphTargetDictionary;
        const teethMorphs = nodes.Wolf3D_Teeth?.morphTargetDictionary;

        const hasVisemes = headMorphs && headMorphs['viseme_aa'] !== undefined;

        // First, gradually decay all morphs
        if (headMorphs) {
            if (hasVisemes) {
                // If the model supports full ARKit visemes
                for (let key in headMorphs) {
                    const index = headMorphs[key];
                    if (key.startsWith('viseme_')) {
                        headNode.morphTargetInfluences[index] = THREE.MathUtils.lerp(
                            headNode.morphTargetInfluences[index],
                            key === targetMorphName ? 1.0 : 0.0,
                            0.2 // Smoothing factor
                        );
                    }
                }
            } else if (headMorphs['mouthOpen'] !== undefined) {
                // FALLBACK: If the model only supports 'mouthOpen'
                const index = headMorphs['mouthOpen'];
                headNode.morphTargetInfluences[index] = THREE.MathUtils.lerp(
                    headNode.morphTargetInfluences[index],
                    mouthOpenTarget,
                    0.3 // Faster smoothing for single mouthOpen
                );
            }
        }

        // Apply to teeth as well if available
        if (teethMorphs && nodes.Wolf3D_Teeth) {
            if (hasVisemes) {
                for (let key in teethMorphs) {
                    const index = teethMorphs[key];
                    if (key.startsWith('viseme_')) {
                        nodes.Wolf3D_Teeth.morphTargetInfluences[index] = THREE.MathUtils.lerp(
                            nodes.Wolf3D_Teeth.morphTargetInfluences[index],
                            key === targetMorphName ? 1.0 : 0.0,
                            0.2
                        );
                    }
                }
            } else if (teethMorphs['mouthOpen'] !== undefined) {
                const index = teethMorphs['mouthOpen'];
                nodes.Wolf3D_Teeth.morphTargetInfluences[index] = THREE.MathUtils.lerp(
                    nodes.Wolf3D_Teeth.morphTargetInfluences[index],
                    mouthOpenTarget,
                    0.3
                );
            }
        }
    });

    return (
        <group dispose={null}>
            <primitive object={scene} scale={scale} position={position} />
        </group>
    );
}

// Preload models for faster switching
useGLTF.preload('/models/hr.glb');
useGLTF.preload('/models/technical.glb');
useGLTF.preload('/models/team_lead.glb');
