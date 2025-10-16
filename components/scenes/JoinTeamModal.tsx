// components/scenes/JoinTeamModal.tsx
import React from 'react';
import { Button } from '../ui/Button';
import { useTypewriter } from '../../hooks/useTypewriter';
import { supabase } from '../../supabaseClient';
import { useAnalytics } from '../../analytics/AnalyticsProvider';

interface JoinTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export const JoinTeamModal: React.FC<JoinTeamModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = React.useState({ name: '', email: '', phone: '', why_you_care: '' });
    const [formStatus, setFormStatus] = React.useState<FormStatus>('idle');
    const { trackEvent } = useAnalytics();
    
    const { displayText: successText } = useTypewriter("Transmission received. We'll reply personally.", 50, { enabled: formStatus === 'success' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');
        trackEvent('form_submission', { form_id: 'team_application' });
        
        try {
            const { error } = await supabase.from('team_applications').insert([formData]);
            if (error) throw error;
            setFormStatus('success');
        } catch (error) {
            console.error("Error submitting team application:", (error as any)?.message || error);
            setFormStatus('error');
        }
    };

    React.useEffect(() => {
        // Reset form when modal is closed
        if (!isOpen) {
            setTimeout(() => {
                setFormData({ name: '', email: '', phone: '', why_you_care: '' });
                setFormStatus('idle');
            }, 300); // Wait for closing animation
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[var(--terminal-black)]/95 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-fade-in">
            <div className="crt-terminal-box w-full max-w-2xl h-auto max-h-[90vh] flex flex-col p-6 md:p-8 relative">
                <div className="absolute top-4 right-4">
                    <Button onClick={onClose} variant="terminal" className="text-2xl">
                        [ X ]
                    </Button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">Join the team — build the platform creators deserve.</h1>
                    <p className="text-lg text-gray-400 mb-8">Founding hires get real ownership and real voice.</p>

                    {formStatus === 'success' ? (
                        <div className="text-center py-12">
                            <p className="text-2xl text-white h-16">
                                {successText}
                                {formStatus === 'success' && successText.length < 50 && <span className="animate-blink">_</span>}
                            </p>
                        </div>
                    ) : formStatus === 'error' ? (
                        <div className="text-center py-12 animate-fade-in">
                            <p className="text-xl text-red-400 mb-4">Submission failed. Please try again or email us directly.</p>
                            <Button onClick={() => setFormStatus('idle')} variant="secondary">Try Again</Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="animate-fade-in space-y-4">
                            <p className="text-gray-400 mb-4">Apply casually — we value work over CVs.</p>
                            <div>
                                <label htmlFor="join-name" className="block text-sm font-bold mb-1">Name</label>
                                <input type="text" id="join-name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-gray-900/50 border-2 border-[var(--terminal-green)]/30 focus:border-[var(--terminal-green)] rounded-md p-2 outline-none"/>
                            </div>
                            <div>
                                <label htmlFor="join-email" className="block text-sm font-bold mb-1">Email</label>
                                <input type="email" id="join-email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full bg-gray-900/50 border-2 border-[var(--terminal-green)]/30 focus:border-[var(--terminal-green)] rounded-md p-2 outline-none"/>
                            </div>
                            <div>
                                <label htmlFor="join-phone" className="block text-sm font-bold mb-1">Phone Number (Optional)</label>
                                <input type="tel" id="join-phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-900/50 border-2 border-[var(--terminal-green)]/30 focus:border-[var(--terminal-green)] rounded-md p-2 outline-none"/>
                            </div>
                            <div>
                                <label htmlFor="join-why_you_care" className="block text-sm font-bold mb-1">One quick line about why you care</label>
                                <textarea id="join-why_you_care" name="why_you_care" value={formData.why_you_care} onChange={handleInputChange} required className="w-full h-24 bg-gray-900/50 border-2 border-[var(--terminal-green)]/30 focus:border-[var(--terminal-green)] rounded-md p-2 outline-none resize-none"/>
                            </div>
                            <Button type="submit" disabled={formStatus === 'submitting'}>
                                {formStatus === 'submitting' ? 'Submitting...' : 'Send Application'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
