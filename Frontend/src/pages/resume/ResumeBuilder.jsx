import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const InputField = ({ label, placeholder, value, onChange, icon, type = "text" }) => (
    <div className="flex flex-col gap-2 group text-left">
        <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant/40 group-focus-within:text-primary transition-colors">{icon}</span>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 group-focus-within:text-primary/70 transition-colors">{label}</label>
        </div>
        <input 
            type={type}
            placeholder={placeholder} 
            value={value} 
            onChange={onChange}
            className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-sm font-medium py-2.5 px-4 rounded-xl outline-none transition-all placeholder:text-on-surface-variant/20 custom-calendar-picker"
        />
    </div>
);

const TextAreaField = ({ label, placeholder, value, onChange, icon }) => (
    <div className="flex flex-col gap-2 group text-left">
        <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant/40 group-focus-within:text-primary transition-colors">{icon}</span>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 group-focus-within:text-primary/70 transition-colors">{label}</label>
        </div>
        <textarea 
            placeholder={placeholder} 
            value={value} 
            onChange={onChange}
            className="w-full bg-white/5 border border-white/10 focus:border-primary/50 text-sm font-medium py-3 px-4 rounded-xl outline-none transition-all placeholder:text-on-surface-variant/20 min-h-[100px] resize-none"
        />
    </div>
);

