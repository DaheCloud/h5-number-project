<script setup lang="ts">
defineOptions({ name: 'ConditionFilter' })
import { computed, ref } from 'vue'
import { lotteryDataService } from '@/services/lotteryData'
import { computeRanking } from '@/utils/zodiac'
import { confirmDialog, toast } from '@/utils/feedback'

type ConditionGroup = {
  conditions: string[]
  zodiacs: string[]
}

type ConditionOptionGroup = {
  key: string
  title: string
  items: string[]
}

const conditionOptions = lotteryDataService.getOtherAttributeOptions()
const zodiacOptions = lotteryDataService.getZodiacOptions().map((item) => item.label)

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
] as const

const groupedConditionOptions = computed<ConditionOptionGroup[]>(() => {
  const remaining = [...conditionOptions]
  const groups: ConditionOptionGroup[] = []

  conditionGroupRules.forEach((rule) => {
    const matched = remaining.filter((item) => rule.patterns.some((pattern) => pattern.test(item)))
    if (matched.length > 0) {
      groups.push({ key: rule.key, title: rule.title, items: matched })
      matched.forEach((item) => {
        const idx = remaining.indexOf(item)
        if (idx > -1) remaining.splice(idx, 1)
      })
    }
  })

  if (remaining.length > 0) {
    groups.push({ key: 'other', title: '其他', items: remaining })
  }

  return groups
})

const activeConditionGroups = ref<string[]>(conditionGroupRules.slice(0, 2).map((item) => item.key))

const ranking = computed(() => {
  const zodiacGroups = groups.value.map((group) => {
    const zodiacs = group.conditions.flatMap((condition) => lotteryDataService.getOtherAttributeZodiacs(condition))
    zodiacs.push(...group.zodiacs)
    return zodiacs
  })

  return computeRanking(zodiacGroups)
})

function toggle(condition: string) {
  const index = selectedConditions.value.indexOf(condition)
  if (index > -1) selectedConditions.value.splice(index, 1)
  else selectedConditions.value.push(condition)
}

function toggleZodiac(zodiac: string) {
  const index = selectedZodiacs.value.indexOf(zodiac)
  if (index > -1) selectedZodiacs.value.splice(index, 1)
  else selectedZodiacs.value.push(zodiac)
}

function clearCurrent() {
  selectedConditions.value = []
  selectedZodiacs.value = []
}

async function copySelected() {
  if (selected.value.length === 0) {
    toast('暂无选择')
    return
  }

  try {
    await navigator.clipboard.writeText(selected.value.join('、'))
    toast('复制成功')
  } catch {
    toast('复制失败')
  }
}

function confirmGroup() {
  if (selectedConditions.value.length === 0 && selectedZodiacs.value.length === 0) {
    toast('请先选择条件')
    return
  }

  groups.value = [
    ...groups.value,
    {
      conditions: [...selectedConditions.value],
      zodiacs: [...selectedZodiacs.value],
    },
  ]
  selectedConditions.value = []
  selectedZodiacs.value = []
  toast('已添加一组')
}

async function clearAllGroups() {
  try {
    await confirmDialog({
      title: '确认操作',
      message: '确定要清空所有条件组吗？此操作不可撤销',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      showCancelButton: true,
    })
    groups.value = []
    selectedConditions.value = []
    selectedZodiacs.value = []
    toast('所有组已成功清空')
  } catch {}
}

function deleteGroup(index: number) {
  groups.value.splice(index, 1)
  toast('已删除该组')
}

