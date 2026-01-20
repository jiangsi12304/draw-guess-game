import GlassCard from '../UI/GlassCard';

interface ScoreEntry {
  username: string;
  avatar: string;
  score: number;
}

interface ScoreBoardProps {
  scores: ScoreEntry[];
  currentUserId?: string;
}

export default function ScoreBoard({ scores }: ScoreBoardProps) {
  // 按分数排序
  const sorted = [...scores].sort((a, b) => b.score - a.score);

  return (
    <GlassCard className="space-y-4">
      <h3 className="text-lg font-display font-bold text-white">🏆 排行榜</h3>

      <div className="space-y-2">
        {sorted.length === 0 ? (
          <p className="text-center text-gray-300 py-4">还没有玩家加入</p>
        ) : (
          sorted.map((entry, index) => (
            <div
              key={entry.username}
              className={`p-3 rounded-lg flex items-center justify-between ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-l-4 border-yellow-400'
                  : index === 1
                  ? 'bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-l-4 border-gray-400'
                  : index === 2
                  ? 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-l-4 border-amber-600'
                  : 'bg-glass-white'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xl font-display font-bold">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </span>
                <span className="text-2xl">{entry.avatar}</span>
                <div>
                  <p className="font-semibold text-white">{entry.username}</p>
                </div>
              </div>
              <span className="text-xl font-bold text-warm-orange">{entry.score}</span>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
