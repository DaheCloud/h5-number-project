<script setup lang="ts">
defineOptions({ name: 'FilterNumbersPage' })

import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { PopoverAction } from 'vant'
import { useFilterLogic } from './useFilterLogic'
import FilterGroup from './components/FilterGroup.vue'
import ResultStickyHeader from './components/ResultStickyHeader.vue'

type FilterPanel = {
  name: string
  title: string
  subtitle: string
  groups: Array<{ label?: string; items: string[] }>
}

const router = useRouter()
const {
  selectedFilters,
  filteredNumbers,
  totalItems,
  toggleFilter,
  clearFilters,
  toggleExclusion,
  onSave,
  onLoad,
  getWaveColorById,
} = useFilterLogic()

const filterPanels: FilterPanel[] = [
  {
    name: 'basic',
    title: '基础属性',
    subtitle: '单双 / 波色 / 五行',
    groups: [
      { label: '单双/大小', items: ['单', '双', '大', '小'] },
      { label: '波色', items: ['红波', '绿波', '蓝波'] },
      { label: '五行', items: ['金', '木', '水', '火', '土'] },
    ],
  },
  {
    name: 'zodiac',
    title: '生肖筛选',
    subtitle: '生肖与属性联动',
    groups: [
      { items: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] },
      { label: '生肖属性', items: ['家禽', '野兽', '天肖', '地肖', '前肖', '后肖', '左肖', '右肖', '阴肖', '阳肖'] },
    ],
  },
  {
    name: 'advanced',
    title: '高级筛选',
    subtitle: '组合逻辑精筛',
    groups: [
      { label: '合数/尾数', items: ['合单', '合双', '合大', '合小', '尾大', '尾小', '大单', '小单', '大双', '小双'] },
      { label: '波色组合', items: ['红单', '红双', '绿单', '绿双', '蓝单', '蓝双'] },
      { label: '尾数精确', items: ['0尾', '1尾', '2尾', '3尾', '4尾', '5尾', '6尾', '7尾', '8尾', '9尾'] },
      { label: '头数/门数/段数', items: ['0头', '1头', '2头', '3头', '4头', '1门', '2门', '3门', '4门', '5门', '1段', '2段', '3段', '4段', '5段', '6段', '7段'] },
      { label: '合数精确', items: ['1合', '2合', '3合', '4合', '5合', '6合', '7合', '8合', '9合', '10合', '11合', '12合', '13合'] },
    ],
  },
]

const panelNames = filterPanels.map((panel) => panel.name)
const activeNames = ref([...panelNames])

const selectedCount = computed(() => selectedFilters.value.length)
const onClickLeft = () => router.back()
const expandAll = () => {
  activeNames.value = [...panelNames]
}
const collapseAll = () => {
  activeNames.value = []
}

const moreActions: PopoverAction[] = [
  { text: '保存条件', icon: 'description' },
  { text: '加载条件', icon: 'orders-o' },
  { text: '展开全部', icon: 'arrow-down' },
  { text: '收起全部', icon: 'arrow-up' },
]

const onSelectMoreAction = (action: { text: string }) => {
  if (action.text === '保存条件') {
    onSave()
    return
  }
  if (action.text === '加载条件') {
    onLoad()
    return
  }
  if (action.text === '展开全部') {
    expandAll()
    return
  }
  if (action.text === '收起全部') {
    collapseAll()
  }
}
</script>

<template>
  <div class="filter-page">
    <van-nav-bar
      title="筛选号码"
      left-arrow
      fixed
      placeholder
      class="top-nav"
      @click-left="onClickLeft"
    >
      <template #right>
        <van-popover
          placement="bottom-end"
          :actions="moreActions"
          @select="onSelectMoreAction"
        >
          <template #reference>
            <button class="round-icon" type="button" aria-label="更多操作">
              <van-icon name="ellipsis" size="17" />
            </button>
          </template>
        </van-popover>
      </template>
    </van-nav-bar>

    <main class="page-body">
      <ResultStickyHeader
        :total-items="totalItems"
        :selected-count="selectedCount"
        :selected-filters="selectedFilters"
        :filtered-numbers="filteredNumbers"
        :get-wave-color="getWaveColorById"
        @clear="clearFilters"
        @remove-filter="toggleFilter"
        @toggle-exclusion="toggleExclusion"
      />

      <section class="panel-stack">
        <van-collapse v-model="activeNames" :border="false">
          <van-collapse-item
            v-for="panel in filterPanels"
            :key="panel.name"
            :title="panel.title"
            :name="panel.name"
            class="panel-item"
          >
            <template #value>
              <span class="panel-subtitle">{{ panel.subtitle }}</span>
            </template>

            <FilterGroup
              v-for="group in panel.groups"
              :key="`${panel.name}-${group.label || group.items.join('-')}`"
              :label="group.label"
              :items="group.items"
              :selected-items="selectedFilters"
              @toggle="toggleFilter"
            />
          </van-collapse-item>
        </van-collapse>
      </section>
    </main>
  </div>
</template>

<style scoped>
.filter-page {
  min-height: 100%;
  background: #f3f4f6;
}

.top-nav {
  --van-nav-bar-background: #ffffff;
  --van-nav-bar-title-text-color: #1f2533;
  --van-nav-bar-icon-color: #1f2533;
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-soft);
}

.round-icon {
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: #fff;
  color: #374151;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.page-body {
  padding: 10px 12px 16px;
  max-width: 760px;
  margin: 0 auto;
}

.panel-stack {
  border-radius: var(--radius-lg);
}

:deep(.panel-item) {
  margin-bottom: 10px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-soft);
}

:deep(.panel-item .van-collapse-item__title) {
  padding: 13px 14px;
  background: #fff;
  color: #1f2937;
  font-weight: 700;
}

:deep(.panel-item .van-collapse-item__content) {
  background: #fff;
  padding: 12px 12px 2px;
}

.panel-subtitle {
  color: #9ca3af;
  font-size: 11px;
}

@media (min-width: 768px) {
  .page-body {
    padding: 12px 16px 20px;
  }

  .dashboard-card {
    padding: 16px;
  }
}
</style>
