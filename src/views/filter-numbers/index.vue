<script setup lang="ts">
defineOptions({ name: 'FilterNumbersPage' })
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFilterLogic } from './useFilterLogic'
import ResultStickyHeader from './components/ResultStickyHeader.vue'

const router = useRouter()
const {
  selectedFilters, filteredNumbers, totalItems,
  toggleFilter, clearFilters, toggleExclusion,
  onSave, onLoad, getWaveColorById,
  groupedByZodiac,
} = useFilterLogic()

const selectedCount = computed(() => selectedFilters.value.length)
const onClickLeft = () => router.back()

// ── 分区折叠状态 ──
const sectionNames = ['basic', 'zodiac', 'headTail', 'composite']
const expandedSections = ref(['basic', 'zodiac', 'headTail'])

function toggleSection(name: string) {
  const i = expandedSections.value.indexOf(name)
  i > -1 ? expandedSections.value.splice(i, 1) : expandedSections.value.push(name)
}

// 统计每个分区的选中数量
const basicKeys = ['单', '双', '大', '小', '红波', '绿波', '蓝波', '金', '木', '水', '火', '土']
const zodiacKeys = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪', '家禽', '野兽', '天肖', '地肖', '前肖', '后肖', '左肖', '右肖', '阴肖', '阳肖', '红单', '红双', '绿单', '绿双', '蓝单', '蓝双']
const headTailKeys = ['0头', '1头', '2头', '3头', '4头', '0尾', '1尾', '2尾', '3尾', '4尾', '5尾', '6尾', '7尾', '8尾', '9尾']
const compositeKeys = ['合单', '合双', '合大', '合小', '尾大', '尾小', '大单', '小单', '大双', '小双', '1门', '2门', '3门', '4门', '5门', '1段', '2段', '3段', '4段', '5段', '6段', '7段', '1合', '2合', '3合', '4合', '5合', '6合', '7合', '8合', '9合', '10合', '11合', '12合', '13合']

function countIn(keys: string[]): number {
  return keys.filter(k => selectedFilters.value.includes(k)).length
}

// ── 更多操作 ──
const moreActions = ['保存条件', '加载条件', '展开全部', '收起全部']
const showMore = ref(false)
const onSelectMoreAction = (action: string) => {
  showMore.value = false
  if (action === '保存条件') onSave()
  else if (action === '加载条件') onLoad()
  else if (action === '展开全部') expandedSections.value = [...sectionNames]
  else if (action === '收起全部') expandedSections.value = []
}

function waveClass(item: string): string {
  if (item === '红波') return 'chip-wave--red'
  if (item === '绿波') return 'chip-wave--green'
  if (item === '蓝波') return 'chip-wave--blue'
  return ''
}
function waveComboClass(item: string): string {
  if (item.startsWith('红')) return 'cwc--red'
  if (item.startsWith('绿')) return 'cwc--green'
  if (item.startsWith('蓝')) return 'cwc--blue'
  return ''
}
</script>

