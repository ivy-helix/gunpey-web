export const COL = 5;
export const ROW = 10;
export const GSW = 44; // grid cell width
export const GSH = 32; // grid cell height

export const PANEL_WIDTH  = COL * GSW + 2;
export const PANEL_HEIGHT = ROW * GSH + 2;

// Panel types
export const EMPTY = 0;
export const BS    = 1; // backslash \
export const SL    = 2; // slash /
export const VI    = 3; // caret ∧
export const HA    = 4; // v-shape ∨

export type PanelType = 0 | 1 | 2 | 3 | 4;

export interface GameState {
  normalPanel:   PanelType[][];
  vanishPanel:   PanelType[][];
  floatingPanel: PanelType[][];
  panelFlag:     number[][];
  score:         number;
  scoreTemp:     number;
  isPlaying:     boolean;
  curX:          number;
  curY:          number;
  swapProgress:  number;   // 0..1, >0 means animating
  failFlags:     boolean[]; // JS版参考：列ごとの失敗フラグ
  missedCount:   number;
}

export function createGameState(): GameState {
  return {
    normalPanel:   Array.from({ length: COL }, () => Array(ROW).fill(EMPTY)),
    vanishPanel:   Array.from({ length: COL }, () => Array(ROW).fill(EMPTY)),
    floatingPanel: Array.from({ length: COL }, () => Array(ROW).fill(EMPTY)),
    panelFlag:     Array.from({ length: COL }, () => Array(ROW).fill(0)),
    score:         0,
    scoreTemp:     0,
    isPlaying:     false,
    curX:          2,
    curY:          4,
    swapProgress:  0,
    failFlags:     Array(COL).fill(false),
    missedCount:   0,
  };
}
