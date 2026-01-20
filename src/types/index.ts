// 用户相关类型
export interface User {
  id: string;
  nickname: string;
  avatar: string;
  score: number;
  isReady: boolean;
}

// 房间相关类型
export interface Room {
  id: string;
  code: string;
  host: string;
  players?: User[];
  gameState: 'waiting' | 'playing' | 'finished';
  currentRound: number;
  maxRounds: number;
  createdAt: number;
}

// 游戏状态类型
export interface GameState {
  currentDrawer: string;
  currentWord: string;
  roundStartTime: number;
  roundDuration: number; // 秒
  scores: Record<string, number>;
  guessedBy: string[];
}

// 绘画数据类型
export interface DrawingStroke {
  x: number;
  y: number;
}

export interface DrawingAction {
  type: 'stroke' | 'erase' | 'clear' | 'undo';
  data?: DrawingStroke[];
  color?: string;
  width?: number;
}

// 聊天消息类型
export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
  isCorrect?: boolean;
}

// 排行榜类型
export interface LeaderboardEntry {
  username: string;
  avatar: string;
  score: number;
  rank: number;
}

// 词库项目类型
export interface WordItem {
  word: string;
  difficulty: 'easy' | 'normal' | 'hard';
  category: string;
}
