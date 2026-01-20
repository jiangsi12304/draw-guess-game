// Socket.io服务器
// 用于处理你画我猜游戏的实时通信

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// 创建Express应用
const app = express();
app.use(cors());

// 创建HTTP服务器
const httpServer = createServer(app);

// 创建Socket.io服务器
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5178',
      'https://jiangsi12304.github.io',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// 存储房间信息
const rooms = new Map();

// 存储用户信息
const users = new Map();

// 服务器状态
let serverStatus = {
  onlineUsers: 0,
  activeRooms: 0
};

// 根路由，用于健康检查
app.get('/', (req, res) => {
  res.json({
    message: '✅ 你画我猜游戏Socket服务器正在运行',
    status: 'online',
    ...serverStatus
  });
});

// 处理Socket连接
io.on('connection', (socket) => {
  console.log('🟢 新用户连接:', socket.id);
  
  // 更新在线用户数
  serverStatus.onlineUsers = io.engine.clientsCount;
  
  // 用户连接事件
  socket.emit('user-connected', { userId: socket.id });
  
  // 监听创建房间
  socket.on('create-room', (data) => {
    const { roomCode, hostId } = data;
    
    if (!rooms.has(roomCode)) {
      // 创建新房间
      rooms.set(roomCode, {
        code: roomCode,
        hostId,
        players: [hostId],
        gameState: 'waiting',
        currentRound: 0,
        maxRounds: 5,
        createdAt: Date.now(),
        messages: [],
        drawings: []
      });
      
      // 更新活跃房间数
      serverStatus.activeRooms = rooms.size;
      
      // 加入房间
      socket.join(roomCode);
      
      console.log('🏠 创建房间:', roomCode, 'by', hostId);
      
      // 发送房间创建成功事件
      socket.emit('room-created', { roomCode });
      io.to(roomCode).emit('room-updated', rooms.get(roomCode));
    } else {
      // 房间已存在
      socket.emit('room-error', { message: '房间已存在' });
    }
  });
  
  // 监听加入房间
  socket.on('join-room', (data) => {
    const { roomCode, userId } = data;
    
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      
      // 如果用户不在房间中，添加到房间
      if (!room.players.includes(userId)) {
        room.players.push(userId);
        
        // 加入房间
        socket.join(roomCode);
        
        console.log('➕ 用户加入房间:', userId, '→', roomCode);
        
        // 发送加入成功事件
        socket.emit('room-joined', { roomCode, room });
        io.to(roomCode).emit('room-updated', room);
        io.to(roomCode).emit('player-joined', { userId });
      } else {
        // 用户已在房间中
        socket.emit('room-joined', { roomCode, room });
      }
    } else {
      // 房间不存在
      socket.emit('room-error', { message: '房间不存在' });
    }
  });
  
  // 监听发送聊天消息
  socket.on('send-chat-message', (data) => {
    const { roomCode, message } = data;
    
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      
      // 添加消息到房间
      room.messages.push(message);
      
      // 发送消息给房间内所有用户
      io.to(roomCode).emit('new-chat-message', message);
      io.to(roomCode).emit('room-updated', room);
      
      console.log('💬 聊天消息:', roomCode, '→', message.text);
    }
  });
  
  // 监听发送绘画动作
  socket.on('send-drawing-action', (data) => {
    const { roomCode, action } = data;
    
    if (rooms.has(roomCode)) {
      // 直接广播绘画动作给房间内所有用户
      io.to(roomCode).emit('new-drawing-action', action);
      
      console.log('🎨 绘画动作:', roomCode, '→', action.type);
    }
  });
  
  // 监听开始游戏
  socket.on('start-game', (data) => {
    const { roomCode } = data;
    
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      
      // 更新游戏状态
      room.gameState = 'playing';
      room.currentRound = 1;
      
      // 发送游戏开始事件
      io.to(roomCode).emit('game-started', room);
      io.to(roomCode).emit('room-updated', room);
      
      console.log('🎮 游戏开始:', roomCode);
    }
  });
  
  // 监听准备游戏
  socket.on('ready-game', (data) => {
    const { roomCode, userId, isReady } = data;
    
    if (rooms.has(roomCode)) {
      // 更新用户准备状态
      io.to(roomCode).emit('player-ready', { userId, isReady });
      
      console.log('🔔 用户准备:', userId, isReady ? '✅' : '❌', '→', roomCode);
    }
  });
  
  // 监听离开房间
  socket.on('leave-room', (data) => {
    const { roomCode, userId } = data;
    
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      
      // 从房间中移除用户
      room.players = room.players.filter(id => id !== userId);
      
      // 离开房间
      socket.leave(roomCode);
      
      console.log('➖ 用户离开房间:', userId, '→', roomCode);
      
      // 发送用户离开事件
      io.to(roomCode).emit('player-left', { userId });
      
      // 如果房间为空，删除房间
      if (room.players.length === 0) {
        rooms.delete(roomCode);
        serverStatus.activeRooms = rooms.size;
        console.log('🚪 房间已删除:', roomCode);
      } else {
        io.to(roomCode).emit('room-updated', room);
      }
    }
  });
  
  // 监听断开连接
  socket.on('disconnect', () => {
    console.log('🔴 用户断开连接:', socket.id);
    
    // 更新在线用户数
    serverStatus.onlineUsers = io.engine.clientsCount;
    
    // 从所有房间中移除用户
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.indexOf(socket.id);
      if (playerIndex > -1) {
        // 从房间中移除用户
        room.players.splice(playerIndex, 1);
        
        // 发送用户离开事件
        io.to(roomCode).emit('player-left', { userId: socket.id });
        
        // 如果房间为空，删除房间
        if (room.players.length === 0) {
          rooms.delete(roomCode);
          serverStatus.activeRooms = rooms.size;
          console.log('🚪 房间已删除:', roomCode);
        } else {
          io.to(roomCode).emit('room-updated', room);
        }
      }
    });
  });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`✅ 服务器已启动，监听端口 ${PORT}`);
  console.log(`📡 WebSocket服务器地址: ws://localhost:${PORT}`);
  console.log(`🌐 HTTP服务器地址: http://localhost:${PORT}`);
});
