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
import { roomsService, gameStateService } from './services/firebase';
import { useFirebaseRoom, useFirebaseGameState, useFirebaseMessages } from './hooks/useFirebase';

type AppState =
  | 'setup'
  | 'menu'
  | 'createRoom'
  | 'joinRoom'
  | 'lobby'
  | 'playing'
  | 'roundEnd'
  | 'gameEnd';

function App() {
  // 用户状态
  const [userId] = useState(() => generateId());
  const [userNickname, setUserNickname] = useState('');
  const [userAvatarIndex, setUserAvatarIndex] = useState(0);
  const [appState, setAppState] = useState<AppState>('setup');

  // 房间状态
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [joinError, setJoinError] = useState('');

  // 游戏状态
  const [roundNumber, setRoundNumber] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);

  // Firebase hooks
  const { currentRoom, updateRoom } = useFirebaseRoom(roomCode);
  const { gameState, updateGameState } = useFirebaseGameState(roomCode);
  const { messages, sendMessage, clearMessages } = useFirebaseMessages(roomCode);

  // 用户设置完成
  const handleUserSetup = (nickname: string, avatarIndex: number) => {
    setUserNickname(nickname);
    setUserAvatarIndex(avatarIndex);
    setAppState('menu');
  };

  // 创建房间
  const handleCreateRoom = async (_roomName: string, maxRounds: number, roundDuration: number) => {
    const newRoomCode = generateRoomCode();
    const newRoom: Room = {
      id: generateId(),
      code: newRoomCode,
      host: userId,
      gameState: 'waiting',
      currentRound: 0,
      maxRounds: maxRounds,
      createdAt: Date.now(),
    };

    try {
      // 创建房间
      await roomsService.createRoom(newRoomCode, newRoom);

      // 加入房间
      const player: User = {
        id: userId,
        nickname: userNickname,
        avatar: getAvatarEmoji(userAvatarIndex),
        score: 0,
        isReady: false,
      };
      await roomsService.joinRoom(newRoomCode, player);

      // 初始化游戏状态
      const initialGameState: GameState = {
        currentDrawer: '',
        currentWord: '',
        roundStartTime: 0,
        roundDuration: roundDuration,
        scores: { [userId]: 0 },
        guessedBy: [],
      };
      await gameStateService.initGameState(newRoomCode, initialGameState);

      setRoomCode(newRoomCode);
      setMaxRounds(maxRounds);
      setAppState('lobby');
    } catch (err: any) {
      setJoinError(err.message);
    }
  };

  // 加入房间
  const handleJoinRoom = async (code: string) => {
    try {
      const room = await roomsService.getRoom(code);
      if (!room) {
        setJoinError('房间不存在或已关闭');
        return;
      }

      const players = room.players ? Object.values(room.players) : [];
      if (players.length >= 6) {
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

      await roomsService.joinRoom(code, newPlayer);

      // 更新游戏状态中的分数
      if (gameState) {
        await updateGameState({
          scores: { ...gameState.scores, [userId]: 0 },
        });
      }

      setRoomCode(code);
      setAppState('lobby');
    } catch (err: any) {
      setJoinError(err.message);
    }
  };

  // 开始游戏
  const handleStartGame = async () => {
    if (!currentRoom || !gameState) return;

    // 随机选择第一个绘画者
    const players = currentRoom.players || [];
    const firstDrawerId = players[Math.floor(Math.random() * players.length)]?.id;
    const word = getRandomWord('normal');

    try {
      await updateRoom({ gameState: 'playing' });

      await updateGameState({
        currentDrawer: firstDrawerId,
        currentWord: word.word,
        roundStartTime: Date.now(),
        roundDuration: gameState.roundDuration,
        scores: gameState.scores,
        guessedBy: [],
      });

      setRoundNumber(1);
      await clearMessages();
      setAppState('playing');
    } catch (err: any) {
      setJoinError(err.message);
    }
  };

  // 发送聊天消息
  const handleSendMessage = async (text: string) => {
    if (!gameState) return;

    const { isCorrect } = checkAnswer(text, gameState.currentWord);
    const message: Omit<ChatMessage, 'timestamp'> = {
      id: generateId(),
      userId,
      username: userNickname,
      text,
      isCorrect: isCorrect && userId !== gameState.currentDrawer,
    };

    try {
      await sendMessage(message);

      // 如果猜对了
      if (isCorrect && userId !== gameState.currentDrawer) {
        const newScores = { ...gameState.scores };
        newScores[userId] = (newScores[userId] || 0) + 50;
        await updateGameState({
          scores: newScores,
          guessedBy: [...gameState.guessedBy, userId],
        });
      }
    } catch (err: any) {
      setJoinError(err.message);
    }
  };

  // 轮次时间结束
  const handleTimeUp = async () => {
    // 切换到下一个绘画者
    if (!currentRoom || !gameState) return;

    const playerIds = (currentRoom.players || []).map((p: any) => p.id);
    const currentDrawerIndex = playerIds.indexOf(gameState.currentDrawer);
    const nextDrawerIndex = (currentDrawerIndex + 1) % playerIds.length;
    const nextDrawerId = playerIds[nextDrawerIndex];

    try {
      if (roundNumber >= maxRounds) {
        // 游戏结束
        setAppState('gameEnd');
      } else {
        // 下一轮
        const word = getRandomWord('normal');
        await updateGameState({
          currentDrawer: nextDrawerId,
          currentWord: word.word,
          roundStartTime: Date.now(),
          guessedBy: [],
        });
        setRoundNumber(prev => prev + 1);
        await clearMessages();
      }
    } catch (err: any) {
      setJoinError(err.message);
    }
  };

  // 离开房间
  const handleLeaveRoom = async () => {
    if (!currentRoom || !roomCode) return;

    try {
      await roomsService.removePlayer(roomCode, userId);

      // 检查是否还有玩家，如果没有则删除房间
      const updatedRoom = await roomsService.getRoom(roomCode);
      const remainingPlayers = updatedRoom?.players ? Object.values(updatedRoom.players) : [];

      if (remainingPlayers.length === 0) {
        // 删除房间
        await roomsService.deleteRoom(roomCode);
      } else if (updatedRoom.host === userId) {
        // 房主离开，转移给第一个玩家
        const newHost = (remainingPlayers[0] as any).id;
        await updateRoom({ host: newHost });
      }

      setRoomCode(null);
      setAppState('menu');
    } catch (err: any) {
      setJoinError(err.message);
    }
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
        return currentRoom && gameState ? (
          <GameBoard
            players={currentRoom.players || []}
            currentUserId={userId}
            currentDrawerId={gameState.currentDrawer}
            currentWord={userId === gameState.currentDrawer ? '？' : (gameState.currentWord || '')}
            roundNumber={roundNumber}
            maxRounds={maxRounds}
            roundDuration={gameState.roundDuration}
            messages={messages}
            onSendMessage={handleSendMessage}
            onTimeUp={handleTimeUp}
            scores={gameState.scores || {}}
          />
        ) : null;

      default:
        return null;
    }
  };

  return <div className="w-full min-h-screen">{render()}</div>;
}

export default App;

