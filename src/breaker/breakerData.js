export function mapChainBreakerBackup(backup = {}) {
  const chains = Array.isArray(backup.habits) ? backup.habits : [];
  const logs = {};
  const src = backup.dailyLogs || {};
  for (const date of Object.keys(src)) {
    const day = src[date] || {};
    const flat = { ...(day.habits || {}) };
    if (day.mood != null) flat.mood = day.mood;
    if (day.note != null) flat.note = day.note;
    logs[date] = flat;
  }
  return { chains, logs };
}

function addDays(dateStr, delta) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function computeStreak(logs = {}, chainId, todayStr) {
  let n = 0;
  let cur = todayStr;
  while (logs[cur] && logs[cur][chainId] === true) {
    n += 1;
    cur = addDays(cur, -1);
  }
  return n;
}
