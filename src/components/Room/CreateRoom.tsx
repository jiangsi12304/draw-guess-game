import { useState } from 'react';
import GlassCard from '../UI/GlassCard';
import GlowButton from '../UI/GlowButton';
import { wordBank } from '../../data/wordBank';

interface CreateRoomProps {
  onCreateRoom: (roomName: string, maxRounds: number, roundDuration: number, difficulty: 'easy' | 'normal' | 'hard' | 'all', customWords?: string[]) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
}

export default function CreateRoom({ onCreateRoom, onBack, isLoading = false }: CreateRoomProps) {
  const [roomName, setRoomName] = useState('');
  const [maxRounds, setMaxRounds] = useState(5);
  const [roundDuration, setRoundDuration] = useState(60);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard' | 'all'>('all');
  const [useCustomWords, setUseCustomWords] = useState(false);
  const [customWords, setCustomWords] = useState('');
  const [error, setError] = useState('');

  // 获取不同难度的词语数量
  const wordCount = {
    easy: wordBank.filter(w => w.difficulty === 'easy').length,
    normal: wordBank.filter(w => w.difficulty === 'normal').length,
    hard: wordBank.filter(w => w.difficulty === 'hard').length,
    all: wordBank.length
  };

  const handleCreate = async () => {
    console.log('=== CreateRoom handleCreate 开始 ===');
    console.log('创建房间按钮被点击');
    console.log('房间名称:', roomName);
    console.log('房间参数:', { maxRounds, roundDuration, difficulty });

    if (!roomName.trim()) {
      console.log('房间名称为空，显示错误');
      setError('请输入房间名称');
      return;
    }

    if (useCustomWords && customWords.trim()) {
      const words = customWords.split(/[,，\n]/).map(w => w.trim()).filter(w => w);
      if (words.length < 10) {
        console.log('自定义词语数量不足');
        setError('自定义词库至少需要10个词语');
        return;
      }
      console.log('使用自定义词库创建房间');
      console.log('调用 onCreateRoom...');
      try {
        await onCreateRoom(roomName, maxRounds, roundDuration, difficulty, words);
        console.log('onCreateRoom 调用完成');
      } catch (err: any) {
        console.error('创建房间失败:', err);
        setError(err.message || '创建房间失败');
      }
    } else {
      console.log('使用默认词库创建房间');
      console.log('调用 onCreateRoom...');
      try {
        await onCreateRoom(roomName, maxRounds, roundDuration, difficulty);
        console.log('onCreateRoom 调用完成');
      } catch (err: any) {
        console.error('创建房间失败:', err);
        setError(err.message || '创建房间失败');
      }
    }
    console.log('=== CreateRoom handleCreate 完成 ===');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-20">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-xl font-semibold">正在创建房间...</p>
          </div>
        </div>
      )}

      <GlassCard className="w-full max-w-md space-y-6" style={{ pointerEvents: 'auto' }}>
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
                console.log('房间名称输入:', e.target.value);
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

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              词语难度
            </label>
            <div className="grid grid-cols-2 gap-2">
              <GlowButton
                variant={difficulty === 'easy' ? 'primary' : 'secondary'}
                onClick={() => setDifficulty('easy')}
                className="text-sm"
              >
                😊 简单 ({wordCount.easy}词)
              </GlowButton>
              <GlowButton
                variant={difficulty === 'normal' ? 'primary' : 'secondary'}
                onClick={() => setDifficulty('normal')}
                className="text-sm"
              >
                🤔 普通 ({wordCount.normal}词)
              </GlowButton>
              <GlowButton
                variant={difficulty === 'hard' ? 'primary' : 'secondary'}
                onClick={() => setDifficulty('hard')}
                className="text-sm"
              >
                😈 困难 ({wordCount.hard}词)
              </GlowButton>
              <GlowButton
                variant={difficulty === 'all' ? 'primary' : 'secondary'}
                onClick={() => setDifficulty('all')}
                className="text-sm"
              >
                🎲 全部 ({wordCount.all}词)
              </GlowButton>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomWords}
                onChange={(e) => setUseCustomWords(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-sm font-semibold text-white">
                使用自定义词库
              </span>
            </label>
            {useCustomWords && (
              <div className="mt-2">
                <textarea
                  value={customWords}
                  onChange={(e) => setCustomWords(e.target.value)}
                  placeholder="输入自定义词语，用逗号分隔&#10;例如：苹果,香蕉,猫,狗"
                  rows={4}
                  className="w-full glass px-4 py-3 rounded-lg text-white resize-none"
                />
                <p className="text-xs text-gray-300 mt-1">
                  {customWords.split(/[,，\n]/).filter(w => w.trim()).length} 个词语（至少10个）
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <GlowButton
              variant="secondary"
              onClick={() => {
                console.log('返回按钮被点击');
                onBack();
              }}
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
