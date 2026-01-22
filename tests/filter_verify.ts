
import rawData from '../num-data.json';

// Mock helpers from the component
const getFilterCategory = (filter: string): string => {
  if (['单', '双'].includes(filter)) return 'oddEven';
  if (['大', '小'].includes(filter)) return 'bigSmall';
  if (['红波', '绿波', '蓝波'].includes(filter)) return 'wave';
  if (['家禽', '野兽'].includes(filter)) return 'poultryBeast';
  if (['合单', '合双'].includes(filter)) return 'sumOddEven';
  if (['合大', '合小'].includes(filter)) return 'sumBigSmall';
  if (['大单', '小单', '大双', '小双'].includes(filter)) return 'bigSmallOddEven';
  if (['尾大', '尾小'].includes(filter)) return 'tailBigSmall';
  if (['金', '木', '水', '火', '土'].includes(filter)) return 'fiveElements';
  if (['红单', '红双', '绿单', '绿双', '蓝单', '蓝双'].includes(filter)) return 'colorOddEven';
  if (['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'].includes(filter)) return 'zodiac';
  if (filter.endsWith('尾') && filter !== '大尾' && filter !== '小尾') return 'tailExact';
  if (filter.endsWith('头')) return 'head';
  if (filter.endsWith('门')) return 'men';
  if (filter.endsWith('段')) return 'duan';
  if (filter.endsWith('合')) return 'heShu';
  if (['天肖', '地肖'].includes(filter)) return 'skyEarth';
  if (['阴肖', '阳肖'].includes(filter)) return 'yinYang';
  if (['左肖', '右肖'].includes(filter)) return 'leftRight';
  if (['前肖', '后肖'].includes(filter)) return 'frontBack';
  if (['独字肖', '合字肖'].includes(filter)) return 'singleMulti';
  return 'other';
};

const zodiacMap: Record<string, string> = {
  'rat': '鼠', 'ox': '牛', 'tiger': '虎', 'rabbit': '兔', 'dragon': '龙', 'snake': '蛇',
  'horse': '马', 'goat': '羊', 'monkey': '猴', 'rooster': '鸡', 'dog': '狗', 'pig': '猪'
};

const fiveElementsMap: Record<string, string> = {
  'metal': '金', 'gold': '金', 'wood': '木', 'water': '水', 'fire': '火', 'earth': '土'
};

const matchNumber = (numObj: any, filter: string): boolean => {
  const id = Number(numObj.id);
  switch (filter) {
    case '单': return numObj.oddAndEven === 'odd';
    case '双': return numObj.oddAndEven === 'even';
    case '红波': return numObj.waveColor === 'red';
    case '金': return fiveElementsMap[numObj.fiveElements] === '金';
    case '鼠': return zodiacMap[numObj.chineseZodiac] === '鼠';
    default: return false; // Simplified for test
  }
};

const runTest = () => {
  console.log('Total items:', rawData.length);
  
  // Test 1: Filter "单"
  const odds = rawData.filter(n => matchNumber(n, '单'));
  console.log('Odd count:', odds.length);
  console.log('First odd:', odds[0].id, odds[0].oddAndEven);

  // Test 2: Filter "红波"
  const reds = rawData.filter(n => matchNumber(n, '红波'));
  console.log('Red count:', reds.length);
  console.log('First red:', reds[0].id, reds[0].waveColor);

  // Test 3: Filter "金"
  const golds = rawData.filter(n => matchNumber(n, '金'));
  console.log('Gold count:', golds.length);
  if(golds.length > 0) console.log('First gold:', golds[0].id, golds[0].fiveElements);
};

runTest();
