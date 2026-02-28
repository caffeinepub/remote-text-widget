import {
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAddStroke, usePollStrokes } from '@/hooks/useQueries';
import type { Stroke } from '@/backend';

interface CollaborativeCanvasProps {
  roomCode: string;
  className?: string;
}

const COLORS = [
  { label: 'White', value: '#e8eaf0' },
  { label: 'Neon', value: '#b8ff57' },
  { label: 'Electric', value: '#57c8ff' },
  { label: 'Pink', value: '#ff57b8' },
  { label: 'Orange', value: '#ffaa57' },
  { label: 'Red', value: '#ff5757' },
];

export default function CollaborativeCanvas({ roomCode, className }: CollaborativeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const currentStrokePoints = useRef<[number, number][]>([]);
  const renderedStrokeCount = useRef(0);

  const [color, setColor] = useState(COLORS[0].value);
  const [strokeSize, setStrokeSize] = useState(4);

  const addStroke = useAddStroke();
  const { data: remoteStrokes } = usePollStrokes(roomCode, !!roomCode);

  // Initialize canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Save current drawing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#0d0f14';
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (tempCanvas.width > 0 && tempCanvas.height > 0) {
      ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
    }
  }, []);

  useEffect(() => {
    initCanvas();
    const observer = new ResizeObserver(() => initCanvas());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [initCanvas]);

  // Draw a stroke on the canvas
  const drawStroke = useCallback((stroke: Stroke) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || stroke.points.length === 0) return;

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.points.length === 1) {
      const [x, y] = stroke.points[0];
      ctx.arc(x * rect.width, y * rect.height, stroke.thickness / 2, 0, Math.PI * 2);
      ctx.fillStyle = stroke.color;
      ctx.fill();
    } else {
      const [startX, startY] = stroke.points[0];
      ctx.moveTo(startX * rect.width, startY * rect.height);
      for (let i = 1; i < stroke.points.length; i++) {
        const [px, py] = stroke.points[i];
        ctx.lineTo(px * rect.width, py * rect.height);
      }
      ctx.stroke();
    }
  }, []);

  // Render new remote strokes as they arrive
  useEffect(() => {
    if (!remoteStrokes) return;
    const newStrokes = remoteStrokes.slice(renderedStrokeCount.current);
    newStrokes.forEach(drawStroke);
    renderedStrokeCount.current = remoteStrokes.length;
  }, [remoteStrokes, drawStroke]);

  const getPos = (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (e instanceof MouseEvent) {
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    } else if (e.touches.length > 0) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return null;
  };

  const startDraw = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const pos = getPos(e);
      if (!pos) return;
      isDrawing.current = true;
      lastPos.current = pos;

      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      currentStrokePoints.current = [[pos.x / rect.width, pos.y / rect.height]];

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, strokeSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    },
    [color, strokeSize]
  );

  const draw = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawing.current) return;
      const pos = getPos(e);
      if (!pos || !lastPos.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      lastPos.current = pos;

      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        currentStrokePoints.current.push([pos.x / rect.width, pos.y / rect.height]);
      }
    },
    [color, strokeSize]
  );

  const stopDraw = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current = null;

    const points = currentStrokePoints.current;
    if (points.length > 0 && roomCode) {
      const stroke: Stroke = {
        points,
        color,
        thickness: strokeSize,
      };
      // Optimistically increment so we don't re-render our own stroke
      renderedStrokeCount.current += 1;
      addStroke.mutate({ roomCode, stroke });
    }
    currentStrokePoints.current = [];
  }, [color, strokeSize, roomCode, addStroke]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);

    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDraw);
      canvas.removeEventListener('mouseleave', stopDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDraw);
    };
  }, [startDraw, draw, stopDraw]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.fillStyle = '#0d0f14';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    renderedStrokeCount.current = 0;
  };

  const decreaseStroke = () => setStrokeSize((s) => Math.max(1, s - 2));
  const increaseStroke = () => setStrokeSize((s) => Math.min(24, s + 2));

  return (
    <div className={`flex flex-col gap-3 ${className ?? ''}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Color swatches */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => setColor(c.value)}
              className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none"
              style={{
                backgroundColor: c.value,
                borderColor: color === c.value ? c.value : 'transparent',
                boxShadow:
                  color === c.value
                    ? `0 0 0 2px #0d0f14, 0 0 0 4px ${c.value}`
                    : 'none',
              }}
            />
          ))}
        </div>

        {/* Stroke size */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={decreaseStroke}
            className="w-7 h-7 text-muted-foreground hover:text-foreground"
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <div
            className="rounded-full bg-foreground/80 transition-all"
            style={{
              width: `${strokeSize}px`,
              height: `${strokeSize}px`,
              minWidth: '4px',
              minHeight: '4px',
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={increaseStroke}
            className="w-7 h-7 text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Clear */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearCanvas}
          className="text-muted-foreground hover:text-destructive gap-1.5 h-7 px-2 text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden border border-border/40 cursor-crosshair flex-1"
        style={{ minHeight: '320px', background: '#0d0f14' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none w-full h-full"
          style={{ cursor: 'crosshair' }}
        />
      </div>
    </div>
  );
}
