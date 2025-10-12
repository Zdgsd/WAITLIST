// components/scenes/InvestorPage.tsx
import React from 'react';
import { useAnalytics } from '../../analytics/AnalyticsProvider';
import { supabase } from '../../supabaseClient';

interface InvestorPageProps {
    onBack: () => void;
}

const CorporateButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }> = ({ children, className, variant = 'primary', ...props }) => {
    const baseClasses = 'px-6 py-3 text-lg rounded-md transition-colors duration-300 disabled:opacity-50';
    const variantClasses = {
        primary: 'bg-green-600 hover:bg-green-500 text-white font-bold',
        secondary: 'bg-gray-700 hover:bg-gray-600 text-white'
    };
    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
    return (
        <input 
            className="w-full bg-[#2a2a2a] border border-[#444] text-gray-200 rounded-md p-3 focus:outline-none focus:border-green-500 transition-colors"
            {...props}
        />
    )
}

const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
    return (
        <textarea 
            className="w-full bg-[#2a2a2a] border border-[#444] text-gray-200 rounded-md p-3 focus:outline-none focus:border-green-500 transition-colors resize-none"
            {...props}
        />
    )
}

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="font-bold text-xl text-gray-100 mb-2">{children}</h3>
);

export const InvestorPage: React.FC<InvestorPageProps> = ({ onBack }) => {
    const { trackEvent } = useAnalytics();
    const [formData, setFormData] = React.useState({ name: '', email: '', firm: '', message: '' });
    const [formStatus, setFormStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const formRef = React.useRef<HTMLDivElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');
        trackEvent('form_submission', { form_id: 'investor_inquiry_page' });
        
        try {
            const { error } = await supabase.from('investor_inquiries').insert([{
                name: formData.name,
                email: formData.email,
                firm: formData.firm,
                creator_suggestion: formData.message // Repurposing this field for the message
            }]);
            if (error) throw error;
            setFormStatus('success');
        } catch (error) {
            console.error("Error submitting investor inquiry:", (error as any)?.message || error);
            setFormStatus('error');
        }
    };
    
    const handleScrollToForm = () => {
        trackEvent('click', { element_id: 'investor_page_talk_to_founders' });
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="w-full h-full bg-[#111111] text-gray-200 font-sans p-4 sm:p-8 flex flex-col">
            <header className="w-full max-w-5xl mx-auto flex justify-between items-center mb-8 flex-shrink-0">
                <h1 className="text-3xl font-bold text-white">BOOKEENI</h1>
                <CorporateButton onClick={() => {
                    trackEvent('click', { element_id: 'investor_page_back_button' });
                    onBack();
                }} variant="secondary">&larr; Back</CorporateButton>
            </header>
            
            <div className="flex-grow overflow-y-auto">
                <div className="w-full max-w-4xl mx-auto pb-8">
                    <div className="bg-[#1a1a1a] p-8 rounded-lg shadow-2xl">
                        
                        <section className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                Bookeeni — Where Live Art Finds Its Future
                            </h2>
                        </section>

                        <div className="space-y-10 text-gray-300 text-lg">
                             <p className="text-center text-gray-400 italic max-w-3xl mx-auto">
                                Imagine a world where creators reach fans directly, every show grows itself, and discovery happens naturally. Bookeeni is building that connection — a platform that scales from local stages to global moments.
                            </p>

                             <div>
                                <SectionHeader>Why now:</SectionHeader>
                                <p>Creators want fairness. Audiences want magic. The old systems are broken.</p>
                            </div>
                            
                            <div>
                                <SectionHeader>Our flywheel:</SectionHeader>
                                <p>Better experiences → more engagement → deeper insights → unstoppable growth.</p>
                            </div>

                            <div>
                                <SectionHeader>We’re looking for:</SectionHeader>
                                <p>Investors and partners who see the potential before everyone else does.</p>
                            </div>

                            <div className="text-center pt-6 border-t border-gray-700">
                                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                    <CorporateButton onClick={handleScrollToForm} variant="primary">
                                        Talk to the founders
                                    </CorporateButton>
                                    <CorporateButton onClick={() => {
                                        trackEvent('click', { element_id: 'investor_page_join_movement' });
                                        onBack();
                                    }} variant="secondary">
                                        Join the movement
                                    </CorporateButton>
                                </div>
                            </div>

                            <div ref={formRef} className="pt-8 scroll-mt-8">
                                <section className="pt-8 border-t border-gray-700">
                                    <h3 className="font-bold text-2xl text-center text-white mb-2">Connect With Us</h3>
                                    {formStatus === 'success' ? (
                                        <div className="text-center py-8 animate-fade-in">
                                            <p className="text-xl text-green-400 font-bold">Thank you for your interest.</p>
                                            <p className="text-gray-400 mt-2">Your inquiry has been received, and we will be in touch shortly.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto mt-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <FormInput type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleInputChange} required />
                                                <FormInput type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleInputChange} required />
                                            </div>
                                            <FormInput type="text" name="firm" placeholder="Your Firm or Company (Optional)" value={formData.firm} onChange={handleInputChange} />
                                            <FormTextarea name="message" placeholder="A brief message..." value={formData.message} onChange={handleInputChange} required rows={3} />
                                            {formStatus === 'error' && <p className="text-red-400 text-sm">Submission failed. Please try again.</p>}
                                            <div className="text-center pt-2">
                                                <CorporateButton type="submit" disabled={formStatus === 'submitting'} variant="primary" className="w-full sm:w-auto">
                                                    {formStatus === 'submitting' ? 'Sending...' : 'Submit Inquiry'}
                                                </CorporateButton>
                                            </div>
                                        </form>
                                    )}
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};