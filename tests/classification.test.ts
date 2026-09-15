import { describe, it, expect } from 'vitest';
import { detectLanguage, classifyComplaint } from '../services/classification/classifier';

describe('AI Complaint Classification Service', () => {
  it('detects language correctly for English, Hindi, and Hinglish', () => {
    expect(detectLanguage('Street light is not working on the main street')).toBe('English');
    expect(detectLanguage('पिछले तीन दिनों से हमारे नल में पीने का पानी नहीं आ रहा है')).toBe('Hindi');
    expect(detectLanguage('Hamare area me 5 din se street light band hai aur raat ko dark rehta hai')).toBe('Hinglish');
  });

  it('classifies the primary hackathon demo complaint correctly', () => {
    const text = 'Hamare area me 5 din se street light band hai aur raat ko road bilkul dark rehta hai.';
    const result = classifyComplaint(text);

    expect(result.department).toBe('Street Lighting / Electrical');
    expect(result.category).toBe('Street Light Failure');
    expect(result.language).toBe('Hinglish');
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.keywords.length).toBeGreaterThan(0);
    expect(result.reason).toContain('Street Lighting / Electrical');
  });

  it('classifies water supply issues in Hindi correctly', () => {
    const text = 'पिछले तीन दिनों से हमारे नल में पीने का पानी बिल्कुल नहीं आ रहा है';
    const result = classifyComplaint(text);

    expect(result.department).toBe('Water Supply');
    expect(result.category).toBe('No Water Supply / Interruption');
    expect(result.language).toBe('Hindi');
  });

  it('classifies dangerous open manhole correctly', () => {
    const text = 'गटर का ढक्कन खुला पड़ा है सड़क पर कोई भी गिर सकता है';
    const result = classifyComplaint(text);

    expect(result.department).toBe('Sewerage / Drainage');
    expect(result.category).toBe('Open / Broken Manhole');
  });

  it('falls back safely to Other for completely ambiguous inputs', () => {
    const text = 'Lorem ipsum dolor sit amet totally random input';
    const result = classifyComplaint(text);

    expect(result.department).toBe('Other');
    expect(result.category).toBe('General Civic Complaint');
    expect(result.isRuleBasedFallback).toBe(true);
  });
});
