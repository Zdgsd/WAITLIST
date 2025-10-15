import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatScene } from './ChatScene';

interface ChatOverlayProps {
  onClose: () => void;
  chatNickname: string;
  chatSessionId: number;
  userRole: string;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({
  onClose,
  chatNickname,
  chatSessionId,
  userRole,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 font-mono"
          style={{ 
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
        >
          {/* Semi-transparent overlay that shows background */}
          <div className="absolute inset-0 bg-black/20" onClick={handleClose} />
          
          {/* Chat container with glass effect */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="absolute inset-4 md:inset-8 lg:inset-16 xl:inset-24 flex items-center justify-center"
          >
            <div className="relative w-full h-full">
              {/* Network background visible through chat */}
              <div className="absolute inset-0 opacity-20" />
              
              {/* Main chat container with glass morphism */}
              <div className="relative w-full h-full bg-black/60 backdrop-blur-md border border-[var(--terminal-green)]/30 rounded-lg overflow-hidden crt-terminal-box">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--terminal-green)]/5 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--terminal-green)]/10 via-transparent to-transparent" />
                
                {/* Scanline overlay to match app theme */}
                <div className="absolute inset-0 pointer-events-none opacity-20" 
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      0deg,
                      transparent,
                      transparent 2px,
                      rgba(47, 221, 108, 0.1) 2px,
                      rgba(47, 221, 108, 0.1) 4px
                    )`
                  }}
                />
                
                {/* Main content */}
                <div className="relative z-10 w-full h-full">
                  <ChatScene
                    nickname={chatNickname}
                    sessionId={chatSessionId}
                    userRole={userRole}
                    onBack={handleClose}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatOverlay;