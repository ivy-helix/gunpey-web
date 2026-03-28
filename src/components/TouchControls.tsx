import React from 'react';

interface Props {
  onKey: (key: string) => void;
}

export default function TouchControls({ onKey }: Props) {
  const btn = (label: string, key: string, style?: React.CSSProperties) => (
    <button
      style={{ ...styles.btn, ...style }}
      onPointerDown={(e) => { e.preventDefault(); onKey(key); }}
    >
      {label}
    </button>
  );

  return (
    <div style={styles.root}>
      {/* 方向キー */}
      <div style={styles.dpad}>
        <div style={styles.dpadRow}>
          <div style={styles.dpadEmpty} />
          {btn('▲', 'ArrowUp')}
          <div style={styles.dpadEmpty} />
        </div>
        <div style={styles.dpadRow}>
          {btn('◀', 'ArrowLeft')}
          {btn('▼', 'ArrowDown')}
          {btn('▶', 'ArrowRight')}
        </div>
      </div>

      {/* アクションボタン */}
      <div style={styles.actions}>
        {btn('SWAP', ' ', styles.swapBtn)}
        {btn('NEW ROW', 'b', styles.newRowBtn)}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'flex-end',
    padding:        '8px 12px',
    background:     '#060202',
    borderTop:      '1px solid #3c0a0a',
    userSelect:     'none',
    WebkitUserSelect: 'none',
  },
  btn: {
    background:   '#1a0606',
    border:       '1px solid #6b1a1a',
    borderRadius: 6,
    color:        '#ff5050',
    fontFamily:   'monospace',
    fontSize:     16,
    width:        50,
    height:       50,
    cursor:       'pointer',
    touchAction:  'none',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    WebkitTapHighlightColor: 'transparent',
  },
  dpad: {
    display:       'flex',
    flexDirection: 'column',
    gap:           4,
  },
  dpadRow: {
    display: 'flex',
    gap:     4,
  },
  dpadEmpty: {
    width:  50,
    height: 50,
  },
  actions: {
    display:       'flex',
    flexDirection: 'column',
    gap:           8,
    alignItems:    'flex-end',
  },
  swapBtn: {
    width:    90,
    height:   56,
    fontSize: 14,
    fontWeight: 'bold',
    background: '#3a0808',
    borderColor: '#cc2222',
    color: '#ff8888',
  },
  newRowBtn: {
    width:    90,
    height:   40,
    fontSize: 12,
  },
};
