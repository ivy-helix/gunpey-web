const KEY = 'gunpey.scores';

function loadScores(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw).filter((n: unknown) => typeof n === 'number');
  } catch {
    return [];
  }
}

function saveScores(scores: number[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(scores));
  } catch {
    // storage full etc. — ignore
  }
}

export function getHighScore(): number {
  const scores = loadScores();
  return scores.length > 0 ? Math.max(...scores) : 0;
}

export function setScore(score: number): number {
  const scores = loadScores();
  if (score > 0) scores.push(score);
  scores.sort((a, b) => b - a);
  saveScores(scores.slice(0, 10)); // 上位10件のみ保持
  return scores.length > 0 ? scores[0] : 0;
}
