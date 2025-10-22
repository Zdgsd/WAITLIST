import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { Button } from '../ui/Button';

interface ChatProps {
  onClose: () => void;
}

type ChatView = 'login' | 'chat';

const LoginView: React.FC<{ onLogin: (nickname: string, userRole: string) => void; onClose: () => void; }> = ({ onLogin, onClose }) => {
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
    <div className="h-full flex flex-col items-center justify-center p-6 text-[var(--terminal-green)]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-[var(--terminal-green)] text-xl leading-none"
          aria-label="Close Chat Login"
        >
          &times;
        </button>
        
        <div className="text-center">
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
  );
};

const ChatViewComponent: React.FC<{ nickname: string; sessionId: number; userRole: string; onBack: () => void; }> = ({ nickname, sessionId, userRole, onBack }) => {
  const { messages, sendMessage, isLoading, chatRooms, activeRoomId, setActiveRoomId } = useChat(nickname, userRole, sessionId);
  const [newMessage, setNewMessage] = useState('');
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Prevent scrolling of parent elements when scrolling chat
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const height = container.clientHeight;
        const wheelDelta = e.deltaY;
        const isScrolledToBottom = scrollTop === scrollHeight - height;

        if (wheelDelta > 0 && isScrolledToBottom) {
          e.preventDefault();
        }
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() && !isLoading) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const activeRoomName = chatRooms.find(room => room.id === activeRoomId)?.name || 'lobby';

  return (
    <div className="flex flex-col h-full text-[var(--terminal-green)]">
      {/* Header */}
      <div className="flex-shrink-0 flex justify-between items-center p-3 border-b border-[var(--terminal-green)]/30 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-400 opacity-60">BOOKEENI</div>
          <div className="h-4 border-l border-[var(--terminal-green)]/40"></div>
          <div 
            className="cursor-pointer hover:text-white transition-colors group text-sm sm:text-base"
            onClick={() => setShowRoomSelection(!showRoomSelection)}
          >
            <span className="text-gray-400 text-sm">#</span>
            <span className="text-[var(--terminal-green)] group-hover:underline">{activeRoomName}</span>
            <span className="text-gray-400 ml-2 text-xs">▼</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-400">user:</span>
          <span className="text-[var(--terminal-green)]">{nickname}</span>
          <Button 
            onClick={onBack} 
            variant="terminal"
            className="text-xs px-3 py-1 border border-[var(--terminal-green)]/50 hover:border-[var(--terminal-green)]"
          >
            [X]
          </Button>
        </div>
      </div>

      {/* Room Selection Dropdown */}
      {showRoomSelection && (
        <div className="absolute top-12 left-3 bg-black/80 backdrop-blur-md border border-[var(--terminal-green)]/30 rounded z-20 min-w-48">
          <div className="p-2 border-b border-[var(--terminal-green)]/20 text-xs text-gray-400">CHANNELS</div>
          {chatRooms.map(room => (
            <div 
              key={room.id} 
              className={`px-3 py-2 cursor-pointer hover:bg-[var(--terminal-green)]/20 transition-colors ${
                room.id === activeRoomId ? 'bg-[var(--terminal-green)]/10 text-white' : 'text-[var(--terminal-green)]'
              }`}
              onClick={() => {
                setActiveRoomId(room.id);
                setShowRoomSelection(false);
              }}
            >
              <span className="text-gray-400">#</span>{room.name}
            </div>
          ))}
        </div>
      )}

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 text-sm space-y-1">
        {messages.map((msg) => (
          <div key={msg.id} className="flex hover:bg-black/10 px-2 py-1 rounded transition-colors">
            <div className="flex-shrink-0 w-16 sm:w-20">
              <span className="text-gray-500 text-xs">{formatTimestamp(msg.created_at)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <span
                className={`font-medium mr-2 ${
                  msg.user_role === 'anonymous'
                    ? 'text-gray-400'
                    : msg.user_role === 'moderator'
                    ? 'text-yellow-400'
                    : 'text-[var(--terminal-green)]'
                }`}
              >
                {msg.user_name}:
              </span>
              <span className="text-white/90 break-words">{msg.message}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        
        {isLoading && (
          <div className="flex justify-center py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-[var(--terminal-green)] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[var(--terminal-green)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-[var(--terminal-green)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-3 border-t border-[var(--terminal-green)]/20 bg-black/30 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="flex-1 relative w-full">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none border-b border-[var(--terminal-green)]/30 focus:border-[var(--terminal-green)] transition-colors py-1"
              placeholder="Type your message... (Enter to send)"
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="w-3 h-3 border-2 border-[var(--terminal-green)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <Button
            onClick={handleSendMessage}
            variant="terminal"
            className="flex-shrink-0 px-3 py-1 text-sm border border-[var(--terminal-green)]/50 hover:border-[var(--terminal-green)] hover:bg-[var(--terminal-green)]/10 transition-all w-full sm:w-auto"
            disabled={isLoading || !newMessage.trim()}
          >
            SEND
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Chat: React.FC<ChatProps> = ({ onClose }) => {
  const [view, setView] = useState<ChatView>('login');
  const [nickname, setNickname] = useState('');
  const [userRole, setUserRole] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);

  const handleLogin = (name: string, role: string) => {
    setNickname(name);
    setUserRole(role);
    setSessionId(Math.floor(10000 + Math.random() * 90000));
    setView('chat');
  };

  return (
    <div className="fixed inset-0 z-50 p-4 flex flex-col bg-black/80 backdrop-blur-md font-mono overflow-hidden">
      <div className="relative w-full h-full border border-[var(--terminal-green)]/30 rounded-lg overflow-hidden crt-terminal-box flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--terminal-green)]/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--terminal-green)]/10 via-transparent to-transparent" />
        <div 
          className="absolute inset-0 pointer-events-none opacity-20" 
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
        <div className="relative z-10 w-full h-full flex flex-col">
          {view === 'login' && <LoginView onLogin={handleLogin} onClose={onClose} />}
          {view === 'chat' && nickname && sessionId && userRole && (
            <ChatViewComponent
              nickname={nickname}
              sessionId={sessionId}
              userRole={userRole}
              onBack={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};