import { describe, it, expect } from 'vitest';
import { lotteryDataService } from '../src/services/lotteryData';

describe('LotteryDataService', () => {
  it('should return 49 numbers', () => {
    const numbers = lotteryDataService.getAllNumbers();
    expect(numbers.length).toBe(49);
  });

  it('should have correct attributes for number 1', () => {
    const num1 = lotteryDataService.getNumber(1);
    expect(num1).toBeDefined();
    expect(num1?.id).toBe(1);
    expect(num1?.wuxing).toBeDefined();
    expect(num1?.zodiac).toBeDefined();
    expect(num1?.wave).toBeDefined();
    // These values depend on the current data.json (2026 horse year?)
    // 1 is Horse in 2026.
    // Let's just check structure, not exact values unless we mock data.
    expect(num1?.wuxing.key).toMatch(/metal|wood|water|fire|earth/);
    expect(num1?.wave.key).toMatch(/red|green|blue/);
  });

  it('should handle odd/even correctly', () => {
    const num1 = lotteryDataService.getNumber(1);
    expect(num1?.oddAndEven).toBe('odd');
    const num2 = lotteryDataService.getNumber(2);
    expect(num2?.oddAndEven).toBe('even');
  });
  
  it('should handle heads/tails correctly', () => {
      const num49 = lotteryDataService.getNumber(49);
      expect(num49?.head).toBe(4);
      expect(num49?.tail).toBe(9);
  });
});
