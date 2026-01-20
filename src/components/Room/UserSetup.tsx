import { useState } from 'react';
import GlassCard from '../UI/GlassCard';
import GlowButton from '../UI/GlowButton';
import AvatarPicker from '../UI/AvatarPicker';

interface UserSetupProps {
  onSetupComplete: (nickname: string, avatarIndex: number) => void;
}

export default function UserSetup({ onSetupComplete }: UserSetupProps) {
  const [nickname, setNickname] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!nickname.trim()) {
      setError('请输入昵称');
      return;
    }
    if (nickname.length > 20) {
      setError('昵称不能超过20个字符');
      return;
    }
    onSetupComplete(nickname, avatarIndex);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-display font-bold gradient-text">
            🎨 你画我猜
          </h1>
          <p className="text-gray-200">与朋友一起享受创意绘画游戏</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              输入你的昵称
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError('');
              }}
              placeholder="例：艺术大师"
              maxLength={20}
              className="w-full glass px-4 py-3 rounded-lg text-white"
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>

          <AvatarPicker selectedIndex={avatarIndex} onSelect={setAvatarIndex} />

          <GlowButton
            onClick={handleSubmit}
            className="w-full text-lg"
          >
            进入游戏大厅
          </GlowButton>
        </div>
      </GlassCard>
    </div>
  );
}
