import { useRef, useEffect, useState } from 'react';
import GlassCard from '../UI/GlassCard';
import GlowButton from '../UI/GlowButton';
import type { ChatMessage } from '../../types';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isGuessing?: boolean;
  currentWord?: string;
}

export default function ChatBox({
  messages,
  onSendMessage,
  isGuessing = true,
  currentWord = '',
}: ChatBoxProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <GlassCard className="space-y-4 flex flex-col h-full">
      <h3 className="text-lg font-display font-bold text-white">💬 聊天</h3>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px]">
        {messages.length === 0 ? (
          <p className="text-center text-gray-300 py-8">还没有消息，开始猜吧！</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.isCorrect
                  ? 'bg-green-400/20 border-l-4 border-green-400'
                  : 'bg-glass-white'
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-warm-pink">{msg.username}:</span>
                <span className="text-white flex-1 break-words">{msg.text}</span>
                {msg.isCorrect && <span className="text-sm text-green-400">✓ 正确</span>}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      {isGuessing && (
        <div className="space-y-2">
          {currentWord && (
            <div className="text-sm text-gray-300">
              💡 提示：这个词有 <span className="font-bold">{currentWord.length}</span> 个字
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入你的猜测..."
              className="flex-1 glass px-3 py-2 rounded-lg text-white resize-none"
              rows={2}
            />
            <GlowButton onClick={handleSend} className="self-end">
              发送
            </GlowButton>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
