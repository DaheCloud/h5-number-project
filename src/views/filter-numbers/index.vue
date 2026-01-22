<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// State for filter conditions
const numberType = ref('all');
const numberRangeStart = ref('');
const numberRangeEnd = ref('');
const specialNumber = ref(false);

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
const selectedFilters = ref<string[]>([]);

const toggleFilter = (item: string) => {
  const index = selectedFilters.value.indexOf(item);
  if (index === -1) {
    selectedFilters.value.push(item);
  } else {
    selectedFilters.value.splice(index, 1);
  }
};



const onSave = () => {
  try {
    const settings = {
      type: numberType.value,
      rangeStart: numberRangeStart.value,
      rangeEnd: numberRangeEnd.value,
      special: specialNumber.value,
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
      numberType.value = settings.type || 'all';
      numberRangeStart.value = settings.rangeStart || '';
      numberRangeEnd.value = settings.rangeEnd || '';
      specialNumber.value = settings.special || false;
      selectedFilters.value = settings.filters || [];
      import('vant').then(({ showToast }) => {
        showToast('筛选条件已加载');
      });
    } catch (e) {
      console.error('Failed to parse saved settings');
    }
  }
};



const onClickLeft = () => {
  router.back();
};

const numberTypeOptions = [
  { text: '全部号码', value: 'all' },
  { text: '普通号码', value: 'normal' },
  { text: '特殊号码', value: 'special' },
];

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
      <!-- 2. Filter Conditions Area -->
      
      <!-- Basic Controls (Dropdown, Range, Checkbox) -->
      <van-cell-group inset title="基础条件">
        <van-field name="numberType" label="号码类型">
          <template #input>
            <van-dropdown-menu :overlay="false">
              <van-dropdown-item v-model="numberType" :options="numberTypeOptions" />
            </van-dropdown-menu>
          </template>
        </van-field>

        <van-field label="号码范围">
          <template #input>
            <div class="range-input">
              <van-field 
                v-model="numberRangeStart" 
                type="digit" 
                placeholder="1" 
                class="mini-input" 
              />
              <span class="separator">-</span>
              <van-field 
                v-model="numberRangeEnd" 
                type="digit" 
                placeholder="49" 
                class="mini-input" 
              />
            </div>
          </template>
        </van-field>

        <van-cell title="特殊号码标记">
          <template #right-icon>
            <van-checkbox v-model="specialNumber" />
          </template>
        </van-cell>
      </van-cell-group>

      <!-- Combination Controls (Button Grids) -->
      <div class="filter-container">
        <div v-for="(row, rowIndex) in layoutGroups" :key="rowIndex" class="filter-row" :class="{ 'split-row': row.type === 'split' }">
          
          <!-- Split Row Layout -->
          <template v-if="row.type === 'split'">
            <div v-for="(subGroup, subIndex) in row.groups" :key="subIndex" class="split-group">
              <div class="button-grid">
                <div 
                  v-for="item in subGroup.items" 
                  :key="item" 
                  class="grid-item"
                  :class="{ active: selectedFilters.includes(item) }"
                  @click="toggleFilter(item)"
                >
                  {{ item }}
                </div>
              </div>
            </div>
          </template>

          <!-- Full Row Layout -->
          <template v-else>
            <div class="button-grid">
              <div 
                v-for="item in row.items" 
                :key="item" 
                class="grid-item"
                :class="{ active: selectedFilters.includes(item) }"
                @click="toggleFilter(item)"
              >
                {{ item }}
              </div>
            </div>
          </template>

        </div>
      </div>
      
      <!-- Spacer for bottom fixed bar (Removed) -->
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

.range-input {
  display: flex;
  align-items: center;
  width: 100%;
}

.mini-input {
  padding: 5px 10px;
  background-color: #f2f3f5;
  border-radius: 4px;
  text-align: center;
}

.separator {
  margin: 0 10px;
  color: #969799;
}

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

.grid-item {
  min-width: 48px;
  height: 36px; /* Slightly taller for better touch target */
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 1px solid #ebedf0;
  border-radius: 4px;
  font-size: 14px;
  color: #323233;
  cursor: pointer;
  transition: all 0.2s;
  flex: none;
}

/* Ensure items don't get too small or too big */
.split-group .grid-item {
  min-width: 40px;
}

.grid-item:active {
  background-color: #f2f3f5;
}

.grid-item.active {
  color: #1989fa;
  background-color: #e8f3ff;
  border-color: #1989fa;
  font-weight: 500;
}



:deep(.van-dropdown-menu__bar) {
  height: 32px;
  box-shadow: none;
  background-color: transparent;
}

:deep(.van-dropdown-menu__title) {
  padding: 0 8px;
}
</style>
