import { useRef, useEffect, useState } from 'react';
import GlassCard from '../UI/GlassCard';
import GlowButton from '../UI/GlowButton';
import { onSocketEvent, sendSocketDrawingAction } from '../../utils/socket';
import type { DrawingAction } from '../../types';

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onDrawingChange?: (imageData: string) => void;
  isDrawer?: boolean;
  roomCode?: string;
}

interface DrawingState {
  isDrawing: boolean;
  color: string;
  brushSize: number;
  history: ImageData[];
  historyIndex: number;
}

export default function DrawingCanvas({
  width = 600,
  height = 500,
  onDrawingChange,
  isDrawer = true,
  roomCode,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    color: '#000000',
    brushSize: 3,
    history: [],
    historyIndex: -1,
  });

  const [currentStroke, setCurrentStroke] = useState<{x: number, y: number}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置白色背景
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // 如果不是绘画者，监听绘画动作
    if (!isDrawer && roomCode) {
      const unsubscribe = onSocketEvent('new-drawing-action', (action: DrawingAction) => {
        handleRemoteAction(action, ctx);
      });
      return unsubscribe;
    }
  }, [width, height, isDrawer, roomCode]);

  const handleRemoteAction = (action: DrawingAction, ctx: CanvasRenderingContext2D) => {
    switch (action.type) {
      case 'stroke':
        if (action.data && action.data.length > 0) {
          ctx.beginPath();
          ctx.strokeStyle = action.color || '#000000';
          ctx.lineWidth = action.width || 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          const points = action.data;
          if (points.length > 0) {
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
              ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
          }
        }
        break;
      case 'clear':
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        break;
    }
  };

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = getCanvasContext();
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const newHistory = drawingState.history.slice(0, drawingState.historyIndex + 1);
    newHistory.push(imageData);

    setDrawingState(prev => ({
      ...prev,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    }));

    // 触发变化回调
    onDrawingChange?.(canvas.toDataURL());
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = getCanvasContext();
    if (!ctx) return;

    setDrawingState(prev => ({ ...prev, isDrawing: true }));
    setCurrentStroke([{x, y}]);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingState.isDrawing || !isDrawer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = getCanvasContext();
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.strokeStyle = drawingState.color;
    ctx.lineWidth = drawingState.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    setCurrentStroke(prev => [...prev, {x, y}]);
  };

  const stopDrawing = () => {
    if (!drawingState.isDrawing) return;
    setDrawingState(prev => ({ ...prev, isDrawing: false }));

    if (roomCode && currentStroke.length > 0) {
      const action: DrawingAction = {
        type: 'stroke',
        data: [...currentStroke],
        color: drawingState.color,
        width: drawingState.brushSize
      };
      sendSocketDrawingAction(roomCode, action);
    }

    setCurrentStroke([]);
    saveToHistory();
  };

  const clearCanvas = () => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    if (roomCode && isDrawer) {
      const action: DrawingAction = {
        type: 'clear'
      };
      sendSocketDrawingAction(roomCode, action);
    }

    saveToHistory();
  };

  const undo = () => {
    if (drawingState.historyIndex <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = getCanvasContext();
    if (!ctx) return;

    const newIndex = drawingState.historyIndex - 1;
    const imageData = drawingState.history[newIndex];

    ctx.putImageData(imageData, 0, 0);
    setDrawingState(prev => ({ ...prev, historyIndex: newIndex }));
  };

  const redo = () => {
    if (drawingState.historyIndex >= drawingState.history.length - 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = getCanvasContext();
    if (!ctx) return;

    const newIndex = drawingState.historyIndex + 1;
    const imageData = drawingState.history[newIndex];

    ctx.putImageData(imageData, 0, 0);
    setDrawingState(prev => ({ ...prev, historyIndex: newIndex }));
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display font-bold text-white">
          {isDrawer ? '✏️ 你的画布' : '👀 观看绘画'}
        </h3>
      </div>

      {/* 工具栏 */}
      {isDrawer && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white">颜色：</span>
            <input
              type="color"
              value={drawingState.color}
              onChange={(e) =>
                setDrawingState(prev => ({ ...prev, color: e.target.value }))
              }
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-white">粗细：</span>
            <input
              type="range"
              min="1"
              max="20"
              value={drawingState.brushSize}
              onChange={(e) =>
                setDrawingState(prev => ({ ...prev, brushSize: parseInt(e.target.value) }))
              }
              className="w-24"
            />
            <span className="text-sm text-white">{drawingState.brushSize}px</span>
          </div>

          <div className="flex gap-2 ml-auto">
            <GlowButton
              variant="secondary"
              onClick={undo}
              disabled={drawingState.historyIndex <= 0}
              className="text-sm"
            >
              ↶ 撤销
            </GlowButton>
            <GlowButton
              variant="secondary"
              onClick={redo}
              disabled={drawingState.historyIndex >= drawingState.history.length - 1}
              className="text-sm"
            >
              ↷ 重做
            </GlowButton>
            <GlowButton
              variant="danger"
              onClick={clearCanvas}
              className="text-sm"
            >
              🗑️ 清空
            </GlowButton>
          </div>
        </div>
      )}

      {/* 画布 */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="border-2 border-white rounded-lg cursor-crosshair shadow-lg"
          style={{ background: 'white' }}
        />
      </div>
    </GlassCard>
  );
}
