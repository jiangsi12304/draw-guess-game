import { useState, useEffect } from 'react';
import './App.css';
import UserSetup from './components/Room/UserSetup';
import Menu from './components/Room/Menu';
import CreateRoom from './components/Room/CreateRoom';
import JoinRoom from './components/Room/JoinRoom';
import Lobby from './components/Room/Lobby';
import GameBoard from './components/Game/GameBoard';
import type { Room, ChatMessage, GameState, DrawingAction } from './types';
import { generateId, generateRoomCode, getAvatarEmoji } from './utils/gameLogic';
import {
  connectSocketServer,
  onSocketEvent,
  createSocketRoom,
  joinSocketRoom,
  startSocketGame,
  sendSocketChatMessage,
  leaveSocketRoom,
  readySocketGame
} from './utils/socket';

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

  // 本地状态替代 Firebase
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 用户设置完成
  const handleUserSetup = (nickname: string, avatarIndex: number) => {
    setUserNickname(nickname);
    setUserAvatarIndex(avatarIndex);
    setAppState('menu');
  };

  // 创建房间
  const handleCreateRoom = async (_roomName: string, maxRounds: number, _roundDuration: number) => {
    const newRoomCode = generateRoomCode();

    // 创建房间
    createSocketRoom(newRoomCode, userId, userNickname, getAvatarEmoji(userAvatarIndex));

    // 加入房间
    joinSocketRoom(newRoomCode, userId, userNickname, getAvatarEmoji(userAvatarIndex));

    setRoomCode(newRoomCode);
    setMaxRounds(maxRounds);
    setAppState('lobby');
  };

  // 加入房间
  const handleJoinRoom = async (code: string) => {
    // 加入房间
    const success = joinSocketRoom(code, userId, userNickname, getAvatarEmoji(userAvatarIndex));
    if (success) {
      setRoomCode(code);
      setAppState('lobby');
    } else {
      setJoinError('加入房间失败，请重试');
    }
  };

  // 开始游戏
  const handleStartGame = () => {
    if (!currentRoom || !roomCode) return;

    // 发送开始游戏命令
    startSocketGame(roomCode);
    // 注意：不在本地设置状态，等待服务器的 game-started 事件
  };

  // 切换准备状态
  const handleToggleReady = (isReady: boolean) => {
    if (!roomCode) return;
    readySocketGame(roomCode, userId, isReady);
  };

  // 发送聊天消息
  const handleSendMessage = (text: string) => {
    if (!gameState || !roomCode) return;

    const message: ChatMessage = {
      id: generateId(),
      userId,
      username: userNickname,
      text,
      isCorrect: false,
      timestamp: Date.now(),
    };

    // 发送消息到服务器
    sendSocketChatMessage(roomCode, message);
  };

  // 轮次时间结束（实际由服务器控制，这里只是为了满足Timer组件的接口）
  const handleTimeUp = () => {
    // 服务器已经控制轮次切换，这里不需要做任何操作
  };

  // 离开房间
  const handleLeaveRoom = () => {
    if (!roomCode) return;

    // 发送离开房间命令
    leaveSocketRoom(roomCode, userId);

    setRoomCode(null);
    setCurrentRoom(null);
    setGameState(null);
    setMessages([]);
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
            players={currentRoom.players || []}
            currentUserId={userId}
            isHost={currentRoom.host === userId}
            onStartGame={handleStartGame}
            onLeave={handleLeaveRoom}
            onToggleReady={handleToggleReady}
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
            roomCode={roomCode || undefined}
          />
        ) : null;

      default:
        return null;
    }
  };

  // Socket.io 连接和事件监听
  useEffect(() => {
    // 连接 Socket.io 服务器
    connectSocketServer();

    // 监听房间更新
    const unsubscribeRoomUpdate = onSocketEvent('room-updated', (updatedRoom: Room) => {
      setCurrentRoom(updatedRoom);
    });

    // 监听游戏开始
    const unsubscribeGameStarted = onSocketEvent('game-started', (newGameState: GameState) => {
      setGameState(newGameState);
      setRoundNumber(1);
      setMessages([]);
      setAppState('playing');
    });

    // 监听游戏状态更新
    const unsubscribeGameStateUpdate = onSocketEvent('game-state-updated', (updatedGameState: GameState) => {
      setGameState(updatedGameState);
    });

    // 监听新轮次
    const unsubscribeNewRound = onSocketEvent('new-round', (newGameState: GameState) => {
      setGameState(newGameState);
      setMessages([]);
      setRoundNumber(prev => prev + 1);
    });

    // 监听游戏结束
    const unsubscribeGameEnded = onSocketEvent('game-ended', (endedRoom: Room) => {
      setAppState('gameEnd');
      setCurrentRoom(endedRoom);
    });

    // 监听聊天消息
    const unsubscribeChatMessage = onSocketEvent('new-chat-message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    // 监听绘画动作
    const unsubscribeDrawingAction = onSocketEvent('new-drawing-action', (action: DrawingAction) => {
      // 这里可以添加绘画动作处理逻辑
      console.log('Received drawing action:', action);
    });

    return () => {
      // 清理所有事件监听器
      unsubscribeRoomUpdate();
      unsubscribeGameStarted();
      unsubscribeGameStateUpdate();
      unsubscribeNewRound();
      unsubscribeGameEnded();
      unsubscribeChatMessage();
      unsubscribeDrawingAction();
    };
  }, []);

  return <div className="w-full min-h-screen">{render()}</div>;
}

export default App;

