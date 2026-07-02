<script setup lang="ts">
import { computed } from 'vue'
import { toast } from '@/utils/feedback'

const props = defineProps<{
  totalItems: number
  selectedCount: number
  selectedFilters: string[]
  filteredNumbers: string[]
  getWaveColor: (id: number) => string
}>()

const emit = defineEmits<{
  (e: 'clear'): void
  (e: 'removeFilter', item: string): void
  (e: 'toggleExclusion', num: string): void
}>()

const showHeader = computed(() => props.selectedCount > 0 || props.filteredNumbers.length > 0)

const copyResults = async () => {
  if (props.filteredNumbers.length === 0) { toast('暂无结果可复制'); return }
  const text = props.filteredNumbers.join(', ')
  try { await navigator.clipboard.writeText(text); toast('已复制到剪贴板') } catch {
    const textArea = document.createElement('textarea')
    textArea.value = text; document.body.appendChild(textArea); textArea.select()
    try { document.execCommand('copy'); toast('已复制到剪贴板') } catch { toast('复制失败') }
    document.body.removeChild(textArea)
  }
}
</script>

<template>
  <section v-if="showHeader" class="sticky top-[49px] z-40 bg-white/98 backdrop-blur-sm px-3 py-2.5 rounded-b-2xl shadow-md border border-gray-200 border-t-0 mb-3">
    <!-- Summary -->
    <div class="flex items-center justify-between flex-wrap gap-2 mb-2">
      <div class="flex items-center gap-2 text-[13px] text-gray-500">
        <span>已选: <span class="text-[#111827] font-semibold text-sm">{{ selectedCount }}</span></span>
        <span class="text-gray-200">|</span>
        <span>结果: <span class="text-[#111827] font-semibold text-sm">{{ totalItems }}</span></span>
      </div>
      <div class="flex gap-1.5">
        <button class="btn btn-xs bg-[#1f2937] text-white border-[#1f2937] rounded-full" @click="copyResults">复制结果</button>
        <button class="btn btn-xs btn-soft btn-error rounded-full" @click="emit('clear')">清空条件</button>
      </div>
    </div>

    <!-- Filter Tags -->
    <div v-if="selectedCount > 0" class="flex gap-1.5 overflow-x-auto pb-1.5 mb-1 scrollbar-hide">
      <button v-for="item in selectedFilters" :key="item"
        class="btn btn-xs bg-[#2f3137] text-white border-[#2f3137] rounded-full font-semibold flex-shrink-0"
        @click="emit('removeFilter', item)">
        {{ item }}
        <span class="icon-[tabler--x] size-3 ml-1 opacity-85"></span>
      </button>
    </div>

    <!-- Result Numbers -->
    <div v-if="filteredNumbers.length > 0" class="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-2 max-h-[180px] overflow-y-auto py-0.5">
      <div v-for="num in filteredNumbers" :key="num"
        class="w-10 h-10 flex items-center justify-center rounded-full font-bold text-xs border shadow-sm cursor-pointer transition-transform active:scale-95 select-none"
        :class="{
          'bg-red-50 border-red-300 text-red-700': getWaveColor(Number(num)) === 'red',
          'bg-green-50 border-green-300 text-green-700': getWaveColor(Number(num)) === 'green',
          'bg-blue-50 border-blue-300 text-blue-700': getWaveColor(Number(num)) === 'blue',
          'bg-gray-50 border-gray-200 text-[#1f2937]': !['red','green','blue'].includes(getWaveColor(Number(num))),
        }"
        @click="emit('toggleExclusion', num)" :title="`点击移除 ${num}`"
      >{{ num }}</div>
    </div>
    <div v-else class="text-center text-[13px] text-gray-400 py-3 bg-[#f5f8fc] rounded-lg">无匹配号码</div>
  </section>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { scrollbar-width: none; }
</style>
