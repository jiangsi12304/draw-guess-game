// Socket.io通信工具
// 用于处理客户端与服务器的实时通信
import { io, Socket } from 'socket.io-client';
import type { ChatMessage, DrawingAction } from '../types';

// Socket实例
let socket: Socket | null = null;

// 连接状态
let isConnected = false;

// 连接服务器
export function connectSocketServer(url: string = 'https://draw-guess-game-server.onrender.com') {
  if (socket) {
    socket.disconnect();
  }

  // 创建socket连接
  socket = io(url, {
    transports: ['websocket'],
    timeout: 5000,
  });

  // 连接成功
  socket.on('connect', () => {
    console.log('✅ Socket连接成功');
    isConnected = true;
  });

  // 连接失败
  socket.on('connect_error', (error) => {
    console.error('❌ Socket连接失败:', error.message);
    isConnected = false;
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log('❌ Socket已断开连接');
    isConnected = false;
  });

  return socket;
}

// 断开连接
export function disconnectSocketServer() {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
  }
}

// 获取连接状态
export function getSocketConnectionStatus() {
  return isConnected;
}

// 发送消息
export function sendSocketMessage(event: string, data: any) {
  if (socket && isConnected) {
    socket.emit(event, data);
    return true;
  }
  console.error('❌ 无法发送消息：Socket未连接');
  return false;
}

// 添加事件监听器
export function onSocketEvent(event: string, callback: (data: any) => void) {
  if (socket) {
    socket.on(event, callback);
    return () => {
      socket?.off(event, callback);
    };
  }
  return () => {};
}

// 创建房间
export function createSocketRoom(roomCode: string, hostId: string, nickname: string, avatar: string, settings?: {
  maxRounds?: number;
  roundDuration?: number;
  difficulty?: 'easy' | 'normal' | 'hard' | 'all';
  customWords?: string[];
}) {
  return sendSocketMessage('create-room', { roomCode, hostId, nickname, avatar, ...settings });
}

// 加入房间
export function joinSocketRoom(roomCode: string, userId: string, nickname: string, avatar: string) {
  return sendSocketMessage('join-room', { roomCode, userId, nickname, avatar });
}

// 发送聊天消息
export function sendSocketChatMessage(roomCode: string, message: ChatMessage) {
  return sendSocketMessage('send-chat-message', { roomCode, message });
}

// 发送绘画动作
export function sendSocketDrawingAction(roomCode: string, action: DrawingAction) {
  return sendSocketMessage('send-drawing-action', { roomCode, action });
}

// 开始游戏
export function startSocketGame(roomCode: string) {
  return sendSocketMessage('start-game', { roomCode });
}

// 准备游戏
export function readySocketGame(roomCode: string, userId: string, isReady: boolean) {
  return sendSocketMessage('ready-game', { roomCode, userId, isReady });
}

// 选择词语
export function selectSocketWord(roomCode: string, userId: string, word: string) {
  return sendSocketMessage('select-word', { roomCode, userId, word });
}

// 踢出玩家
export function kickSocketPlayer(roomCode: string, hostId: string, playerId: string) {
  return sendSocketMessage('kick-player', { roomCode, hostId, playerId });
}

// 离开房间
export function leaveSocketRoom(roomCode: string, userId: string) {
  return sendSocketMessage('leave-room', { roomCode, userId });
}