const ResumeBuilder = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        personalInfo: { name: '', email: '', phone: '', address: '' },
        experience: [{ title: '', company: '', description: '', startDate: '', endDate: '' }],
        education: [{ degree: '', institution: '', startDate: '', endDate: '' }],
        skills: ''
    });

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/\D/g, ''); // Only numbers
        setFormData({ 
            ...formData, 
            personalInfo: { ...formData.personalInfo, phone: val } 
        });
    };

    const handleExperienceChange = (index, field, value) => {
        const newExp = [...formData.experience];
        newExp[index][field] = value;
        setFormData({ ...formData, experience: newExp });
    };

    const addExperience = () => {
        setFormData({ ...formData, experience: [...formData.experience, { title: '', company: '', description: '', startDate: '', endDate: '' }] });
    };

    const removeExperience = (index) => {
        const newExp = formData.experience.filter((_, i) => i !== index);
        setFormData({ ...formData, experience: newExp });
    };

    const handleEducationChange = (index, field, value) => {
        const newEdu = [...formData.education];
        newEdu[index][field] = value;
        setFormData({ ...formData, education: newEdu });
    };

    const addEducation = () => {
        setFormData({ ...formData, education: [...formData.education, { degree: '', institution: '', startDate: '', endDate: '' }] });
    };

    const removeEducation = (index) => {
        const newEdu = formData.education.filter((_, i) => i !== index);
        setFormData({ ...formData, education: newEdu });
    };

    const generateResume = async () => {
        setLoading(true);
        try {
            const payload = {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim())
            };

            const res = await axios.post('http://localhost:5000/api/ai/generate-resume', payload);

            const link = document.createElement('a');
            link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${res.data.file}`;
            link.download = res.data.filename || 'resume.docx';
            link.click();

        } catch (error) {
            console.error("Generation failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b1326] bg-mesh text-on-surface font-body selection:bg-primary/30 relative overflow-hidden flex flex-col">
            <style>{`
                .custom-calendar-picker::-webkit-calendar-picker-indicator {
                    filter: invert(1) brightness(0.8) sepia(1) saturate(5) hue-rotate(200deg);
                    cursor: pointer;
                }
            `}</style>

            {/* Decorative Background Blurs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Top Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-surface-variant/40 backdrop-blur-xl flex justify-between items-center px-10 h-16 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-on-primary text-xl font-bold">description</span>
                    </div>
                    <h1 className="text-xl font-headline font-bold text-on-surface tracking-tight">Resume <span className="text-primary/80 italic">Builder</span></h1>
                </div>

                <button 
                    onClick={() => navigate('/ai-dashboard')}
                    className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
                >
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Exit Hub</span>
                </button>
            </header>

            <main className="flex-1 mt-16 p-10 flex flex-col gap-10 relative z-10 w-full max-w-[1000px] mx-auto overflow-y-auto custom-scrollbar pb-32">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tighter uppercase">Professional <span className="text-primary italic">Resume</span> Builder</h2>
                    <p className="text-sm text-on-surface-variant/60 font-medium font-body italic border-l-2 border-primary/40 pl-4">
                        Build your professional profile into a high-impact narrative.
                    </p>
                </div>

                <div className="flex flex-col gap-12">
                    {/* Personal Information Module */}
                    <div className="glass-panel p-8 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-focus-within:bg-primary transition-colors" />
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface">Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputField label="Full Name" icon="badge" placeholder="John Doe" value={formData.personalInfo.name} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, name: e.target.value } })} />
                            <InputField label="Email Address" icon="alternate_email" placeholder="john@example.com" value={formData.personalInfo.email} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, email: e.target.value } })} />
                            <InputField label="Phone Number (Numbers Only)" icon="phone" placeholder="5550000000" value={formData.personalInfo.phone} onChange={handlePhoneChange} />
                            <InputField label="Geo Location" icon="location_on" placeholder="San Francisco, CA" value={formData.personalInfo.address} onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, address: e.target.value } })} />
                        </div>
                    </div>

                    {/* Professional Summary Module */}
                    <div className="glass-panel p-8 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-secondary/40 group-focus-within:bg-secondary transition-colors" />
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-secondary text-xl">short_text</span>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface">Profile Summary</h3>
                        </div>
                        <TextAreaField 
                            label="Executive Summary" 
                            icon="psychology_alt"
                            placeholder="Describe your professional mission..."
                            value={formData.summary || ''}
                            onChange={e => setFormData({ ...formData, summary: e.target.value })}
                        />
                    </div>

                    {/* Experience Grid */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">history_edu</span>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface">Experience Section</h3>
                            </div>
                            <button onClick={addExperience} className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl text-primary transition-all text-xs font-bold uppercase tracking-wider">
                                <span className="material-symbols-outlined text-sm">add_circle</span>
                                New Entry
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-6">
                            {formData.experience.map((exp, i) => (
                                <div key={i} className="glass-panel p-8 border border-white/5 relative group bg-white/[0.02]">
                                    <button onClick={() => removeExperience(i)} className="absolute top-6 right-6 p-2 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <InputField label="Job Title" icon="work" placeholder="Software Architect" value={exp.title} onChange={e => handleExperienceChange(i, 'title', e.target.value)} />
                                        <InputField label="Organization" icon="business" placeholder="Company Name" value={exp.company} onChange={e => handleExperienceChange(i, 'company', e.target.value)} />
                                        <InputField label="Start Date" icon="calendar_today" type="date" value={exp.startDate} onChange={e => handleExperienceChange(i, 'startDate', e.target.value)} />
                                        <InputField label="End Date" icon="event_available" type="date" value={exp.endDate} onChange={e => handleExperienceChange(i, 'endDate', e.target.value)} />
                                    </div>
                                    <TextAreaField label="Professional Responsibilities" icon="subject" placeholder="List your key responsibilities and achievements..." value={exp.description} onChange={e => handleExperienceChange(i, 'description', e.target.value)} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Education Matrix */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-secondary text-xl">school</span>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface">Education History</h3>
                            </div>
                            <button onClick={addEducation} className="flex items-center gap-2 px-4 py-2 bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 rounded-xl text-secondary transition-all text-xs font-bold uppercase tracking-wider">
                                <span className="material-symbols-outlined text-sm">add_circle</span>
                                New Entry
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-6">
                            {formData.education.map((edu, i) => (
                                <div key={i} className="glass-panel p-8 border border-white/5 relative group bg-white/[0.02]">
                                    <button onClick={() => removeEducation(i)} className="absolute top-6 right-6 p-2 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                        <div className="col-span-2 md:col-span-1">
                                            <InputField label="Credential" icon="school" placeholder="B.S. CS" value={edu.degree} onChange={e => handleEducationChange(i, 'degree', e.target.value)} />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <InputField label="Academy" icon="account_balance" placeholder="Stanford" value={edu.institution} onChange={e => handleEducationChange(i, 'institution', e.target.value)} />
                                        </div>
                                        <div className="col-span-1">
                                            <InputField label="Start" icon="calendar_today" type="date" value={edu.startDate} onChange={e => handleEducationChange(i, 'startDate', e.target.value)} />
                                        </div>
                                        <div className="col-span-1">
                                            <InputField label="End" icon="event_available" type="date" value={edu.endDate} onChange={e => handleEducationChange(i, 'endDate', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-8 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-focus-within:bg-primary transition-colors" />
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-primary text-xl">bolt</span>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface">Skills Assessment</h3>
                        </div>
                        <TextAreaField 
                            label="Skill Identifiers (Comma Separated)" 
                            icon="terminal"
                            placeholder="React, Node.js, TensorFlow, Career Strategy..."
                            value={formData.skills}
                            onChange={e => setFormData({ ...formData, skills: e.target.value })}
                        />
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 z-40 bg-surface-variant/40 backdrop-blur-xl border-t border-white/5 p-6 flex justify-center">
                <button 
                    onClick={generateResume} 
                    disabled={loading}
                    className="flex items-center gap-4 px-10 py-4 bg-primary hover:bg-primary-dark text-on-primary rounded-2xl font-headline font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all disabled:opacity-20 flex-1 max-w-[600px] overflow-hidden group relative"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    {loading ? (
                        <span className="material-symbols-outlined animate-spin relative z-10">sync</span>
                    ) : (
                        <span className="material-symbols-outlined relative z-10">download_for_offline</span>
                    )}
                    <span className="relative z-10">{loading ? 'Building your Resume...' : 'Generate Resume'}</span>
                </button>
            </footer>
        </div>
    );
};

export default ResumeBuilder;
