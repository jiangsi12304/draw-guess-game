import { useState, useEffect } from 'react';
import './App.css';
import UserSetup from './components/Room/UserSetup';
import Menu from './components/Room/Menu';
import CreateRoom from './components/Room/CreateRoom';
import JoinRoom from './components/Room/JoinRoom';
import Lobby from './components/Room/Lobby';
import GameBoard from './components/Game/GameBoard';
import GlowButton from './components/UI/GlowButton';
import GlassCard from './components/UI/GlassCard';
import type { Room, ChatMessage, GameState, DrawingAction } from './types';
import { generateId, generateRoomCode, getAvatarEmoji } from './utils/gameLogic';
import { soundManager } from './utils/soundManager';
import {
  connectSocketServer,
  onSocketEvent,
  createSocketRoom,
  joinSocketRoom,
  startSocketGame,
  sendSocketChatMessage,
  leaveSocketRoom,
  readySocketGame,
  selectSocketWord,
  kickSocketPlayer,
  getSocketConnectionStatus
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
  const [revealedWord, setRevealedWord] = useState<string | null>(null);

  // 用户设置完成
  const handleUserSetup = (nickname: string, avatarIndex: number) => {
    setUserNickname(nickname);
    setUserAvatarIndex(avatarIndex);
    setAppState('menu');
  };

  // 创建房间
  const handleCreateRoom = async (_roomName: string, maxRounds: number, roundDuration: number, difficulty: 'easy' | 'normal' | 'hard' | 'all', customWords?: string[]) => {
    console.log('=== handleCreateRoom 开始 ===');
    console.log('房间参数:', { _roomName, maxRounds, roundDuration, difficulty, customWords });
    console.log('用户信息:', { userId, userNickname, userAvatarIndex });

    // 检查 Socket 连接状态
    const isConnected = getSocketConnectionStatus();
    console.log('Socket连接状态:', isConnected);

    if (!isConnected) {
      console.error('❌ Socket未连接');
      alert(`❌ 无法连接到服务器

请检查：
1. Socket 服务器是否正在运行
2. 网络连接是否正常
3. 防火墙是否阻止连接`);
      return;
    }

    const newRoomCode = generateRoomCode();
    console.log('生成的房间码:', newRoomCode);

    // 创建房间
    console.log('调用 createSocketRoom...');
    const created = createSocketRoom(newRoomCode, userId, userNickname, getAvatarEmoji(userAvatarIndex), {
      maxRounds,
      roundDuration,
      difficulty,
      customWords
    });

    console.log('createSocketRoom 返回结果:', created);

    if (!created) {
      console.error('❌ 创建房间失败');
      alert('❌ 创建房间失败，请重试');
      return;
    }

    // 加入房间
    console.log('调用 joinSocketRoom...');
    const joined = joinSocketRoom(newRoomCode, userId, userNickname, getAvatarEmoji(userAvatarIndex));

    console.log('joinSocketRoom 返回结果:', joined);

    if (!joined) {
      console.error('❌ 加入房间失败');
      alert('❌ 加入房间失败，请重试');
      return;
    }

    console.log('设置房间信息到状态');
    setRoomCode(newRoomCode);
    setMaxRounds(maxRounds);
    console.log('等待 room-updated 事件...');
    // 不在这里设置 appState，等待 room-updated 事件后再设置
    console.log('=== handleCreateRoom 完成 ===');
  };

  // 加入房间
  const handleJoinRoom = async (code: string) => {
    // 检查 Socket 连接状态
    if (!getSocketConnectionStatus()) {
      setJoinError('无法连接到服务器，请检查网络连接');
      return;
    }

    setJoinError('');

    // 加入房间
    const success = joinSocketRoom(code, userId, userNickname, getAvatarEmoji(userAvatarIndex));
    if (success) {
      setRoomCode(code);
      // 不在这里设置 appState，等待 room-updated 事件后再设置
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

  // 选择词语
  const handleWordSelect = (word: string) => {
    if (!roomCode) return;
    selectSocketWord(roomCode, userId, word);
  };

  // 踢出玩家
  const handleKickPlayer = (playerId: string) => {
    if (!roomCode) return;
    kickSocketPlayer(roomCode, userId, playerId);
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
            onCreateRoom={() => {
              console.log('点击创建房间');
              setAppState('createRoom');
            }}
            onJoinRoom={() => {
              console.log('点击加入房间');
              setAppState('joinRoom');
            }}
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
            onKickPlayer={handleKickPlayer}
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
            onWordSelect={handleWordSelect}
            scores={gameState.scores || {}}
            roomCode={roomCode || undefined}
            revealedWord={revealedWord}
            wordSelectionState={gameState.wordSelectionState || 'drawing'}
            wordOptions={gameState.wordOptions || []}
          />
        ) : null;

      case 'gameEnd':
        return currentRoom ? (
          <div className="min-h-screen flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-2xl text-center space-y-6">
              <h2 className="text-4xl font-display font-bold gradient-text">🏆 游戏结束</h2>

              <div className="space-y-4">
                {(currentRoom.players || [])
                  .sort((a, b) => (gameState?.scores?.[b.id] || 0) - (gameState?.scores?.[a.id] || 0))
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className={`p-4 rounded-lg flex items-center justify-between ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-400/30 to-orange-400/30 border-2 border-yellow-400'
                          : 'bg-glass-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{player.avatar}</span>
                        <div className="text-left">
                          <p className="font-bold text-white text-xl">
                            {index === 0 ? '🥇 ' : index === 1 ? '🥈 ' : index === 2 ? '🥉 ' : ''}
                            {player.nickname}
                          </p>
                          {player.id === userId && (
                            <p className="text-sm text-gray-300">（你）</p>
                          )}
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-white">
                        {gameState?.scores?.[player.id] || 0} 分
                      </p>
                    </div>
                  ))}
              </div>

              <div className="flex gap-3">
                <GlowButton onClick={handleLeaveRoom} className="flex-1">
                  返回菜单
                </GlowButton>
              </div>
            </GlassCard>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  // Socket.io 连接和事件监听
  useEffect(() => {
    console.log('App useEffect: 设置Socket事件监听');

    // 连接 Socket.io 服务器
    connectSocketServer();

    // 监听房间更新
    const unsubscribeRoomUpdate = onSocketEvent('room-updated', (updatedRoom: Room) => {
      console.log('收到 room-updated 事件:', updatedRoom);
      console.log('当前appState:', appState);
      console.log('当前房间:', currentRoom);

      // 如果之前没有房间信息，说明刚创建或加入房间，切换到lobby
      if (!currentRoom && (appState === 'createRoom' || appState === 'joinRoom' || appState === 'menu')) {
        console.log(`从${appState}切换到lobby`);
        setAppState('lobby');
      }

      setCurrentRoom(updatedRoom);
    });

    // 监听游戏开始
    const unsubscribeGameStarted = onSocketEvent('game-started', (newGameState: GameState) => {
      console.log('收到 game-started 事件');
      soundManager.playGameStart();
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
      soundManager.playRoundChange();
      setGameState(newGameState);
      setMessages([]);
      setRoundNumber(prev => prev + 1);
    });

    // 监听游戏结束
    const unsubscribeGameEnded = onSocketEvent('game-ended', (endedRoom: Room) => {
      soundManager.playGameEnd();
      setAppState('gameEnd');
      setCurrentRoom(endedRoom);
    });

    // 监听答案揭晓
    const unsubscribeAnswerRevealed = onSocketEvent('answer-revealed', (data: { word: string, correct: boolean }) => {
      if (data.correct) {
        soundManager.playCorrect();
      } else {
        soundManager.playTimeUp();
      }
      setRevealedWord(data.word);
      // 3秒后隐藏答案
      setTimeout(() => {
        setRevealedWord(null);
      }, 3000);
    });

    // 监听聊天消息
    const unsubscribeChatMessage = onSocketEvent('new-chat-message', (message: ChatMessage) => {
      // 如果消息来自自己，且答错了，播放错误音效
      if (message.userId === userId && !message.isCorrect && gameState) {
        // 只在猜测状态下播放错误音效
        soundManager.playWrong();
      }
      setMessages(prev => [...prev, message]);
    });

    // 监听词语选择
    const unsubscribeWordSelected = onSocketEvent('word-selected', (data: { word: string, drawerId: string }) => {
      console.log('词语已选择:', data.word);
    });

    // 监听绘画动作
    const unsubscribeDrawingAction = onSocketEvent('new-drawing-action', (action: DrawingAction) => {
      // 这里可以添加绘画动作处理逻辑
      console.log('Received drawing action:', action);
    });

    return () => {
      console.log('App useEffect cleanup: 清理事件监听器');
      // 清理所有事件监听器
      unsubscribeRoomUpdate();
      unsubscribeGameStarted();
      unsubscribeGameStateUpdate();
      unsubscribeNewRound();
      unsubscribeGameEnded();
      unsubscribeAnswerRevealed();
      unsubscribeChatMessage();
      unsubscribeWordSelected();
      unsubscribeDrawingAction();
    };
  }, [appState, userId, gameState]);

  return (
    <div className="w-full min-h-screen pointer-events-auto" style={{ position: 'relative', zIndex: 1 }}>
      {render()}
    </div>
  );
}

export default App;

