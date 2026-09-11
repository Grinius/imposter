'use client';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Point, Stroke } from '@/lib/drawing-imposter';
import { playerColors } from './shared';

// A shared drawing surface for one phone. Strokes live in 0–1 coordinates in the round state; this
// component only paints them and, while `active`, captures exactly one pointer-down-to-up stroke and
// hands it back. The canvas draws at a fixed internal resolution and lets CSS scale it, which keeps
// the maths trivial and the picture identical on every screen size.
const resolution = 800, lineWidth = 7;
export default function SketchPad({ strokes, pending, active, onStrokeEnd, label }: { strokes: Stroke[]; pending: Point[] | null; active: boolean; onStrokeEnd: (points: Point[]) => void; label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState<Point[] | null>(null);
  const drawing = useRef<Point[] | null>(null);
  useEffect(() => {
    const context = canvas.current?.getContext('2d'); if (!context) return;
    context.clearRect(0, 0, resolution, resolution);
    context.lineCap = 'round'; context.lineJoin = 'round'; context.lineWidth = lineWidth;
    const paint = (points: Point[], color: string) => {
      if (!points.length) return;
      context.strokeStyle = color; context.fillStyle = color; context.beginPath();
      if (points.length === 1) { context.arc(points[0][0] * resolution, points[0][1] * resolution, lineWidth / 2, 0, Math.PI * 2); context.fill(); return; }
      context.moveTo(points[0][0] * resolution, points[0][1] * resolution);
      for (const [x, y] of points.slice(1)) context.lineTo(x * resolution, y * resolution);
      context.stroke();
    };
    for (const stroke of strokes) paint(stroke.points, playerColors[stroke.player % playerColors.length]);
    if (pending) paint(pending, '#1f3a30'); else if (live) paint(live, '#1f3a30');
  }, [strokes, pending, live]);
  function position(event: PointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return [Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)), Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))];
  }
  function down(event: PointerEvent<HTMLCanvasElement>) {
    if (!active || pending || drawing.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = [position(event)]; setLive(drawing.current);
  }
  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const point = position(event), last = drawing.current[drawing.current.length - 1];
    if (Math.hypot(point[0] - last[0], point[1] - last[1]) < 0.002) return; // ignore jitter; keeps strokes small
    drawing.current = [...drawing.current, point]; setLive(drawing.current);
  }
  function up() {
    if (!drawing.current) return;
    const points = drawing.current; drawing.current = null; setLive(null);
    onStrokeEnd(points);
  }
  return <canvas ref={canvas} className={`sketch-pad ${active && !pending ? 'sketch-active' : ''}`} width={resolution} height={resolution} role="img" aria-label={label}
    onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} />;
}
