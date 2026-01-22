<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import rawData from '../../../num-data.json';

const router = useRouter();

// State for filter conditions
const selectedFilters = ref<string[]>([]);

// --- Number Search Feature State ---
// Map raw data to a consistent format if needed, or use directly
const allNumbers = ref<any[]>(rawData);
const searchText = ref('');
const searchType = ref<'exact' | 'fuzzy' | 'regex'>('fuzzy');
const sortType = ref<'asc' | 'desc'>('asc');
const currentPage = ref(1);
const pageSize = ref(20);
const loading = ref(false);

// No need to generate mock data anymore
onMounted(() => {
  // loading.value = true;
  // loading.value = false;
});

// --- Filter Logic Helpers ---

// 1. Define Categories for "OR within category, AND between categories" logic
const getFilterCategory = (filter: string): string => {
  if (['单', '双'].includes(filter)) return 'oddEven';
  if (['大', '小'].includes(filter)) return 'bigSmall';
  if (['红波', '绿波', '蓝波'].includes(filter)) return 'wave';
  if (['家禽', '野兽'].includes(filter)) return 'poultryBeast';
  if (['合单', '合双'].includes(filter)) return 'sumOddEven';
  if (['合大', '合小'].includes(filter)) return 'sumBigSmall';
  if (['大单', '小单', '大双', '小双'].includes(filter)) return 'bigSmallOddEven'; // Composite
  if (['尾大', '尾小'].includes(filter)) return 'tailBigSmall';
  if (['金', '木', '水', '火', '土'].includes(filter)) return 'fiveElements';
  if (['红单', '红双', '绿单', '绿双', '蓝单', '蓝双'].includes(filter)) return 'colorOddEven'; // Composite
  if (['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'].includes(filter)) return 'zodiac';
  if (filter.endsWith('尾') && filter !== '大尾' && filter !== '小尾') return 'tailExact';
  if (filter.endsWith('头')) return 'head';
  if (filter.endsWith('门')) return 'men';
  if (filter.endsWith('段')) return 'duan';
  if (filter.endsWith('合')) return 'heShu';
  if (['天肖', '地肖'].includes(filter)) return 'skyEarth';
  if (['阴肖', '阳肖'].includes(filter)) return 'yinYang';
  // Additional Zodiac Attributes
  if (['左肖', '右肖'].includes(filter)) return 'leftRight';
  if (['前肖', '后肖'].includes(filter)) return 'frontBack';
  if (['独字肖', '合字肖'].includes(filter)) return 'singleMulti';
  
  return 'other';
};

// 2. Mapping Helpers
const zodiacMap: Record<string, string> = {
  'rat': '鼠', 'ox': '牛', 'tiger': '虎', 'rabbit': '兔', 'dragon': '龙', 'snake': '蛇',
  'horse': '马', 'goat': '羊', 'monkey': '猴', 'rooster': '鸡', 'dog': '狗', 'pig': '猪'
};

const fiveElementsMap: Record<string, string> = {
  'metal': '金', 'gold': '金', 
  'wood': '木', 
  'water': '水', 
  'fire': '火', 
  'earth': '土'
};

