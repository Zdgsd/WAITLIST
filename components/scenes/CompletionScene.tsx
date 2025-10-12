import React from 'react';
import { MemoryCardData, SubmissionStatus } from '../../types';
import { useTypewriter } from '../../hooks/useTypewriter';
import { ALL_ROLES } from '../../constants';
import { gameQuestions } from '../../gameQuestions';
import { Button } from '../ui/Button';
import { supabase } from '../../supabaseClient';
import { useAnalytics } from '../../analytics/AnalyticsProvider';

interface CompletionSceneProps {
  data: MemoryCardData;
  memoryNumber: number;
  onNavigateToInvestors: () => void;
  status: SubmissionStatus;
  setStatus: (status: SubmissionStatus) => void;
}

const CompletionSceneComponent: React.FC<CompletionSceneProps> = ({ data, memoryNumber, onNavigateToInvestors, status, setStatus }) => {
  const [userCount, setUserCount] = React.useState<number | null>(null);
  const { trackEvent } = useAnalytics();
  
  const { displayText: statusText } = useTypewriter(
    status === 'submitting' ? "TRANSMITTING TO DATABASE..." :
    status === 'success' ? "TRANSMISSION COMPLETE." :
    status === 'error' ? "TRANSMISSION FAILED." :
    "INITIALIZING TRANSMISSION...", 80
  );

  React.useEffect(() => {
    const submitData = async () => {
        if (status !== 'idle') return;

        setStatus('submitting');
        
        const roleLabel = ALL_ROLES.find(r => r.id === data.role)?.label || 'Explorer';
        const orderedGameAnswers = gameQuestions.map(q => data.gameAnswers[q.id] || "");

        const payload = {
            id: memoryNumber,
            email: data.email,
            role: roleLabel,
            name: data.name,
            age: data.age,
            game_answers: orderedGameAnswers
        };

        try {
            const { error } = await supabase
              .from('waitlist_users')
              .insert([payload]);

            if (error) {
                throw error;
            }

            const { count, error: countError } = await supabase
              .from('waitlist_users')
              .select('*', { count: 'exact', head: true });

            if (countError) {
              console.error("Error fetching user count:", countError);
            } else if (count !== null) {
              setUserCount(count);
            }
            
            setStatus('success');
        } catch (error) {
            console.error("Error submitting to Supabase:", (error as any)?.message || error);
            setStatus('error');
        }
    };
    
    const timer = setTimeout(submitData, 1000);
    return () => clearTimeout(timer);
  }, [status, setStatus, data, memoryNumber]);

  React.useEffect(() => {
    trackEvent('page_view', { page: 'CompletionScene' });
  }, [trackEvent]);

  const handleButtonClick = () => {
    trackEvent('button_click', { button: 'Interested in Helping' });
    onNavigateToInvestors();
  };

  if (status === 'success') {
    const roleLabel = ALL_ROLES.find(r => r.id === data.role)?.label || 'Explorer';
    return (
      <div className="flex flex-col items-center justify-start h-full text-center p-4 md:p-8 overflow-y-auto pt-10 md:pt-16 pb-16">
        <div className="animate-fade-in w-full max-w-3xl mx-auto text-center">
          
          {userCount !== null && (
            <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <p className="text-xl text-gray-400">Welcome,</p>
              <p className="text-3xl md:text-4xl font-bold text-white">{roleLabel} #{userCount}</p>
            </div>
          )}

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-white" style={{ animationDelay: '0.2s' }}>
            About + Join Us
          </h1>
          
          <div className="space-y-10 text-lg text-gray-300">
            <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-xl md:text-2xl font-bold mb-3 text-[var(--terminal-green)]">The First of Our Kind</h2>
              <p>We’re Bookeeni.<br/>The first platform built for the live creator era —<br/>where artists, organizers, and fans connect without permission.</p>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <p>We asked one question:<br/><span className="text-white italic">What if live art didn’t need gatekeepers?</span></p>
              <p className="mt-4">Bookeeni is our answer — a direct, creator-driven network that turns every show, street performance, or pop-up into a living, growing ecosystem.<br/>No middlemen. No waiting for validation. Just creators, audiences, and real connection.</p>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-xl md:text-2xl font-bold mb-3 text-[var(--terminal-green)]">Why We Exist</h2>
              <p>Live experiences are coming back — but the system behind them is still broken.<br/>Creators lose control. Organizers chase trends. Fans can’t find what’s real.</p>
              <p className="mt-4">We’re changing that.<br/>Bookeeni gives power back to the people who make culture —<br/>by making it easy to connect, book, and grow directly.<br/>From creators → to explorers → from fans → to full house.</p>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <h2 className="text-xl md:text-2xl font-bold mb-3 text-[var(--terminal-green)]">Why Join Us</h2>
              <p className="mb-4">Be part of the first platform rewriting how live art works.</p>
              <ul className="list-none space-y-3 text-left max-w-lg mx-auto">
                <li><span className="text-[var(--terminal-green)] mr-2">→</span> Shape the movement — early voices influence how Bookeeni grows.</li>
                <li><span className="text-[var(--terminal-green)] mr-2">→</span> Access first-wave perks — exclusive tools, gigs, and community drops.</li>
                <li><span className="text-[var(--terminal-green)] mr-2">→</span> Collaborate globally — with artists, technologists, and dreamers building the next cultural infrastructure.</li>
                <li><span className="text-[var(--terminal-green)] mr-2">→</span> Leave a mark — we’re not building an app; we’re building a cultural reset.</li>
              </ul>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: '1.0s' }}>
              <h2 className="text-xl md:text-2xl font-bold mb-3 text-[var(--terminal-green)]">Join the First Wave</h2>
              <p>If you believe live art deserves a new system,<br/>if you’re tired of algorithms deciding what matters —<br/>join us.</p>
              <p className="mt-4">Send a message to <a href="mailto:Bookeeni.contact@gmail.com" className="text-white font-bold hover:underline">Bookeeni.contact@gmail.com</a></p>
              <p className="mt-2">Tell us who you are, what you create, and why you care.</p>
            </section>
            
             <section className="animate-fade-in" style={{ animationDelay: '1.1s' }}>
                <p className="text-white font-bold">Let’s rebuild how the world connects — one stage at a time.</p>
            </section>

            <div className="pt-4 animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <p className="text-gray-400 mb-4">Or for partnership inquiries:</p>
              <Button variant="primary" onClick={handleButtonClick} className="animate-pulse-glow text-xl px-6 py-3 mb-4">
                Interested in Helping?
              </Button>
              <div className="mt-8">
                <Button variant="secondary" onClick={() => {
                  trackEvent('click', { element_id: 'join_team_button_footer' });
                  window.location.href = 'mailto:Bookeeni.contact@gmail.com?subject=Join%20Bookeeni%20Team';
                }} className="text-lg px-5 py-2.5">
                  Join Our Team
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // UI for idle, submitting, error states
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
      <h1 className="text-5xl sm:text-6xl md:text-8xl mb-8 tracking-widest font-bold">BOOKEENI</h1>
      <div className="w-full max-w-2xl">
        <p className="text-2xl md:text-3xl lg:text-4xl mb-8 h-12" aria-live="polite" aria-atomic="true">
          {statusText}
          {(status === 'submitting' || status === 'idle') && <span className="animate-blink">_</span>}
        </p>
        
        {status === 'error' && (
             <p className="mt-8 text-lg text-red-500 animate-fade-in">
                Could not connect to the database. Please try again later.
            </p>
        )}
      </div>
    </div>
  );
};

export const CompletionScene = React.memo(CompletionSceneComponent);