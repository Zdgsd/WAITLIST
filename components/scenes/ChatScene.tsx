import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { Button } from '../ui/Button';

interface ChatSceneProps {
  nickname: string;
  sessionId: number;
  userRole: string;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  room_id: string;
  user_name: string;
  user_role: string;
  message: string;
  created_at: string;
}

interface ChatRoom {
  id: string;
  name: string;
}

export const ChatScene: React.FC<ChatSceneProps> = ({
  nickname,
  sessionId,
  userRole,
  onBack
}) => {
  const { messages, sendMessage, isLoading, chatRooms, activeRoomId, setActiveRoomId } = useChat(nickname, userRole, sessionId);
  const [newMessage, setNewMessage] = useState('');
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const activeRoomName = chatRooms.find(room => room.id === activeRoomId)?.name || 'lobby';

  return (
    <div className="flex flex-col h-full font-mono text-[var(--terminal-green)] relative overflow-hidden">
      {/* Header with app-style branding */}
      <div className="flex justify-between items-center p-3 border-b border-[var(--terminal-green)]/30 bg-black/20 backdrop-blur-sm">
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

      {/* Messages Area - Transparent with visible background */}
      <div 
        className="flex-grow overflow-y-auto p-3 text-sm space-y-1 bg-transparent"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--terminal-green) transparent'
        }}
      >
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
                &lt;{msg.user_name}&gt;
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

      {/* Input Area - Integrated with app theme */}
      <div className="p-3 border-t border-[var(--terminal-green)]/20 bg-black/30 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Removed nickname@terminal:~$ */}
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

      {/* CRT Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: `linear-gradient(
            rgba(18, 16, 16, 0) 50%,
            rgba(0, 0, 0, 0.25) 50%
          )`,
          backgroundSize: '100% 4px',
          opacity: 0.1
        }}></div>
      </div>
    </div>
  );
};