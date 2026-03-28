import { useEffect, useRef } from 'react';
import type { GameState } from '../game/types';
import { COL, ROW, GSW, GSH, EMPTY, BS, SL, VI, HA } from '../game/types';

// ── カラーパレット（深紅ネオン） ───────────────────────
const C = {
  BG:     '#060202',
  CELL:   '#0e0404',
  GRID:   '#3c0a0a',
  LINE:   '#dc1e1e',
  GLOW:   'rgba(220,30,30,0.25)',
  VANISH: '#ff7814',
  VANISH_GLOW: 'rgba(255,120,20,0.25)',
  CURSOR: '#ff5050',
  CURSOR_FILL: 'rgba(255,80,80,0.10)',
  SCORE_POP: '#ffb464',
  SWAP_FILL: 'rgba(255,80,80,0.14)',
  OVERLAY: 'rgba(6,2,2,0.60)',
  TEXT:   '#dc1e1e',
};

interface Props {
  state:       GameState;
  swapProgress: number;
}

export default function GameCanvas({ state, swapProgress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = COL * GSW + 2;
  const H = ROW * GSH + 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const g = canvas.getContext('2d');
    if (!g) return;

    draw(g, state, swapProgress, W, H);
  });

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  );
}

// ─── 描画ロジック ─────────────────────────────────────
function draw(
  g: CanvasRenderingContext2D,
  s: GameState,
  swapProg: number,
  W: number,
  H: number,
) {
  // 背景
  g.fillStyle = C.BG;
  g.fillRect(0, 0, W, H);

  // グリッドセル
  for (let y = 0; y < ROW; y++) {
    for (let x = 0; x < COL; x++) {
      g.fillStyle = C.CELL;
      g.fillRect(x * GSW + 1, y * GSH + 1, GSW - 1, GSH - 1);
      g.strokeStyle = C.GRID;
      g.lineWidth = 0.8;
      g.strokeRect(x * GSW + 0.5, y * GSH + 0.5, GSW, GSH);
    }
  }

  // スキャンライン
  g.save();
  g.globalAlpha = 0.06;
  g.fillStyle = '#000';
  for (let y = 0; y < H; y += 2) {
    g.fillRect(0, y, W, 1);
  }
  g.restore();

  // パネル描画
  for (let x = 0; x < COL; x++) {
    for (let y = 0; y < ROW; y++) {
      const px = x * GSW, py = y * GSH;
      if (s.normalPanel[x][y] !== EMPTY)
        drawGlowPanel(g, s.normalPanel[x][y], px, py, C.LINE, C.GLOW);
      if (s.vanishPanel[x][y] !== EMPTY)
        drawGlowPanel(g, s.vanishPanel[x][y], px, py, C.VANISH, C.VANISH_GLOW);
      if (s.floatingPanel[x][y] !== EMPTY) {
        drawGlowPanel(g, s.floatingPanel[x][y], px - 4, py - 4, C.LINE, C.GLOW);
        g.strokeStyle = C.GRID;
        g.lineWidth = 0.8;
        g.strokeRect(px - 4 + 0.5, py - 4 + 0.5, GSW, GSH);
      }
    }
  }

  // スワップアニメーション
  if (swapProg > 0) {
    const sx = s.curX * GSW, sy = s.curY * GSH;
    g.fillStyle = C.SWAP_FILL;
    g.fillRect(sx + 1, sy,        GSW - 1, GSH - 1);
    g.fillRect(sx + 1, sy + GSH,  GSW - 1, GSH - 1);

    const offset = Math.round(GSH * swapProg);
    drawPanel(g, s.normalPanel[s.curX][s.curY + 1], sx, sy + offset,         C.LINE, true);
    drawPanel(g, s.normalPanel[s.curX][s.curY],     sx, sy + GSH - offset,   C.LINE, true);
  }

  // カーソル
  if (s.isPlaying) {
    const cx = s.curX * GSW, cy = s.curY * GSH;
    g.fillStyle = C.CURSOR_FILL;
    g.fillRect(cx + 1, cy + 1, GSW - 1, 2 * GSH - 1);
    g.strokeStyle = C.CURSOR;
    g.lineWidth = 2;
    g.strokeRect(cx + 1, cy + 1, GSW - 1, 2 * GSH - 1);
  }

  // スコアポップアップ
  if (s.scoreTemp > 0) {
    let dispX = 0, dispY = 0;
    for (let y = 0; y < ROW; y++)
      for (let x = 0; x < COL; x++)
        if (s.panelFlag[x][y] === 1) { dispX = x; dispY = y; }
    if (dispX > 3) dispX = 3;
    if (dispY > 5) dispY -= 1;

    const txt = `+${s.scoreTemp}`;
    g.font = 'bold 14px monospace';
    g.fillStyle = 'rgba(0,0,0,0.7)';
    g.fillText(txt, dispX * GSW + 2, dispY * GSH + 1);
    g.fillStyle = C.SCORE_POP;
    g.fillText(txt, dispX * GSW + 1, dispY * GSH);
  }

  // スタンバイオーバーレイ
  if (!s.isPlaying) {
    g.fillStyle = C.OVERLAY;
    g.fillRect(0, 0, W, H);
    g.font = 'bold 13px monospace';
    g.fillStyle = C.TEXT;
    const msg = 'PRESS START';
    const tw = g.measureText(msg).width;
    g.fillText(msg, (W - tw) / 2, H / 2);
  }
}

function drawGlowPanel(
  g: CanvasRenderingContext2D,
  p: number, x: number, y: number,
  color: string, glow: string,
) {
  // グロー層
  g.save();
  g.globalAlpha = 1;
  g.strokeStyle = glow;
  g.lineWidth = 8;
  g.lineCap = 'round';
  drawPanelShape(g, p, x, y);
  g.restore();
  // メイン線
  drawPanel(g, p, x, y, color, false);
}

function drawPanel(
  g: CanvasRenderingContext2D,
  p: number, x: number, y: number,
  color: string, thin: boolean,
) {
  g.strokeStyle = color;
  g.lineWidth = thin ? 2 : 2.5;
  g.lineCap = 'round';
  drawPanelShape(g, p, x, y);
}

function drawPanelShape(g: CanvasRenderingContext2D, p: number, x: number, y: number) {
  const x2 = x + GSW, y2 = y + GSH;
  const xm = x + GSW / 2, ym = y + GSH / 2;
  g.beginPath();
  switch (p) {
    case BS:
      g.moveTo(x,  y ); g.lineTo(x2, y2); break;
    case SL:
      g.moveTo(x,  y2); g.lineTo(x2, y ); break;
    case VI:
      g.moveTo(x,  y ); g.lineTo(xm, ym);
      g.moveTo(xm, ym); g.lineTo(x2, y ); break;
    case HA:
      g.moveTo(x,  y2); g.lineTo(xm, ym);
      g.moveTo(xm, ym); g.lineTo(x2, y2); break;
  }
  g.stroke();
}
