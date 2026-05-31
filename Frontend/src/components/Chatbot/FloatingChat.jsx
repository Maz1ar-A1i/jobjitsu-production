import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import Chatbot from './Chatbot';

const FloatingChat = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="floating-chat-root">
            {isOpen && (
                <div className="ai-chat-container">
                    <Chatbot 
                        isFloating={true} 
                        onClose={() => setIsOpen(false)} 
                    />
                </div>
            )}
            
            <button
                className={`ai-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle AI Assistant"
            >
                <div className="relative">
                    {isOpen ? <X size={24} /> : (
                        <>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#c3c0ff]" />
                            <MessageSquare size={24} />
                        </>
                    )}
                </div>
            </button>

            <style>{`
                .floating-chat-root {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 16px;
                }
                .ai-chat-container {
                    width: 400px;
                    height: 600px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .ai-toggle {
                    width: 64px;
                    height: 64px;
                    border-radius: 20px;
                    background: #171f33;
                    color: #c3c0ff;
                    border: 1px solid rgba(195, 192, 255, 0.1);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-blur: xl;
                }
                .ai-toggle:hover {
                    transform: scale(1.05) translateY(-2px);
                    background: #1c273d;
                    border-color: rgba(195, 192, 255, 0.3);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.4), 0 0 15px rgba(195, 192, 255, 0.1);
                }
                .ai-toggle.active {
                    background: #1d00a5;
                    color: white;
                    border-color: #c3c0ff;
                }
                @keyframes slideUp {
                    from { transform: translateY(30px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default FloatingChat;
