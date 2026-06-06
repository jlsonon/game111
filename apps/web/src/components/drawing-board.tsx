"use client";

import type { DrawingStroke } from "@partyverse/shared";
import { Brush, Eraser, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GhostButton } from "./ui";

type Props = {
  userId: string;
  strokes: DrawingStroke[];
  onStroke?: (stroke: DrawingStroke) => void;
  onUndo?: () => void;
  readOnly?: boolean;
};

export function DrawingBoard({ userId, strokes, onStroke, onUndo, readOnly }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState("#22d3ee");
  const [size, setSize] = useState(6);
  const [tool, setTool] = useState<"BRUSH" | "ERASER">("BRUSH");
  const current = useRef<DrawingStroke | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, rect.width, rect.height);

    strokes.forEach((stroke) => drawStroke(context, stroke));
  }, [strokes]);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  return (
    <div className="grid gap-3">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2">
          <GhostButton className={tool === "BRUSH" ? "bg-cyan-300 text-zinc-950" : ""} onClick={() => setTool("BRUSH")}>
            <Brush size={17} />
          </GhostButton>
          <GhostButton className={tool === "ERASER" ? "bg-cyan-300 text-zinc-950" : ""} onClick={() => setTool("ERASER")}>
            <Eraser size={17} />
          </GhostButton>
          <input aria-label="Brush color" type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-11 w-14 rounded-lg border border-white/10 bg-transparent" />
          <input aria-label="Brush size" type="range" min="2" max="24" value={size} onChange={(event) => setSize(Number(event.target.value))} className="w-32 accent-cyan-300" />
          <GhostButton onClick={onUndo}>
            <RotateCcw size={17} /> Undo
          </GhostButton>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`aspect-[4/3] w-full touch-none rounded-lg bg-white shadow-2xl ${readOnly ? "cursor-default" : "cursor-crosshair"}`}
        onPointerDown={(event) => {
          if (readOnly) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          current.current = {
            id: crypto.randomUUID(),
            userId,
            points: [point(event)],
            color,
            size,
            tool,
            createdAt: Date.now(),
          };
        }}
        onPointerMove={(event) => {
          if (readOnly || !current.current) return;
          current.current.points.push(point(event));
          const context = event.currentTarget.getContext("2d");
          if (context) drawStroke(context, current.current);
        }}
        onPointerUp={() => {
          if (!readOnly && current.current && current.current.points.length > 1) onStroke?.(current.current);
          current.current = null;
        }}
      />
    </div>
  );
}

function drawStroke(context: CanvasRenderingContext2D, stroke: DrawingStroke) {
  if (stroke.points.length < 2) return;
  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = stroke.size;
  context.strokeStyle = stroke.tool === "ERASER" ? "#ffffff" : stroke.color;
  context.beginPath();
  context.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (const point of stroke.points.slice(1)) context.lineTo(point.x, point.y);
  context.stroke();
  context.restore();
}
