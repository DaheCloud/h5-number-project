<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  totalItems: number;
  selectedCount: number;
  selectedFilters: string[];
  filteredNumbers: string[];
  getWaveColor: (id: number) => string;
}>();

const emit = defineEmits<{
  (e: 'clear'): void;
  (e: 'removeFilter', item: string): void;
}>();

const showHeader = computed(() => props.selectedCount > 0 || props.filteredNumbers.length > 0);

const copyResults = async () => {
  if (props.filteredNumbers.length === 0) {
    import('vant').then(({ showToast }) => showToast('暂无结果可复制'));
    return;
  }
  
  const text = props.filteredNumbers.join(', ');
  try {
    await navigator.clipboard.writeText(text);
    import('vant').then(({ showToast }) => showToast('已复制到剪贴板'));
  } catch (err) {
    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      import('vant').then(({ showToast }) => showToast('已复制到剪贴板'));
    } catch (e) {
      console.error('Copy failed', e);
      import('vant').then(({ showToast }) => showToast('复制失败'));
    }
    document.body.removeChild(textArea);
  }
};
</script>

<template>
  <transition name="van-slide-down">
    <section v-if="showHeader" class="result-sticky-header">
      <div class="result-summary">
        <div class="summary-left">
          <span class="summary-item">已选: <span class="highlight">{{ selectedCount }}</span></span>
          <span class="divider">|</span>
          <span class="summary-item">结果: <span class="highlight">{{ totalItems }}</span></span>
        </div>
        <div class="summary-actions">
           <van-button size="mini" plain type="primary" round @click="copyResults">复制结果</van-button>
           <van-button size="mini" plain type="danger" round @click="emit('clear')">清空条件</van-button>
        </div>
      </div>
      
      <!-- Selected Filters Tags -->
      <div class="selected-tags-scroll" v-if="selectedCount > 0">
         <van-tag 
            v-for="item in selectedFilters" 
            :key="item" 
            closeable 
            size="medium" 
            type="primary" 
            @close="emit('removeFilter', item)"
            class="filter-tag"
          >
            {{ item }}
          </van-tag>
      </div>

      <!-- Result Balls -->
      <div class="result-grid" v-if="filteredNumbers.length > 0">
         <div 
          v-for="num in filteredNumbers" 
          :key="num" 
          class="ball"
          :class="`ball-${getWaveColor(Number(num))}`"
        >
          {{ num }}
        </div>
      </div>
      <div v-else class="empty-result">
        无匹配号码
      </div>
    </section>
  </transition>
</template>

<style scoped>
.result-sticky-header {
  position: sticky;
  top: 46px; /* Below NavBar */
  z-index: 99;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  margin-bottom: 16px;
}

.result-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.summary-actions {
  display: flex;
  gap: 8px;
}

.summary-left {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.highlight {
  color: #333;
  font-weight: 600;
  font-size: 15px;
}

.divider {
  color: #ebedf0;
}

.selected-tags-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 4px;
  scrollbar-width: none; 
}
.selected-tags-scroll::-webkit-scrollbar { display: none; }

.filter-tag {
  flex-shrink: 0;
  padding: 3px 8px;
}

.result-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
  padding: 4px 0;
}

.ball {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 14px;
  background: #f5f5f5;
  color: #333;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  user-select: none;
}

.ball-red { background: linear-gradient(135deg, #ff7875, #f5222d); color: white; box-shadow: 0 2px 6px rgba(245, 34, 45, 0.3); }
.ball-green { background: linear-gradient(135deg, #95de64, #52c41a); color: white; box-shadow: 0 2px 6px rgba(82, 196, 26, 0.3); }
.ball-blue { background: linear-gradient(135deg, #69c0ff, #1890ff); color: white; box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3); }

.empty-result {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}
</style>
