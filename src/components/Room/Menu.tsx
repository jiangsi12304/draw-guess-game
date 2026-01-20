import GlassCard from '../UI/GlassCard';
import GlowButton from '../UI/GlowButton';

interface MenuProps {
  playerName: string;
  playerAvatar: string;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onLogout: () => void;
}

export default function Menu({
  playerName,
  playerAvatar,
  onCreateRoom,
  onJoinRoom,
  onLogout,
}: MenuProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* 欢迎卡片 */}
        <GlassCard className="text-center space-y-4">
          <h1 className="text-5xl font-display font-bold gradient-text">
            🎨
          </h1>
          <h2 className="text-3xl font-display font-bold text-white">
            你画我猜
          </h2>
          <p className="text-gray-200">享受创意与欢乐的绘画游戏</p>
        </GlassCard>

        {/* 玩家信息 */}
        <GlassCard className="flex items-center gap-4">
          <span className="text-4xl">{playerAvatar}</span>
          <div className="flex-1">
            <p className="text-sm text-gray-300">欢迎回来</p>
            <p className="text-xl font-semibold text-white">{playerName}</p>
          </div>
        </GlassCard>

        {/* 菜单按钮 */}
        <div className="space-y-3">
          <GlowButton onClick={onCreateRoom} className="w-full text-lg">
            ➕ 创建房间
          </GlowButton>
          <GlowButton
            variant="secondary"
            onClick={onJoinRoom}
            className="w-full text-lg"
          >
            🔗 加入房间
          </GlowButton>
          <GlowButton
            variant="secondary"
            onClick={onLogout}
            className="w-full text-lg"
          >
            🚪 退出游戏
          </GlowButton>
        </div>

        {/* 提示信息 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-glass-white rounded-lg">
            <p className="text-2xl">👥</p>
            <p className="text-xs text-gray-300 mt-1">2-6人</p>
          </div>
          <div className="text-center p-3 bg-glass-white rounded-lg">
            <p className="text-2xl">⏱️</p>
            <p className="text-xs text-gray-300 mt-1">实时联机</p>
          </div>
          <div className="text-center p-3 bg-glass-white rounded-lg">
            <p className="text-2xl">🎮</p>
            <p className="text-xs text-gray-300 mt-1">无限乐趣</p>
          </div>
        </div>
      </div>
    </div>
  );
}
