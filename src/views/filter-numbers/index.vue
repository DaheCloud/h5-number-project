<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// State for filter conditions
const selectedFilters = ref<string[]>([]);

// --- Number Search Feature State ---
const allNumbers = ref<string[]>([]);
const searchText = ref('');
const searchType = ref<'exact' | 'fuzzy' | 'regex'>('fuzzy');
const sortType = ref<'asc' | 'desc'>('asc');
const currentPage = ref(1);
const pageSize = ref(20);
const loading = ref(false);

// Generate mock data (1000 items)
onMounted(() => {
  loading.value = true;
  setTimeout(() => {
    allNumbers.value = Array.from({ length: 1000 }, (_, i) => 
      (i + 1).toString().padStart(3, '0')
    );
    loading.value = false;
  }, 500);
});

// Filter Logic
const filteredNumbers = computed(() => {
  let result = allNumbers.value;

  // 1. Filter by Search Text
  if (searchText.value) {
    const query = searchText.value.trim();
    if (searchType.value === 'exact') {
      result = result.filter(n => n === query);
    } else if (searchType.value === 'fuzzy') {
      result = result.filter(n => n.includes(query));
    } else if (searchType.value === 'regex') {
      try {
        const regex = new RegExp(query);
        result = result.filter(n => regex.test(n));
      } catch (e) {
        // Invalid regex, return empty or all? Returning empty for safety
        return [];
      }
    }
  }

  // 2. Sort
  result = [...result].sort((a, b) => {
    return sortType.value === 'asc' 
      ? a.localeCompare(b) 
      : b.localeCompare(a);
  });

  return result;
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
        <div class="card-head">
          <span class="card-title">已选条件</span>
        </div>
        <div class="number-tags">
          <span v-for="item in selectedFilters" :key="item" class="tag tag--selected">{{ item }}</span>
          <span v-if="selectedFilters.length === 0" class="tag tag--empty">暂无选择</span>
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

      <!-- 3. Number Search & Results -->
      <section class="card-section">
        <div class="card-head">
          <span class="card-title">号码搜索结果 ({{ totalItems }})</span>
        </div>
        
        <div class="search-controls">
          <!-- Search Input -->
          <van-search 
            v-model="searchText" 
            placeholder="请输入号码或正则..." 
            show-action
            shape="round"
            background="transparent"
            @clear="clearSearch"
          >
            <template #action>
               <div @click="clearSearch" v-if="searchText">清除</div>
            </template>
          </van-search>

          <!-- Search Options -->
          <div class="options-row">
            <span class="label">模式:</span>
            <van-radio-group v-model="searchType" direction="horizontal">
              <van-radio name="exact">精确</van-radio>
              <van-radio name="fuzzy">模糊</van-radio>
              <van-radio name="regex">正则</van-radio>
            </van-radio-group>
          </div>

          <div class="options-row">
            <span class="label">排序:</span>
             <van-radio-group v-model="sortType" direction="horizontal">
              <van-radio name="asc">升序</van-radio>
              <van-radio name="desc">降序</van-radio>
            </van-radio-group>
          </div>
        </div>

        <!-- Result List -->
        <div class="result-area">
          <div v-if="loading" class="loading-state">
            <van-loading size="24px">加载中...</van-loading>
          </div>
          
          <div v-else-if="filteredNumbers.length === 0" class="empty-state">
            <van-empty description="无匹配结果" />
          </div>

          <div v-else class="result-list">
             <div 
              v-for="num in paginatedNumbers" 
              :key="num" 
              class="result-item"
            >
              <span class="num-text">{{ num }}</span>
            </div>
          </div>
          
          <div class="pagination-wrapper" v-if="totalItems > 0">
             <van-pagination 
              v-model="currentPage" 
              :total-items="totalItems" 
              :items-per-page="pageSize"
              force-ellipses
            />
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
