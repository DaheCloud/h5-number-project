<script setup lang="ts">
defineOptions({ name: 'ConditionFilter' })
import { computed, ref } from 'vue'
import { lotteryDataService } from '@/services/lotteryData'
import { computeRanking } from '@/utils/zodiac'
import { confirmDialog, toast } from '@/utils/feedback'

type ConditionGroup = { conditions: string[]; zodiacs: string[] }
type ConditionOptionGroup = { key: string; title: string; items: string[] }

const conditionOptions = lotteryDataService.getOtherAttributeOptions()
const zodiacOptions = lotteryDataService.getZodiacOptions().map(i => i.label)
const selectedConditions = ref<string[]>([])
const selectedZodiacs = ref<string[]>([])
const groups = ref<ConditionGroup[]>([])
const selected = computed(() => [...selectedConditions.value, ...selectedZodiacs.value])

const conditionGroupRules = [
  { key: 'space', title: '天地家野', patterns: [/天肖|地肖|家禽|野兽|家肖|野肖/] },
  { key: 'core', title: '基础属性', patterns: [/阴性|阳性|吉美|凶丑|女肖|男肖/] },
  { key: 'position', title: '方位时段', patterns: [/前肖|后肖|左肖|右肖|朝肖|夕肖|昼肖|夜肖/] },
  { key: 'color', title: '颜色边中', patterns: [/红肖|蓝肖|绿肖|白肖|白边|黑中/] },
  { key: 'size', title: '大小胆', patterns: [/大肖|小肖|胆大肖|胆小肖|单双|双笔|单笔/] },
  { key: 'season', title: '四季才艺', patterns: [/春|夏|秋|冬|琴|棋|书|画/] },
]

const groupedConditionOptions = computed<ConditionOptionGroup[]>(() => {
  const remaining = [...conditionOptions]
  const result: ConditionOptionGroup[] = []
  conditionGroupRules.forEach(rule => {
    const matched = remaining.filter(i => rule.patterns.some(p => p.test(i)))
    if (matched.length) { result.push({ key: rule.key, title: rule.title, items: matched }); matched.forEach(i => { const idx = remaining.indexOf(i); if (idx > -1) remaining.splice(idx, 1) }) }
  })
  if (remaining.length) result.push({ key: 'other', title: '其他', items: remaining })
  return result
})

const activeConditionGroups = ref<string[]>(conditionGroupRules.slice(0, 2).map(i => i.key))

const ranking = computed(() => {
  const zodiacGroups = groups.value.map(g => {
    const zodiacs = g.conditions.flatMap(c => lotteryDataService.getOtherAttributeZodiacs(c))
    zodiacs.push(...g.zodiacs); return zodiacs
  })
  return computeRanking(zodiacGroups)
})

function toggle(condition: string) { const i = selectedConditions.value.indexOf(condition); i > -1 ? selectedConditions.value.splice(i, 1) : selectedConditions.value.push(condition) }
function toggleZodiac(zodiac: string) { const i = selectedZodiacs.value.indexOf(zodiac); i > -1 ? selectedZodiacs.value.splice(i, 1) : selectedZodiacs.value.push(zodiac) }
function clearCurrent() { selectedConditions.value = []; selectedZodiacs.value = [] }

async function copySelected() {
  if (selected.value.length === 0) { toast('暂无选择'); return }
  try { await navigator.clipboard.writeText(selected.value.join('、')); toast('复制成功') } catch { toast('复制失败') }
}

function confirmGroup() {
  if (selectedConditions.value.length === 0 && selectedZodiacs.value.length === 0) { toast('请先选择条件'); return }
  groups.value = [...groups.value, { conditions: [...selectedConditions.value], zodiacs: [...selectedZodiacs.value] }]
  selectedConditions.value = []; selectedZodiacs.value = []; toast('已添加一组')
}

async function clearAllGroups() {
  const confirmed = await confirmDialog({ title: '确认操作', message: '确定要清空所有条件组吗？此操作不可撤销', confirmText: '确定', cancelText: '取消', showCancel: true })
  if (confirmed) { groups.value = []; selectedConditions.value = []; selectedZodiacs.value = []; toast('所有组已成功清空') }
}

function deleteGroup(index: number) { groups.value.splice(index, 1); toast('已删除该组') }

