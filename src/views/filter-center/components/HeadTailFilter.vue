<script setup lang="ts">
defineOptions({ name: 'HeadTailFilter' })
import { ref, computed } from 'vue'
import { confirmDialog, toast } from '@/utils/feedback'

const activeTab = ref<'head' | 'tail'>('head')
const heads = [0, 1, 2, 3, 4]
const units = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const selectedHeads = ref<number[]>([])
const selectedUnits = ref<number[]>([])
const groupsHead = ref<number[][]>([])
const groupsUnit = ref<number[][]>([])

function toggleHead(n: number) { const i = selectedHeads.value.indexOf(n); i > -1 ? selectedHeads.value.splice(i, 1) : selectedHeads.value.push(n) }
function toggleUnit(n: number) { const i = selectedUnits.value.indexOf(n); i > -1 ? selectedUnits.value.splice(i, 1) : selectedUnits.value.push(n) }
function clearCurrent() { activeTab.value === 'head' ? selectedHeads.value = [] : selectedUnits.value = [] }

async function copySelected() {
  const list = activeTab.value === 'head' ? selectedHeads.value : selectedUnits.value
  if (list.length === 0) { toast('暂无选择'); return }
  try { await navigator.clipboard.writeText(list.join('.')); toast('复制成功') } catch { toast('复制失败') }
}

function confirmGroup() {
  if (activeTab.value === 'head') {
    if (selectedHeads.value.length === 0) { toast('请先选择头数'); return }
    groupsHead.value.push([...selectedHeads.value]); selectedHeads.value = []; toast('已添加一组')
  } else {
    if (selectedUnits.value.length === 0) { toast('请先选择尾数'); return }
    groupsUnit.value.push([...selectedUnits.value]); selectedUnits.value = []; toast('已添加一组')
  }
}

function deleteGroup(index: number) {
  activeTab.value === 'head' ? groupsHead.value.splice(index, 1) : groupsUnit.value.splice(index, 1)
  toast('已删除该组')
}

async function clearAllGroups() {
  const confirmed = await confirmDialog({ title: '确认操作', message: '确定要清空所有组吗？此操作不可撤销', confirmText: '确定', cancelText: '取消', showCancel: true })
  if (confirmed) { activeTab.value === 'head' ? groupsHead.value = [] : groupsUnit.value = []; toast('所有组已成功清空') }
}

const totalCount = computed(() => {
  const list = activeTab.value === 'head' ? groupsHead.value : groupsUnit.value
  return list.reduce((s, g) => s + g.length, 0)
})

const ranking = computed(() => {
  const list = activeTab.value === 'head' ? groupsHead.value : groupsUnit.value
  if (totalCount.value === 0) return [] as { name: string; count: number; ratio: number }[]
  const m = new Map<number, number>()
  for (const g of list) for (const n of g) m.set(n, (m.get(n) || 0) + 1)
  return Array.from(m.entries()).map(([name, count]) => ({ name: String(name), count, ratio: count / totalCount.value })).sort((a, b) => b.ratio - a.ratio)
})

defineExpose({ refresh: () => { selectedHeads.value = []; selectedUnits.value = []; toast('已刷新头尾筛选') } })
</script>

<template>
  <div class="flex flex-col min-h-full">
    <div class="p-3 space-y-3">
      <!-- Selected Card -->
      <div class="u-section">
        <span class="text-sm text-base-content">已选{{ activeTab === 'head' ? '头数' : '尾数' }}</span>
        <div class="flex flex-wrap gap-2 mt-2">
          <span v-for="n in (activeTab==='head'?selectedHeads:selectedUnits)" :key="n" class="inline-flex items-center justify-center min-w-[48px] h-9 px-2 rounded-full bg-primary text-white font-semibold text-sm">{{ n }}</span>
          <span v-if="(activeTab==='head'?selectedHeads:selectedUnits).length===0" class="text-sm text-secondary">暂无选择</span>
        </div>
        <div class="flex gap-2 mt-3">
          <button class="btn btn-sm btn-outline btn-secondary" @click="copySelected">复制</button>
          <button class="btn btn-sm btn-ghost" @click="clearCurrent">清空</button>
          <button class="btn btn-sm btn-primary" @click="confirmGroup">确认本组</button>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="u-section">
        <div class="tabs tabs-boxed">
          <button class="tab" :class="activeTab==='head'?'tab-active':''" @click="activeTab='head'">头数</button>
          <button class="tab" :class="activeTab==='tail'?'tab-active':''" @click="activeTab='tail'">尾数</button>
        </div>
      </div>

      <!-- Grid -->
      <div class="u-section">
        <div class="grid grid-cols-5 gap-2">
          <button v-for="n in (activeTab==='head'?heads:units)" :key="n" type="button"
            class="u-chip"
            :class="(activeTab==='head'?selectedHeads:selectedUnits).includes(n)?'is-active':''"
            @click="activeTab==='head'?toggleHead(n):toggleUnit(n)">{{ n }}</button>
        </div>
      </div>

      <!-- Groups -->
      <div class="u-section">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-base-content">已添加的组（{{ activeTab==='head'?'头数':'尾数' }}）</h3>
          <button class="btn btn-xs btn-soft btn-error" @click="clearAllGroups">清空所有组</button>
        </div>
        <div v-if="(activeTab==='head'?groupsHead:groupsUnit).length===0" class="text-sm text-secondary">暂无分组</div>
        <div v-else class="space-y-3">
          <div v-for="(g,i) in (activeTab==='head'?groupsHead:groupsUnit)" :key="i">
            <div class="flex items-center justify-between"><span class="text-sm text-secondary">第{{ i+1 }}组</span>
              <button class="btn btn-xs btn-circle btn-ghost text-error" @click="deleteGroup(i)"><span class="icon-[tabler--trash] size-3.5"></span></button>
            </div>
            <div class="flex flex-wrap gap-2 mt-1">
              <span v-for="n in g" :key="n" class="inline-flex items-center justify-center min-w-[48px] h-9 px-2 rounded-full bg-primary text-white font-semibold text-sm">{{ n }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="u-section">
        <h3 class="text-sm font-semibold text-base-content mb-3">统计结果</h3>
        <div v-if="ranking.length===0" class="text-sm text-secondary">暂无数据</div>
        <div v-else class="space-y-2">
          <div v-for="item in ranking" :key="item.name" class="grid grid-cols-[60px_1fr_80px] items-center gap-2">
            <span class="text-sm text-base-content">{{ item.name }}</span>
            <div class="h-2.5 bg-base-200 rounded-full overflow-hidden"><div class="h-full bg-primary transition-all" :style="{width:Math.round(item.ratio*100)+'%'}"></div></div>
            <span class="text-right text-xs text-secondary">{{ (item.ratio*100).toFixed(1) }}%（{{ item.count }}）</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
