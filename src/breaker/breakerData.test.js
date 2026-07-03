import { describe, it, expect } from 'vitest';
import { mapChainBreakerBackup, computeStreak } from './breakerData.js';

describe('mapChainBreakerBackup', () => {
  it('habits -> chains, dailyLogs düzleştirilir', () => {
    const backup = {
      habits: [{ id: 'h1', name: 'Sigara', icon: '🚬', color: '#ef4444', createdAt: '2026-01-01' }],
      dailyLogs: { '2026-07-01': { habits: { h1: true }, mood: 4, note: 'iyi' } },
    };
    const { chains, logs } = mapChainBreakerBackup(backup);
    expect(chains).toEqual(backup.habits);
    expect(logs['2026-07-01']).toEqual({ h1: true, mood: 4, note: 'iyi' });
  });

  it('eksik alanlar guvenli defaultlar', () => {
    const { chains, logs } = mapChainBreakerBackup({});
    expect(chains).toEqual([]);
    expect(logs).toEqual({});
  });
});

describe('computeStreak', () => {
  it('bugunden geriye kesintisiz true sayar', () => {
    const logs = {
      '2026-07-03': { h1: true }, '2026-07-02': { h1: true }, '2026-07-01': { h1: false },
    };
    expect(computeStreak(logs, 'h1', '2026-07-03')).toBe(2);
  });
  it('bugun false ise 0', () => {
    expect(computeStreak({ '2026-07-03': { h1: false } }, 'h1', '2026-07-03')).toBe(0);
  });
});