// 3. Match Function
const matchNumber = (numObj: any, filter: string): boolean => {
  const id = Number(numObj.id);
  
  switch (filter) {
    case '单': return numObj.oddAndEven === 'odd';
    case '双': return numObj.oddAndEven === 'even';
    case '大': return id >= 25; // Assuming 49 balls, 25-49 is Big
    case '小': return id <= 24;
    
    case '红波': return numObj.waveColor === 'red';
    case '绿波': return numObj.waveColor === 'green';
    case '蓝波': return numObj.waveColor === 'blue';
    
    case '家禽': return numObj.poultryBeast === '家禽';
    case '野兽': return numObj.poultryBeast === '野兽';
    
    case '合单': return numObj.sumOddAndEven === 'oddSum';
    case '合双': return numObj.sumOddAndEven === 'evenSum';
    
    case '合大': return numObj.sum >= 7; // Rule: Sum >= 7 is Big? Need verification. Assuming >= 7
    case '合小': return numObj.sum <= 6;
    
    case '尾大': return numObj.tail >= 5;
    case '尾小': return numObj.tail <= 4;
    
    // Composite: Big/Small + Odd/Even
    case '大单': return id >= 25 && numObj.oddAndEven === 'odd';
    case '小单': return id <= 24 && numObj.oddAndEven === 'odd';
    case '大双': return id >= 25 && numObj.oddAndEven === 'even';
    case '小双': return id <= 24 && numObj.oddAndEven === 'even';
    
    // Five Elements
    case '金': return fiveElementsMap[numObj.fiveElements] === '金';
    case '木': return fiveElementsMap[numObj.fiveElements] === '木';
    case '水': return fiveElementsMap[numObj.fiveElements] === '水';
    case '火': return fiveElementsMap[numObj.fiveElements] === '火';
    case '土': return fiveElementsMap[numObj.fiveElements] === '土';
    
    // Color + Odd/Even
    case '红单': return numObj.waveColor === 'red' && numObj.oddAndEven === 'odd';
    case '红双': return numObj.waveColor === 'red' && numObj.oddAndEven === 'even';
    case '绿单': return numObj.waveColor === 'green' && numObj.oddAndEven === 'odd';
    case '绿双': return numObj.waveColor === 'green' && numObj.oddAndEven === 'even';
    case '蓝单': return numObj.waveColor === 'blue' && numObj.oddAndEven === 'odd';
    case '蓝双': return numObj.waveColor === 'blue' && numObj.oddAndEven === 'even';
    
    // Zodiac
    case '鼠': case '牛': case '虎': case '兔': case '龙': case '蛇':
    case '马': case '羊': case '猴': case '鸡': case '狗': case '猪':
      return zodiacMap[numObj.chineseZodiac] === filter;
      
    // Tail Exact
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
    
    // Head
    case '0头': return numObj.head === 0;
    case '1头': return numObj.head === 1;
    case '2头': return numObj.head === 2;
    case '3头': return numObj.head === 3;
    case '4头': return numObj.head === 4;
    
    // Men
    case '1门': return numObj.men === '1门';
    case '2门': return numObj.men === '2门';
    case '3门': return numObj.men === '3门';
    case '4门': return numObj.men === '4门';
    case '5门': return numObj.men === '5门';
    
    // Duan
    case '1段': return numObj.duan === '1段';
    case '2段': return numObj.duan === '2段';
    case '3段': return numObj.duan === '3段';
    case '4段': return numObj.duan === '4段';
    case '5段': return numObj.duan === '5段';
    case '6段': return numObj.duan === '6段';
    case '7段': return numObj.duan === '7段';
    
    // HeShu (Format in JSON: "合01", UI: "1合")
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
    
    // Zodiac Attributes
    case '天肖': return numObj.skyEarth === '天肖';
    case '地肖': return numObj.skyEarth === '地肖';
    case '阴肖': return numObj.yinYang === '阴性' || numObj.yinYang === '阴肖';
    case '阳肖': return numObj.yinYang === '阳性' || numObj.yinYang === '阳肖';
    
    // Custom Zodiac Sets
    case '前肖': {
      const z = zodiacMap[numObj.chineseZodiac];
      return z ? ['鼠','牛','虎','兔','龙','蛇'].includes(z) : false;
    }
    case '后肖': {
      const z = zodiacMap[numObj.chineseZodiac];
      return z ? ['马','羊','猴','鸡','狗','猪'].includes(z) : false;
    }
    case '左肖': {
      const z = zodiacMap[numObj.chineseZodiac];
      return z ? ['鼠','牛','龙','蛇','猴','鸡'].includes(z) : false;
    }
    case '右肖': {
      const z = zodiacMap[numObj.chineseZodiac];
      return z ? ['虎','兔','马','羊','狗','猪'].includes(z) : false;
    }
    case '独字肖': {
      const z = zodiacMap[numObj.chineseZodiac];
      return z ? ['鼠','牛','虎','兔','马','羊','狗','猪'].includes(z) : false;
    }
    case '合字肖': {
      const z = zodiacMap[numObj.chineseZodiac];
      return z ? ['龙','蛇','猴','鸡'].includes(z) : false;
    }

    default: return false;
  }
};


