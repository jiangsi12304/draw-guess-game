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
  tool: 'brush' | 'eraser' | 'fill';
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
    tool: 'brush',
  });

  const [currentStroke, setCurrentStroke] = useState<{x: number, y: number}[]>([]);

  // 预设颜色
  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#FF6B6B',
    '#FFB6C1', '#FFD700', '#FFA500', '#FFA500',
    '#FF8C00', '#808000', '#008000', '#006400',
    '#00FF00', '#00FF7F', '#00FFFF', '#008080',
    '#0000FF', '#000080', '#4B0082', '#800080',
    '#FF00FF', '#FF1493', '#FF69B4', '#FFC0CB',
    '#E6E6FA', '#D8BFD8', '#A52A2A', '#8B4513',
    '#DEB887', '#F5DEB3', '#DCDCDC', '#C0C0C0',
  ];

  // 将十六进制颜色转换为 RGB
  const hexToRgb = (hex: string): {r: number, g: number, b: number, a: number} => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 255
    } : {r: 0, g: 0, b: 0, a: 255};
  };

  // 比较两个颜色是否相同
  const colorsMatch = (color1: {r: number, g: number, b: number, a: number}, color2: {r: number, g: number, b: number, a: number}, tolerance: number = 0): boolean => {
    return Math.abs(color1.r - color2.r) <= tolerance &&
           Math.abs(color1.g - color2.g) <= tolerance &&
           Math.abs(color1.b - color2.b) <= tolerance &&
           Math.abs(color1.a - color2.a) <= tolerance;
  };

  // 泛洪填充算法
  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = getCanvasContext();
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const x = Math.floor(startX);
    const y = Math.floor(startY);

    // 获取起始点颜色
    const startPos = (y * width + x) * 4;
    const startColor = {
      r: data[startPos],
      g: data[startPos + 1],
      b: data[startPos + 2],
      a: data[startPos + 3]
    };

    // 获取填充颜色
    const fillRgb = hexToRgb(fillColor);

    // 如果填充颜色与起始颜色相同，不执行填充
    if (colorsMatch(startColor, {r: fillRgb.r, g: fillRgb.g, b: fillRgb.b, a: 255})) {
      return;
    }

    // 使用栈实现泛洪填充
    const stack: [number, number][] = [[x, y]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!;
      const key = `${cx},${cy}`;

      if (visited.has(key)) continue;
      if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;

      const pos = (cy * width + cx) * 4;
      const currentColor = {
        r: data[pos],
        g: data[pos + 1],
        b: data[pos + 2],
        a: data[pos + 3]
      };

      // 如果当前颜色与起始颜色不匹配，不填充
      if (!colorsMatch(currentColor, startColor, 10)) continue;

      // 填充当前像素
      data[pos] = fillRgb.r;
      data[pos + 1] = fillRgb.g;
      data[pos + 2] = fillRgb.b;
      data[pos + 3] = 255;
      visited.add(key);

      // 添加相邻像素到栈
      stack.push([cx + 1, cy]);
      stack.push([cx - 1, cy]);
      stack.push([cx, cy + 1]);
      stack.push([cx, cy - 1]);
    }

    // 将填充后的图像数据放回画布
    ctx.putImageData(imageData, 0, 0);
    saveToHistory();
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z: 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y: 重做
      else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      // Ctrl+Shift+Z: 重做
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      }
      // B: 画笔
      else if (e.key === 'b' && isDrawer) {
        setDrawingState(prev => ({ ...prev, tool: 'brush' }));
      }
      // E: 橡皮擦
      else if (e.key === 'e' && isDrawer) {
        setDrawingState(prev => ({ ...prev, tool: 'eraser' }));
      }
      // F: 填充桶
      else if (e.key === 'f' && isDrawer) {
        setDrawingState(prev => ({ ...prev, tool: 'fill' }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawer, drawingState.historyIndex, drawingState.history.length]);

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
      const unsubscribeDrawing = onSocketEvent('new-drawing-action', (action: DrawingAction) => {
        handleRemoteAction(action, ctx);
      });

      // 监听新轮次开始，清空画布
      const unsubscribeNewRound = onSocketEvent('new-round', () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
      });

      return () => {
        unsubscribeDrawing();
        unsubscribeNewRound();
      };
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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = getCanvasContext();
    if (!ctx) return;

    // 如果是填充工具，执行填充
    if (drawingState.tool === 'fill') {
      floodFill(x, y, drawingState.color);
      return;
    }

    setDrawingState(prev => ({ ...prev, isDrawing: true }));
    setCurrentStroke([{x, y}]);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingState.isDrawing || !isDrawer) return;
    if ('touches' in e) e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = getCanvasContext();
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.strokeStyle = drawingState.tool === 'eraser' ? '#FFFFFF' : drawingState.color;
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

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
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
        <div className="space-y-3">
          {/* 颜色选择 */}
          <div>
            <span className="text-sm text-white mb-2 block">颜色：</span>
            <div className="flex flex-wrap gap-1">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setDrawingState(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                    drawingState.color === color ? 'border-white ring-2 ring-blue-500' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <input
                type="color"
                value={drawingState.color}
                onChange={(e) =>
                  setDrawingState(prev => ({ ...prev, color: e.target.value }))
                }
                className="w-8 h-8 rounded cursor-pointer ml-2"
                title="自定义颜色"
              />
            </div>
          </div>

          {/* 画笔大小 */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-white">粗细：</span>
            <input
              type="range"
              min="1"
              max="30"
              value={drawingState.brushSize}
              onChange={(e) =>
                setDrawingState(prev => ({ ...prev, brushSize: parseInt(e.target.value) }))
              }
              className="w-32"
            />
            <span className="text-sm text-white bg-glass-white px-2 py-1 rounded">{drawingState.brushSize}px</span>
          </div>

          {/* 工具选择 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white">工具：</span>
            <div className="flex gap-2 flex-wrap">
              <GlowButton
                variant={drawingState.tool === 'brush' ? 'primary' : 'secondary'}
                onClick={() => setDrawingState(prev => ({ ...prev, tool: 'brush' }))}
                className="text-sm"
              >
                🖌️ 画笔
              </GlowButton>
              <GlowButton
                variant={drawingState.tool === 'eraser' ? 'primary' : 'secondary'}
                onClick={() => setDrawingState(prev => ({ ...prev, tool: 'eraser' }))}
                className="text-sm"
              >
                🧽 橡皮擦
              </GlowButton>
              <GlowButton
                variant={drawingState.tool === 'fill' ? 'primary' : 'secondary'}
                onClick={() => setDrawingState(prev => ({ ...prev, tool: 'fill' }))}
                className="text-sm"
              >
                🪣 填充
              </GlowButton>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 justify-end flex-wrap">
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
              variant="primary"
              onClick={downloadDrawing}
              className="text-sm"
            >
              💾 保存
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
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="border-2 border-white rounded-lg cursor-crosshair shadow-lg max-w-full h-auto"
          style={{ background: 'white', maxWidth: '100%', touchAction: 'none' }}
        />
      </div>
    </GlassCard>
  );
}
