import React from 'react';

interface HUDProps {
  score:     number;
  highScore: number;
  timeLeft:  number;
}

export default function HUD({ score, highScore, timeLeft }: HUDProps) {
  const sec  = Math.floor(timeLeft / 1000);
  const cs   = Math.floor((timeLeft % 1000) / 10);
  const timeStr = `${String(sec).padStart(2,'0')}:${String(cs).padStart(2,'0')}`;

  const timeColor =
    sec >= 30 ? '#ff8888' :
    sec >= 10 ? '#ffaa00' : '#ff2222';

  return (
    <div style={styles.hud}>
      {/* タイマーカード */}
      <Card label="TIME">
        <span style={{ ...styles.value, color: timeColor, fontSize: 28 }}>{timeStr}</span>
      </Card>

      {/* 操作説明 */}
      <Card label="HOW TO PLAY" style={{ flex: 1 }}>
        <div style={styles.instructions}>
          <Row k="←→↑↓"  v="移動" />
          <Row k="SPACE"  v="入替" />
          <Row k="B"      v="新行" />
          <div style={styles.divider} />
          <span style={styles.subtext}>タップで操作可</span>
        </div>
      </Card>

      {/* スコアカード */}
      <Card label="SCORE">
        <span style={{ ...styles.value, fontSize: 26 }}>{score.toLocaleString()}</span>
      </Card>

      {/* ハイスコアカード */}
      <Card label="BEST">
        <span style={{ ...styles.value, color: '#ff4444', fontSize: 24 }}>
          {highScore.toLocaleString()}
        </span>
      </Card>
    </div>
  );
}

function Card({ label, children, style }: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ ...styles.card, ...style }}>
      <span style={styles.label}>{label}</span>
      <div style={styles.accentLine} />
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={styles.row}>
      <span style={styles.key}>{k}</span>
      <span style={styles.val}>{v}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hud: {
    display:       'flex',
    flexDirection: 'column',
    gap:           8,
    padding:       '6px 4px',
    width:         '100%',
    boxSizing:     'border-box',
  },
  card: {
    background:   '#0e0404',
    border:       '1px solid #501010',
    borderRadius: 6,
    padding:      '6px 10px 8px',
    display:      'flex',
    flexDirection:'column',
    gap:          4,
  },
  label: {
    fontSize:     10,
    color:        '#a04040',
    letterSpacing: 1,
    fontFamily:   'monospace',
  },
  accentLine: {
    height:     1,
    background: '#c81c1c',
    marginBottom: 2,
  },
  value: {
    fontFamily:  'monospace',
    fontWeight:  'bold',
    color:       '#ffaaaa',
    textAlign:   'right',
    lineHeight:  1,
  },
  instructions: {
    display:       'flex',
    flexDirection: 'column',
    gap:           3,
  },
  row: {
    display:        'flex',
    justifyContent: 'space-between',
  },
  key: {
    color:      '#ff4444',
    fontFamily: 'monospace',
    fontSize:   12,
  },
  val: {
    color:      '#a04040',
    fontFamily: 'monospace',
    fontSize:   12,
  },
  divider: {
    height:     1,
    background: '#3c0a0a',
    margin:     '3px 0',
  },
  subtext: {
    fontSize:   11,
    color:      '#804040',
    fontFamily: 'monospace',
  },
};
