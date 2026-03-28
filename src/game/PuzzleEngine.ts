import { TimeFlag } from './TimeFlag';
import { setScore } from './RankingData';
import type { PanelType, GameState } from './types';
import {
  COL, ROW, EMPTY, BS, SL, VI, HA,
  createGameState,
} from './types';

export class PuzzleEngine {
  state: GameState;

  private gridFlag:      number[][];
  private connectFlag:   number = 0;
  private scoreTempPre:  number = 0;

  private swapTimer:    TimeFlag;
  private vanishTimer:  TimeFlag;
  private panelupTimer: TimeFlag;

  // コールバック
  onGameOver?: () => void;
  onConnect?:  () => void;
  onVanish?:   () => void;
  onSwap?:     () => void;
  onPanelUp?:  () => void;

  constructor() {
    this.state    = createGameState();
    this.gridFlag = Array.from({ length: COL + 1 }, () => Array(ROW + 1).fill(0));

    this.swapTimer    = new TimeFlag(false, 0, 80);
    this.vanishTimer  = new TimeFlag(false, 0, 6000);
    this.panelupTimer = new TimeFlag(false, 0, 5000);
  }

  // ─── ゲーム制御 ──────────────────────────────────
  start(): void {
    const s = this.state;
    for (let x = 0; x < COL; x++)
      for (let y = 0; y < ROW; y++)
        s.normalPanel[x][y] = EMPTY;

    s.curX        = 2;
    s.curY        = 4;
    s.score       = 0;
    s.scoreTemp   = 0;
    s.failFlags   = Array(COL).fill(false);
    s.missedCount = 0;
    this.scoreTempPre = 0;

    this.swapTimer.setFlag(false);
    this.vanishTimer.setFlag(false);
    this.panelupTimer.setFlag(true);
    s.isPlaying = true;
  }

  end(): void {
    const s = this.state;
    s.score += s.scoreTemp;
    s.scoreTemp = 0;
    setScore(s.score);
    this.swapTimer.setFlag(false);
    this.vanishTimer.setFlag(false);
    s.isPlaying = false;
  }

  // ─── キー入力 ─────────────────────────────────────
  keyDown(key: string): void {
    const s = this.state;
    if (this.swapTimer.getFlag() || !s.isPlaying) return;

    switch (key) {
      case 'ArrowLeft':  if (s.curX > 0)       s.curX--; break;
      case 'ArrowRight': if (s.curX < COL - 1) s.curX++; break;
      case 'ArrowUp':    if (s.curY > 0)       s.curY--; break;
      case 'ArrowDown':  if (s.curY < ROW - 2) s.curY++; break;
      case ' ':
        this.doSwap();
        break;
      case 'b':
      case 'B':
        this.panelUp();
        break;
    }
  }

  // ─── スワップ ─────────────────────────────────────
  private doSwap(): void {
    const s = this.state;
    this.swapTimer.setFlag(true);
    this.onSwap?.();

    const { curX: cx, curY: cy } = s;
    const get = (x: number, y: number): PanelType =>
      s.vanishPanel[x][y] === EMPTY ? s.normalPanel[x][y] : s.floatingPanel[x][y];
    const set = (x: number, y: number, v: PanelType) => {
      if (s.vanishPanel[x][y] === EMPTY) s.normalPanel[x][y] = v;
      else s.floatingPanel[x][y] = v;
    };

    const buf1 = get(cx, cy);
    const buf2 = get(cx, cy + 1);
    set(cx, cy,     buf2);
    set(cx, cy + 1, buf1);
    this.checkFlags();
  }

  // ─── パネルアップ ─────────────────────────────────
  panelUp(): void {
    const s = this.state;
    if (this.vanishTimer.getFlag()) {
      this.panelupTimer.setFlag(true);
      return;
    }

    this.onPanelUp?.();

    // ── ゲームオーバー判定（JS版方式：同じ列2回はみ出し） ──
    for (let x = 0; x < COL; x++) {
      if (s.normalPanel[x][0] !== EMPTY) {
        if (s.failFlags[x]) {
          // 2回目 → ゲームオーバー
          s.isPlaying = false;
          this.onGameOver?.();
          return;
        } else {
          // 1回目 → フラグだけ立てる
          s.failFlags[x] = true;
        }
      }
    }

    // 行を1つ上にずらす
    for (let y = 0; y < ROW - 1; y++)
      for (let x = 0; x < COL; x++)
        s.normalPanel[x][y] = s.normalPanel[x][y + 1];

    // 新しい行を最下行に追加
    this.generateNewRow();

    if (s.curY > 0) s.curY--;
    this.checkFlags();
    this.panelupTimer.setFlag(true);
  }

  // ─── 行生成（詰み防止付き） ────────────────────────
  private generateNewRow(): void {
    const s = this.state;

    // パネル数を決定（45%:2個, 45%:3個, 10%:4個）
    const r = Math.random() * 100;
    let num = r < 45 ? 2 : r < 90 ? 3 : 4;

    const placed = Array(COL).fill(false);

    // 詰み防止：上からy=5行目あたりで空き列があれば強制配置
    // 端列（左端・右端）が特に重要
    const criticalCols: number[] = [];
    for (let x = 0; x < COL; x++) {
      let empty = true;
      for (let y = 0; y < ROW - 1; y++) {
        if (s.normalPanel[x][y] !== EMPTY) { empty = false; break; }
      }
      if (empty) criticalCols.push(x);
    }

    // 端列が空の場合は優先的に埋める
    const priorityCols = criticalCols.filter(x => x === 0 || x === COL - 1);
    for (const x of priorityCols) {
      if (num > 0) { placed[x] = true; num--; }
    }
    // それ以外の空列も必要なら埋める
    for (const x of criticalCols) {
      if (!placed[x] && num > 0) { placed[x] = true; num--; }
    }

    // 残りはランダム配置
    while (num > 0) {
      const x = Math.floor(Math.random() * COL);
      if (!placed[x]) { placed[x] = true; num--; }
    }

    for (let x = 0; x < COL; x++) {
      s.normalPanel[x][ROW - 1] = placed[x]
        ? ((Math.floor(Math.random() * 4) + 1) as PanelType)
        : EMPTY;
    }
  }