// Filter Logic
const filteredNumbers = computed(() => {
  let result = allNumbers.value;

  // 0. Apply Selected Filters
  if (selectedFilters.value.length > 0) {
    // Group filters by category
    const filtersByCategory: Record<string, string[]> = {};
    selectedFilters.value.forEach(f => {
      const cat = getFilterCategory(f);
      if (!filtersByCategory[cat]) filtersByCategory[cat] = [];
      filtersByCategory[cat].push(f);
    });

    // Apply AND logic between categories, OR logic within category
    result = result.filter(numObj => {
      return Object.keys(filtersByCategory).every(category => {
        const filtersInCat = filtersByCategory[category] || [];
        // Must match AT LEAST ONE filter in this category
        return filtersInCat.some(filter => matchNumber(numObj, filter));
      });
    });
  }

  // 1. Filter by Search Text
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

  // 2. Sort
  result = [...result].sort((a, b) => {
    const valA = a.id.toString().padStart(3, '0');
    const valB = b.id.toString().padStart(3, '0');
    return sortType.value === 'asc' 
      ? valA.localeCompare(valB) 
      : valB.localeCompare(valA);
  });

  return result.map(n => n.id.toString().padStart(2, '0')); // Return formatted strings for display (01, 02... 10, 11...)
});

// Pagination
const paginatedNumbers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredNumbers.value.slice(start, start + pageSize.value);
});

const totalItems = computed(() => filteredNumbers.value.length);

// Reset pagination on filter change
watch([searchText, searchType, sortType], () => {
  currentPage.value = 1;
});

const clearSearch = () => {
  searchText.value = '';
};
// -----------------------------------

// Filter options based on new visual design
const layoutGroups = [
  // Row 1: Odd/Even | Big/Small
  {
    type: 'split',
    groups: [
      { items: ['单', '双'] },
      { items: ['大', '小'] }
    ]
  },
  // Row 2: Waves | Poultry/Beast
  {
    type: 'split',
    groups: [
      { items: ['红波', '绿波', '蓝波'] },
      { items: ['家禽', '野兽'] }
    ]
  },
  // Row 3: Composite Odd/Big/Tail
  {
    type: 'full',
    items: ['合单', '大单', '小单', '合大', '尾大']
  },
  // Row 4: Composite Even/Big/Tail
  {
    type: 'full',
    items: ['合双', '大双', '小双', '合小', '尾小']
  },
  // Row 5: Five Elements
  {
    type: 'full',
    items: ['金', '木', '水', '火', '土']
  },
  // Row 6: Color Combinations
  {
    type: 'full',
    items: ['红单', '红双', '绿单', '绿双', '蓝单', '蓝双']
  },
  // Row 7: Zodiac (Merged)
  {
    type: 'full',
    items: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
  },
  // Row 9: Tails (Merged)
  {
    type: 'full',
    items: ['0尾', '1尾', '2尾', '3尾', '4尾', '5尾', '6尾', '7尾', '8尾', '9尾', '大尾', '小尾']
  },
  // Row 11: Heads
  {
    type: 'full',
    items: ['0头', '1头', '2头', '3头', '4头']
  },
  // Row 14: Doors
  {
    type: 'full',
    items: ['1门', '2门', '3门', '4门', '5门']
  },
  // Row 15: Segments
  {
    type: 'full',
    items: ['1段', '2段', '3段', '4段', '5段', '6段', '7段']
  },
  // Row 16: Sums (Merged)
  {
    type: 'full',
    items: ['1合', '2合', '3合', '4合', '5合', '6合', '7合', '8合', '9合', '10合', '11合', '12合', '13合']
  },
  // Row 12: Zodiac Attr 1
  {
    type: 'full',
    items: ['天肖', '左肖', '前肖', '独字肖', '阴肖']
  },
  // Row 13: Zodiac Attr 2
  {
    type: 'full',
    items: ['地肖', '右肖', '后肖', '合字肖', '阳肖']
  }
];

