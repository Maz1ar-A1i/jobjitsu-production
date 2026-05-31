import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-background text-on-background font-body antialiased min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/10 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <Link className="text-xl font-headline font-extrabold text-on-surface tracking-tight flex items-center gap-2 hover:opacity-80 transition-all duration-300 active:scale-95" to="/">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            JobJitsu
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <a className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-all" href="#features">Features</a>
            <a className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-all" href="#how-it-works">How it Works</a>
            <a className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-all" href="#testimonials">Testimonials</a>
            <a className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-all" href="#pricing">Pricing</a>
          </div>
          <div className="hidden md:flex items-center gap-4 ml-4">
            <Link className="px-5 py-2.5 rounded-lg border border-outline-variant/30 hover:border-primary/50 bg-surface-container-high hover:bg-surface-bright text-on-surface font-label font-bold text-sm transition-all shadow-sm active:scale-95" to="/login">Sign In</Link>
            <Link className="bg-gradient-to-br from-primary-container to-tertiary-container text-white px-6 py-2.5 rounded-lg font-label font-bold text-sm hover:opacity-90 transition-all hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] active:scale-95 border border-primary/20" to="/signup">Sign Up</Link>
          </div>
          <button className="md:hidden text-on-surface">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </nav>

      <main className="flex-grow pt-24 bg-mesh">
        {/* Hero Section */}
        <section className="relative px-6 py-20 lg:py-32 max-w-7xl mx-auto overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="z-10 relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-primary/30">
                <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4CD7F6] animate-pulse"></span>
                <span className="text-xs font-medium text-primary">JobJitsu AI v2.0 is Live</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-headline font-extrabold tracking-tight text-on-surface mb-6 leading-[1.1]">
                Ace Every Interview with <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">AI-Powered Coaching</span>
              </h1>
              <p className="text-lg lg:text-xl text-on-surface-variant mb-10 max-w-2xl font-body leading-relaxed">
                JobJitsu analyzes your answers in real-time, gives instant feedback, and trains you until you're interview-ready. Land your dream job.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="bg-gradient-to-br from-primary-container to-tertiary text-white px-8 py-4 rounded-full font-label font-semibold hover:opacity-90 transition-all hover:shadow-[0_0_20px_rgba(251,171,255,0.4)] active:scale-95 flex items-center justify-center gap-2">
                  Start Free Practice
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                </Link>
                <button className="glass-panel text-on-surface px-8 py-4 rounded-full font-label font-semibold hover:bg-surface-variant transition-all active:scale-95 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_circle</span>
                  Watch Demo
                </button>
              </div>
              <div className="mt-12 flex items-center gap-4 text-sm text-on-surface-variant font-medium">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-surface-variant border border-outline/20"></div>
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline/20"></div>
                  <div className="w-8 h-8 rounded-full bg-surface-bright border border-outline/20"></div>
                </div>
                <p>Join 50,000+ job seekers</p>
              </div>
            </div>

            <div className="relative z-10 hidden lg:block">
              {/* Dashboard Mockup */}
              <div className="glass-panel rounded-2xl p-6 relative shadow-2xl overflow-hidden aspect-[4/3] flex flex-col group">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>

                {/* Mockup Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">robot_2</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-on-surface">Technical Mock Interview</h3>
                      <p className="text-xs text-on-surface-variant">Senior Frontend Engineer Role</p>
                    </div>
                  </div>
                  <div className="glass-panel px-3 py-1 rounded-full text-xs font-medium text-secondary border-secondary/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span> Recording
                  </div>
                </div>

                {/* Mockup Content */}
                <div className="flex-grow flex flex-col justify-end gap-4 relative">
                  {/* AI Feedback Bubble */}
                  <div className="glass-panel p-4 rounded-xl max-w-[80%] self-end bg-surface-variant/50">
                    <p className="text-xs text-on-surface mb-2">Great explanation of React hooks. To improve, try mentioning a specific use case where `useMemo` optimized performance in a past project.</p>
                    <div className="flex gap-2">
                      <span className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary">Clarity: 9/10</span>
                      <span className="text-[10px] px-2 py-1 rounded bg-secondary/10 text-secondary">Depth: 7/10</span>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -left-6 bottom-10 glass-panel px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg border-tertiary/30 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">94%</h4>
                    <p className="text-xs text-on-surface-variant">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-24 max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-headline font-extrabold text-on-surface mb-4">Everything You Need to Crush Interviews</h2>
            <p className="text-on-surface-variant font-body text-lg max-w-2xl mx-auto">Our AI-powered tools provide a comprehensive ecosystem to help you prepare, practice, and perform at your best.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-3xl text-primary">support_agent</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">AI Mock Interviews</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">Practice with an AI interviewer that adapts to your level. Experience realistic scenarios tailored to your target role and industry.</p>
            </div>
            {/* Card 2 */}
            <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                <span className="material-symbols-outlined text-3xl text-secondary">bolt</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Real-time Feedback</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">Get instant scoring on your answers, tone, clarity, and confidence. Identify areas for improvement immediately after speaking.</p>
            </div>
            {/* Card 3 */}
            <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-tertiary/10 flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-colors">
                <span className="material-symbols-outlined text-3xl text-tertiary">dashboard</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Job Tracking</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">Track all your applications in one organized dashboard. Never lose sight of where you stand with your target companies.</p>
            </div>
            {/* Card 4 */}
            <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-3xl text-primary">description</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Resume Builder</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">Generate AI-powered resumes tailored to each job description to maximize your chances of getting past the ATS.</p>
            </div>
            {/* Card 5 */}
            <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                <span className="material-symbols-outlined text-3xl text-secondary">model_training</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Practice Hub</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">Access a massive library of domain-specific questions for tech, finance, consulting, and more to hone your skills.</p>
            </div>
            {/* Card 6 */}
            <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-tertiary/10 flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-colors">
                <span className="material-symbols-outlined text-3xl text-tertiary">monitoring</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Progress Analytics</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">Visualize your improvement over time with detailed charts tracking your performance across various metrics and interviews.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="px-6 py-24 bg-surface-container/20 border-y border-outline-variant/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-headline font-extrabold text-on-surface mb-4">Get Interview-Ready in 3 Simple Steps</h2>
              <p className="text-on-surface-variant font-body text-lg max-w-2xl mx-auto">Our streamlined process takes you from preparation to success.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-outline-variant/30 -z-10"></div>

              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full glass-panel flex items-center justify-center text-3xl font-extrabold text-primary mb-6 shadow-[0_0_20px_rgba(79,70,229,0.2)]">1</div>
                <h3 className="text-xl font-bold text-on-surface mb-3">Create Your Profile</h3>
                <p className="text-on-surface-variant text-sm">Set your target role, industry, and experience level to customize your practice sessions.</p>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full glass-panel flex items-center justify-center text-3xl font-extrabold text-secondary mb-6 shadow-[0_0_20px_rgba(76,215,246,0.2)]">2</div>
                <h3 className="text-xl font-bold text-on-surface mb-3">Practice with AI</h3>
                <p className="text-on-surface-variant text-sm">Run realistic mock interviews with our AI and receive instant, actionable feedback.</p>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full glass-panel flex items-center justify-center text-3xl font-extrabold text-tertiary mb-6 shadow-[0_0_20px_rgba(251,171,255,0.2)]">3</div>
                <h3 className="text-xl font-bold text-on-surface mb-3">Land the Job</h3>
                <p className="text-on-surface-variant text-sm">Track your applications, refine your resume with AI, and confidently ace your real interviews.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="glass-panel rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-tertiary/10"></div>
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl lg:text-5xl font-extrabold text-on-surface mb-2">50K+</div>
                <div className="text-sm font-medium text-primary uppercase tracking-wider">Users</div>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-extrabold text-on-surface mb-2">94%</div>
                <div className="text-sm font-medium text-secondary uppercase tracking-wider">Success Rate</div>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-extrabold text-on-surface mb-2">200+</div>
                <div className="text-sm font-medium text-tertiary uppercase tracking-wider">Companies</div>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-extrabold text-on-surface mb-2">1M+</div>
                <div className="text-sm font-medium text-primary uppercase tracking-wider">Sessions</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="px-6 py-24 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-headline font-extrabold text-on-surface mb-4">Candidates Who Got Hired</h2>
            <p className="text-on-surface-variant font-body text-lg max-w-2xl mx-auto">Hear from professionals who used JobJitsu to land roles at top tech companies.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex text-tertiary mb-4">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="text-on-surface-variant text-sm mb-6">"JobJitsu's AI feedback was incredibly precise. It pointed out a habit I had of rambling during technical explanations. Fixing that helped me land my dream role."</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-bright flex items-center justify-center text-on-surface font-bold">JD</div>
                <div>
                  <h4 className="font-bold text-on-surface text-sm">John Doe</h4>
                  <p className="text-xs text-primary">Software Engineer @ TechCorp</p>
                </div>
              </div>
            </div>
            {/* Testimonial 2 */}
            <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex text-tertiary mb-4">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="text-on-surface-variant text-sm mb-6">"The practice hub's domain-specific questions perfectly mirrored what I was asked in my real interviews. I felt completely prepared."</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-bright flex items-center justify-center text-on-surface font-bold">SJ</div>
                <div>
                  <h4 className="font-bold text-on-surface text-sm">Sarah Jenkins</h4>
                  <p className="text-xs text-secondary">Product Manager @ Innovate</p>
                </div>
              </div>
            </div>
            {/* Testimonial 3 */}
            <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex text-tertiary mb-4">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="text-on-surface-variant text-sm mb-6">"I loved the progress analytics. Seeing my confidence score improve over weeks of practice gave me the boost I needed to ace the final round."</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-bright flex items-center justify-center text-on-surface font-bold">MR</div>
                <div>
                  <h4 className="font-bold text-on-surface text-sm">Michael Ross</h4>
                  <p className="text-xs text-tertiary">Data Scientist @ DataWorks</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="px-6 py-24 bg-surface-container/20 border-y border-outline-variant/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-headline font-extrabold text-on-surface mb-4">Simple, Transparent Pricing</h2>
              <p className="text-on-surface-variant font-body text-lg max-w-2xl mx-auto">Choose the plan that fits your interview preparation needs.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
              {/* Free Tier */}
              <div className="glass-panel p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-on-surface mb-2">Free</h3>
                <p className="text-on-surface-variant text-sm mb-6">For casual practice.</p>
                <div className="text-4xl font-extrabold text-on-surface mb-6">$0<span className="text-lg text-on-surface-variant font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> 5 AI Mock Interviews/mo</li>
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Basic Feedback</li>
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Job Tracker (up to 10)</li>
                  <li className="flex items-center gap-3 opacity-50"><span className="material-symbols-outlined text-sm">close</span> AI Resume Builder</li>
                  <li className="flex items-center gap-3 opacity-50"><span className="material-symbols-outlined text-sm">close</span> Advanced Analytics</li>
                </ul>
                <button className="w-full glass-panel text-on-surface py-3 rounded-full font-label font-semibold hover:bg-surface-variant transition-all">Current Plan</button>
              </div>

              {/* Pro Tier (Highlighted) */}
              <div className="glass-panel p-8 rounded-2xl border border-primary/50 relative shadow-[0_0_30px_rgba(79,70,229,0.15)] transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-tertiary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>
                <h3 className="text-xl font-bold text-on-surface mb-2">Pro</h3>
                <p className="text-on-surface-variant text-sm mb-6">For serious job seekers.</p>
                <div className="text-4xl font-extrabold text-on-surface mb-6">$19<span className="text-lg text-on-surface-variant font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Unlimited AI Mock Interviews</li>
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Advanced Real-time Feedback</li>
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Unlimited Job Tracker</li>
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> AI Resume Builder</li>
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Progress Analytics Dashboard</li>
                </ul>
                <button className="w-full bg-gradient-to-br from-primary-container to-tertiary text-white py-3 rounded-full font-label font-semibold hover:opacity-90 transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)]">Upgrade to Pro</button>
              </div>

              {/* Enterprise Tier */}
              <div className="glass-panel p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-on-surface mb-2">Enterprise</h3>
                <p className="text-on-surface-variant text-sm mb-6">For career coaches & bootcamps.</p>
                <div className="text-4xl font-extrabold text-on-surface mb-6">$49<span className="text-lg text-on-surface-variant font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Everything in Pro</li>
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Custom Interview Scenarios</li>
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> White-labeled Dashboard</li>
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> Student Management</li>
                  <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm">check</span> API Access</li>
                </ul>
                <button className="w-full glass-panel text-on-surface py-3 rounded-full font-label font-semibold hover:bg-surface-variant transition-all">Contact Sales</button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="px-6 py-24 max-w-5xl mx-auto">
          <div className="glass-panel rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-headline font-extrabold text-on-surface mb-6">Ready to Land Your Dream Job?</h2>
              <p className="text-lg text-on-surface-variant mb-10 max-w-xl mx-auto">Join thousands of successful candidates who used JobJitsu to prepare and get hired.</p>
              <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <input type="email" placeholder="Enter your email" className="flex-grow bg-surface-container-high/50 border border-outline/20 rounded-full px-6 py-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary backdrop-blur-md" required />
                <button type="submit" className="bg-gradient-to-r from-primary to-secondary text-surface px-8 py-4 rounded-full font-bold whitespace-nowrap hover:opacity-90 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">Get Started Free</button>
              </form>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/10 w-full relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6 py-12 max-w-7xl mx-auto">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link className="text-lg font-headline font-extrabold text-primary flex items-center gap-2" to="/">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              JobJitsu
            </Link>
            <p className="font-body text-sm text-on-surface-variant">
              © 2026 JobJitsu AI. Precision Intelligence for the Modern Career.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-on-surface font-headline font-semibold text-sm mb-2">Product</h4>
            <a className="px-4 py-2 w-fit rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm" href="#features">Features</a>
            <a className="px-4 py-2 w-fit rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm" href="#pricing">Pricing</a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-on-surface font-headline font-semibold text-sm mb-2">Resources</h4>
            <Link className="px-4 py-2 w-fit rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm" to="/about">About</Link>
            <Link className="px-4 py-2 w-fit rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm" to="/guides">Guides</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-on-surface font-headline font-semibold text-sm mb-2">Legal</h4>
            <Link className="px-4 py-2 w-fit rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm" to="/privacy">Privacy</Link>
            <Link className="px-4 py-2 w-fit rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm" to="/terms">Terms</Link>
            <Link className="px-4 py-2 w-fit rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm" to="/security">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;