function getGroupZodiacStats(group: ConditionGroup) {
  const fromConditions = group.conditions.flatMap(c => lotteryDataService.getOtherAttributeZodiacs(c))
  const all = [...fromConditions, ...group.zodiacs]
  const counter = new Map<string, number>()
  all.forEach(z => counter.set(z, (counter.get(z) || 0) + 1))
  return Array.from(counter.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

function togglePanel(key: string) {
  const i = activeConditionGroups.value.indexOf(key)
  i > -1 ? activeConditionGroups.value.splice(i, 1) : activeConditionGroups.value.push(key)
}

defineExpose({ refresh: () => { selectedConditions.value = []; selectedZodiacs.value = []; toast('已刷新条件筛选') } })
</script>

<template>
  <div class="flex flex-col min-h-full">
    <div class="p-3 space-y-3">
      <!-- Selected -->
      <div class="u-section">
        <span class="text-sm text-base-content">已选条件</span>
        <div class="flex flex-wrap gap-2 mt-2">
          <span v-for="item in selected" :key="item" class="inline-flex items-center justify-center min-w-[48px] min-h-9 px-2.5 rounded-full bg-primary text-primary-content font-semibold text-sm">{{ item }}</span>
          <span v-if="selected.length===0" class="text-sm text-secondary">暂无选择</span>
        </div>
        <div class="flex gap-2 mt-3">
          <button class="btn btn-sm btn-outline btn-secondary" @click="copySelected">复制</button>
          <button class="btn btn-sm btn-ghost" @click="clearCurrent">清空</button>
          <button class="btn btn-sm btn-primary" @click="confirmGroup">确认本组</button>
        </div>
      </div>

      <!-- Condition Groups (custom accordion) -->
      <div class="u-section">
        <h3 class="text-sm font-semibold text-base-content mb-3">条件选项分组</h3>
        <div v-for="grp in groupedConditionOptions" :key="grp.key" class="mb-2 border border-base-300 rounded-xl overflow-hidden">
          <button type="button" class="w-full flex items-center justify-between px-4 py-3 bg-base-100 font-semibold text-sm" @click="togglePanel(grp.key)">
            <span>{{ grp.title }}</span>
            <div class="flex items-center gap-2">
              <span class="text-xs text-secondary">{{ grp.items.length }}项</span>
              <span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="activeConditionGroups.includes(grp.key)?'rotate-180':''"></span>
            </div>
          </button>
          <div v-if="activeConditionGroups.includes(grp.key)" class="px-4 pb-3 pt-1 bg-base-100">
            <div class="grid grid-cols-3 gap-2">
              <button v-for="condition in grp.items" :key="condition" type="button"
                class="u-chip" :class="selectedConditions.includes(condition)?'is-active':''" @click="toggle(condition)">{{ condition }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Zodiac extra -->
      <div class="u-section">
        <h3 class="text-sm font-semibold text-base-content mb-3">额外生肖筛选（{{ selectedZodiacs.length }}）</h3>
        <div class="grid grid-cols-3 gap-2">
          <button v-for="zodiac in zodiacOptions" :key="zodiac" type="button"
            class="u-chip" :class="selectedZodiacs.includes(zodiac)?'is-active':''" @click="toggleZodiac(zodiac)">{{ zodiac }}</button>
        </div>
      </div>

      <!-- Groups -->
      <div class="u-section">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-base-content">已添加的条件组</h3>
          <button class="btn btn-xs btn-soft btn-error" @click="clearAllGroups">清空所有组</button>
        </div>
        <div v-if="groups.length===0" class="text-sm text-secondary">暂无分组</div>
        <div v-else class="space-y-3">
          <div v-for="(group, idx) in groups" :key="idx" class="space-y-2">
            <div class="flex items-center justify-between"><span class="text-sm text-secondary">第{{ idx+1 }}组</span>
              <button class="btn btn-xs btn-circle btn-ghost text-error" @click="deleteGroup(idx)"><span class="icon-[tabler--trash] size-3.5"></span></button>
            </div>
            <div class="space-y-1.5">
              <div><span class="text-xs text-secondary">条件组</span><div class="flex flex-wrap gap-2 mt-1"><span v-for="item in group.conditions" :key="item" class="inline-flex items-center justify-center min-w-[48px] min-h-9 px-2.5 rounded-full bg-primary text-primary-content font-semibold text-sm">{{ item }}</span><span v-if="!group.conditions.length" class="text-xs text-secondary">无</span></div></div>
              <div><span class="text-xs text-secondary">额外生肖</span><div class="flex flex-wrap gap-2 mt-1"><span v-for="z in group.zodiacs" :key="z" class="inline-flex items-center justify-center min-w-[48px] min-h-9 px-2.5 rounded-full bg-base-200 border border-base-300 text-sm">{{ z }}</span><span v-if="!group.zodiacs.length" class="text-xs text-secondary">无</span></div></div>
            </div>
            <div><span class="text-xs text-secondary">对应生肖（含重复）</span><div class="flex flex-wrap gap-2 mt-1">
              <span v-for="z in getGroupZodiacStats(group)" :key="z.name" class="inline-flex items-center justify-center min-w-[48px] min-h-9 px-2 rounded-full text-sm font-semibold" :class="z.count>1?'bg-error/10 text-error':'bg-base-200 text-primary'">{{ z.name }}<template v-if="z.count>1">×{{ z.count }}</template></span>
            </div></div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="u-section">
        <h3 class="text-sm font-semibold text-base-content mb-3">重复生肖统计</h3>
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