<template>
  <div class="filter-page min-h-full" style="background-color: var(--page-bg)">
    <!-- ═══ 顶部导航栏：紧凑单行 ═══ -->
    <header class="filter-navbar sticky top-0 z-50">
      <button class="btn btn-text btn-sm btn-circle" @click="onClickLeft">
        <span class="icon-[tabler--arrow-left] size-5"></span>
      </button>
      <div class="flex-1 px-2 min-w-0">
        <h1 class="text-base font-bold text-base-content truncate">高级号码筛选</h1>
      </div>
      <div v-if="selectedCount > 0" class="filter-count-badge">{{ selectedCount }}</div>
      <button class="btn btn-text btn-sm text-secondary" @click="clearFilters">
        <span class="icon-[tabler--rotate-ccw] size-4"></span>
      </button>
      <div class="relative">
        <button type="button" class="btn btn-text btn-sm btn-circle" @click="showMore = !showMore">
          <span class="icon-[tabler--dots] size-5"></span>
        </button>
        <div
          v-if="showMore"
          class="absolute right-0 top-full mt-1 bg-base-100 border border-base-300 rounded-xl shadow-lg z-50 min-w-32 py-1"
          @click.stop
        >
          <button
            v-for="action in moreActions"
            :key="action"
            class="w-full text-left px-4 py-2 text-sm hover:bg-base-200 text-base-content"
            @click="onSelectMoreAction(action)"
          >{{ action }}</button>
        </div>
      </div>
    </header>

    <!-- ═══ 主内容区 ═══ -->
    <main class="px-3 py-3 max-w-[640px] mx-auto space-y-2.5">
      <ResultStickyHeader
        :total-items="totalItems"
        :selected-count="selectedCount"
        :selected-filters="selectedFilters"
        :filtered-numbers="filteredNumbers"
        :get-wave-color="getWaveColorById"
        :grouped-by-zodiac="groupedByZodiac"
        @clear="clearFilters"
        @remove-filter="toggleFilter"
        @toggle-exclusion="toggleExclusion"
      />

      <!-- ─── 分区1：基础属性快速筛选 ─── -->
      <section class="filter-section">
        <button type="button" class="section-header" @click="toggleSection('basic')">
          <div class="flex items-center gap-2 min-w-0">
            <span class="section-indicator"></span>
            <h2 class="text-[13px] font-bold text-base-content truncate">基础属性</h2>
            <span v-if="countIn(basicKeys) > 0" class="section-count">{{ countIn(basicKeys) }}</span>
          </div>
          <span
            class="icon-[tabler--chevron-down] size-4 text-secondary transition-transform duration-200"
            :class="{ 'rotate-180': expandedSections.includes('basic') }"
          ></span>
        </button>

        <div v-if="expandedSections.includes('basic')" class="section-body">
          <div class="filter-block">
            <div class="segmented-grid grid-cols-4">
              <button
                v-for="item in ['单', '双', '大', '小']"
                :key="item"
                type="button"
                class="segmented-chip"
                :class="{ 'segmented-chip--active': selectedFilters.includes(item) }"
                @click="toggleFilter(item)"
              >{{ item }}</button>
            </div>
          </div>

          <div class="filter-block">
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="item in ['红波', '绿波', '蓝波']"
                :key="item"
                type="button"
                class="chip-wave"
                :class="[waveClass(item), { 'chip-wave--active': selectedFilters.includes(item) }]"
                @click="toggleFilter(item)"
              >{{ item }}</button>
            </div>
          </div>

          <div class="filter-block">
            <div class="grid grid-cols-5 gap-1.5">
              <button
                v-for="item in ['金', '木', '水', '火', '土']"
                :key="item"
                type="button"
                class="chip-wuxing"
                :class="{ 'chip-wuxing--active': selectedFilters.includes(item) }"
                @click="toggleFilter(item)"
              >{{ item }}</button>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── 分区2：生肖与联动属性 ─── -->
      <section class="filter-section">
        <button type="button" class="section-header" @click="toggleSection('zodiac')">
          <div class="flex items-center gap-2 min-w-0">
            <span class="section-indicator"></span>
            <h2 class="text-[13px] font-bold text-base-content truncate">生肖与联动</h2>
            <span v-if="countIn(zodiacKeys) > 0" class="section-count">{{ countIn(zodiacKeys) }}</span>
          </div>
          <span
            class="icon-[tabler--chevron-down] size-4 text-secondary transition-transform duration-200"
            :class="{ 'rotate-180': expandedSections.includes('zodiac') }"
          ></span>
        </button>

        <div v-if="expandedSections.includes('zodiac')" class="section-body">
          <div class="filter-block">
            <div class="grid grid-cols-6 gap-1.5">
              <button
                v-for="item in ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']"
                :key="item"
                type="button"
                class="chip-zodiac"
                :class="{ 'chip-zodiac--active': selectedFilters.includes(item) }"
                @click="toggleFilter(item)"
              >{{ item }}</button>
            </div>
          </div>

          <div class="filter-block">
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="item in ['家禽', '野兽', '天肖', '地肖', '前肖', '后肖', '左肖', '右肖', '阴肖', '阳肖', '红单', '红双', '绿单', '绿双', '蓝单', '蓝双']"
                :key="item"
                type="button"
                class="chip-tag"
                :class="[waveComboClass(item), { 'chip-tag--active': selectedFilters.includes(item) }]"
                @click="toggleFilter(item)"
              >{{ item }}</button>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── 分区3：头数与尾数精确控制 ─── -->
      <section class="filter-section">
        <button type="button" class="section-header" @click="toggleSection('headTail')">
          <div class="flex items-center gap-2 min-w-0">
            <span class="section-indicator"></span>
            <h2 class="text-[13px] font-bold text-base-content truncate">头数与尾数</h2>
            <span v-if="countIn(headTailKeys) > 0" class="section-count">{{ countIn(headTailKeys) }}</span>
          </div>
          <span
            class="icon-[tabler--chevron-down] size-4 text-secondary transition-transform duration-200"
            :class="{ 'rotate-180': expandedSections.includes('headTail') }"
          ></span>
        </button>

        <div v-if="expandedSections.includes('headTail')" class="section-body">
          <div class="filter-block">
            <div class="text-[10px] font-semibold text-secondary">头数</div>
            <div class="grid grid-cols-5 gap-1.5">
              <button
                v-for="item in ['0头', '1头', '2头', '3头', '4头']"
                :key="item"
                type="button"
                class="chip-tail"
                :class="{ 'chip-tail--active': selectedFilters.includes(item) }"
                @click="toggleFilter(item)"
              >{{ item }}</button>
            </div>
          </div>

          <div class="filter-block">
            <div class="text-[10px] font-semibold text-secondary">尾数</div>
            <div class="grid grid-cols-5 gap-1.5">
              <button
                v-for="item in ['0尾', '1尾', '2尾', '3尾', '4尾', '5尾', '6尾', '7尾', '8尾', '9尾']"
                :key="item"
                type="button"
                class="chip-tail"
                :class="{ 'chip-tail--active': selectedFilters.includes(item) }"
                @click="toggleFilter(item)"
              >{{ item }}</button>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── 分区4：合数与门段（默认折叠） ─── -->
      <section class="filter-section">
        <button type="button" class="section-header" @click="toggleSection('composite')">
          <div class="flex items-center gap-2 min-w-0">
            <span
              class="w-1 h-3.5 rounded-full"
              :class="expandedSections.includes('composite') ? 'bg-primary' : 'bg-base-300'"
            ></span>
            <h2
              class="text-[13px] font-bold truncate"
              :class="expandedSections.includes('composite') ? 'text-base-content' : 'text-secondary'"
            >合数与门段高级</h2>
            <span v-if="countIn(compositeKeys) > 0" class="section-count">{{ countIn(compositeKeys) }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span
              v-if="!expandedSections.includes('composite') && countIn(compositeKeys) === 0"
              class="text-[10px] text-secondary bg-base-200 px-1.5 py-0.5 rounded-full"
            >收起</span>
            <span
              class="icon-[tabler--chevron-down] size-4 text-secondary transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.includes('composite') }"
            ></span>
          </div>
        </button>

        <div v-if="expandedSections.includes('composite')" class="section-body">
          <div class="filter-block">
            <div class="text-[10px] font-semibold text-secondary mb-1">合数 / 尾数</div>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="item in ['合单', '合双', '合大', '合小', '尾大', '尾小', '大单', '小单', '大双', '小双']"
                :key="item"
                type="button"
                class="chip-tag"
                :class="{ 'chip-tag--active': selectedFilters.includes(item) }"
                @click="toggleFilter(item)"
              >{{ item }}</button>
            </div>
          </div>

          <div class="filter-block">
            <div class="text-[10px] font-semibold text-secondary mb-1">门数 / 段数</div>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="item in ['1门', '2门', '3门', '4门', '5门', '1段', '2段', '3段', '4段', '5段', '6段', '7段']"
                :key="item"
                type="button"
                class="chip-tag"
                :class="{ 'chip-tag--active': selectedFilters.includes(item) }"
                @click="toggleFilter(item)"
              >{{ item }}</button>
            </div>
          </div>

          <div class="filter-block">
            <div class="text-[10px] font-semibold text-secondary mb-1">合数精确</div>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="item in ['1合', '2合', '3合', '4合', '5合', '6合', '7合', '8合', '9合', '10合', '11合', '12合', '13合']"
                :key="item"
                type="button"
                class="chip-tag"
                :class="{ 'chip-tag--active': selectedFilters.includes(item) }"
                @click="toggleFilter(item)"
              >{{ item }}</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ═══ 导航栏：单行紧凑 ═══ */
.filter-navbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: color-mix(in srgb, var(--color-base-100) 80%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-base-300);
}

