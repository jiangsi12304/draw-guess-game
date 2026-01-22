// Socket.io服务器
// 用于处理你画我猜游戏的实时通信

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// 词库
const wordBank = [
  { word: '猫', difficulty: 'easy', category: '动物' },
  { word: '狗', difficulty: 'easy', category: '动物' },
  { word: '鱼', difficulty: 'easy', category: '动物' },
  { word: '鸟', difficulty: 'easy', category: '动物' },
  { word: '大象', difficulty: 'normal', category: '动物' },
  { word: '长颈鹿', difficulty: 'normal', category: '动物' },
  { word: '企鹅', difficulty: 'normal', category: '动物' },
  { word: '熊猫', difficulty: 'normal', category: '动物' },
  { word: '蝴蝶', difficulty: 'hard', category: '动物' },
  { word: '乌贼', difficulty: 'hard', category: '动物' },
  { word: '苹果', difficulty: 'easy', category: '食物' },
  { word: '香蕉', difficulty: 'easy', category: '食物' },
  { word: '米饭', difficulty: 'easy', category: '食物' },
  { word: '面条', difficulty: 'easy', category: '食物' },
  { word: '披萨', difficulty: 'normal', category: '食物' },
  { word: '汉堡', difficulty: 'normal', category: '食物' },
  { word: '寿司', difficulty: 'normal', category: '食物' },
  { word: '冰淇淋', difficulty: 'normal', category: '食物' },
  { word: '蛋糕', difficulty: 'easy', category: '食物' },
  { word: '咖啡', difficulty: 'normal', category: '食物' },
  { word: '钥匙', difficulty: 'easy', category: '物品' },
  { word: '椅子', difficulty: 'easy', category: '物品' },
  { word: '桌子', difficulty: 'easy', category: '物品' },
  { word: '门', difficulty: 'easy', category: '物品' },
  { word: '窗户', difficulty: 'easy', category: '物品' },
  { word: '灯', difficulty: 'easy', category: '物品' },
  { word: '手机', difficulty: 'normal', category: '物品' },
  { word: '电脑', difficulty: 'normal', category: '物品' },
  { word: '雨伞', difficulty: 'normal', category: '物品' },
  { word: '眼镜', difficulty: 'normal', category: '物品' },
  { word: '跑步', difficulty: 'easy', category: '动作' },
  { word: '跳跃', difficulty: 'easy', category: '动作' },
  { word: '走路', difficulty: 'easy', category: '动作' },
  { word: '唱歌', difficulty: 'easy', category: '动作' },
  { word: '跳舞', difficulty: 'easy', category: '动作' },
  { word: '游泳', difficulty: 'easy', category: '动作' },
  { word: '睡觉', difficulty: 'easy', category: '动作' },
  { word: '吃饭', difficulty: 'easy', category: '动作' },
  { word: '写字', difficulty: 'easy', category: '动作' },
  { word: '骑车', difficulty: 'normal', category: '动作' },
  { word: '太阳', difficulty: 'easy', category: '自然' },
  { word: '月亮', difficulty: 'easy', category: '自然' },
  { word: '星星', difficulty: 'easy', category: '自然' },
  { word: '云', difficulty: 'easy', category: '自然' },
  { word: '雨', difficulty: 'easy', category: '自然' },
  { word: '火', difficulty: 'easy', category: '自然' },
  { word: '树', difficulty: 'easy', category: '自然' },
  { word: '花', difficulty: 'easy', category: '自然' },
  { word: '山', difficulty: 'easy', category: '自然' },
  { word: '海', difficulty: 'easy', category: '自然' },
  { word: '足球', difficulty: 'easy', category: '运动' },
  { word: '篮球', difficulty: 'easy', category: '运动' },
  { word: '网球', difficulty: 'normal', category: '运动' },
  { word: '乒乓球', difficulty: 'normal', category: '运动' },
  { word: '羽毛球', difficulty: 'normal', category: '运动' },
  { word: '溜冰', difficulty: 'normal', category: '运动' },
  { word: '滑雪', difficulty: 'normal', category: '运动' },
  { word: '冲浪', difficulty: 'hard', category: '运动' },
  { word: '医生', difficulty: 'easy', category: '职业' },
  { word: '老师', difficulty: 'easy', category: '职业' },
  { word: '警察', difficulty: 'easy', category: '职业' },
  { word: '消防员', difficulty: 'normal', category: '职业' },
  { word: '飞行员', difficulty: 'normal', category: '职业' },
  { word: '厨师', difficulty: 'normal', category: '职业' },
  { word: '画家', difficulty: 'normal', category: '职业' },
  { word: '汽车', difficulty: 'easy', category: '交通' },
  { word: '自行车', difficulty: 'easy', category: '交通' },
  { word: '火车', difficulty: 'easy', category: '交通' },
  { word: '飞机', difficulty: 'easy', category: '交通' },
  { word: '船', difficulty: 'easy', category: '交通' },
  { word: '公交车', difficulty: 'easy', category: '交通' },
  { word: '摩托车', difficulty: 'normal', category: '交通' },
  { word: '直升机', difficulty: 'hard', category: '交通' },
  { word: '房子', difficulty: 'easy', category: '建筑' },
  { word: '城堡', difficulty: 'normal', category: '建筑' },
  { word: '教堂', difficulty: 'normal', category: '建筑' },
  { word: '金字塔', difficulty: 'hard', category: '建筑' },
  { word: '摩天大楼', difficulty: 'hard', category: '建筑' },
  { word: '圣诞节', difficulty: 'easy', category: '节日' },
  { word: '元旦', difficulty: 'easy', category: '节日' },
  { word: '春节', difficulty: 'easy', category: '节日' },
  { word: '万圣节', difficulty: 'normal', category: '节日' },
  { word: '复活节', difficulty: 'normal', category: '节日' },
  { word: '吉他', difficulty: 'easy', category: '乐器' },
  { word: '钢琴', difficulty: 'easy', category: '乐器' },
  { word: '小提琴', difficulty: 'normal', category: '乐器' },
  { word: '鼓', difficulty: 'easy', category: '乐器' },
  { word: '长笛', difficulty: 'normal', category: '乐器' },
  { word: '开心', difficulty: 'easy', category: '情感' },
  { word: '伤心', difficulty: 'easy', category: '情感' },
  { word: '生气', difficulty: 'easy', category: '情感' },
  { word: '害怕', difficulty: 'easy', category: '情感' },
  { word: '惊讶', difficulty: 'easy', category: '情感' },
  { word: '齿轮', difficulty: 'hard', category: '物品' },
  { word: '显微镜', difficulty: 'hard', category: '物品' },
  { word: '望远镜', difficulty: 'hard', category: '物品' },
  { word: '地震', difficulty: 'hard', category: '自然' },
  { word: '彩虹', difficulty: 'hard', category: '自然' },
  { word: '火山', difficulty: 'hard', category: '自然' },
];