// Selected filters
// const selectedFilters = ref<string[]>([]);

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
    const settings = {
      filters: selectedFilters.value
    };
    localStorage.setItem('filterSettings', JSON.stringify(settings));
    import('vant').then(({ showToast }) => {
      showToast('筛选条件已保存');
    });
  } catch (e) {
    console.error('Failed to save settings:', e);
    import('vant').then(({ showToast }) => {
      showToast('保存失败');
    });
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



const onClickLeft = () => {
  router.back();
};

const getWaveColorById = (id: number): string => {
  const number = allNumbers.value.find((num: any) => Number(num.id) === id);
  return number?.waveColor || '';
};

</script>

<template>
  <div class="filter-numbers-page">
    <!-- 1. Top Title Bar -->
    <van-nav-bar
      title="筛选号码"
      left-text="返回"
      right-text="加载/保存"
      left-arrow
      fixed
      placeholder
      @click-left="onClickLeft"
      @click-right="onLoad" 
    >
        <template #right>
            <van-popover
                placement="bottom-end"
                :actions="[{ text: '保存条件', icon: 'description' }, { text: '加载条件', icon: 'orders-o' }]"
                @select="(action) => action.text === '保存条件' ? onSave() : onLoad()"
            >
                <template #reference>
                    <van-icon name="ellipsis" size="18" />
                </template>
            </van-popover>
        </template>
    </van-nav-bar>

    <div class="content-area">
      <section class="card-section">
        <div class="selected-head">
          <span class="selected-title">已选条件</span>
          <span class="selected-count">{{ totalItems }}</span>
        </div>
        
        <!-- 筛选结果展示区域 -->
        <div class="filter-results" v-if="filteredNumbers.length > 0">
          <div class="number-tags">
            <span 
              v-for="num in filteredNumbers" 
              :key="num" 
              class="tag tag--selected"
              :class="{
                'tag--red': getWaveColorById(Number(num)) === 'red',
                'tag--green': getWaveColorById(Number(num)) === 'green',
                'tag--blue': getWaveColorById(Number(num)) === 'blue'
              }"
            >
              {{ num }}
            </span>
          </div>
        </div>
        <div class="filter-results" v-else-if="selectedFilters.length > 0">
          <div class="number-tags">
            <span class="tag tag--empty">暂无匹配结果</span>
          </div>
        </div>
        
        <!-- 已选条件标签 -->
        <div class="selected-tags" v-if="selectedFilters.length > 0">
          <span v-for="item in selectedFilters" :key="item" class="tag tag--selected">{{ item }}</span>
        </div>
        <div class="selected-tags" v-else>
          <span class="tag tag--empty">暂无选择</span>
        </div>
        
        <div class="actions">
          <van-button size="small" plain type="primary" @click="onSave">保存条件</van-button>
          <van-button size="small" plain @click="onLoad">加载条件</van-button>
          <van-button size="small" plain type="danger" @click="clearFilters">清空</van-button>
        </div>
      </section>

      <!-- 2. Filter Conditions Area -->
      
      <!-- Combination Controls (Button Grids) -->
      <section class="card-section">
         <div class="card-head">
          <span class="card-title">筛选选项</span>
        </div>
        <div class="filter-container">
          <!-- 筛选条件行 -->
          <div v-for="(row, rowIndex) in layoutGroups" :key="rowIndex" class="filter-row" :class="{ 'split-row': row.type === 'split' }">
            
            <!-- Split Row Layout -->
            <template v-if="row.type === 'split'">
              <div v-for="(subGroup, subIndex) in row.groups" :key="subIndex" class="split-group">
                <div class="button-grid">
                  <button 
                    v-for="item in subGroup.items" 
                    :key="item" 
                    type="button"
                    class="chip"
                    :class="{ 'chip--active': selectedFilters.includes(item) }"
                    @click="toggleFilter(item)"
                  >
                    {{ item }}
                  </button>
                </div>
              </div>
            </template>

            <!-- Full Row Layout -->
            <template v-else>
              <div class="button-grid">
                <button 
                  v-for="item in row.items" 
                  :key="item" 
                  type="button"
                  class="chip"
                  :class="{ 'chip--active': selectedFilters.includes(item) }"
                  @click="toggleFilter(item)"
                >
                  {{ item }}
                </button>
              </div>
            </template>

          </div>
        </div>
      </section>
      
    </div>

    <!-- 3. Bottom Action Bar (Removed) -->
  </div>