function getGroupZodiacStats(group: ConditionGroup) {
  const fromConditions = group.conditions.flatMap((condition) => lotteryDataService.getOtherAttributeZodiacs(condition))
  const all = [...fromConditions, ...group.zodiacs]
  const counter = new Map<string, number>()

  all.forEach((zodiac) => {
    counter.set(zodiac, (counter.get(zodiac) || 0) + 1)
  })

  return Array.from(counter.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

defineExpose({
  refresh: () => {
    selectedConditions.value = []
    selectedZodiacs.value = []
    toast('已刷新条件筛选')
  },
})
</script>

<template>
  <div class="condition-filter-comp">
    <div class="content">
      <section class="selected-card">
        <div class="selected-head">
          <span class="selected-title">已选条件</span>
        </div>
        <div class="condition-tags">
          <span v-for="item in selected" :key="item" class="tag tag--selected">{{ item }}</span>
          <span v-if="selected.length === 0" class="tag tag--empty">暂无选择</span>
        </div>
        <div class="actions">
          <van-button size="small" plain type="primary" @click="copySelected">复制</van-button>
          <van-button size="small" plain @click="clearCurrent">清空</van-button>
          <van-button size="small" type="primary" @click="confirmGroup">确认本组</van-button>
        </div>
      </section>

      <section class="grid-section">
        <div class="section-title">条件选项分组</div>
        <van-collapse v-model="activeConditionGroups" :border="false" class="condition-collapse">
          <van-collapse-item
            v-for="group in groupedConditionOptions"
            :key="group.key"
            :title="group.title"
            :name="group.key"
            class="condition-collapse-item"
          >
            <template #value>
              <span class="collapse-meta">{{ group.items.length }}项</span>
            </template>
            <div class="grid">
              <button
                v-for="condition in group.items"
                :key="condition"
                type="button"
                class="chip"
                :class="selectedConditions.includes(condition) ? 'chip--active' : ''"
                @click="toggle(condition)"
              >
                {{ condition }}
              </button>
            </div>
          </van-collapse-item>
        </van-collapse>
      </section>

      <section class="grid-section">
        <div class="section-title">额外生肖筛选（{{ selectedZodiacs.length }}）</div>
        <div class="grid zodiac-grid">
          <button
            v-for="zodiac in zodiacOptions"
            :key="zodiac"
            type="button"
            class="chip"
            :class="selectedZodiacs.includes(zodiac) ? 'chip--active' : ''"
            @click="toggleZodiac(zodiac)"
          >
            {{ zodiac }}
          </button>
        </div>
      </section>

      <section class="groups-section">
        <div class="groups-head">
          <h3 class="section-title">已添加的条件组</h3>
          <van-button size="small" type="danger" plain @click="clearAllGroups">
            <van-icon name="delete" />
            <span class="ml-4">清空所有组</span>
          </van-button>
        </div>
        <div v-if="groups.length === 0" class="empty">暂无分组</div>
        <div v-else class="groups">
          <div v-for="(group, index) in groups" :key="index" class="group">
            <div class="group-head">
              <span class="group-title">第{{ index + 1 }}组</span>
              <van-button
                icon="delete"
                size="mini"
                type="danger"
                plain
                class="group-delete-btn"
                @click="deleteGroup(index)"
              />
            </div>
            <div class="group-tags">
              <div class="group-tags-block">
                <span class="group-tags-label">条件组</span>
                <div class="group-tags-items">
                  <span v-for="item in group.conditions" :key="item" class="tag tag--selected">{{ item }}</span>
                  <span v-if="group.conditions.length === 0" class="tag tag--empty">无</span>
                </div>
              </div>
              <div class="group-tags-block">
                <span class="group-tags-label">额外生肖</span>
                <div class="group-tags-items">
                  <span v-for="zodiac in group.zodiacs" :key="`z-${zodiac}`" class="tag tag--extra">{{ zodiac }}</span>
                  <span v-if="group.zodiacs.length === 0" class="tag tag--empty">无</span>
                </div>
              </div>
            </div>
            <div class="group-zodiacs">
              <span class="group-zodiacs__label">对应生肖（含重复）</span>
              <div class="group-zodiacs__tags">
                <span
                  v-for="zodiac in getGroupZodiacStats(group)"
                  :key="zodiac.name"
                  class="tag tag--derived"
                  :class="zodiac.count > 1 ? 'tag--repeat' : ''"
                >
                  {{ zodiac.name }}<template v-if="zodiac.count > 1">×{{ zodiac.count }}</template>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="stats-section">
        <h3 class="section-title">重复生肖统计</h3>
        <div v-if="ranking.length === 0" class="empty">暂无数据</div>
        <div v-else class="stats">
          <div v-for="item in ranking" :key="item.name" class="stat-row">
            <div class="stat-label">{{ item.name }}</div>
            <div class="stat-bar">
              <div class="stat-fill" :style="{ width: Math.round(item.ratio * 100) + '%' }"></div>
            </div>
            <div class="stat-meta">{{ (item.ratio * 100).toFixed(1) }}%（{{ item.count }}）</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.condition-filter-comp { display: flex; flex-direction: column; height: 100%; }
.content { padding: 12px; padding-bottom: 80px; }
.selected-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: var(--space-3);
  box-shadow: var(--shadow-soft);
}
.selected-head { display: flex; align-items: center; justify-content: space-between; }
.selected-title { font-size: 14px; color: var(--color-text); }
.condition-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.tag { display: inline-flex; align-items: center; justify-content: center; min-width: 48px; min-height: 36px; padding: 0 10px; border-radius: 999px; font-weight: 600; font-size: 14px; }
.tag--selected { background: var(--color-primary); color: #fff; }
.tag--extra { background: #f8fafc; color: var(--color-text); border: 1px solid var(--color-border); }
.tag--derived { background: rgba(47, 49, 55, 0.12); color: var(--color-primary); }
.tag--repeat { background: #fee2e2; color: #b91c1c; }
.tag--empty { background: #f3f4f6; color: var(--color-text-muted); border: 1px dashed var(--color-border); }
.actions { display: flex; gap: 8px; margin-top: 10px; }
.grid-section { margin-top: 12px; background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-3); }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2); }
.condition-collapse { margin-top: 8px; }
.collapse-meta { font-size: 12px; color: var(--color-text-muted); }
.condition-collapse-item { border: 1px solid var(--color-border); border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 8px; }
:deep(.condition-collapse-item .van-collapse-item__title) { background: #fff; font-weight: 600; }
:deep(.condition-collapse-item .van-collapse-item__content) { background: #fff; padding: 10px 0 4px; }
.zodiac-grid { margin-top: 10px; }
.chip { padding: 10px 12px; border-radius: var(--radius-full); border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); font-size: 14px; transition: transform .12s ease, box-shadow .12s ease, background-color .12s ease, border-color .12s ease; }
.chip:hover { box-shadow: var(--shadow-soft); transform: translateY(-1px); }
.chip:active { transform: translateY(-2px); }
.chip--active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.groups-section { margin-top: 24px; background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-3); box-shadow: var(--shadow-soft); }
.groups-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-title { color: var(--color-text); }
.groups { display: flex; flex-direction: column; gap: 12px; }
.group { display: flex; flex-direction: column; gap: 8px; }
.group-head { display: flex; align-items: center; justify-content: space-between; }
.group-title { font-size: 13px; color: var(--color-text-muted); }
.group-tags { display: flex; flex-direction: column; gap: 8px; }
.group-tags-block { display: flex; flex-direction: column; gap: 6px; }
.group-tags-label { font-size: 12px; color: var(--color-text-muted); }
.group-tags-items { display: flex; flex-wrap: wrap; gap: 8px; }
.group-zodiacs { display: flex; flex-direction: column; gap: 8px; }
.group-zodiacs__label { font-size: 12px; color: var(--color-text-muted); }
.group-zodiacs__tags { display: flex; flex-wrap: wrap; gap: 8px; }
.empty { font-size: 13px; color: var(--color-text-muted); }
.group-delete-btn { min-width: auto; width: 28px; height: 28px; padding: 0; border-radius: 999px; }
.stats-section { margin-top: 12px; background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-3); }
.stats { display: flex; flex-direction: column; gap: 10px; }
.stat-row { display: grid; grid-template-columns: 60px 1fr 80px; align-items: center; gap: 8px; }
.stat-label { font-size: 14px; color: var(--color-text); }
.stat-bar { height: 10px; background: #f3f4f6; border-radius: var(--radius-full); overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,.06); }
.stat-fill { height: 100%; background: var(--color-primary); transition: width .25s ease; }
.stat-meta { text-align: right; font-size: 12px; color: var(--color-text-muted); }
@media (max-width: 480px) { .grid { grid-template-columns: repeat(3, 1fr); } }
</style>
