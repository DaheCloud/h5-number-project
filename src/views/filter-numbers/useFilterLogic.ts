import { ref, computed } from 'vue';
import { lotteryDataService, type LotteryNumber } from '../../services/lotteryData';

export function useFilterLogic() {
  // State
  // Use data service instead of raw JSON
  const allNumbers = ref<LotteryNumber[]>([]);
  
  try {
    allNumbers.value = lotteryDataService.getAllNumbers();
  } catch (error) {
    console.error('Failed to load lottery data:', error);
    import('vant').then(({ showToast }) => {
      showToast('数据加载失败，请刷新重试');
    });
  }

  const selectedFilters = ref<string[]>([]);
  const excludedNumbers = ref<string[]>([]);
  const searchText = ref('');
  const searchType = ref<'exact' | 'fuzzy' | 'regex'>('fuzzy');
  const sortType = ref<'asc' | 'desc'>('asc');


  // --- Helpers ---
  // Using Service data, we don't need hardcoded maps for basic attributes.
  // But filter logic relies on UI labels matching data attributes.

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
    // Zodiacs
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

  const matchNumber = (numObj: LotteryNumber, filter: string): boolean => {
    const id = numObj.id;
    
    switch (filter) {
      case '单': return numObj.oddAndEven === 'odd';
      case '双': return numObj.oddAndEven === 'even';
      case '大': return id >= 25;
      case '小': return id <= 24;
      
      case '红波': return numObj.wave.label === '红'; // Or check key 'red'
      case '绿波': return numObj.wave.label === '绿';
      case '蓝波': return numObj.wave.label === '蓝';
      
      // Need to check if 'poultryBeast' is in LotteryNumber or need auxiliary check
      // Current LotteryNumber doesn't have poultryBeast.
      // We need to fetch it from 'other attributes' in data.json via service or extending LotteryNumber
      // For now, let's assume we can check against raw data or if service provides a helper.
      // Since we want to rely on service, let's see if we can get it.
      // The current service puts everything in 'numbers'. 
      // But '家禽', '野兽' are in '其它属性' in data.json.
      // We should use a helper to check these attributes.
      case '家禽': case '野兽': 
      case '天肖': case '地肖':
      case '阴肖': case '阳肖':
      case '前肖': case '后肖':
      case '左肖': case '右肖':
      case '独字肖': case '合字肖':
         return checkOtherAttribute(numObj, filter);
      
      case '合单': return numObj.sumOddAndEven === 'odd'; // Service normalized to 'odd'/'even'
      case '合双': return numObj.sumOddAndEven === 'even';
      case '合大': return (Math.floor(id/10) + id%10) >= 7;
      case '合小': return (Math.floor(id/10) + id%10) <= 6;
      case '尾大': return numObj.tail >= 5;
      case '尾小': return numObj.tail <= 4;
      
      case '大单': return id >= 25 && numObj.oddAndEven === 'odd';
      case '小单': return id <= 24 && numObj.oddAndEven === 'odd';
      case '大双': return id >= 25 && numObj.oddAndEven === 'even';
      case '小双': return id <= 24 && numObj.oddAndEven === 'even';
      
      case '金': case '木': case '水': case '火': case '土':
        return numObj.wuxing.label === filter;
      
      case '红单': return numObj.wave.label === '红' && numObj.oddAndEven === 'odd';
      case '红双': return numObj.wave.label === '红' && numObj.oddAndEven === 'even';
      case '绿单': return numObj.wave.label === '绿' && numObj.oddAndEven === 'odd';
      case '绿双': return numObj.wave.label === '绿' && numObj.oddAndEven === 'even';
      case '蓝单': return numObj.wave.label === '蓝' && numObj.oddAndEven === 'odd';
      case '蓝双': return numObj.wave.label === '蓝' && numObj.oddAndEven === 'even';
      
      case '鼠': case '牛': case '虎': case '兔': case '龙': case '蛇':
      case '马': case '羊': case '猴': case '鸡': case '狗': case '猪':
        return numObj.zodiac.label === filter;
        
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
      
      // heShu in service is '合01', '合02'...
      // filter is '1合', '2合'...
      case '1合': case '2合': case '3合': case '4合': case '5合':
      case '6合': case '7合': case '8合': case '9合': case '10合':
      case '11合': case '12合': case '13合':
        const num = filter.replace('合', '').padStart(2, '0');
        return numObj.heShu === `合${num}`;

      default: return false;
    }
  };

  // Helper to check attributes in "其它属性"
  const rawData = lotteryDataService.getRawData() || {};
  const otherAttrs = (rawData['其它属性'] || {}) as Record<string, string[]>;
  
  const checkOtherAttribute = (numObj: LotteryNumber, attrName: string): boolean => {
      // Map UI filter name to JSON key if needed
      const keyMap: Record<string, string> = {
          '家禽': '家禽', '野兽': '野兽',
          '天肖': '天肖', '地肖': '地肖',
          '阴肖': '阴性', '阳肖': '阳性', // JSON uses 阴性/阳性
          // Others might not exist in JSON, handle gracefully
          '前肖': '前肖', '后肖': '后肖',
          '左肖': '左肖', '右肖': '右肖',
          '独字肖': '独字肖', '合字肖': '合字肖'
      };
      
      const jsonKey = keyMap[attrName] || attrName;
      const values = otherAttrs[jsonKey];
      if (!values) return false;
      
      // values is list of zodiac names like ["鼠", "牛"] or ["鼠龙猴"]
      // Check if numObj.zodiac.label is in this list
      return values.some(v => v.includes(numObj.zodiac.label));
  };

  const getWaveColorById = (id: number): string => {
    const number = allNumbers.value.find((num) => num.id === id);
    return number?.wave.key || '';
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

    // Exclude manually removed numbers
    if (excludedNumbers.value.length > 0) {
      result = result.filter(n => !excludedNumbers.value.includes(n.id.toString().padStart(2, '0')));
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
    excludedNumbers.value = [];
    import('vant').then(({ showToast }) => {
      showToast('已清空条件');
    });
  };

  const toggleExclusion = (num: string) => {
    const idx = excludedNumbers.value.indexOf(num);
    if (idx > -1) {
      excludedNumbers.value.splice(idx, 1);
    } else {
      excludedNumbers.value.push(num);
    }
  };

  const onSave = () => {
    try {
      const settings = { 
        filters: selectedFilters.value,
        excluded: excludedNumbers.value
      };
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
        excludedNumbers.value = settings.excluded || [];
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
    toggleExclusion,
    onSave,
    onLoad,
    getWaveColorById
  };
}