</template>

<style scoped>
.filter-numbers-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content-area {
  padding-top: 10px;
}

/* New Card Styles */
.header-fixed { position: sticky; top: 0; z-index: 1000; }
.selected-card { background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-3); box-shadow: var(--shadow-soft); margin-bottom: 12px; }
.selected-head { display: flex; align-items: center; justify-content: space-between; }
.selected-title { font-size: 14px; color: #222; }
.number-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.tag { display: inline-flex; align-items: center; justify-content: center; min-width: 48px; height: 36px; padding: 0 8px; border-radius: 999px; font-weight: 600; font-size: 14px; }
.tag--selected { background: #1989fa; color: #fff; }
.tag--empty { background: #f5f5f5; color: #999; font-weight: normal; }
.actions { display: flex; gap: 8px; margin-top: 10px; }

/* Filter Container Styles */
.filter-container {
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-row {
  background: #fff;
  /* Removed individual background/shadow/padding to match the clean grid look if needed, 
     but keeping container style for grouping might be better. 
     The image shows clean rows. Let's keep rows clean. */
}

/* For split rows, we want two distinct groups side by side or just separated visually */
.filter-row.split-row {
  display: flex;
  gap: 12px;
  background: transparent; /* Remove background from container */
}

.split-group {
  flex: 1; /* Equal width */
  background: #fff;
  /* border-radius: 8px; */
  /* padding: 8px; */
  /* box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); */
}

.button-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 8px 12px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  transition: transform .12s ease, box-shadow .12s ease, background-color .12s ease, border-color .12s ease;
  min-width: 48px;
  text-align: center;
  cursor: pointer;
}
.chip:hover { box-shadow: var(--shadow-soft); transform: translateY(-1px); }
.chip:active { transform: translateY(-2px); }
.chip--active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

/* Filter Results Styles */
.filter-results {
  background: #fff;
  border-radius: var(--radius-md);
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-soft);
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.results-title {
  font-size: 14px;
  color: #222;
  font-weight: 500;
}

.number-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Selected Head Styles */
.selected-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.selected-title {
  font-size: 14px;
  color: #222;
  font-weight: 500;
}

.selected-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease;
}

.tag:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-soft);
}

.tag--selected {
  background: #1989fa;
  color: #fff;
}

.tag--red {
  background: #ff4d4f;
  color: #fff;
}

.tag--green {
  background: #52c41a;
  color: #fff;
}

.tag--blue {
  background: #1890ff;
  color: #fff;
}

.tag--empty {
  background: #f5f5f5;
  color: #999;
  font-weight: normal;
}

/* Search Section Styles */
.search-controls {
  padding: 0 4px;
}

.options-row {
  display: flex;
  align-items: center;
  margin-top: 12px;
  padding: 0 12px;
  font-size: 14px;
}

.label {
  margin-right: 12px;
  color: #646566;
  white-space: nowrap;
}

.result-area {
  margin-top: 16px;
  min-height: 200px;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.result-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #ebedf0;
}

.result-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  border-bottom: 1px solid #ebedf0;
  background: #fff;
}

.num-text {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
