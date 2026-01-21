import DrawingCanvas from '../Canvas/DrawingCanvas';
import ChatBox from '../Chat/ChatBox';
import Timer from './Timer';
import ScoreBoard from './ScoreBoard';
import GlassCard from '../UI/GlassCard';
import GlowButton from '../UI/GlowButton';
import type { User, ChatMessage } from '../../types';
import { checkAnswer } from '../../utils/gameLogic';

interface GameBoardProps {
  players: User[];
  currentUserId: string;
  currentDrawerId: string;
  currentWord: string;
  roundNumber: number;
  maxRounds: number;
  roundDuration: number;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onTimeUp: () => void;
  scores: Record<string, number>;
  roomCode?: string;
  revealedWord?: string | null;
}

export default function GameBoard({
  players,
  currentUserId,
  currentDrawerId,
  currentWord,
  roundNumber,
  maxRounds,
  roundDuration,
  messages,
  onSendMessage,
  onTimeUp,
  scores,
  roomCode,
  revealedWord,
}: GameBoardProps) {
  const isDrawer = currentUserId === currentDrawerId;
  const currentDrawer = players.find(p => p.id === currentDrawerId);
  const playerScores = players.map(p => ({
    username: p.nickname,
    avatar: p.avatar,
    score: scores[p.id] || 0,
  }));

  const handleSendMessage = (text: string) => {
    const { isCorrect } = checkAnswer(text, currentWord);

    if (isCorrect && !isDrawer) {
      // 播放正确声音
      console.log('猜对了！');
    }

    onSendMessage(text);
  };

  return (
    <div className="min-h-screen p-4 space-y-4">
      {/* 答案揭晓提示 */}
      {revealedWord && (
        <GlassCard className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400">
          <div className="text-center py-4">
            <p className="text-lg font-bold text-yellow-300 mb-2">
              {revealedWord ? '答案揭晓！' : '答案揭晓！'}
            </p>
            <p className="text-3xl font-bold text-white">{revealedWord}</p>
            <p className="text-sm text-gray-300 mt-2">即将进入下一题...</p>
          </div>
        </GlassCard>
      )}

      {/* 头部信息 */}
      <GlassCard className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">
            {isDrawer ? '✏️ 你在绘画' : '👀 观看绘画'}
          </h2>
          <p className="text-gray-300">
            绘画者：<span className="font-semibold">{currentDrawer?.nickname}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-300">第 {roundNumber} / {maxRounds} 轮</p>
          <p className="text-2xl font-bold gradient-text">
            {isDrawer ? '？' : currentWord.length > 0 ? `${currentWord.length} 字` : ''}
          </p>
        </div>
      </GlassCard>

      {/* 主游戏区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧：画布 */}
        <div className="lg:col-span-2">
          <DrawingCanvas
            width={600}
            height={500}
            isDrawer={isDrawer}
            roomCode={roomCode}
          />
        </div>

        {/* 右侧：计时器和排行榜 */}
        <div className="space-y-4">
          <GlassCard className="flex flex-col items-center">
            <h3 className="text-lg font-display font-bold text-white mb-4">⏱️ 时间</h3>
            <Timer
              duration={roundDuration}
              onTimeUp={onTimeUp}
              isActive={true}
            />
          </GlassCard>

          <ScoreBoard scores={playerScores} currentUserId={currentUserId} />
        </div>
      </div>

      {/* 聊天区域 */}
      <ChatBox
        messages={messages}
        onSendMessage={handleSendMessage}
        isGuessing={!isDrawer}
        currentWord={isDrawer ? '' : currentWord}
      />

      {/* 游戏控制 */}
      <GlassCard className="text-center">
        <p className="text-gray-300 mb-4">
          {isDrawer
            ? '画出单词，让其他玩家猜测！'
            : '仔细观察，快速猜出是什么！'}
        </p>
        <GlowButton variant="secondary" className="text-sm">
          继续游戏
        </GlowButton>
      </GlassCard>
    </div>
  );
}
