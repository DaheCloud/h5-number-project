import { ref, computed } from 'vue';
import rawData from '../../../num-data.json';

export function useFilterLogic() {
  // State
  const allNumbers = ref<any[]>(rawData);
  const selectedFilters = ref<string[]>([]);
  const searchText = ref('');
  const searchType = ref<'exact' | 'fuzzy' | 'regex'>('fuzzy');
  const sortType = ref<'asc' | 'desc'>('asc');

  // --- Helpers ---
  const zodiacMap: Record<string, string> = {
    'rat': '鼠', 'ox': '牛', 'tiger': '虎', 'rabbit': '兔', 'dragon': '龙', 'snake': '蛇',
    'horse': '马', 'goat': '羊', 'monkey': '猴', 'rooster': '鸡', 'dog': '狗', 'pig': '猪'
  };

  const fiveElementsMap: Record<string, string> = {
    'metal': '金', 'gold': '金', 'wood': '木', 'water': '水', 'fire': '火', 'earth': '土'
  };

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

  const matchNumber = (numObj: any, filter: string): boolean => {
    const id = Number(numObj.id);
    
    switch (filter) {
      case '单': return numObj.oddAndEven === 'odd';
      case '双': return numObj.oddAndEven === 'even';
      case '大': return id >= 25;
      case '小': return id <= 24;
      
      case '红波': return numObj.waveColor === 'red';
      case '绿波': return numObj.waveColor === 'green';
      case '蓝波': return numObj.waveColor === 'blue';
      
      case '家禽': return numObj.poultryBeast === '家禽';
      case '野兽': return numObj.poultryBeast === '野兽';
      
      case '合单': return numObj.sumOddAndEven === 'oddSum';
      case '合双': return numObj.sumOddAndEven === 'evenSum';
      case '合大': return numObj.sum >= 7;
      case '合小': return numObj.sum <= 6;
      case '尾大': return numObj.tail >= 5;
      case '尾小': return numObj.tail <= 4;
      
      case '大单': return id >= 25 && numObj.oddAndEven === 'odd';
      case '小单': return id <= 24 && numObj.oddAndEven === 'odd';
      case '大双': return id >= 25 && numObj.oddAndEven === 'even';
      case '小双': return id <= 24 && numObj.oddAndEven === 'even';
      
      case '金': return fiveElementsMap[numObj.fiveElements] === '金';
      case '木': return fiveElementsMap[numObj.fiveElements] === '木';
      case '水': return fiveElementsMap[numObj.fiveElements] === '水';
      case '火': return fiveElementsMap[numObj.fiveElements] === '火';
      case '土': return fiveElementsMap[numObj.fiveElements] === '土';
      
      case '红单': return numObj.waveColor === 'red' && numObj.oddAndEven === 'odd';
      case '红双': return numObj.waveColor === 'red' && numObj.oddAndEven === 'even';
      case '绿单': return numObj.waveColor === 'green' && numObj.oddAndEven === 'odd';
      case '绿双': return numObj.waveColor === 'green' && numObj.oddAndEven === 'even';
      case '蓝单': return numObj.waveColor === 'blue' && numObj.oddAndEven === 'odd';
      case '蓝双': return numObj.waveColor === 'blue' && numObj.oddAndEven === 'even';
      
      case '鼠': case '牛': case '虎': case '兔': case '龙': case '蛇':
      case '马': case '羊': case '猴': case '鸡': case '狗': case '猪':
        return zodiacMap[numObj.chineseZodiac] === filter;
        
      case '0尾': return numObj.tail === 0;
      case '1尾': return numObj.tail === 1;
      case '2尾': return numObj.tail === 2;
      case '3尾': return numObj.tail === 3;
      case '4尾': return numObj.tail === 4;
      case '5尾': return numObj.tail === 5;
      case '6尾': return numObj.tail === 6;
      case '7尾': return numObj.tail === 7;
      case '8尾': return numObj.tail === 8;
      case '9尾': return numObj.tail === 9;
      
      case '0头': return numObj.head === 0;
      case '1头': return numObj.head === 1;
      case '2头': return numObj.head === 2;
      case '3头': return numObj.head === 3;
      case '4头': return numObj.head === 4;
      
      case '1门': return numObj.men === '1门';
      case '2门': return numObj.men === '2门';
      case '3门': return numObj.men === '3门';
      case '4门': return numObj.men === '4门';
      case '5门': return numObj.men === '5门';
      
      case '1段': return numObj.duan === '1段';
      case '2段': return numObj.duan === '2段';
      case '3段': return numObj.duan === '3段';
      case '4段': return numObj.duan === '4段';
      case '5段': return numObj.duan === '5段';
      case '6段': return numObj.duan === '6段';
      case '7段': return numObj.duan === '7段';
      
      case '1合': return numObj.heShu === '合01';
      case '2合': return numObj.heShu === '合02';
      case '3合': return numObj.heShu === '合03';
      case '4合': return numObj.heShu === '合04';
      case '5合': return numObj.heShu === '合05';
      case '6合': return numObj.heShu === '合06';
      case '7合': return numObj.heShu === '合07';
      case '8合': return numObj.heShu === '合08';
      case '9合': return numObj.heShu === '合09';
      case '10合': return numObj.heShu === '合10';
      case '11合': return numObj.heShu === '合11';
      case '12合': return numObj.heShu === '合12';
      case '13合': return numObj.heShu === '合13';
      
      case '天肖': return numObj.skyEarth === '天肖';
      case '地肖': return numObj.skyEarth === '地肖';
      case '阴肖': return numObj.yinYang === '阴性' || numObj.yinYang === '阴肖';
      case '阳肖': return numObj.yinYang === '阳性' || numObj.yinYang === '阳肖';
      
      case '前肖': return ['鼠','牛','虎','兔','龙','蛇'].includes(zodiacMap[numObj.chineseZodiac] || '');
      case '后肖': return ['马','羊','猴','鸡','狗','猪'].includes(zodiacMap[numObj.chineseZodiac] || '');
      case '左肖': return ['鼠','牛','龙','蛇','猴','鸡'].includes(zodiacMap[numObj.chineseZodiac] || '');
      case '右肖': return ['虎','兔','马','羊','狗','猪'].includes(zodiacMap[numObj.chineseZodiac] || '');
      case '独字肖': return ['鼠','牛','虎','兔','马','羊','狗','猪'].includes(zodiacMap[numObj.chineseZodiac] || '');
      case '合字肖': return ['龙','蛇','猴','鸡'].includes(zodiacMap[numObj.chineseZodiac] || '');

      default: return false;
    }
  };

  const getWaveColorById = (id: number): string => {
    const number = allNumbers.value.find((num: any) => Number(num.id) === id);
    return number?.waveColor || '';
  };

  // --- Computed Properties ---
  const filteredNumbers = computed(() => {
    if (selectedFilters.value.length === 0 && !searchText.value) {
      return [];
    }

    let result = allNumbers.value;

    // Filter
    if (selectedFilters.value.length > 0) {
      const filtersByCategory: Record<string, string[]> = {};
      selectedFilters.value.forEach(f => {
        const cat = getFilterCategory(f);
        if (!filtersByCategory[cat]) filtersByCategory[cat] = [];
        filtersByCategory[cat].push(f);
      });

      result = result.filter(numObj => {
        return Object.keys(filtersByCategory).every(category => {
          const filtersInCat = filtersByCategory[category];
          if (!filtersInCat) return true; // Should not happen given Object.keys
          return filtersInCat.some(filter => matchNumber(numObj, filter));
        });
      });
    }

    // Search
    if (searchText.value) {
      const query = searchText.value.trim();
      if (searchType.value === 'exact') {
        result = result.filter(n => n.id.toString() === query || n.id.toString().padStart(3, '0') === query);
      } else if (searchType.value === 'fuzzy') {
        result = result.filter(n => n.id.toString().includes(query));
      } else if (searchType.value === 'regex') {
        try {
          const regex = new RegExp(query);
          result = result.filter(n => regex.test(n.id.toString()));
        } catch (e) {
          return [];
        }
      }
    }

    // Sort
    result = [...result].sort((a, b) => {
      const valA = a.id.toString().padStart(3, '0');
      const valB = b.id.toString().padStart(3, '0');
      return sortType.value === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    });

    return result.map(n => n.id.toString().padStart(2, '0'));
  });

  const totalItems = computed(() => filteredNumbers.value.length);

  // --- Actions ---
  const toggleFilter = (item: string) => {
    const index = selectedFilters.value.indexOf(item);
    if (index === -1) {
      selectedFilters.value.push(item);
    } else {
      selectedFilters.value.splice(index, 1);
    }
  };

  const clearFilters = () => {
    selectedFilters.value = [];
    import('vant').then(({ showToast }) => {
      showToast('已清空条件');
    });
  };

  const onSave = () => {
    try {
      const settings = { filters: selectedFilters.value };
      localStorage.setItem('filterSettings', JSON.stringify(settings));
      import('vant').then(({ showToast }) => {
        showToast('筛选条件已保存');
      });
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  const onLoad = () => {
    const saved = localStorage.getItem('filterSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        selectedFilters.value = settings.filters || [];
        import('vant').then(({ showToast }) => {
          showToast('筛选条件已加载');
        });
      } catch (e) {
        console.error('Failed to parse saved settings');
      }
    } else {
      import('vant').then(({ showToast }) => {
        showToast('暂无保存的条件');
      });
    }
  };

  return {
    selectedFilters,
    filteredNumbers,
    totalItems,
    searchText,
    searchType,
    sortType,
    toggleFilter,
    clearFilters,
    onSave,
    onLoad,
    getWaveColorById
  };
}
