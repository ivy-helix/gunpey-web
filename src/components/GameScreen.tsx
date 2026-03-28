import { useCallback, useEffect, useRef, useState } from 'react';
import { PuzzleEngine } from '../game/PuzzleEngine';
import { getHighScore } from '../game/RankingData';
import { useGameLoop } from '../hooks/useGameLoop';
import GameCanvas from './GameCanvas';
import HUD from './HUD';
import TouchControls from './TouchControls';

const TIME_LIMIT = 90_000; // 90秒

export default function GameScreen() {
  const engineRef   = useRef(new PuzzleEngine());
  const [, forceUpdate] = useState(0);
  const repaint = useCallback(() => forceUpdate(n => n + 1), []);

  const [isRunning,  setIsRunning]  = useState(false);
  const [timeLeft,   setTimeLeft]   = useState(TIME_LIMIT);
  const [highScore,  setHighScore]  = useState(() => getHighScore());
  const [gameOver,   setGameOver]   = useState(false);
  const timeRef = useRef(TIME_LIMIT);

  // ゲームオーバーコールバック
  useEffect(() => {
    const engine = engineRef.current;
    engine.onGameOver = () => {
      setIsRunning(false);
      setGameOver(true);
      engine.end();
      setHighScore(getHighScore());
    };
  }, []);

  // ゲームループ
  useGameLoop((delta) => {
    const engine = engineRef.current;

    timeRef.current = Math.max(0, timeRef.current - delta);
    setTimeLeft(timeRef.current);

    if (timeRef.current <= 0) {
      setIsRunning(false);
      engine.end();
      setHighScore(getHighScore());
      return;
    }

    engine.tick(delta);
    repaint();
  }, isRunning);

  // キーボード操作
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
        e.preventDefault();
      }
      engineRef.current.keyDown(e.key);
      repaint();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [repaint]);

  const handleStart = () => {
    setGameOver(false);
    timeRef.current = TIME_LIMIT;
    setTimeLeft(TIME_LIMIT);
    engineRef.current.start();
    setIsRunning(true);
    repaint();
  };

  const handleKey = (key: string) => {
    engineRef.current.keyDown(key);
    repaint();
  };

  const state = engineRef.current.state;

  return (
    <div style={styles.root}>
      {/* タイトルバー */}
      <div style={styles.titleBar}>
        <span style={styles.title}>GUNPEY</span>
        <button style={styles.startBtn} onClick={handleStart}>
          {gameOver ? 'RETRY' : isRunning ? 'RESTART' : 'START'}
        </button>
      </div>

      {/* メインコンテンツ */}
      <div style={styles.main}>
        {/* 左HUD */}
        <div style={styles.side}>
          <HUD
            score={state.score + state.scoreTemp}
            highScore={highScore}
            timeLeft={timeLeft}
          />
        </div>

        {/* ゲームボード */}
        <div style={styles.board}>
          <GameCanvas
            state={state}
            swapProgress={state.swapProgress}
          />
          {/* ゲームオーバーオーバーレイ */}
          {gameOver && (
            <div style={styles.overlay}>
              <div style={styles.overlayText}>GAME OVER</div>
              <div style={styles.overlayScore}>Score: {state.score.toLocaleString()}</div>
              <button style={styles.retryBtn} onClick={handleStart}>RETRY</button>
            </div>
          )}
        </div>

        {/* 右余白（対称用） */}
        <div style={styles.side} />
      </div>

      {/* タッチ操作 */}
      <TouchControls onKey={handleKey} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display:       'flex',
    flexDirection: 'column',
    height:        '100dvh',
    background:    '#060202',
    color:         '#ff5050',
    fontFamily:    'monospace',
    overflow:      'hidden',
  },
  titleBar: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        '6px 12px',
    borderBottom:   '1px solid #3c0a0a',
    background:     '#0a0303',
  },
  title: {
    fontSize:    20,
    fontWeight:  'bold',
    letterSpacing: 4,
    color:       '#cc1c1c',
  },
  startBtn: {
    background:   '#3a0808',
    border:       '1px solid #cc2222',
    borderRadius: 4,
    color:        '#ff8888',
    fontFamily:   'monospace',
    fontSize:     13,
    padding:      '4px 14px',
    cursor:       'pointer',
  },
  main: {
    flex:           1,
    display:        'flex',
    justifyContent: 'center',
    alignItems:     'center',
    gap:            8,
    padding:        '8px 4px',
    overflow:       'hidden',
    minHeight:      0,
  },
  side: {
    width:   130,
    flexShrink: 0,
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
  },
  board: {
    position:  'relative',
    lineHeight: 0,
    border:    '1px solid #501010',
    boxShadow: '0 0 16px rgba(200,20,20,0.3)',
  },
  overlay: {
    position:       'absolute',
    inset:          0,
    background:     'rgba(6,2,2,0.82)',
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            12,
  },
  overlayText: {
    fontSize:    28,
    fontWeight:  'bold',
    color:       '#ff2222',
    letterSpacing: 4,
  },
  overlayScore: {
    fontSize:  16,
    color:     '#ff8888',
  },
  retryBtn: {
    background:   '#3a0808',
    border:       '1px solid #cc2222',
    borderRadius: 4,
    color:        '#ff8888',
    fontFamily:   'monospace',
    fontSize:     14,
    padding:      '8px 24px',
    cursor:       'pointer',
    marginTop:    8,
  },
};
