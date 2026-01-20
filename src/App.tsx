import { useState } from 'react';
import './App.css';
import UserSetup from './components/Room/UserSetup';
import Menu from './components/Room/Menu';
import CreateRoom from './components/Room/CreateRoom';
import JoinRoom from './components/Room/JoinRoom';
import Lobby from './components/Room/Lobby';
import GameBoard from './components/Game/GameBoard';
import type { User, Room, ChatMessage, GameState } from './types';
import { generateId, generateRoomCode, getAvatarEmoji, getRandomWord, checkAnswer } from './utils/gameLogic';

type AppState =
  | 'setup'
  | 'menu'
  | 'createRoom'
  | 'joinRoom'
  | 'lobby'
  | 'playing'
  | 'roundEnd'
  | 'gameEnd';

interface LocalRoom extends Room {
  players: User[];
}

function App() {
  // 用户状态
  const [userId] = useState(() => generateId());
  const [userNickname, setUserNickname] = useState('');
  const [userAvatarIndex, setUserAvatarIndex] = useState(0);
  const [appState, setAppState] = useState<AppState>('setup');

  // 房间状态
  const [currentRoom, setCurrentRoom] = useState<LocalRoom | null>(null);
  const [rooms, setRooms] = useState<Map<string, LocalRoom>>(new Map());
  const [joinError, setJoinError] = useState('');

  // 游戏状态
  const [gameState, setGameState] = useState<GameState>({
    currentDrawer: '',
    currentWord: '',
    roundStartTime: 0,
    roundDuration: 60,
    scores: {},
    guessedBy: [],
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);

  // 用户设置完成
  const handleUserSetup = (nickname: string, avatarIndex: number) => {
    setUserNickname(nickname);
    setUserAvatarIndex(avatarIndex);
    setAppState('menu');
  };

  // 创建房间
  const handleCreateRoom = (_roomName: string, maxRounds: number, roundDuration: number) => {
    const roomCode = generateRoomCode();
    const newRoom: LocalRoom = {
      id: generateId(),
      code: roomCode,
      host: userId,
      players: [
        {
          id: userId,
          nickname: userNickname,
          avatar: getAvatarEmoji(userAvatarIndex),
          score: 0,
          isReady: false,
        },
      ],
      gameState: 'waiting',
      currentRound: 0,
      maxRounds: maxRounds,
      createdAt: Date.now(),
    };

    rooms.set(roomCode, newRoom);
    setCurrentRoom(newRoom);
    setRooms(new Map(rooms));
    setMaxRounds(maxRounds);

    // 初始化游戏状态
    setGameState(prev => ({
      ...prev,
      roundDuration: roundDuration,
      scores: { [userId]: 0 },
    }));

    setAppState('lobby');
  };

  // 加入房间
  const handleJoinRoom = (code: string) => {
    const room = rooms.get(code);
    if (!room) {
      setJoinError('房间不存在或已关闭');
      return;
    }

    if (room.players.length >= 6) {
      setJoinError('房间已满');
      return;
    }

    const newPlayer: User = {
      id: userId,
      nickname: userNickname,
      avatar: getAvatarEmoji(userAvatarIndex),
      score: 0,
      isReady: false,
    };

    room.players.push(newPlayer);
    setCurrentRoom(room);
    setRooms(new Map(rooms));
    setGameState(prev => ({
      ...prev,
      scores: { ...prev.scores, [userId]: 0 },
    }));
    setAppState('lobby');
  };

  // 开始游戏
  const handleStartGame = () => {
    if (!currentRoom) return;

    // 随机选择第一个绘画者
    const firstDrawerId = currentRoom.players[Math.floor(Math.random() * currentRoom.players.length)].id;
    const word = getRandomWord('normal');

    currentRoom.gameState = 'playing';
    setCurrentRoom({ ...currentRoom });
    setGameState({
      currentDrawer: firstDrawerId,
      currentWord: word.word,
      roundStartTime: Date.now(),
      roundDuration: gameState.roundDuration,
      scores: gameState.scores,
      guessedBy: [],
    });
    setRoundNumber(1);
    setMessages([]);
    setAppState('playing');
  };

  // 发送聊天消息
  const handleSendMessage = (text: string) => {
    if (!currentRoom) return;

    const { isCorrect } = checkAnswer(text, gameState.currentWord);
    const message: ChatMessage = {
      id: generateId(),
      userId,
      username: userNickname,
      text,
      timestamp: Date.now(),
      isCorrect: isCorrect && userId !== gameState.currentDrawer,
    };

    setMessages(prev => [...prev, message]);

    // 如果猜对了
    if (isCorrect && userId !== gameState.currentDrawer) {
      const newScores = { ...gameState.scores };
      newScores[userId] = (newScores[userId] || 0) + 50;
      setGameState(prev => ({
        ...prev,
        scores: newScores,
        guessedBy: [...prev.guessedBy, userId],
      }));
    }
  };

  // 轮次时间结束
  const handleTimeUp = () => {
    // 切换到下一个绘画者
    if (!currentRoom) return;

    const playerIds = currentRoom.players.map(p => p.id);
    const currentDrawerIndex = playerIds.indexOf(gameState.currentDrawer);
    const nextDrawerIndex = (currentDrawerIndex + 1) % playerIds.length;
    const nextDrawerId = playerIds[nextDrawerIndex];

    if (roundNumber >= maxRounds) {
      // 游戏结束
      setAppState('gameEnd');
    } else {
      // 下一轮
      const word = getRandomWord('normal');
      setGameState(prev => ({
        ...prev,
        currentDrawer: nextDrawerId,
        currentWord: word.word,
        roundStartTime: Date.now(),
        guessedBy: [],
      }));
      setRoundNumber(prev => prev + 1);
      setMessages([]);
    }
  };

  // 离开房间
  const handleLeaveRoom = () => {
    if (!currentRoom) return;

    const newRoom = { ...currentRoom };
    newRoom.players = newRoom.players.filter(p => p.id !== userId);

    if (newRoom.players.length === 0) {
      rooms.delete(currentRoom.code);
    } else {
      if (newRoom.host === userId) {
        newRoom.host = newRoom.players[0].id;
      }
      rooms.set(currentRoom.code, newRoom);
    }

    setRooms(new Map(rooms));
    setCurrentRoom(null);
    setAppState('menu');
  };

  // 渲染不同的应用状态
  const render = () => {
    switch (appState) {
      case 'setup':
        return <UserSetup onSetupComplete={handleUserSetup} />;

      case 'menu':
        return (
          <Menu
            playerName={userNickname}
            playerAvatar={getAvatarEmoji(userAvatarIndex)}
            onCreateRoom={() => setAppState('createRoom')}
            onJoinRoom={() => setAppState('joinRoom')}
            onLogout={() => {
              setUserNickname('');
              setAppState('setup');
            }}
          />
        );

      case 'createRoom':
        return (
          <CreateRoom
            onCreateRoom={handleCreateRoom}
            onBack={() => setAppState('menu')}
          />
        );

      case 'joinRoom':
        return (
          <JoinRoom
            onJoinRoom={handleJoinRoom}
            onBack={() => {
              setAppState('menu');
              setJoinError('');
            }}
            error={joinError}
          />
        );

      case 'lobby':
        return currentRoom ? (
          <Lobby
            roomCode={currentRoom.code}
            players={currentRoom.players}
            currentUserId={userId}
            isHost={currentRoom.host === userId}
            onStartGame={handleStartGame}
            onLeave={handleLeaveRoom}
          />
        ) : null;

      case 'playing':
        return currentRoom ? (
          <GameBoard
            players={currentRoom.players}
            currentUserId={userId}
            currentDrawerId={gameState.currentDrawer}
            currentWord={userId === gameState.currentDrawer ? '？' : gameState.currentWord}
            roundNumber={roundNumber}
            maxRounds={maxRounds}
            roundDuration={gameState.roundDuration}
            messages={messages}
            onSendMessage={handleSendMessage}
            onTimeUp={handleTimeUp}
            scores={gameState.scores}
          />
        ) : null;

      default:
        return null;
    }
  };

  return <div className="w-full min-h-screen">{render()}</div>;
}

export default App;

