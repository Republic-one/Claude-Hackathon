import { describe, it, expect } from 'vitest';
import {
  calculateDistanceKm,
  resolveLocationFromCoordinates,
  resolveLocationFromText,
} from '../services/location/resolver';

describe('Bhopal Location & Municipal Office Resolver', () => {
  it('calculates geographic distance accurately', () => {
    // Distance between Mata Mandir HQ (23.2345, 77.4048) and 10 No. Market Arera (23.2120, 77.4290) is ~3.5 km
    const dist = calculateDistanceKm(23.2345, 77.4048, 23.2120, 77.4290);
    expect(dist).toBeGreaterThan(2.5);
    expect(dist).toBeLessThan(5.0);
  });

  it('reverse geocodes coordinates to Arera Colony and identifies recommended office', () => {
    const lat = 23.2105;
    const lng = 77.4312;
    const resolved = resolveLocationFromCoordinates(lat, lng, 'Street Lighting / Electrical');

    expect(resolved.city).toBe('Bhopal');
    expect(resolved.locality).toContain('Arera Colony');
    expect(resolved.wardNumber).toBe(47);
    expect(resolved.isGpsDetected).toBe(true);
    expect(resolved.nearestOffice).toBeDefined();
    expect(resolved.nearestOffice?.office_name).toBeDefined();
  });

  it('resolves manual text search for Kolar Road and assigns Ward 80', () => {
    const resolved = resolveLocationFromText('Sarvdharm Colony Kolar Road');

    expect(resolved.locality).toContain('Kolar Road');
    expect(resolved.wardNumber).toBe(80);
    expect(resolved.isGpsDetected).toBe(false);
  });
});
