import { useState } from 'react';
import GlassCard from '../UI/GlassCard';
import GlowButton from '../UI/GlowButton';

interface CreateRoomProps {
  onCreateRoom: (roomName: string, maxRounds: number, roundDuration: number) => Promise<void>;
  onBack: () => void;
}

export default function CreateRoom({ onCreateRoom, onBack }: CreateRoomProps) {
  const [roomName, setRoomName] = useState('');
  const [maxRounds, setMaxRounds] = useState(5);
  const [roundDuration, setRoundDuration] = useState(60);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!roomName.trim()) {
      setError('请输入房间名称');
      return;
    }
    try {
      await onCreateRoom(roomName, maxRounds, roundDuration);
    } catch (err: any) {
      setError(err.message || '创建房间失败');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md space-y-6">
        <h2 className="text-3xl font-display font-bold text-white text-center">
          创建新房间
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              房间名称
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => {
                setRoomName(e.target.value);
                setError('');
              }}
              placeholder="例：朋友聚会"
              maxLength={30}
              className="w-full glass px-4 py-3 rounded-lg text-white"
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              游戏轮数：{maxRounds}
            </label>
            <input
              type="range"
              min="3"
              max="10"
              value={maxRounds}
              onChange={(e) => setMaxRounds(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              每轮时间：{roundDuration}秒
            </label>
            <input
              type="range"
              min="30"
              max="120"
              step="10"
              value={roundDuration}
              onChange={(e) => setRoundDuration(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-3">
            <GlowButton
              variant="secondary"
              onClick={onBack}
              className="flex-1"
            >
              返回
            </GlowButton>
            <GlowButton
              onClick={handleCreate}
              className="flex-1"
            >
              创建房间
            </GlowButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
