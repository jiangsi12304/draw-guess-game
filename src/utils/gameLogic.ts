// 计算 Levenshtein 距离，用于判断相似度
export function levenshteinDistance(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= bLen; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= aLen; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bLen; i++) {
    for (let j = 1; j <= aLen; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[bLen][aLen];
}

// 检查答案是否正确
export function checkAnswer(guess: string, answer: string): {
  isCorrect: boolean;
  similarity: number;
} {
  const normalizedGuess = guess.toLowerCase().trim();
  const normalizedAnswer = answer.toLowerCase().trim();

  // 完全匹配
  if (normalizedGuess === normalizedAnswer) {
    return { isCorrect: true, similarity: 1 };
  }

  // 检查距离
  const distance = levenshteinDistance(normalizedGuess, normalizedAnswer);
  const maxLen = Math.max(normalizedGuess.length, normalizedAnswer.length);
  const similarity = 1 - distance / maxLen;

  // 如果相似度超过 70% 则视为正确
  return {
    isCorrect: similarity > 0.7,
    similarity,
  };
}

// 计算得分
export function calculateScore(
  timeRemaining: number,
  roundDuration: number,
  isDrawer: boolean
): number {
  const baseScore = 100;
  const timeBonus = Math.floor((timeRemaining / roundDuration) * 50);
  const drawerBonus = isDrawer ? 20 : 0;

  return baseScore + timeBonus + drawerBonus;
}

// 生成房间邀请码
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 生成唯一 ID
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 格式化时间
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 截断文本
export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// 获取头像URL
export const AVATARS = [
  '😀', '😂', '😍', '🤔', '😎', '🤗', '😴', '🤩',
  '🐶', '🐱', '🐭', '🦁', '🐯', '🐻', '🐼', '🐨',
  '🦄', '🐮', '🐷', '🐸', '🦆', '🦅', '🦉', '🦊',
];

export function getAvatarEmoji(index: number): string {
  return AVATARS[index % AVATARS.length];
}

// 获取随机单词
export function getRandomWord(difficulty?: 'easy' | 'normal' | 'hard'): { word: string } {
  // 这里简化处理，实际应该从 wordBank 获取
  return { word: '苹果' };
}
