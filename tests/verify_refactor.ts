
import { useFilterLogic } from '../src/views/filter-numbers/useFilterLogic';

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) { return this.store[key] || null; },
  setItem(key: string, value: string) { this.store[key] = value; },
  clear() { this.store = {}; }
};
global.localStorage = localStorageMock as any;

// Run test
async function runTest() {
  console.log('Starting Refactor Verification...');
  
  const { 
    selectedFilters, 
    filteredNumbers, 
    toggleFilter, 
    clearFilters 
  } = useFilterLogic();

  // 1. Initial State
  if (selectedFilters.value.length !== 0) throw new Error('Initial filters should be empty');
  if (filteredNumbers.value.length !== 0) throw new Error('Initial results should be empty (hidden by default)');
  console.log('✓ Initial state correct');

  // 2. Add Filter '单' (Odd)
  toggleFilter('单');
  if (!selectedFilters.value.includes('单')) throw new Error('Filter "单" not added');
  // Check if we have results. Odd numbers should be roughly half of 49.
  const countOdd = filteredNumbers.value.length;
  console.log(`Filter '单' matches ${countOdd} numbers`);
  if (countOdd === 0) throw new Error('Filter "单" should return results');
  
  // 3. Add Filter '大' (Big) -> Logic is AND between categories?
  // '单' is oddEven, '大' is bigSmall. Different categories -> AND.
  // Odd AND Big.
  toggleFilter('大');
  const countOddBig = filteredNumbers.value.length;
  console.log(`Filter '单' + '大' matches ${countOddBig} numbers`);
  
  if (countOddBig >= countOdd) throw new Error('Adding second category should reduce (or equal) results');

  // 4. Remove Filter '大'
  toggleFilter('大');
  if (filteredNumbers.value.length !== countOdd) throw new Error('Removing filter should restore count');

  // 5. Clear
  clearFilters();
  if (selectedFilters.value.length !== 0) throw new Error('Clear should remove all filters');
  if (filteredNumbers.value.length !== 0) throw new Error('Clear should hide results');

  console.log('✓ All checks passed');
}

runTest().catch(e => {
  console.error('Test Failed:', e);
  process.exit(1);
});
