<script setup lang="ts">
import { computed } from 'vue';
import { toast } from '@/utils/feedback';

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
  (e: 'toggleExclusion', num: string): void;
}>();

const showHeader = computed(() => props.selectedCount > 0 || props.filteredNumbers.length > 0);

const copyResults = async () => {
  if (props.filteredNumbers.length === 0) {
    toast('暂无结果可复制');
    return;
  }
  
  const text = props.filteredNumbers.join(', ');
  try {
    await navigator.clipboard.writeText(text);
    toast('已复制到剪贴板');
  } catch (err) {
    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      toast('已复制到剪贴板');
    } catch (e) {
      console.error('Copy failed', e);
      toast('复制失败');
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
           <van-button size="mini" round class="btn-copy" @click="copyResults">复制结果</van-button>
           <van-button size="mini" round class="btn-clear" @click="emit('clear')">清空条件</van-button>
        </div>
      </div>
      
      <!-- Selected Filters Tags -->
      <div class="selected-tags-scroll" v-if="selectedCount > 0">
          <van-tag 
             v-for="item in selectedFilters" 
             :key="item" 
             closeable 
             plain
             round
             size="medium" 
             @close="emit('removeFilter', item)"
             class="filter-tag"
           >
             {{ item }}
          </van-tag>
      </div>

      <!-- Result Numbers -->
      <div class="result-grid" v-if="filteredNumbers.length > 0">
         <div 
          v-for="num in filteredNumbers" 
          :key="num" 
          class="result-num"
          :class="`result-num--${getWaveColor(Number(num))}`"
          @click="emit('toggleExclusion', num)"
          title="点击移除"
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
  backdrop-filter: blur(6px);
  padding: 10px 12px;
  box-shadow: var(--shadow-card);
  border-bottom-left-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
  margin-bottom: 12px;
  border: 1px solid var(--color-border);
  border-top: none;
}

.result-summary {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.summary-actions {
  display: flex;
  gap: 6px;
}

:deep(.summary-actions .van-button) {
  min-height: var(--control-h-sm);
  padding-inline: 10px;
}

:deep(.summary-actions .btn-copy) {
  background: #1f2937;
  color: #f8fafc;
  border: 1px solid #1f2937;
}

:deep(.summary-actions .btn-clear) {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.summary-left {
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}

.highlight {
  color: #111827;
  font-weight: 600;
  font-size: 14px;
}

.divider {
  color: #ebedf0;
}

.selected-tags-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: 4px;
  padding-top: 2px;
  scrollbar-width: none; 
}
.selected-tags-scroll::-webkit-scrollbar { display: none; }

.filter-tag {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 999px;
  border-color: #2f3137;
  background: #2f3137;
  color: #f8fafc;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(17, 24, 39, 0.16);
}

:deep(.filter-tag .van-tag__close) {
  color: #f8fafc;
  opacity: 0.85;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
  padding: 2px 0;
}

.result-num {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.02em;
  background: #f8fafc;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.06);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
  user-select: none;
  cursor: pointer;
}

.result-num:active {
  transform: scale(0.97);
}

.result-num--red {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #b91c1c;
}

.result-num--green {
  background: #dcfce7;
  border-color: #86efac;
  color: #166534;
}

.result-num--blue {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.empty-result {
  text-align: center;
  color: #8190a8;
  font-size: 13px;
  padding: 12px;
  background: #f5f8fc;
  border-radius: 8px;
}
</style>
