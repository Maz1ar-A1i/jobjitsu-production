import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateCurrentUser } from "../../features/auth/slice/authSlice";
import { createNotification } from "../../helpers/createNotifications";

const MaterialIcon = ({ icon, className = "", fill = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
  >
    {icon}
  </span>
);

export default function AccountPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth?.currentUser) || {};
  
  // Profile State
  const [name, setName] = useState(currentUser.name || currentUser.username || "");
  const [email, setEmail] = useState(currentUser.email || "");
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatarUrl || "");
  const fileInputRef = useRef(null);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI State
  const [activeTab, setActiveTab] = useState("profile"); // profile | security | billing

  useEffect(() => {
    setName(currentUser.name || currentUser.username || "");
    setEmail(currentUser.email || "");
    setAvatarPreview(currentUser.avatarUrl || "");
  }, [currentUser]);

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setAvatarPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const onSaveProfile = (e) => {
    e.preventDefault();
    const payload = { name, email };
    if (avatarPreview) payload.avatarUrl = avatarPreview;
    dispatch(updateCurrentUser(payload));
    createNotification("success", "Profile updated successfully");
  };

  const onSavePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      createNotification("error", "New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      createNotification("error", "Password must be at least 6 characters");
      return;
    }
    // Mocking password update success
    createNotification("success", "Password updated successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const onPurchasePlan = (planName) => {
    // Mocking billing
    createNotification("success", `Successfully subscribed to ${planName} plan`);
  };

  const TABS = [
    { id: "profile", label: "Profile", icon: "person" },
    { id: "security", label: "Security", icon: "lock" },
    { id: "billing", label: "Billing & Plans", icon: "credit_card" },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="fixed -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 -left-32 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c3c0ff] to-[#4f46e5] flex items-center justify-center text-on-primary shadow-lg shadow-indigo-900/40 group-hover:scale-110 transition-transform">
              <MaterialIcon icon="psychology" fill />
            </div>
            <div>
              <h1 className="font-headline font-extrabold text-xl bg-gradient-to-br from-[#c3c0ff] to-[#4f46e5] bg-clip-text text-transparent tracking-tighter">JobJitsu</h1>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface-variant text-sm font-bold uppercase tracking-widest text-on-surface-variant transition-all active:scale-95"
          >
            <MaterialIcon icon="arrow_back" className="text-base" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Sidebar Menu */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/50 px-4 mb-4">Settings</h2>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full py-3 px-4 flex items-center gap-3 font-body font-medium text-sm rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-surface-container-high text-primary border border-primary/20 shadow-lg'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
                }`}
              >
                <MaterialIcon icon={tab.icon} className="text-lg" fill={activeTab === tab.id} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-surface-container p-8 md:p-12 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
            
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="flex items-center gap-4 border-b border-outline-variant/10 pb-6">
                  <MaterialIcon icon="person" className="text-3xl text-primary" />
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-white">Public Profile</h2>
                    <p className="text-sm text-on-surface-variant mt-1">Manage your personal information and avatar.</p>
                  </div>
                </div>

                <form onSubmit={onSaveProfile} className="space-y-8">
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-surface-container-high border-2 border-primary/20 p-1 flex-shrink-0">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <img src={`https://robohash.org/${email || 'default'}?set=set2`} alt="avatar" className="w-full h-full object-cover rounded-xl" />
                      )}
                    </div>
                    <div className="space-y-3">
                      <button 
                        type="button" 
                        onClick={onPickFile}
                        className="bg-surface-container-highest hover:bg-surface-bright text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/10 hover:border-primary/50 active:scale-95 flex items-center gap-2"
                      >
                        <MaterialIcon icon="upload" className="text-base" />
                        Change Avatar
                      </button>
                      <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest">JPG, GIF or PNG. Max size of 800K</p>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/80 ml-1">Full Name</label>
                      <input 
                        className="w-full bg-background border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-on-surface transition-all outline-none"
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="e.g. Jane Doe" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/80 ml-1">Email Address</label>
                      <input 
                        className="w-full bg-background border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-on-surface transition-all outline-none"
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="jane@example.com" 
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-outline-variant/10 flex justify-end">
                    <button 
                      type="submit" 
                      className="bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:brightness-110 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <MaterialIcon icon="save" className="text-base" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="flex items-center gap-4 border-b border-outline-variant/10 pb-6">
                  <MaterialIcon icon="lock" className="text-3xl text-primary" />
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-white">Security & Password</h2>
                    <p className="text-sm text-on-surface-variant mt-1">Ensure your account is using a long, random password to stay secure.</p>
                  </div>
                </div>

                <form onSubmit={onSavePassword} className="space-y-6 max-w-lg">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/80 ml-1">Current Password</label>
                    <input 
                      className="w-full bg-background border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-on-surface transition-all outline-none"
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      placeholder="••••••••" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/80 ml-1">New Password</label>
                    <input 
                      className="w-full bg-background border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-on-surface transition-all outline-none"
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="••••••••" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/80 ml-1">Confirm New Password</label>
                    <input 
                      className="w-full bg-background border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm text-on-surface transition-all outline-none"
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="••••••••" 
                    />
                  </div>

                  <div className="pt-6 border-t border-outline-variant/10">
                    <button 
                      type="submit" 
                      className="bg-surface-container-highest hover:bg-surface-bright text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-white/10 hover:border-primary/50 active:scale-95 flex items-center gap-2"
                    >
                      <MaterialIcon icon="key" className="text-base" />
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="flex items-center gap-4 border-b border-outline-variant/10 pb-6">
                  <MaterialIcon icon="credit_card" className="text-3xl text-secondary" />
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-white">Billing & Subscription</h2>
                    <p className="text-sm text-on-surface-variant mt-1">Manage your active plans and upgrade your package.</p>
                  </div>
                </div>

                <div className="bg-surface-container-low p-6 rounded-2xl border-l-4 border-primary/40 shadow-xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-outline/60 mb-1">Current Plan</p>
                    <h3 className="text-xl font-bold text-white">Free Tier</h3>
                    <p className="text-xs text-on-surface-variant mt-1">Limited to 3 AI Mock Interviews per month.</p>
                  </div>
                  <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold uppercase tracking-widest border border-primary/20">
                    Active
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Available Upgrades</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Pro Plan */}
                    <div className="bg-surface-container-high p-8 rounded-2xl border border-outline-variant/10 hover:border-secondary/30 transition-all relative group overflow-hidden">
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-secondary/10 rounded-full blur-[40px] group-hover:bg-secondary/20 transition-colors" />
                      <div className="relative z-10 space-y-6">
                        <div>
                          <h4 className="text-lg font-bold text-white">Pro Package</h4>
                          <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-3xl font-black text-secondary">$19</span>
                            <span className="text-xs text-on-surface-variant">/ month</span>
                          </div>
                        </div>
                        <ul className="space-y-3 text-sm text-on-surface-variant">
                          <li className="flex items-center gap-2"><MaterialIcon icon="check_circle" className="text-secondary text-base" /> Unlimited AI Interviews</li>
                          <li className="flex items-center gap-2"><MaterialIcon icon="check_circle" className="text-secondary text-base" /> Advanced Analytics</li>
                          <li className="flex items-center gap-2"><MaterialIcon icon="check_circle" className="text-secondary text-base" /> Priority Support</li>
                        </ul>
                        <button 
                          onClick={() => onPurchasePlan("Pro Package")}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-secondary/20 to-secondary/10 hover:from-secondary/30 hover:to-secondary/20 text-secondary font-bold text-xs uppercase tracking-widest border border-secondary/30 transition-all active:scale-95"
                        >
                          Upgrade to Pro
                        </button>
                      </div>
                    </div>

                    {/* Elite Plan */}
                    <div className="bg-surface-container-high p-8 rounded-2xl border border-outline-variant/10 hover:border-tertiary/30 transition-all relative group overflow-hidden">
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-tertiary/10 rounded-full blur-[40px] group-hover:bg-tertiary/20 transition-colors" />
                      <div className="relative z-10 space-y-6">
                        <div>
                          <h4 className="text-lg font-bold text-white">Elite Package</h4>
                          <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-3xl font-black text-tertiary">$49</span>
                            <span className="text-xs text-on-surface-variant">/ month</span>
                          </div>
                        </div>
                        <ul className="space-y-3 text-sm text-on-surface-variant">
                          <li className="flex items-center gap-2"><MaterialIcon icon="check_circle" className="text-tertiary text-base" /> Everything in Pro</li>
                          <li className="flex items-center gap-2"><MaterialIcon icon="check_circle" className="text-tertiary text-base" /> 1-on-1 Expert Review</li>
                          <li className="flex items-center gap-2"><MaterialIcon icon="check_circle" className="text-tertiary text-base" /> Custom AI Persona</li>
                        </ul>
                        <button 
                          onClick={() => onPurchasePlan("Elite Package")}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-tertiary/20 to-tertiary/10 hover:from-tertiary/30 hover:to-tertiary/20 text-tertiary font-bold text-xs uppercase tracking-widest border border-tertiary/30 transition-all active:scale-95"
                        >
                          Upgrade to Elite
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
