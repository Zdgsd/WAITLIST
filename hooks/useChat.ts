import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Assuming supabaseClient.ts exists

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

export const useChat = (nickname: string, userRole: string, sessionId: number) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string>('00000000-0000-0000-0000-000000000001'); // Default to welcome lounge
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  // Fetch chat rooms on mount
  useEffect(() => {
    const fetchChatRooms = async () => {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        console.error("Error fetching chat rooms:", error);
      } else {
        setChatRooms(data || []);
      }
    };
    fetchChatRooms();
  }, []);

  // Load messages for active room and subscribe to changes
  useEffect(() => {
    setIsLoading(true);
    setMessages([]); // Clear messages when room changes

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', activeRoomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error("Error loading messages:", error);
      } else {
        setMessages(data || []);
      }
      setIsLoading(false);
    };

    loadMessages();

    const channel = supabase.channel(`room-${activeRoomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${activeRoomId}` },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoomId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsLoading(true);

    const { error } = await supabase.from('chat_messages').insert({
      room_id: activeRoomId,
      user_name: nickname,
      user_role: userRole,
      message: text,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error sending message:", error);
    }
    setIsLoading(false);
  }, [nickname, userRole, activeRoomId]);

  return {
    messages,
    sendMessage,
    isLoading,
    chatRooms,
    activeRoomId,
    setActiveRoomId,
  };
};