import { useState, useEffect, useRef, useCallback } from 'react';
import { roomsService, gameStateService, messagesService } from '../services/firebase';
import type { Room, ChatMessage, GameState } from '../types';

interface LocalRoom extends Room {
  players: any[];
}

export function useFirebaseRoom(roomCode: string | null) {
  const [currentRoom, setCurrentRoom] = useState<LocalRoom | null>(null);
  const [error, setError] = useState<string>('');
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // 监听房间变化
  useEffect(() => {
    if (!roomCode) return;

    try {
      unsubscribeRef.current = roomsService.onRoomChange(roomCode, (room) => {
        if (room) {
          // 转换Firebase格式为应用格式
          const players = room.players ? Object.values(room.players) : [];
          setCurrentRoom({
            ...room,
            players,
          });
        }
      });
    } catch (err: any) {
      setError(err.message);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [roomCode]);

  const updateRoom = useCallback(
    async (updates: any) => {
      if (!roomCode) return;
      try {
        await roomsService.updateRoom(roomCode, updates);
      } catch (err: any) {
        setError(err.message);
      }
    },
    [roomCode]
  );

  return { currentRoom, error, updateRoom };
}

export function useFirebaseGameState(roomCode: string | null) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string>('');
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!roomCode) return;

    try {
      unsubscribeRef.current = gameStateService.onGameStateChange(roomCode, (state) => {
        if (state) {
          setGameState(state);
        }
      });
    } catch (err: any) {
      setError(err.message);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [roomCode]);

  const updateGameState = useCallback(
    async (updates: any) => {
      if (!roomCode) return;
      try {
        await gameStateService.updateGameState(roomCode, updates);
      } catch (err: any) {
        setError(err.message);
      }
    },
    [roomCode]
  );

  return { gameState, error, updateGameState };
}

export function useFirebaseMessages(roomCode: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string>('');
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!roomCode) return;

    try {
      unsubscribeRef.current = messagesService.onMessagesChange(roomCode, (msgs) => {
        if (msgs) {
          setMessages(msgs as ChatMessage[]);
        }
      });
    } catch (err: any) {
      setError(err.message);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [roomCode]);

  const sendMessage = useCallback(
    async (message: Omit<ChatMessage, 'timestamp'>) => {
      if (!roomCode) return;
      try {
        await messagesService.sendMessage(roomCode, message);
      } catch (err: any) {
        setError(err.message);
      }
    },
    [roomCode]
  );

  const clearMessages = useCallback(
    async () => {
      if (!roomCode) return;
      try {
        await messagesService.clearMessages(roomCode);
      } catch (err: any) {
        setError(err.message);
      }
    },
    [roomCode]
  );

  return { messages, error, sendMessage, clearMessages };
}
