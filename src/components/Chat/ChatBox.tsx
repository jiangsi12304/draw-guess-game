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
    <GlassCard className="space-y-4 flex flex-col h-full" hoverEffect={false}>
      <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
        <span className="text-xl">💬</span>
        <span className="gradient-text">聊天</span>
        <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full text-white/80">
          {messages.length} 条消息
        </span>
      </h3>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px] pr-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-5xl mb-3 float">💭</div>
            <p className="text-white/70 font-medium">还没有消息</p>
            <p className="text-white/50 text-sm">开始猜测吧！</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`message-enter p-3 rounded-lg backdrop-blur-md border transition-all duration-300 ${
                msg.isCorrect
                  ? 'bg-gradient-to-r from-green-400/20 to-emerald-400/20 border-l-4 border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.3)]'
                  : 'bg-gradient-to-r from-white/20 to-white/10 border border-white/20 hover:border-white/30 hover:shadow-lg'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-baseline gap-2">
                <span
                  className={`font-semibold ${
                    msg.isCorrect ? 'text-green-400' : 'text-warm-pink'
                  }`}
                >
                  {msg.username}:
                </span>
                <span className="text-white flex-1 break-words font-medium">{msg.text}</span>
                {msg.isCorrect && (
                  <span className="text-sm text-green-400 font-bold animate-pulse">
                    ✓ 正确
                  </span>
                )}
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
            <div className="flex items-center gap-2 text-sm bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm border border-white/20">
              <span className="text-yellow-300">💡</span>
              <span className="text-white/80">
                提示：这个词有 <span className="font-bold text-white">{currentWord.length}</span> 个字
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入你的猜测..."
              className="flex-1 glass px-4 py-3 rounded-xl text-white resize-none text-base placeholder-white/50"
              rows={2}
            />
            <GlowButton
              onClick={handleSend}
              className="self-end"
              disabled={!input.trim()}
              size="md"
            >
              发送
            </GlowButton>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
