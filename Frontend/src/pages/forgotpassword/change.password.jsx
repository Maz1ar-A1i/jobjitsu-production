import React from 'react';
import ResetPasswordForm from '../../features/auth/reset.password.form';
import './change.password.scss';

const ChangePassword = () => {
    return (
        <div className="bg-background text-on-surface min-h-screen flex flex-col font-body">
            <main className="flex-grow flex items-center justify-center px-6 pt-32 pb-16 bg-mesh relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -z-10 animate-pulse-slow delay-1000"></div>

                <div className="w-full max-w-sm glass-panel p-8 rounded-[1.5rem] border border-outline-variant/10 shadow-2xl relative overflow-hidden animate-fade-in-up">
                    <div className="text-center mb-8 relative z-10">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-primary text-3xl">key</span>
                        </div>
                        <h2 className="text-2xl font-headline font-black text-on-surface mb-2 tracking-tight">Reset Password</h2>
                        <p className="text-on-surface-variant text-xs font-medium leading-relaxed">
                            Securing your career trajectory. <br/>
                            Enter your new credentials below.
                        </p>
                    </div>
                    <ResetPasswordForm />
                </div>
            </main>
        </div>
    )
}

export default ChangePassword;


