import { describe, it, expect, vi } from 'vitest';
import { useFilterLogic } from '../src/views/filter-numbers/useFilterLogic';
import { lotteryDataService } from '../src/services/lotteryData';

// Mock lotteryDataService
vi.mock('../src/services/lotteryData', () => ({
  lotteryDataService: {
    getAllNumbers: () => [
      { id: 1, oddAndEven: 'odd', wave: { key: 'red', label: '红' }, wuxing: { key: 'metal', label: '金' }, zodiac: { key: 'rat', label: '鼠' }, tail: 1, head: 0, sumOddAndEven: 'even', heShu: '合02', men: '1门', duan: '1段' },
      { id: 2, oddAndEven: 'even', wave: { key: 'red', label: '红' }, wuxing: { key: 'metal', label: '金' }, zodiac: { key: 'ox', label: '牛' }, tail: 2, head: 0, sumOddAndEven: 'odd', heShu: '合02', men: '1门', duan: '1段' },
      { id: 25, oddAndEven: 'odd', wave: { key: 'blue', label: '蓝' }, wuxing: { key: 'earth', label: '土' }, zodiac: { key: 'horse', label: '马' }, tail: 5, head: 2, sumOddAndEven: 'odd', heShu: '合07', men: '3门', duan: '4段' }
    ],
    getRawData: () => ({
      '其它属性': {
        '家禽': ['牛', '马', '羊', '鸡', '狗', '猪'],
        '野兽': ['鼠', '虎', '兔', '龙', '蛇', '猴']
      }
    })
  }
}));

describe('useFilterLogic', () => {
  it('should initialize with empty filters', () => {
    const { selectedFilters } = useFilterLogic();
    expect(selectedFilters.value).toEqual([]);
  });

  it('should toggle filters correctly', () => {
    const { selectedFilters, toggleFilter } = useFilterLogic();
    toggleFilter('单');
    expect(selectedFilters.value).toContain('单');
    toggleFilter('单');
    expect(selectedFilters.value).not.toContain('单');
  });

  it('should filter numbers by odd/even', () => {
    const { selectedFilters, filteredNumbers, toggleFilter } = useFilterLogic();
    toggleFilter('单');
    // Mock data: 1 is odd, 2 is even, 25 is odd
    // Should return 1, 25
    expect(filteredNumbers.value).toContain('01');
    expect(filteredNumbers.value).toContain('25');
    expect(filteredNumbers.value).not.toContain('02');
  });
});