.filter-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--color-primary);
  color: var(--color-primary-content);
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

/* ═══ 分区卡片 ═══ */
.filter-section {
  background: var(--color-base-100);
  border-radius: 12px;
  border: 1px solid var(--color-base-300);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  cursor: pointer;
  border: none;
  background: transparent;
  color: inherit;
  gap: 8px;
}

.section-indicator {
  width: 3px;
  height: 14px;
  background: var(--color-primary);
  border-radius: 999px;
  flex-shrink: 0;
}

.section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 16px;
  padding: 0 5px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-primary) 18%, transparent);
  color: var(--color-primary);
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

.section-body {
  padding: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-block {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* ═══ 分段控件（单双大小） ═══ */
.segmented-grid {
  display: grid;
  gap: 4px;
  padding: 3px;
  background: var(--color-base-200);
  border-radius: 10px;
}

.segmented-chip {
  position: relative;
  height: 30px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  background: transparent;
  color: var(--color-secondary);
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, box-shadow 0.15s, transform 0.1s;
}

.segmented-chip:active { transform: scale(0.96); }
.segmented-chip:hover { color: var(--color-base-content); }

.segmented-chip--active {
  background: var(--color-primary);
  color: var(--color-primary-content);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 45%, transparent), inset 0 0 0 2px color-mix(in srgb, var(--color-primary) 50%, #000);
  font-weight: 700;
}

/* ═══ 波色按钮（大色块） ═══ */
.chip-wave {
  position: relative;
  height: 34px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  background: var(--color-base-200);
  color: var(--color-secondary);
  border: 1px solid var(--color-base-300);
  overflow: hidden;
}
.chip-wave:active { transform: scale(0.96); }

.chip-wave--red {
  color: var(--color-error);
  border-color: color-mix(in srgb, var(--color-error) 35%, transparent);
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
}
.chip-wave--green {
  color: var(--color-success);
  border-color: color-mix(in srgb, var(--color-success) 35%, transparent);
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
}
.chip-wave--blue {
  color: var(--color-info);
  border-color: color-mix(in srgb, var(--color-info) 35%, transparent);
  background: color-mix(in srgb, var(--color-info) 8%, transparent);
}

.chip-wave--active.chip-wave--red {
  background: var(--color-error);
  border-color: var(--color-error);
  color: var(--color-error-content);
  box-shadow: 0 2px 10px color-mix(in srgb, var(--color-error) 55%, transparent), inset 0 0 0 2px color-mix(in srgb, var(--color-error) 50%, #000);
}
.chip-wave--active.chip-wave--red:hover { filter: brightness(1.08); }
.chip-wave--active.chip-wave--green {
  background: var(--color-success);
  border-color: var(--color-success);
  color: var(--color-success-content);
  box-shadow: 0 2px 10px color-mix(in srgb, var(--color-success) 55%, transparent), inset 0 0 0 2px color-mix(in srgb, var(--color-success) 50%, #000);
}
.chip-wave--active.chip-wave--green:hover { filter: brightness(1.08); }
.chip-wave--active.chip-wave--blue {
  background: var(--color-info);
  border-color: var(--color-info);
  color: var(--color-info-content);
  box-shadow: 0 2px 10px color-mix(in srgb, var(--color-info) 55%, transparent), inset 0 0 0 2px color-mix(in srgb, var(--color-info) 50%, #000);
}
.chip-wave--active.chip-wave--blue:hover { filter: brightness(1.08); }

/* ═══ 五行 ═══ */
.chip-wuxing {
  height: 30px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--color-base-200);
  color: var(--color-secondary);
  border: none;
}
.chip-wuxing:active { transform: scale(0.96); }
.chip-wuxing:not(.chip-wuxing--active):hover {
  background: var(--color-base-300);
  color: var(--color-base-content);
}
.chip-wuxing--active {
  background: var(--color-primary);
  color: var(--color-primary-content);
  font-weight: 700;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 45%, transparent), inset 0 0 0 2px color-mix(in srgb, var(--color-primary) 50%, #000);
}
.chip-wuxing--active:hover {
  filter: brightness(1.08);
}

/* ═══ 生肖：6 列更紧凑 ═══ */
.chip-zodiac {
  height: 32px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--color-base-200);
  color: var(--color-secondary);
  border: 1px solid transparent;
}
.chip-zodiac:active { transform: scale(0.96); }
.chip-zodiac:not(.chip-zodiac--active):hover { background: var(--color-base-300); }
.chip-zodiac--active {
  background: var(--color-primary);
  color: var(--color-primary-content);
  border-color: var(--color-primary);
  font-weight: 700;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 45%, transparent), inset 0 0 0 2px color-mix(in srgb, var(--color-primary) 50%, #000);
}
.chip-zodiac--active:hover {
  background: var(--color-primary);
  color: var(--color-primary-content);
  filter: brightness(1.08);
}

/* ═══ 标签芯片（多属性） ═══ */
.chip-tag {
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--color-base-200);
  color: var(--color-secondary);
  border: 1px solid transparent;
  white-space: nowrap;
}
.chip-tag:active { transform: scale(0.96); }
.chip-tag:not(.chip-tag--active):hover {
  background: var(--color-base-300);
  color: var(--color-base-content);
}
.chip-tag--active {
  background: var(--color-primary);
  color: var(--color-primary-content);
  font-weight: 700;
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 45%, transparent), inset 0 0 0 2px color-mix(in srgb, var(--color-primary) 50%, #000);
}
.chip-tag--active:hover { filter: brightness(1.08); }
/* 标签芯片波色变体：未选中时按波色着色，选中时实色填充 */
.chip-tag.cwc--red:not(.chip-tag--active) { color: var(--color-error); }
.chip-tag.cwc--green:not(.chip-tag--active) { color: var(--color-success); }
.chip-tag.cwc--blue:not(.chip-tag--active) { color: var(--color-info); }

.chip-tag.cwc--red.chip-tag--active {
  background: var(--color-error);
  border-color: var(--color-error);
  color: var(--color-error-content);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-error) 45%, transparent), inset 0 0 0 2px color-mix(in srgb, var(--color-error) 50%, #000);
}
.chip-tag.cwc--red.chip-tag--active:hover { filter: brightness(1.08); }
.chip-tag.cwc--green.chip-tag--active {
  background: var(--color-success);
  border-color: var(--color-success);
  color: var(--color-success-content);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-success) 45%, transparent), inset 0 0 0 2px color-mix(in srgb, var(--color-success) 50%, #000);
}
.chip-tag.cwc--green.chip-tag--active:hover { filter: brightness(1.08); }
.chip-tag.cwc--blue.chip-tag--active {
  background: var(--color-info);
  border-color: var(--color-info);
  color: var(--color-info-content);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-info) 45%, transparent), inset 0 0 0 2px color-mix(in srgb, var(--color-info) 50%, #000);
}
.chip-tag.cwc--blue.chip-tag--active:hover { filter: brightness(1.08); }

/* ═══ 尾数 ═══ */
.chip-tail {
  height: 30px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--color-base-200);
  color: var(--color-secondary);
  border: none;
}
.chip-tail:active { transform: scale(0.96); }
.chip-tail:not(.chip-tail--active):hover {
  background: var(--color-base-300);
  color: var(--color-base-content);
}
.chip-tail--active {
  background: var(--color-primary);
  color: var(--color-primary-content);
  font-weight: 700;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 45%, transparent), inset 0 0 0 2px color-mix(in srgb, var(--color-primary) 50%, #000);
}
.chip-tail--active:hover {
  filter: brightness(1.08);
}

/* ═══ 选中态勾选角标：右上角小圆点 ═══ */
.segmented-chip--active::after,
.chip-wuxing--active::after,
.chip-zodiac--active::after,
.chip-tail--active::after {
  content: "";
  position: absolute;
  top: 3px;
  right: 3px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
}
</style>
