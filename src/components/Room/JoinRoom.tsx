import { useState } from 'react';
import GlassCard from '../UI/GlassCard';
import GlowButton from '../UI/GlowButton';

interface JoinRoomProps {
  onJoinRoom: (code: string) => Promise<void>;
  onBack: () => void;
  error?: string;
  isLoading?: boolean;
}

export default function JoinRoom({ onJoinRoom, onBack, error, isLoading = false }: JoinRoomProps) {
  const [code, setCode] = useState('');

  const handleJoin = async () => {
    if (code.trim().length === 6) {
      await onJoinRoom(code.toUpperCase());
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      await handleJoin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-xl font-semibold">正在加入房间...</p>
          </div>
        </div>
      )}

      <GlassCard className="w-full max-w-md space-y-6">
        <h2 className="text-3xl font-display font-bold text-white text-center">
          加入房间
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              输入邀请码（6位）
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyPress={handleKeyPress}
              placeholder="例：ABC123"
              maxLength={6}
              className="w-full glass px-4 py-3 rounded-lg text-white text-center text-2xl font-mono"
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>

          <p className="text-center text-gray-300 text-sm">
            请让房主分享邀请码
          </p>

          <div className="flex gap-3">
            <GlowButton
              variant="secondary"
              onClick={onBack}
              className="flex-1"
            >
              返回
            </GlowButton>
            <GlowButton
              onClick={handleJoin}
              disabled={code.length !== 6}
              className="flex-1"
            >
              加入房间
            </GlowButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
