import { useState } from 'react';
import GlassCard from '../UI/GlassCard';
import GlowButton from '../UI/GlowButton';
import type { User } from '../../types';

interface LobbyProps {
  roomCode: string;
  players: User[];
  currentUserId: string;
  isHost: boolean;
  onStartGame: () => void;
  onLeave: () => void;
  onToggleReady?: (ready: boolean) => void;
}

export default function Lobby({
  roomCode,
  players,
  currentUserId,
  isHost,
  onStartGame,
  onLeave,
  onToggleReady,
}: LobbyProps) {
  const [copied, setCopied] = useState(false);

  // 获取当前用户的准备状态
  const currentPlayer = players.find(p => p.id === currentUserId);
  const isCurrentPlayerReady = currentPlayer?.isReady ?? false;

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allReady = players.length >= 2 && players.every(p => p.isReady);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        {/* 房间信息 */}
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold gradient-text">
              🎮 游戏大厅
            </h2>
            {isHost && <span className="bg-warm-pink px-3 py-1 rounded-full text-sm font-semibold">👑 房主</span>}
          </div>

          <div className="bg-glass-white p-4 rounded-lg space-y-2">
            <p className="text-gray-200">邀请码</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                readOnly
                className="flex-1 glass px-4 py-3 rounded-lg text-white text-2xl font-mono text-center"
              />
              <GlowButton onClick={copyCode} className="whitespace-nowrap">
                {copied ? '✓ 已复制' : '📋 复制'}
              </GlowButton>
            </div>
            <p className="text-sm text-gray-300">
              分享此邀请码给你的朋友来加入房间
            </p>
          </div>
        </GlassCard>

        {/* 玩家列表 */}
        <GlassCard className="space-y-4">
          <h3 className="text-lg font-display font-bold text-white">
            👥 玩家列表 ({players.length}/6)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {players.map((player) => (
              <div
                key={player.id}
                className={`p-4 rounded-lg flex items-center justify-between ${
                  player.isReady
                    ? 'bg-gradient-to-r from-green-400/20 to-emerald-400/20 border-l-4 border-green-400'
                    : 'bg-glass-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{player.avatar}</span>
                  <div>
                    <p className="font-semibold text-white">{player.nickname}</p>
                    <p className="text-xs text-gray-300">
                      {player.id === currentUserId ? '（你）' : ''}
                    </p>
                  </div>
                </div>
                <span className="text-2xl">
                  {player.isReady ? '✅' : '⏳'}
                </span>
              </div>
            ))}
          </div>

          {players.length < 2 && (
            <p className="text-center text-warm-yellow font-semibold">
              需要至少 2 名玩家才能开始游戏
            </p>
          )}
        </GlassCard>

        {/* 控制按钮 */}
        <div className="flex gap-3">
          {!isHost && (
            <GlowButton
              variant={isCurrentPlayerReady ? "primary" : "secondary"}
              onClick={() => onToggleReady?.(!isCurrentPlayerReady)}
              className="flex-1"
            >
              {isCurrentPlayerReady ? '✅ 已准备' : '⏳ 准备游戏'}
            </GlowButton>
          )}
          <GlowButton
            variant="secondary"
            onClick={onLeave}
            className="flex-1"
          >
            退出房间
          </GlowButton>
          {isHost && (
            <GlowButton
              onClick={onStartGame}
              disabled={!allReady || players.length < 2}
              className="flex-1"
            >
              开始游戏
            </GlowButton>
          )}
        </div>
      </div>
    </div>
  );
}
