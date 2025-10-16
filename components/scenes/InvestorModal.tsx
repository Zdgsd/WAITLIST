import React from 'react';
import { Button } from '../ui/Button';
import { useTypewriter } from '../../hooks/useTypewriter';

interface InvestorModalProps {
    onClose: () => void;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export const InvestorModal: React.FC<InvestorModalProps> = ({ onClose }) => {
    const [showForm, setShowForm] = React.useState(false);
    const [formData, setFormData] = React.useState({ name: '', email: '', interest: '' });
    const [formStatus, setFormStatus] = React.useState<FormStatus>('idle');
    
    const { displayText: successText } = useTypewriter("Transmission received. We'll reach out to learn more.", 50, { enabled: formStatus === 'success' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');
        console.log("Investor Inquiry:", { ...formData, tag: 'Investor' });
        // Simulate network request
        setTimeout(() => {
            setFormStatus('success');
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-[var(--terminal-black)]/95 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-fade-in">
            <div className="crt-terminal-box w-full max-w-3xl h-[90vh] flex flex-col p-6 md:p-8 relative">
                <div className="absolute top-4 right-4">
                    <Button onClick={onClose} variant="terminal" className="text-2xl">
                        [ X ]
                    </Button>
                </div>
                <div className="flex-grow overflow-y-auto pr-4">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">Bookeeni — Investor FAQ & Quick Intro</h1>
                    <p className="text-lg text-gray-400 mb-8">We’re building the platform that reconnects live art with its people — if you’re curious about investing or partnering, this is the short version.</p>

                    <div className="space-y-6 text-gray-300">
                        <section>
                            <h2 className="font-bold text-xl text-[var(--terminal-green)] mb-2">Why consider us</h2>
                            <ul className="list-none space-y-1 pl-4">
                                <li><span className="text-[var(--terminal-green)] mr-2">→</span> We remove gatekeepers and unlock direct bookings between artists and audiences.</li>
                                <li><span className="text-[var(--terminal-green)] mr-2">→</span> Built for cross-border discovery and rapid viral onboarding.</li>
                                <li><span className="text-[var(--terminal-green)] mr-2">→</span> Early product-first traction plan focused on high-engagement creators.</li>
                                <li><span className="text-[var(--terminal-green)] mr-2">→</span> Lean, founder-led build with growth playbooks ready for scale.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-bold text-xl text-[var(--terminal-green)] mb-2">Quick FAQs</h2>
                            <div className="space-y-3 pl-4">
                                <div>
                                    <h3 className="font-bold text-white">How big is the opportunity?</h3>
                                    <p>Live experiences and creator-driven events are underserved by direct, low-fee markets — Bookeeni positions itself at that intersection.</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">What stage are you at?</h3>
                                    <p>MVP & waitlist phase — we’re validating demand locally with a low-cost, high-signal growth sprint.</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">What do you need from investors?</h3>
                                    <p>Smart capital and strategic partnerships to accelerate product polish, creator acquisition, and international growth.</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Why now?</h3>
                                    <p>Audiences crave IRL connection again; creators need better economics and direct access to fans — timing is aligned.</p>
                                </div>
                            </div>
                        </section>

                        <section className="pt-4">
                            {!showForm && formStatus !== 'success' && (
                                <div className="text-center space-y-4">
                                    <Button variant="primary" onClick={() => setShowForm(true)}>I’m an investor — tell me more</Button>
                                    <p>OR</p>
                                    <a href="mailto:join@bookeeni.com?subject=Investor%20Intro" className="text-lg hover:underline">Email us: join@bookeeni.com</a>
                                </div>
                            )}

                            {showForm && formStatus !== 'success' && (
                                <form onSubmit={handleSubmit} className="animate-fade-in space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-bold mb-1">Name</label>
                                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-gray-900/50 border-2 border-[var(--terminal-green)]/30 focus:border-[var(--terminal-green)] rounded-md p-2 outline-none"/>
                                    </div>
                                     <div>
                                        <label htmlFor="email" className="block text-sm font-bold mb-1">Email</label>
                                        <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full bg-gray-900/50 border-2 border-[var(--terminal-green)]/30 focus:border-[var(--terminal-green)] rounded-md p-2 outline-none"/>
                                    </div>
                                    <div>
                                        <label htmlFor="interest" className="block text-sm font-bold mb-1">One-line interest</label>
                                        <input type="text" id="interest" name="interest" value={formData.interest} onChange={handleInputChange} required className="w-full bg-gray-900/50 border-2 border-[var(--terminal-green)]/30 focus:border-[var(--terminal-green)] rounded-md p-2 outline-none"/>
                                    </div>
                                    <Button type="submit" disabled={formStatus === 'submitting'}>
                                        {formStatus === 'submitting' ? 'Submitting...' : 'Submit Inquiry'}
                                    </Button>
                                </form>
                            )}
                            
                            {formStatus === 'success' && (
                                <div className="text-center py-8">
                                    <p className="text-2xl text-white">
                                        {successText}
                                        {successText.length < 50 && <span className="animate-blink">_</span>}
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
