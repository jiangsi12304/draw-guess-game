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
const allowedOrigins = [
  'http://localhost:5178',
  'http://localhost:3000',
  'https://jiangsi12304.github.io'
];

// 从环境变量添加客户端 URL
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
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
    const { roomCode, hostId, nickname, avatar } = data;
    
    if (!rooms.has(roomCode)) {
      const hostPlayer = {
        id: hostId,
        nickname: nickname || '玩家' + hostId.slice(0, 4),
        avatar: avatar || '👤',
        score: 0,
        isReady: true
      };
      
      // 创建新房间
      rooms.set(roomCode, {
        id: roomCode,
        code: roomCode,
        host: hostId,
        players: [hostPlayer],
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
      
      console.log('🏠 创建房间:', roomCode, 'by', nickname);
      
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
    const { roomCode, userId, nickname, avatar } = data;
    
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      
      // 检查用户是否已在房间中
      const existingPlayer = room.players.find(p => p.id === userId);
      
      if (!existingPlayer) {
        const newPlayer = {
          id: userId,
          nickname: nickname || '玩家' + userId.slice(0, 4),
          avatar: avatar || '👤',
          score: 0,
          isReady: false
        };
        
        // 添加到房间
        room.players.push(newPlayer);
        
        // 加入房间
        socket.join(roomCode);
        
        console.log('➕ 用户加入房间:', nickname, '→', roomCode);
        
        // 发送加入成功事件
        socket.emit('room-joined', { roomCode, room });
        io.to(roomCode).emit('room-updated', room);
        io.to(roomCode).emit('player-joined', { userId, nickname, avatar });
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
      const gameState = room.currentGameState;

      // 检查是否猜对
      if (room.gameState === 'playing' && gameState) {
        const sender = room.players.find(p => p.id === message.userId);

        // 如果发送者是绘画者，不算
        if (sender && sender.id !== gameState.currentDrawer) {
          // 检查答案是否正确（不区分大小写）
          if (message.text.trim().toLowerCase() === gameState.currentWord.toLowerCase()) {
            // 猜对了
            message.isCorrect = true;

            // 计算分数（基于剩余时间）
            const timeElapsed = (Date.now() - gameState.roundStartTime) / 1000;
            const timeRemaining = gameState.roundDuration - timeElapsed;
            const score = Math.max(10, Math.floor(timeRemaining * 10));

            // 加分
            gameState.scores[message.userId] = (gameState.scores[message.userId] || 0) + score;

            // 记录猜对的人
            if (!gameState.guessedBy.includes(message.userId)) {
              gameState.guessedBy.push(message.userId);
            }

            // 如果所有人都猜对了，提前结束本轮
            const guessers = room.players.filter(p => p.id !== gameState.currentDrawer);
            if (gameState.guessedBy.length >= guessers.length) {
              // 延迟2秒后开始下一轮
              setTimeout(() => {
                startNewRound(roomCode);
              }, 2000);
            }
          }
        }
      }

      // 添加消息到房间
      room.messages.push(message);

      // 发送消息给房间内所有用户
      io.to(roomCode).emit('new-chat-message', message);
      if (gameState) {
        io.to(roomCode).emit('game-state-updated', gameState);
      }

      console.log('💬 聊天消息:', roomCode, '→', message.text, message.isCorrect ? '✅ 正确' : '');
    }
  });

  // 存储轮次定时器
  const roundTimers = new Map();

  // 开始新轮次
  function startNewRound(roomCode) {
    // 清除之前的定时器
    if (roundTimers.has(roomCode)) {
      clearTimeout(roundTimers.get(roomCode));
      roundTimers.delete(roomCode);
    }

    if (!rooms.has(roomCode)) return;

    const room = rooms.get(roomCode);

    // 检查是否所有轮次都结束了
    if (room.currentRound >= room.maxRounds) {
      // 游戏结束
      room.gameState = 'finished';
      io.to(roomCode).emit('game-ended', room);
      io.to(roomCode).emit('room-updated', room);
      console.log('🏁 游戏结束:', roomCode);
      return;
    }

    // 选择下一个绘画者（轮换）
    const oldGameState = room.currentGameState;
    const currentDrawerIndex = room.players.findIndex(p => p.id === oldGameState.currentDrawer);
    const nextDrawerIndex = (currentDrawerIndex + 1) % room.players.length;
    const nextDrawer = room.players[nextDrawerIndex];

    // 随机选择新单词
    const words = [
      '猫', '狗', '鱼', '鸟', '苹果', '香蕉', '钥匙', '椅子',
      '太阳', '月亮', '足球', '篮球', '医生', '老师', '汽车',
      '自行车', '房子', '吉他', '钢琴', '开心', '伤心', '跑步',
      '跳跃', '唱歌', '跳舞', '树', '花', '山', '海', '门', '窗户',
      '大象', '长颈鹿', '企鹅', '熊猫', '披萨', '汉堡', '寿司',
      '手机', '电脑', '雨伞', '眼镜', '足球', '篮球', '网球',
      '消防员', '飞行员', '厨师', '画家', '火车', '飞机', '船'
    ];
    const currentWord = words[Math.floor(Math.random() * words.length)];

    // 创建新游戏状态
    const newGameState = {
      currentDrawer: nextDrawer.id,
      currentWord: currentWord,
      roundStartTime: Date.now(),
      roundDuration: 60,
      scores: oldGameState.scores,
      guessedBy: []
    };

    // 更新房间
    room.currentGameState = newGameState;
    room.currentRound++;

    // 发送新轮次开始事件
    io.to(roomCode).emit('new-round', newGameState);
    io.to(roomCode).emit('game-state-updated', newGameState);
    io.to(roomCode).emit('room-updated', room);

    console.log('🔄 新轮次:', roomCode, '- 第', room.currentRound, '轮', '- 绘画者:', nextDrawer.nickname, '- 单词:', currentWord);

    // 设置定时器检查时间结束
    const timer = setTimeout(() => {
      checkRoundEnd(roomCode);
    }, newGameState.roundDuration * 1000);

    roundTimers.set(roomCode, timer);
  }

  // 检查轮次是否结束
  function checkRoundEnd(roomCode) {
    if (!rooms.has(roomCode)) return;

    const room = rooms.get(roomCode);
    const gameState = room.currentGameState;

    if (!gameState) return;

    // 检查是否所有人都猜对了
    const guessers = room.players.filter(p => p.id !== gameState.currentDrawer);
    if (gameState.guessedBy.length >= guessers.length) {
      // 所有人都猜对了，开始新轮次
      startNewRound(roomCode);
    }
  }
  
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

      // 随机选择第一个绘画者
      const drawerIndex = Math.floor(Math.random() * room.players.length);
      const drawer = room.players[drawerIndex];

      // 随机选择一个单词（简单难度）
      const words = [
        '猫', '狗', '鱼', '鸟', '苹果', '香蕉', '钥匙', '椅子',
        '太阳', '月亮', '足球', '篮球', '医生', '老师', '汽车',
        '自行车', '房子', '吉他', '钢琴', '开心', '伤心', '跑步',
        '跳跃', '唱歌', '跳舞', '树', '花', '山', '海', '门', '窗户'
      ];
      const currentWord = words[Math.floor(Math.random() * words.length)];

      // 初始化游戏状态
      const gameState = {
        currentDrawer: drawer.id,
        currentWord: currentWord,
        roundStartTime: Date.now(),
        roundDuration: 60, // 60秒
        scores: {},
        guessedBy: []
      };

      // 初始化分数
      room.players.forEach(player => {
        gameState.scores[player.id] = 0;
      });

      // 更新房间状态
      room.gameState = 'playing';
      room.currentRound = 1;
      room.currentGameState = gameState;

      // 发送游戏开始事件
      io.to(roomCode).emit('game-started', gameState);
      io.to(roomCode).emit('room-updated', room);

      console.log('🎮 游戏开始:', roomCode, '- 绘画者:', drawer.nickname, '- 单词:', currentWord);

      // 设置定时器检查时间结束
      const timer = setTimeout(() => {
        checkRoundEnd(roomCode);
      }, gameState.roundDuration * 1000);

      roundTimers.set(roomCode, timer);
    }
  });
  
  // 监听准备游戏
  socket.on('ready-game', (data) => {
    const { roomCode, userId, isReady } = data;
    
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      const player = room.players.find(p => p.id === userId);
      
      if (player) {
        player.isReady = isReady;
        
        // 广播更新
        io.to(roomCode).emit('player-ready', { userId, isReady });
        io.to(roomCode).emit('room-updated', room);
        
        console.log('🔔 用户准备:', player.nickname, isReady ? '✅' : '❌', '→', roomCode);
      }
    }
  });
  
  // 监听离开房间
  socket.on('leave-room', (data) => {
    const { roomCode, userId } = data;

    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      const leavingPlayer = room.players.find(p => p.id === userId);

      // 从房间中移除用户
      room.players = room.players.filter(p => p.id !== userId);

      // 离开房间
      socket.leave(roomCode);

      console.log('➖ 用户离开房间:', leavingPlayer?.nickname || userId, '→', roomCode);

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
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
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
