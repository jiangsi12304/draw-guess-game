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
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md space-y-8">
        {/* 欢迎卡片 */}
        <GlassCard className="text-center space-y-4" hoverEffect={false}>
          <div className="text-7xl mb-2 animate-float">🎨</div>
          <h1 className="text-4xl font-display font-bold gradient-text">
            你画我猜
          </h1>
          <p className="text-white/80 text-lg">享受创意与欢乐的绘画游戏</p>
          <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4" />
          <p className="text-white/60 text-sm">与朋友一起，挥洒创意，猜测画作</p>
        </GlassCard>

        {/* 玩家信息 */}
        <GlassCard className="flex items-center gap-4 p-4" hoverEffect={false}>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-warm-pink to-warm-orange flex items-center justify-center text-3xl shadow-lg animate-float">
            {playerAvatar}
          </div>
          <div className="flex-1">
            <p className="text-sm text-white/60 font-medium">欢迎回来</p>
            <p className="text-xl font-bold text-white">{playerName}</p>
          </div>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.6)]" />
        </GlassCard>

        {/* 菜单按钮 */}
        <div className="space-y-3 relative z-20">
          <GlowButton onClick={onCreateRoom} className="w-full text-lg py-4" size="lg">
            <span className="mr-2">➕</span>
            创建房间
          </GlowButton>
          <GlowButton
            variant="secondary"
            onClick={onJoinRoom}
            className="w-full text-lg py-4"
            size="lg"
          >
            <span className="mr-2">🔗</span>
            加入房间
          </GlowButton>
          <GlowButton
            variant="secondary"
            onClick={onLogout}
            className="w-full text-lg py-4"
            size="lg"
          >
            <span className="mr-2">🚪</span>
            退出游戏
          </GlowButton>
        </div>

        {/* 提示信息 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-4 bg-gradient-to-br from-white/20 to-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="text-3xl mb-2 animate-float" style={{ animationDelay: '0s' }}>👥</div>
            <p className="text-xs text-white/70 font-medium">2-6人</p>
            <p className="text-xs text-white/50">多人游戏</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-white/20 to-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="text-3xl mb-2 animate-float" style={{ animationDelay: '0.5s' }}>⏱️</div>
            <p className="text-xs text-white/70 font-medium">实时</p>
            <p className="text-xs text-white/50">联机对战</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-white/20 to-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="text-3xl mb-2 animate-float" style={{ animationDelay: '1s' }}>🎮</div>
            <p className="text-xs text-white/70 font-medium">无限</p>
            <p className="text-xs text-white/50">游戏乐趣</p>
          </div>
        </div>
      </div>
    </div>
  );
}
