import { useState, useEffect } from 'react';
import GlassCard from '../UI/GlassCard';
import GlowButton from '../UI/GlowButton';
import type { WordItem } from '../../types';
import { soundManager } from '../../utils/soundManager';

interface WordSelectionProps {
  wordOptions: WordItem[];
  onSelectWord: (word: string) => void;
  isDrawer: boolean;
  timeLeft?: number;
}

export default function WordSelection({
  wordOptions,
  onSelectWord,
  isDrawer,
  timeLeft = 10
}: WordSelectionProps) {
  const [countdown, setCountdown] = useState(timeLeft);

  const handleWordSelect = (word: string) => {
    soundManager.playWordSelect();
    onSelectWord(word);
  };

  useEffect(() => {
    if (countdown <= 0 || !isDrawer) return;

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isDrawer]);

  // 如果倒计时结束且未选择，随机选择一个
  useEffect(() => {
    if (countdown <= 0 && isDrawer && wordOptions.length > 0) {
      onSelectWord(wordOptions[0].word);
    }
  }, [countdown, isDrawer, wordOptions, onSelectWord]);

  if (!isDrawer) {
    return (
      <GlassCard className="bg-gradient-to-r from-blue-400/20 to-purple-400/20 border-2 border-blue-400">
        <div className="text-center py-8">
          <p className="text-lg font-bold text-blue-300 mb-2">
            🎨 画家正在选择词语...
          </p>
          <p className="text-sm text-gray-300">
            请耐心等待！
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400">
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display gradient-text mb-2">
            ✏️ 选择一个词语来绘画
          </h2>
          <p className="text-sm text-gray-300">
            倒计时: <span className="font-bold text-yellow-300">{countdown}秒</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wordOptions.map((word, index) => (
            <GlowButton
              key={index}
              onClick={() => handleWordSelect(word.word)}
              className="py-8 px-4 flex flex-col items-center gap-2 h-full"
            >
              <span className="text-3xl mb-2">
                {index === 0 ? '🅰️' : index === 1 ? '🅱️' : '©️'}
              </span>
              <div>
                <p className="text-2xl font-bold text-white">{word.word}</p>
                <p className="text-xs text-gray-300 mt-1">
                  {word.category} • {word.difficulty}
                </p>
              </div>
            </GlowButton>
          ))}
        </div>

        <p className="text-xs text-gray-400">
          提示：选择你觉得最容易表现的词语
        </p>
      </div>
    </GlassCard>
  );
}
