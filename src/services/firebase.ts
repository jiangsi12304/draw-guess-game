import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  push,
} from 'firebase/database';

// Firebase 配置 - 请替换为你的项目信息
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// 房间操作
export const roomsService = {
  // 创建房间
  async createRoom(roomCode: string, room: any) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    await set(roomRef, {
      ...room,
      createdAt: Date.now(),
    });
  },

  // 获取房间
  async getRoom(roomCode: string) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    return snapshot.val();
  },

  // 加入房间
  async joinRoom(roomCode: string, player: any) {
    const playersRef = ref(database, `rooms/${roomCode}/players`);
    await push(playersRef, player);
  },

  // 更新房间
  async updateRoom(roomCode: string, updates: any) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    await update(roomRef, updates);
  },

  // 移除玩家
  async removePlayer(roomCode: string, playerId: string) {
    const playersRef = ref(database, `rooms/${roomCode}/players`);
    const snapshot = await get(playersRef);
    const players = snapshot.val();

    for (const key in players) {
      if (players[key].id === playerId) {
        await remove(ref(database, `rooms/${roomCode}/players/${key}`));
        break;
      }
    }
  },

  // 监听房间变化
  onRoomChange(roomCode: string, callback: (room: any) => void) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    return onValue(roomRef, (snapshot) => {
      callback(snapshot.val());
    });
  },

  // 清理房间
  async deleteRoom(roomCode: string) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    await remove(roomRef);
  },
};

// 游戏状态操作
export const gameStateService = {
  // 创建游戏状态
  async initGameState(roomCode: string, gameState: any) {
    const gameRef = ref(database, `games/${roomCode}/state`);
    await set(gameRef, gameState);
  },

  // 获取游戏状态
  async getGameState(roomCode: string) {
    const gameRef = ref(database, `games/${roomCode}/state`);
    const snapshot = await get(gameRef);
    return snapshot.val();
  },

  // 更新游戏状态
  async updateGameState(roomCode: string, updates: any) {
    const gameRef = ref(database, `games/${roomCode}/state`);
    await update(gameRef, updates);
  },

  // 监听游戏状态变化
  onGameStateChange(roomCode: string, callback: (state: any) => void) {
    const gameRef = ref(database, `games/${roomCode}/state`);
    return onValue(gameRef, (snapshot) => {
      callback(snapshot.val());
    });
  },
};

// 聊天消息操作
export const messagesService = {
  // 发送消息
  async sendMessage(roomCode: string, message: any) {
    const messagesRef = ref(database, `games/${roomCode}/messages`);
    await push(messagesRef, {
      ...message,
      timestamp: Date.now(),
    });
  },

  // 获取消息
  async getMessages(roomCode: string) {
    const messagesRef = ref(database, `games/${roomCode}/messages`);
    const snapshot = await get(messagesRef);
    return snapshot.val();
  },

  // 监听消息变化
  onMessagesChange(roomCode: string, callback: (messages: any) => void) {
    const messagesRef = ref(database, `games/${roomCode}/messages`);
    return onValue(messagesRef, (snapshot) => {
      const msgs = snapshot.val();
      if (msgs) {
        const messageArray = Object.values(msgs).sort((a: any, b: any) => a.timestamp - b.timestamp);
        callback(messageArray);
      }
    });
  },

  // 清理消息
  async clearMessages(roomCode: string) {
    const messagesRef = ref(database, `games/${roomCode}/messages`);
    await remove(messagesRef);
  },
};

// 清理游戏数据
export const cleanupService = {
  async cleanupGame(roomCode: string) {
    const gameRef = ref(database, `games/${roomCode}`);
    await remove(gameRef);
  },
};