  // ─── 接続チェック（Javaから移植） ─────────────────
  checkFlags(): void {
    const s = this.state;
    const np = s.normalPanel;
    const vp = s.vanishPanel;

    // vanishPanelもnormalPanelに合成して判定
    for (let x = 0; x < COL; x++)
      for (let y = 0; y < ROW; y++)
        if (vp[x][y] !== EMPTY) np[x][y] = vp[x][y];

    // フラグ初期化
    for (let x = 0; x < COL + 1; x++)
      for (let y = 0; y < ROW + 1; y++) {
        if (x < COL && y < ROW) s.panelFlag[x][y] = 0;
        this.gridFlag[x][y] = x < COL ? 0 : 1;
      }

    // 左から探索
    for (let y = 0; y <= ROW; y++) {
      this.connectFlag = 0;
      this.connectionCheck(0, y, 0, y);
    }
    // 右から探索
    for (let y = 0; y <= ROW; y++) this.gridFlag[COL][y] = 0;
    for (let y = 0; y <= ROW; y++) {
      this.connectFlag = 0;
      this.connectionCheck(COL, y, COL, y);
    }

    // 消えるパネルをvanishPanelへ
    s.scoreTemp = 0;
    for (let x = 0; x < COL; x++) {
      for (let y = 0; y < ROW; y++) {
        if (s.panelFlag[x][y] === 1) {
          vp[x][y] = np[x][y];
          np[x][y] = EMPTY;
          if (!this.vanishTimer.getFlag()) this.vanishTimer.setFlag(true);
          s.scoreTemp++;
        }
      }
    }
    s.scoreTemp = 100 * s.scoreTemp * (s.scoreTemp - 4);

    if (s.scoreTemp > this.scoreTempPre) this.onConnect?.();
    this.scoreTempPre = s.scoreTemp;
  }

  private connectionCheck(x: number, y: number, px: number, py: number): number {
    const s    = this.state;
    const np   = s.normalPanel;
    const gf   = this.gridFlag;
    const pf   = s.panelFlag;
    let finalGF = 0;

    switch (gf[x][y]) {
      case 0: gf[x][y] = 2; break;
      case 1: return 1;
      case 2: return this.connectFlag;
    }

    if (x !== COL) {
      if (y !== 0) {
        if (np[x][y-1] === SL && !(px === x+1 && py === y-1))
          finalGF += pf[x][y-1] = this.connectionCheck(x+1, y-1, x, y);
        if (np[x][y-1] === HA && !(px === x+1 && py === y))
          finalGF += pf[x][y-1] = this.connectionCheck(x+1, y,   x, y);
      }
      if (y !== ROW) {
        if (np[x][y] === VI && !(px === x+1 && py === y))
          finalGF += pf[x][y] = this.connectionCheck(x+1, y,   x, y);
        if (np[x][y] === BS && !(px === x+1 && py === y+1))
          finalGF += pf[x][y] = this.connectionCheck(x+1, y+1, x, y);
      }
    }
    if (x !== 0) {
      if (y !== 0) {
        if (np[x-1][y-1] === BS && !(px === x-1 && py === y-1))
          finalGF += pf[x-1][y-1] = this.connectionCheck(x-1, y-1, x, y);
        if (np[x-1][y-1] === HA && !(px === x-1 && py === y))
          finalGF += pf[x-1][y-1] = this.connectionCheck(x-1, y,   x, y);
      }
      if (y !== ROW) {
        if (np[x-1][y] === VI && !(px === x-1 && py === y))
          finalGF += pf[x-1][y] = this.connectionCheck(x-1, y,   x, y);
        if (np[x-1][y] === SL && !(px === x-1 && py === y+1))
          finalGF += pf[x-1][y] = this.connectionCheck(x-1, y+1, x, y);
      }
    }

    if (finalGF === 0) {
      gf[x][y] = 0;
    } else {
      gf[x][y] = 1;
      this.connectFlag = 1;
    }
    return gf[x][y];
  }

  // ─── ゲームループ tick ─────────────────────────────
  tick(delta: number = 5): void {
    const s = this.state;

    this.swapTimer.tickTime(delta);
    this.vanishTimer.tickTime(delta);
    this.panelupTimer.tickTime(delta);

    // スワップ進行率をstateに反映
    s.swapProgress = this.swapTimer.getFlag() ? this.swapTimer.getRate() : 0;

    // 消去タイマー完了
    if (!this.vanishTimer.getFlag()) {
      for (let x = 0; x < COL; x++) {
        for (let y = 0; y < ROW; y++) {
          s.vanishPanel[x][y] = EMPTY;
          if (s.floatingPanel[x][y] !== EMPTY) {
            s.normalPanel[x][y]   = s.floatingPanel[x][y];
            s.floatingPanel[x][y] = EMPTY;
          }
        }
      }
      if (s.scoreTemp !== 0) {
        if (this.vanishTimer.getTime() > 5) this.onVanish?.();
        s.score += s.scoreTemp;
        s.scoreTemp = 0;
      }
    }

    if (!this.panelupTimer.getFlag()) this.panelUp();
  }

  // スワップアニメーション中かどうか
  isSwapping(): boolean { return this.swapTimer.getFlag(); }
  isVanishing(): boolean { return this.vanishTimer.getFlag(); }
}