// 随机获取3个不同的词语（排除已使用的词语）
function getRandomWords(count, difficulty = 'all', customWords = [], usedWords = []) {
  let availableWords = wordBank;

  // 如果有自定义词语，优先使用
  if (customWords && customWords.length > 0) {
    // 过滤掉已使用的自定义词语
    const unusedCustomWords = customWords.filter(word => !usedWords.includes(word));
    const shuffled = [...unusedCustomWords].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, unusedCustomWords.length)).map(word => ({
      word,
      difficulty: 'normal',
      category: '自定义'
    }));
  }

  // 根据难度过滤词语
  if (difficulty !== 'all') {
    availableWords = wordBank.filter(w => w.difficulty === difficulty);
  }

  // 过滤掉已使用的词语
  availableWords = availableWords.filter(w => !usedWords.includes(w.word));

  const shuffled = [...availableWords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, availableWords.length));
}

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
    const { roomCode, hostId, nickname, avatar, maxRounds = 5, roundDuration = 60, difficulty = 'all', customWords } = data;

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
        maxRounds,
        createdAt: Date.now(),
        messages: [],
        drawings: [],
        difficulty,
        customWords,
        roundDuration,
        usedWords: [] // 记录本局已使用过的词语
      });

      // 更新活跃房间数
      serverStatus.activeRooms = rooms.size;

      // 加入房间
      socket.join(roomCode);

      console.log('🏠 创建房间:', roomCode, 'by', nickname, `轮数:${maxRounds}, 时长:${roundDuration}, 难度:${difficulty}`);

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
            message.revealWord = gameState.currentWord;

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

            // 显示答案，然后3秒后开始下一轮
            io.to(roomCode).emit('answer-revealed', { word: gameState.currentWord, correct: true });

            // 延迟3秒后开始下一轮
            setTimeout(() => {
              startNewRound(roomCode);
            }, 3000);
          } else {
            // 猜错了，但不显示答案（因为还有其他人可以猜）
            message.isCorrect = false;
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

  // 存储提示定时器
  const hintTimers = new Map();

  // 开始新轮次
  function startNewRound(roomCode) {
    // 清除之前的定时器
    if (roundTimers.has(roomCode)) {
      clearTimeout(roundTimers.get(roomCode));
      roundTimers.delete(roomCode);
    }

    // 清除提示定时器
    hintTimers.forEach((timer, key) => {
      if (key.startsWith(roomCode)) {
        clearTimeout(timer);
        hintTimers.delete(key);
      }
    });

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
    const oldGameState = room.currentGameState || { currentDrawer: room.players[0]?.id };
    const currentDrawerIndex = room.players.findIndex(p => p.id === oldGameState.currentDrawer);
    const nextDrawerIndex = room.players.length > 0 ? (currentDrawerIndex + 1) % room.players.length : 0;
    const nextDrawer = room.players[nextDrawerIndex];

    // 随机选择3个候选词语（排除已使用的词语）
    const wordOptions = getRandomWords(3, room.difficulty, room.customWords, room.usedWords);

    // 创建新游戏状态 - 进入词语选择状态
    const newGameState = {
      currentDrawer: nextDrawer.id,
      currentWord: '',
      roundStartTime: Date.now(),
      roundDuration: room.roundDuration || 30, // 使用房间设置的时长，默认30秒
      scores: oldGameState.scores || {},
      guessedBy: [],
      wordSelectionState: 'selecting',
      wordOptions: wordOptions
    };

    // 初始化分数
    if (!oldGameState.scores) {
      room.players.forEach(player => {
        newGameState.scores[player.id] = 0;
      });
    }

    // 更新房间
    room.currentGameState = newGameState;
    room.currentRound++;

    // 发送新轮次开始事件 - 词语选择状态
    io.to(roomCode).emit('new-round', newGameState);
    io.to(roomCode).emit('game-state-updated', newGameState);
    io.to(roomCode).emit('room-updated', room);

    console.log('🔄 新轮次:', roomCode, '- 第', room.currentRound, '轮', '- 绘画者:', nextDrawer.nickname, '- 选择词语中...');
  }

  // 发送提示更新
  function sendHintUpdate(roomCode, gameState) {
    if (!gameState.currentWord) return;

    const now = Date.now();
    const timeElapsed = (now - gameState.roundStartTime) / 1000;
    const timeRemaining = gameState.roundDuration - timeElapsed;
    const percentage = timeElapsed / gameState.roundDuration;

    let hintText = '';

    // 根据时间显示不同程度的提示
    if (percentage >= 0 && percentage < 0.3) {
      // 0-30%: 只显示字数
      hintText = '_ '.repeat(gameState.currentWord.length).trim();
    } else if (percentage >= 0.3 && percentage < 0.6) {
      // 30-60%: 显示第一个字
      hintText = gameState.currentWord[0] + ' ' + '_ '.repeat(gameState.currentWord.length - 1).trim();
    } else if (percentage >= 0.6 && percentage < 0.8) {
      // 60-80%: 显示前两个字
      if (gameState.currentWord.length >= 2) {
        hintText = gameState.currentWord.substring(0, 2) + ' ' + '_ '.repeat(gameState.currentWord.length - 2).trim();
      } else {
        hintText = gameState.currentWord;
      }
    } else if (percentage >= 0.8) {
      // 80%+: 显示所有字
      hintText = gameState.currentWord;
    }

    io.to(roomCode).emit('hint-updated', { hintText });
  }

  // 监听词语选择
  socket.on('select-word', (data) => {
    const { roomCode, userId, word } = data;

    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      const gameState = room.currentGameState;

      // 验证是否是当前绘画者且在选择状态
      if (gameState && gameState.currentDrawer === userId && gameState.wordSelectionState === 'selecting') {
        // 验证词语是否在选项中
        const isValidOption = gameState.wordOptions.some(w => w.word === word);
        if (isValidOption) {
          // 更新游戏状态为绘画中
          gameState.currentWord = word;
          gameState.roundStartTime = Date.now();
          gameState.wordSelectionState = 'drawing';

          // 将词语添加到已使用列表（本局不再出现）
          if (!room.usedWords) room.usedWords = [];
          room.usedWords.push(word);

          // 广播词语选择
          io.to(roomCode).emit('word-selected', { word, drawerId: userId });
          io.to(roomCode).emit('game-state-updated', gameState);

          console.log('✏️ 词语选择:', roomCode, '- 绘画者选择:', word);

          // 发送初始提示
          sendHintUpdate(roomCode, gameState);

          // 设置提示定时器
          const hintIntervals = [
            gameState.roundDuration * 0.3 * 1000,  // 30%时显示第一个字
            gameState.roundDuration * 0.6 * 1000,  // 60%时显示前两个字
            gameState.roundDuration * 0.8 * 1000   // 80%时显示全部
          ];

          hintIntervals.forEach((delay, index) => {
            const hintTimer = setTimeout(() => {
              const room = rooms.get(roomCode);
              if (room && room.currentGameState) {
                sendHintUpdate(roomCode, room.currentGameState);
              }
            }, delay);
            hintTimers.set(`${roomCode}-${index}`, hintTimer);
          });

          // 设置定时器检查时间结束
          const timer = setTimeout(() => {
            checkRoundEnd(roomCode);
          }, gameState.roundDuration * 1000);

          roundTimers.set(roomCode, timer);
        }
      }
    }
  });

  // 检查轮次是否结束
  function checkRoundEnd(roomCode) {
    if (!rooms.has(roomCode)) return;

    const room = rooms.get(roomCode);
    const gameState = room.currentGameState;

    if (!gameState) return;

    // 显示答案
    io.to(roomCode).emit('answer-revealed', { word: gameState.currentWord, correct: false });

    // 延迟3秒后开始下一轮
    setTimeout(() => {
      startNewRound(roomCode);
    }, 3000);
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

      // 随机选择3个候选词语（排除已使用的词语）
      const wordOptions = getRandomWords(3, room.difficulty, room.customWords, room.usedWords || []);

      // 初始化游戏状态 - 词语选择状态
      const gameState = {
        currentDrawer: drawer.id,
        currentWord: '',
        roundStartTime: Date.now(),
        roundDuration: room.roundDuration || 30, // 使用房间设置的时长，默认30秒
        scores: {},
        guessedBy: [],
        wordSelectionState: 'selecting',
        wordOptions: wordOptions
      };

      // 初始化分数
      room.players.forEach(player => {
        gameState.scores[player.id] = 0;
      });

      // 更新房间状态
      room.gameState = 'playing';
      room.currentRound = 0; // 将在第1轮开始时变为1
      room.currentGameState = gameState;

      // 发送游戏开始事件
      io.to(roomCode).emit('game-started', gameState);
      io.to(roomCode).emit('room-updated', room);

      console.log('🎮 游戏开始:', roomCode, '- 绘画者:', drawer.nickname, '- 难度:', room.difficulty, '- 等待选择词语...');
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

  // 监听踢出玩家
  socket.on('kick-player', (data) => {
    const { roomCode, hostId, playerId } = data;

    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);

      // 验证是否是房主
      if (room.host !== hostId) {
        socket.emit('room-error', { message: '只有房主可以踢出玩家' });
        return;
      }

      // 不能踢出房主自己
      if (playerId === hostId) {
        socket.emit('room-error', { message: '不能踢出自己' });
        return;
      }

      // 找到被踢出的玩家
      const playerIndex = room.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) {
        socket.emit('room-error', { message: '玩家不存在' });
        return;
      }

      const kickedPlayer = room.players[playerIndex];

      // 从房间中移除玩家
      room.players.splice(playerIndex, 1);

      // 通知玩家被踢出
      io.to(playerId).emit('kicked-from-room', { roomCode });

      // 广播更新
      io.to(roomCode).emit('player-kicked', { playerId: kickedPlayer.id, nickname: kickedPlayer.nickname });
      io.to(roomCode).emit('room-updated', room);

      console.log('🚫 玩家被踢出:', kickedPlayer.nickname, '→', roomCode);
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
