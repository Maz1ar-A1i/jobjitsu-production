import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const Chatbot = ({ isOpen = true, isFloating = false, onClose }) => {

    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hello! I am your **JobJitsu AI Assistant**. How can I assist you with your career strategy or resume optimization today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [error, setError] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post('http://localhost:5000/api/ai/chat', { message: userMessage });
            const reply = res.data.reply;
            setMessages(prev => [...prev, { role: 'model', text: reply }]);
        } catch (err) {
            console.error(err);
            setError("Communication error. Retrying transmission...");
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = (msg) => {
        const isUser = msg.role === 'user';
        const rawHtml = marked.parse(msg.text);
        const sanitizedHtml = DOMPurify.sanitize(rawHtml);

        return (
            <div className={`flex gap-4 max-w-[90%] transition-all animate-in fade-in slide-in-from-bottom-2 duration-500 ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`} key={Math.random()}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg ${
                    isUser ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'
                }`}>
                    <span className="material-symbols-outlined text-lg">{isUser ? 'person' : 'psychology'}</span>
                </div>
                
                <div className={`relative p-5 rounded-2xl border backdrop-blur-md flex flex-col gap-2 ${
                    isUser 
                        ? 'bg-secondary/5 border-secondary/20 rounded-tr-none' 
                        : 'bg-primary/5 border-primary/20 rounded-tl-none'
                }`}>
                    <div 
                        className="text-[14px] leading-relaxed text-on-surface font-body overflow-hidden prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
                    />
                    
                    {/* Status Marker */}
                    <div className={`flex items-center gap-1.5 mt-1 border-t border-white/5 pt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`w-1 h-1 rounded-full ${isUser ? 'bg-secondary animate-pulse' : 'bg-primary animate-pulse'}`} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">
                            {isUser ? 'AUTHENTICATED USER' : 'AI ASSISTANT'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`flex flex-col overflow-hidden glass-panel h-full border border-white/5 shadow-2xl ${isFloating ? 'fixed bottom-4 right-4 w-96 h-[600px] z-50' : ''}`}>
            {/* AI Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 bg-primary rounded-full absolute -top-0.5 -right-0.5 border border-[#1a2235] z-10 animate-pulse shadow-[0_0_10px_#c3c0ff]" />
                        <span className="material-symbols-outlined text-primary text-2xl">neurology</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-headline font-bold text-on-surface">Gemini AI Link</span>
                        <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Status: Interface Active</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-wider">Online</span>
                    </div>
                    {onClose && (
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-on-surface-variant/40 hover:text-white transition-all active:scale-90"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Transmission Buffer (Messages) */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
                {messages.map(renderMessage)}
                
                {loading && (
                    <div className="flex gap-4 max-w-[90%] mr-auto items-center animate-pulse">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                        </div>
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 border-dashed">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="mx-auto flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        {error}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Neural Input Station */}
            <form className="p-5 bg-white/5 border-t border-white/5 flex gap-3" onSubmit={handleSend}>
                <div className="relative flex-1 group">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-primary/50 text-sm font-medium py-3 pl-5 pr-24 rounded-xl outline-none transition-all placeholder:text-on-surface-variant/20 tracking-wide"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-40 group-focus-within:opacity-100 transition-opacity">
                        <span className="text-[10px] font-black font-mono text-primary tracking-tighter cursor-default">CMD+ENT</span>
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading || !input.trim()}
                    className="w-12 h-12 bg-primary hover:bg-primary-dark text-on-primary rounded-xl flex items-center justify-center transition-all disabled:opacity-20 disabled:grayscale shadow-lg shadow-primary/20 group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="material-symbols-outlined text-2xl relative z-10 group-hover:translate-x-0.5 transition-transform">send</span>
                </button>
            </form>
        </div>
    );
};

export default Chatbot;
