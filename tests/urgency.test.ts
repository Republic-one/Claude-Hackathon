import { describe, it, expect } from 'vitest';
import { calculateUrgency } from '../services/urgency/scorer';

describe('Urgency Scoring Engine', () => {
  it('assigns Critical priority to live exposed electric wires', () => {
    const text = 'Open electric wire hanging near children park, huge sparking seen yesterday.';
    const result = calculateUrgency(text, 'STREET_LIGHTING', 'Exposed / Dangling Electric Wire');

    expect(result.level).toBe('Critical');
    expect(result.score).toBeGreaterThanOrEqual(81);
    expect(result.severity).toBe(5);
    expect(result.reasons.some((r) => r.toLowerCase().includes('wire') || r.toLowerCase().includes('electrocution'))).toBe(true);
  });

  it('assigns High urgency to 5-day street light outage with transparent duration reasoning', () => {
    const text = 'Hamare area me 5 din se street light band hai aur raat ko road bilkul dark rehta hai.';
    const result = calculateUrgency(text, 'STREET_LIGHTING', 'Street Light Failure');

    expect(result.level).toBe('High');
    expect(result.score).toBeGreaterThanOrEqual(61);
    expect(result.score).toBeLessThanOrEqual(80);
    expect(result.reasons.some((r) => r.includes('5 days'))).toBe(true);
    expect(result.reasons.some((r) => r.toLowerCase().includes('illumination') || r.toLowerCase().includes('visibility'))).toBe(true);
  });

  it('assigns Low priority for routine sweeping issues', () => {
    const text = 'Road needs normal sweeping, some dry leaves on footpath.';
    const result = calculateUrgency(text, 'SANITATION', 'Street Sweeping / Cleaning Not Done');

    expect(result.level).toBe('Low');
    expect(result.score).toBeLessThanOrEqual(30);
  });
});
