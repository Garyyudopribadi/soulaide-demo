import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import {
  MessageSquare,
  Send,
  UserCheck,
  X,
  Radio,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth.ts';
import { chatService } from './chatService.ts';
import { presenceService, PRESENCE_CONFIG } from './presenceService.ts';
import type { ChatMessage, PresenceStatus } from './types.ts';
import type { CustomerBookingRecord } from '@/features/booking/bookingService.ts';

interface RealtimeChatModalProps {
  booking: CustomerBookingRecord | null;
  onClose: () => void;
}

export const RealtimeChatModal: React.FC<RealtimeChatModalProps> = ({ booking, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [psychologistPresence, setPsychologistPresence] = useState<PresenceStatus>('offline');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // Load conversation and messages
  useEffect(() => {
    if (!booking || !user) return;

    let isMounted = true;
    let unsubscribeChat: (() => void) | null = null;
    let unsubscribePresence: (() => void) | null = null;

    const initChat = async () => {
      try {
        setIsLoading(true);
        // 1. Get or create conversation
        const conv = await chatService.getOrCreateBookingConversation(
          booking.id,
          user.id,
          booking.psychologist.id
        );

        if (!isMounted) return;
        setConversationId(conv.id);

        // 2. Fetch history
        const history = await chatService.getConversationMessages(conv.id);
        if (isMounted) {
          setMessages(history);
          setIsLoading(false);
        }

        // 3. Mark existing messages as read
        await chatService.markMessagesAsRead(conv.id, user.id);

        // 4. Subscribe to new messages via Realtime
        unsubscribeChat = chatService.subscribeToMessages(conv.id, (newMsg) => {
          if (!isMounted) return;
          setMessages((prev) => {
            // Deduplicate if already present
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Mark as read if from other participant
          if (newMsg.sender_id !== user.id) {
            chatService.markMessagesAsRead(conv.id, user.id);
          }
        });

        // 5. Fetch and subscribe to psychologist presence
        const currentPresence = await presenceService.getPsychologistPresence(booking.psychologist.id);
        if (isMounted) setPsychologistPresence(currentPresence);

        unsubscribePresence = presenceService.subscribeToPresence(
          booking.psychologist.id,
          (status) => {
            if (isMounted) setPsychologistPresence(status);
          }
        );
      } catch (err) {
        console.error('Error initializing chat:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    initChat();

    return () => {
      isMounted = false;
      if (unsubscribeChat) unsubscribeChat();
      if (unsubscribePresence) unsubscribePresence();
    };
  }, [booking, user]);

  if (!booking) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !conversationId || !user || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const created = await chatService.sendMessage(conversationId, user.id, textToSend);
      setMessages((prev) => {
        if (prev.some((m) => m.id === created.id)) return prev;
        return [...prev, created];
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const presenceInfo = PRESENCE_CONFIG[psychologistPresence] || PRESENCE_CONFIG.offline;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-xl bg-white shadow-2xl border-slate-200 flex flex-col h-[650px] max-h-[92vh] overflow-hidden rounded-2xl">
        {/* Modal Header */}
        <CardHeader className="bg-slate-50 border-b border-slate-200 p-4 shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-700 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                  <span>Koordinasi Sesi</span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {booking.bookingCode}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-plum-600" />
                    <span>Psikolog: {booking.psychologist.fullName}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium">
                    <span className={`w-2 h-2 rounded-full ${presenceInfo.color}`}></span>
                    <span className="text-slate-600">{presenceInfo.label}</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        {/* Chat Messages Body */}
        <CardContent className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
              <Radio className="w-6 h-6 animate-pulse text-plum-600" />
              <p className="text-xs">Menghubungkan ke ruang pesan aman...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada pesan koordinasi. Kirim pesan pertama untuk konfirmasi sesi.
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              const isSystem = msg.content.startsWith('[Sistem Soulaide]');

              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center my-2">
                    <span className="inline-block px-3 py-1.5 bg-slate-200/70 text-slate-600 rounded-full text-[11px] font-medium max-w-sm">
                      {msg.content.replace('[Sistem Soulaide]:', '').trim()}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                      isMe
                        ? 'bg-plum-600 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p className="font-semibold text-[10px] mb-0.5 opacity-80">
                      {isMe ? 'Anda' : booking.psychologist.fullName}
                    </p>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMe && (
                      <CheckCheck
                        className={`w-3.5 h-3.5 ${msg.is_read ? 'text-plum-600' : 'text-slate-300'}`}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Message Input Footer */}
        <CardFooter className="p-3 border-t border-slate-200 bg-white shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tulis pesan konfirmasi jadwal atau kendala teknis..."
              disabled={isLoading || isSending}
              className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-plum-500 focus:border-plum-500 bg-slate-50 disabled:opacity-50"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputText.trim() || isLoading || isSending}
              className="bg-plum-600 hover:bg-plum-700 text-white gap-1.5 px-4 text-xs font-semibold"
            >
              <span>{isSending ? 'Mengirim...' : 'Kirim'}</span>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};
