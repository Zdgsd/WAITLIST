import React, { useState } from 'react';

interface ChatLoginSceneProps {
  onLogin: (nickname: string, userRole: string) => void;
  onClose: () => void; // Added onClose prop
}

export const ChatLoginScene: React.FC<ChatLoginSceneProps> = ({ onLogin, onClose }) => {
  const [nickname, setNickname] = useState('');

  const handleLogin = () => {
    if (nickname.trim()) {
      onLogin(nickname, 'user');
    }
  };

  const handleAnonLogin = () => {
    const anonNickname = `anon_${Math.floor(1000 + Math.random() * 9000)}`;
    onLogin(anonNickname, 'anonymous');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="fixed inset-0 z-50 font-mono flex items-center justify-center">
      {/* Background overlay that shows nodes */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} /> {/* Close on overlay click */}
      
      {/* Login container with glass effect */}
      <div className="relative bg-black/60 backdrop-blur-md border border-[var(--terminal-green)]/30 rounded-lg p-6 max-w-md w-full mx-4 crt-terminal-box">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-[var(--terminal-green)] text-xl leading-none"
          aria-label="Close Chat Login"
        >
          &times;
        </button>
        
        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-10" 
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(47, 221, 108, 0.3) 2px,
              rgba(47, 221, 108, 0.3) 4px
            )`
          }}
        />
        
        <div className="relative z-10 text-center">
          {/* App branding */}
          <div className="text-xs text-gray-400 mb-2 tracking-widest">BOOKEENI NETWORK</div>
          <h2 className="text-xl mb-2 text-[var(--terminal-green)] animate-pulse">CHAT ACCESS</h2>
          <div className="text-sm text-gray-400 mb-6">Join the community terminal</div>
          
          <div className="mb-6 text-left">
            <label htmlFor="nickname-input" className="block text-sm text-gray-400 mb-2">USER HANDLE:</label>
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="enter_your_handle"
              className="w-full p-3 bg-black/40 border border-[var(--terminal-green)]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--terminal-green)] transition-colors"
              autoFocus
            />
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleLogin}
              className="w-full bg-[var(--terminal-green)]/10 border border-[var(--terminal-green)]/50 text-[var(--terminal-green)] py-3 rounded hover:bg-[var(--terminal-green)]/20 hover:border-[var(--terminal-green)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!nickname.trim()}
            >
              [ CONNECT AS: {nickname.trim() || 'USER'} ]
            </button>
            <button
              onClick={handleAnonLogin}
              className="w-full bg-gray-700/20 border border-gray-600/50 text-gray-400 py-3 rounded hover:bg-gray-700/40 hover:text-gray-300 hover:border-gray-500 transition-all duration-200"
            >
              [ CONNECT ANONYMOUSLY ]
            </button>
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            Secure connection established • End-to-end encrypted
          </div>
        </div>
      </div>
    </div>
  );
};