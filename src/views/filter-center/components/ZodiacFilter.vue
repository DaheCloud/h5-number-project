<script setup lang="ts">
defineOptions({ name: 'ZodiacFilter' })
import { ref, computed } from 'vue'
import { ALL_ZODIACS, addGroup, computeRanking } from '@/utils/zodiac'
import { confirmDialog, toast } from '@/utils/feedback'

const zodiacs = ALL_ZODIACS
const selected = ref<string[]>([])
const groups = ref<string[][]>([])
const ranking = computed(() => computeRanking(groups.value))

function toggle(name: string) { const i = selected.value.indexOf(name); i > -1 ? selected.value.splice(i,1) : selected.value.push(name) }
function clearAll() { selected.value = [] }
async function copySelected() {
  if (selected.value.length===0) { toast('暂无选择'); return }
  try { await navigator.clipboard.writeText(selected.value.join('.')); toast('复制成功') } catch { toast('复制失败') }
}
function confirmGroup() {
  if (selected.value.length===0) { toast('请先选择生肖'); return }
  groups.value = addGroup(groups.value, selected.value); selected.value = []; toast('已添加一组')
}
async function clearAllGroups() {
  const confirmed = await confirmDialog({ title:'确认操作', message:'确定要清空所有组吗？此操作不可撤销', confirmText:'确定', cancelText:'取消', showCancel:true })
  if (confirmed) { groups.value=[]; selected.value=[]; toast('所有组已成功清空') }
}
function deleteGroup(index:number) { groups.value.splice(index,1); toast('已删除该组') }
defineExpose({ refresh: () => { selected.value=[]; toast('已刷新生肖筛选') } })
</script>

<template>
  <div class="flex flex-col min-h-full">
    <div class="p-3 space-y-3">
      <!-- Selected -->
      <div class="u-section">
        <span class="text-sm text-base-content">已选生肖</span>
        <div class="flex flex-wrap gap-2 mt-2">
          <span v-for="n in selected" :key="n" class="inline-flex items-center justify-center min-w-[48px] h-9 px-2 rounded-full bg-primary text-white font-semibold text-sm">{{ n }}</span>
          <span v-if="selected.length===0" class="text-sm text-secondary">暂无选择</span>
        </div>
        <div class="flex gap-2 mt-3">
          <button class="btn btn-sm btn-outline btn-secondary" @click="copySelected">复制</button>
          <button class="btn btn-sm btn-ghost" @click="clearAll">清空</button>
          <button class="btn btn-sm btn-primary" @click="confirmGroup">确认本组</button>
        </div>
      </div>

      <!-- Grid -->
      <div class="u-section">
        <div class="grid grid-cols-3 gap-2">
          <button v-for="name in zodiacs" :key="name" type="button"
            class="u-chip" :class="selected.includes(name)?'is-active':''" @click="toggle(name)">{{ name }}</button>
        </div>
      </div>

      <!-- Groups -->
      <div class="u-section">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-base-content">已添加的组</h3>
          <button class="btn btn-xs btn-soft btn-error" @click="clearAllGroups">清空所有组</button>
        </div>
        <div v-if="groups.length===0" class="text-sm text-secondary">暂无分组</div>
        <div v-else class="space-y-3">
          <div v-for="(g,i) in groups" :key="i">
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
