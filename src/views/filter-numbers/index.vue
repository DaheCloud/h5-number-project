<script setup lang="ts">
defineOptions({ name: 'FilterNumbersPage' })
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFilterLogic } from './useFilterLogic'
import FilterGroup from './components/FilterGroup.vue'
import ResultStickyHeader from './components/ResultStickyHeader.vue'

type FilterPanel = { name: string; title: string; subtitle: string; groups: Array<{ label?: string; items: string[] }> }

const router = useRouter()
const { selectedFilters, filteredNumbers, totalItems, toggleFilter, clearFilters, toggleExclusion, onSave, onLoad, getWaveColorById } = useFilterLogic()

const filterPanels: FilterPanel[] = [
  { name: 'basic', title: '基础属性', subtitle: '单双 / 波色 / 五行', groups: [{ label: '单双/大小', items: ['单','双','大','小'] }, { label: '波色', items: ['红波','绿波','蓝波'] }, { label: '五行', items: ['金','木','水','火','土'] }] },
  { name: 'zodiac', title: '生肖筛选', subtitle: '生肖与属性联动', groups: [{ items: ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'] }, { label: '生肖属性', items: ['家禽','野兽','天肖','地肖','前肖','后肖','左肖','右肖','阴肖','阳肖'] }] },
  { name: 'advanced', title: '高级筛选', subtitle: '组合逻辑精筛', groups: [{ label: '合数/尾数', items: ['合单','合双','合大','合小','尾大','尾小','大单','小单','大双','小双'] }, { label: '波色组合', items: ['红单','红双','绿单','绿双','蓝单','蓝双'] }, { label: '尾数精确', items: ['0尾','1尾','2尾','3尾','4尾','5尾','6尾','7尾','8尾','9尾'] }, { label: '头数/门数/段数', items: ['0头','1头','2头','3头','4头','1门','2门','3门','4门','5门','1段','2段','3段','4段','5段','6段','7段'] }, { label: '合数精确', items: ['1合','2合','3合','4合','5合','6合','7合','8合','9合','10合','11合','12合','13合'] }] },
]

const panelNames = filterPanels.map(p => p.name)
const activeNames = ref([...panelNames])
const selectedCount = computed(() => selectedFilters.value.length)
const onClickLeft = () => router.back()
const expandAll = () => { activeNames.value = [...panelNames] }
const collapseAll = () => { activeNames.value = [] }

const moreActions = ['保存条件', '加载条件', '展开全部', '收起全部']
const showMore = ref(false)
const onSelectMoreAction = (action: string) => {
  showMore.value = false
  if (action === '保存条件') onSave()
  else if (action === '加载条件') onLoad()
  else if (action === '展开全部') expandAll()
  else if (action === '收起全部') collapseAll()
}

function togglePanel(name: string) {
  const i = activeNames.value.indexOf(name)
  i > -1 ? activeNames.value.splice(i, 1) : activeNames.value.push(name)
}
</script>

<template>
  <div class="filter-page min-h-screen bg-[#f3f4f6]">
    <!-- Navbar -->
    <div class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 py-3">
      <button class="btn btn-text btn-sm btn-circle mr-2" @click="onClickLeft"><span class="icon-[tabler--arrow-left] size-5"></span></button>
      <h1 class="text-base font-bold text-[#1f2937] flex-1">筛选号码</h1>
      <div class="relative">
        <button type="button" class="btn btn-text btn-sm btn-circle" @click="showMore=!showMore"><span class="icon-[tabler--dots] size-5"></span></button>
        <div v-if="showMore" class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-32 py-1" @click.stop>
          <button v-for="action in moreActions" :key="action" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" @click="onSelectMoreAction(action)">{{ action }}</button>
        </div>
      </div>
    </div>

    <main class="px-3 pb-5 max-w-[760px] mx-auto">
      <ResultStickyHeader :total-items="totalItems" :selected-count="selectedCount" :selected-filters="selectedFilters" :filtered-numbers="filteredNumbers" :get-wave-color="getWaveColorById" @clear="clearFilters" @remove-filter="toggleFilter" @toggle-exclusion="toggleExclusion" />

      <!-- Panels: custom accordion -->
      <div class="space-y-2.5">
        <div v-for="panel in filterPanels" :key="panel.name" class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <button type="button" class="w-full flex items-center justify-between px-4 py-3.5 font-bold text-sm text-[#1f2937]" @click="togglePanel(panel.name)">
            <span>{{ panel.title }}</span>
            <div class="flex items-center gap-2">
              <span class="text-[11px] text-gray-400">{{ panel.subtitle }}</span>
              <span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="activeNames.includes(panel.name)?'rotate-180':''"></span>
            </div>
          </button>
          <div v-if="activeNames.includes(panel.name)" class="px-3 pb-3">
            <FilterGroup v-for="group in panel.groups" :key="`${panel.name}-${group.label||group.items.join('-')}`" :label="group.label" :items="group.items" :selected-items="selectedFilters" @toggle="toggleFilter" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
