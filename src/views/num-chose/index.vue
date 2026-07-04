<script setup lang="ts">
defineOptions({ name: 'NumChosePage' })
import { ref, computed, onMounted, watch } from 'vue'
import NumberButton from './components/NumberButton.vue'
import { lotteryDataService, type ZodiacKey, type WuxingKey, type WaveKey } from '@/services/lotteryData'
import { toast } from '@/utils/feedback'
import { getFilterIds, getOtherAttrIds } from '@/utils/numberMatcher'

// 手动输入弹窗状态
const showManualInputDialog = ref(false)
const manualInputText = ref('')
const customDelimiter = ref(',')

function openManualInputDialog() { showManualInputDialog.value = true }
function closeManualInputDialog() { showManualInputDialog.value = false; manualInputText.value = '' }
function handleManualInputConfirm() {
  const text = manualInputText.value.trim()
  if (!text) { toast('请输入号码'); return }
  const delimiter = customDelimiter.value || ','
  const regex = new RegExp(`[,\\s\\n${delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]+`)
  const numbers = text.split(regex).filter(s => s).map(s => isNaN(parseInt(s, 10)) ? null : parseInt(s, 10)).filter(n => n !== null && n >= 1 && n <= 49) as number[]
  if (numbers.length === 0) { toast('未识别到有效号码(1-49)'); return }
  const uniqueNumbers = [...new Set(numbers)]
  const existingSet = new Set(selectedNumbers.value); for (const n of uniqueNumbers) existingSet.add(n)
  selectedNumbers.value = Array.from(existingSet).sort((a, b) => a - b)
  toast(`已添加 ${uniqueNumbers.length} 个号码`); closeManualInputDialog()
}

// 页面状态
const activeTab = ref<'number' | 'zodiac' | 'five' | 'condition'>('number')
const selectedNumbers = ref<number[]>([])
const sortOrder = ref<'asc' | 'desc' | 'none'>('none')
const resultsExpanded = ref(true)
const filtersExpanded = ref(true)
const moreFiltersExpanded = ref(false)
const zodiacFilterExpanded = ref(false)

const tabs: { key: 'number' | 'zodiac' | 'five' | 'condition'; label: string; icon: string }[] = [
  { key: 'number', label: '数字选号', icon: 'icon-[tabler--apps]' },
  { key: 'zodiac', label: '生肖选号', icon: 'icon-[tabler--paw]' },
  { key: 'five', label: '五行选号', icon: 'icon-[tabler--yin-yang]' },
  { key: 'condition', label: '更多', icon: 'icon-[tabler--dots]' },
]
const numbers = computed(() => lotteryDataService.getAllNumbers())

// 五行选项
const elementOptions: { key: WuxingKey; label: string }[] = [
  { key: 'metal', label: '金' }, { key: 'wood', label: '木' }, { key: 'water', label: '水' }, { key: 'fire', label: '火' }, { key: 'earth', label: '土' },
]
const selectedElement = ref<WuxingKey>('metal')
const stickySelected = ref<boolean>(false)
const stickyEnabled = computed(() => stickySelected.value)
const resultsStickySelected = ref<boolean>(false)
const resultsStickyEnabled = computed(() => resultsStickySelected.value)

const idsByElement = computed(() => {
  const acc = {} as Record<WuxingKey, number[]>
  elementOptions.forEach(opt => { acc[opt.key] = numbers.value.filter(n => n.wuxing.key === opt.key).map(n => n.id).sort((a, b) => a - b) })
  return acc
})

function setElement(key: WuxingKey) { selectedElement.value = key }

const recordById = computed(() => {
  const m = new Map<number, any>(); for (const i of numbers.value) m.set(i.id, i); return m
})

// 生肖相关配置
const metaByKey: Record<ZodiacKey, { name: string; emoji: string }> = {
  rat: { name: '鼠', emoji: '🐭' }, ox: { name: '牛', emoji: '🐮' }, tiger: { name: '虎', emoji: '🐯' },
  rabbit: { name: '兔', emoji: '🐰' }, dragon: { name: '龙', emoji: '🐲' }, snake: { name: '蛇', emoji: '🐍' },
  horse: { name: '马', emoji: '🐴' }, goat: { name: '羊', emoji: '🐑' }, monkey: { name: '猴', emoji: '🐵' },
  rooster: { name: '鸡', emoji: '🐔' }, dog: { name: '狗', emoji: '🐶' }, pig: { name: '猪', emoji: '🐷' },
}

const zodiacOptions: { key: ZodiacKey; name: string; emoji: string }[] =
  (['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'] as ZodiacKey[]).map(key => ({ key, name: metaByKey[key].name, emoji: metaByKey[key].emoji }))

const zodiacFilterOptions = computed(() => zodiacFilterExpanded.value ? zodiacOptions : zodiacOptions.slice(0, 6))

const numbersByZodiac = computed(() => {
  const acc = {} as Record<ZodiacKey, number[]>
  zodiacOptions.forEach(opt => { acc[opt.key] = numbers.value.filter(n => n.zodiac.key === opt.key).map(n => n.id).sort((a, b) => a - b) })
  return acc
})

const zodiacOptionsSorted = computed(() => {
  const list = zodiacOptions.slice()
  list.sort((a, b) => { const an = numbersByZodiac.value[a.key]?.[0] ?? 999; const bn = numbersByZodiac.value[b.key]?.[0] ?? 999; return an - bn })
  return list
})

const zodiacCardOrderMode = ref<'zodiac' | 'number'>('number')
const zodiacCardList = computed(() => zodiacCardOrderMode.value === 'number' ? zodiacOptionsSorted.value : zodiacOptions)
const zodiacOrderSwitch = computed({ get() { return zodiacCardOrderMode.value === 'number' }, set(v: boolean) { zodiacCardOrderMode.value = v ? 'number' : 'zodiac' } })

// 条件过滤配置
const conditionGroups: { label: string; options: string[] }[] = [
  { label: '合单双', options: ['合单', '合双'] },
  { label: '五行', options: ['金', '木', '水', '火', '土'] },
  { label: '波色单双', options: ['红单', '红双', '绿单', '绿双', '蓝单', '蓝双'] },
  { label: '生肖', options: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] },
  { label: '门数', options: ['1门', '2门', '3门', '4门', '5门'] },
  { label: '段数', options: ['1段', '2段', '3段', '4段', '5段', '6段', '7段'] },
  { label: '合数', options: ['1合', '2合', '3合', '4合', '5合', '6合', '7合', '8合', '9合', '10合', '11合', '12合', '13合'] },
  { label: '头数', options: ['0头', '1头', '2头', '3头', '4头'] },
  { label: '尾数', options: ['0尾', '1尾', '2尾', '3尾', '4尾', '5尾', '6尾', '7尾', '8尾', '9尾', '大尾', '小尾'] },
  { label: '头单双', options: ['0头单', '1头单', '2头单', '3头单', '4头单', '0头双', '1头双', '2头双', '3头双', '4头双'] },
  { label: '合尾', options: ['0合尾', '1合尾', '2合尾', '3合尾', '4合尾', '5合尾', '6合尾', '7合尾', '8合尾', '9合尾'] },
  { label: '天肖组合', options: ['天肖', '左肖', '前肖', '阴肖', '家肖'] },
  { label: '地肖组合', options: ['地肖', '右肖', '后肖', '阳肖', '野肖'] },
]
const selectedConditionOptions = ref<string[]>([])
function toggleConditionOption(opt: string) { const i = selectedConditionOptions.value.indexOf(opt); i > -1 ? selectedConditionOptions.value.splice(i, 1) : selectedConditionOptions.value.push(opt) }
function clearAllConditions() { selectedConditionOptions.value = [] }

const conditionResultNumbers = computed(() => {
  const sets: Set<number>[] = []
  for (const g of conditionGroups) {
    const sel = selectedConditionOptions.value.filter(o => g.options.includes(o))
    if (sel.length > 0) { const u = new Set<number>(); for (const o of sel) for (const n of getFilterIds(o)) u.add(n); sets.push(u) }
  }
  if (sets.length === 0) return []
  let result = Array.from(sets[0] ?? new Set<number>())
  for (let i = 1; i < sets.length; i++) { result = result.filter(n => sets[i]!.has(n)) }
  return result.sort((a, b) => a - b)
})

watch(selectedConditionOptions, (vals) => { if (vals.length > 0) selectedNumbers.value = conditionResultNumbers.value; else selectedNumbers.value = [] }, { deep: true })

// 生肖选号
const selectedZodiacs = ref<ZodiacKey[]>([])
function toggleZodiac(key: ZodiacKey) {
  const i = selectedZodiacs.value.indexOf(key)
  if (i > -1) { selectedZodiacs.value.splice(i, 1); const removeSet = new Set(numbersByZodiac.value[key]); selectedNumbers.value = selectedNumbers.value.filter(n => !removeSet.has(n)) }
  else { selectedZodiacs.value.push(key); const set = new Set(selectedNumbers.value); for (const n of numbersByZodiac.value[key]) set.add(n); selectedNumbers.value = Array.from(set).sort((a, b) => a - b) }
}
function clearZodiac() { const remove = new Set<number>(); for (const k of selectedZodiacs.value) for (const n of numbersByZodiac.value[k]) remove.add(n); selectedZodiacs.value = []; selectedNumbers.value = selectedNumbers.value.filter(n => !remove.has(n)) }

function pad2(n: number) { return String(n).padStart(2, '0') }
function colorClassById(id: number) { const w = recordById.value.get(id)?.wave.key; return w === 'red' ? 'z-num--red' : w === 'green' ? 'z-num--green' : w === 'blue' ? 'z-num--blue' : '' }
function isZodiacActive(key: ZodiacKey) { return numbersByZodiac.value[key].some(n => selectedNumbers.value.includes(n)) }
function selectAllCurrentElement() { const set = new Set(selectedNumbers.value); for (const n of idsByElement.value[selectedElement.value]) set.add(n); selectedNumbers.value = Array.from(set).sort((a, b) => a - b) }

// Filters
const oddEvenFilter = ref<'all' | 'odd' | 'even'>('all')
const sumOddEvenFilter = ref<'all' | 'oddSum' | 'evenSum'>('all')
const selectedHeads = ref<number[]>([])
const selectedUnits = ref<number[]>([])
const selectedElementsFilter = ref<WuxingKey[]>([])
function toggleElementFilter(e: WuxingKey) { const i = selectedElementsFilter.value.indexOf(e); i > -1 ? selectedElementsFilter.value.splice(i, 1) : selectedElementsFilter.value.push(e) }
const homeWildFilter = ref<'all' | 'home' | 'wild'>('all')
const skyEarthFilter = ref<'all' | 'sky' | 'earth'>('all')
const selectedWaveColors = ref<WaveKey[]>([])
function toggleWaveColor(c: WaveKey) { const i = selectedWaveColors.value.indexOf(c); i > -1 ? selectedWaveColors.value.splice(i, 1) : selectedWaveColors.value.push(c) }
type WaveOddEven = 'red-odd' | 'red-even' | 'green-odd' | 'green-even' | 'blue-odd' | 'blue-even'
const selectedWaveOddEven = ref<WaveOddEven[]>([])
function toggleWaveOddEven(v: WaveOddEven) { const i = selectedWaveOddEven.value.indexOf(v); i > -1 ? selectedWaveOddEven.value.splice(i, 1) : selectedWaveOddEven.value.push(v) }
const selectedZodiacsFilter = ref<ZodiacKey[]>([])
function toggleZodiacFilter(k: ZodiacKey) { const i = selectedZodiacsFilter.value.indexOf(k); i > -1 ? selectedZodiacsFilter.value.splice(i, 1) : selectedZodiacsFilter.value.push(k) }
const selectedMenFilter = ref<string[]>([])
function toggleMenFilter(v: string) { const i = selectedMenFilter.value.indexOf(v); i > -1 ? selectedMenFilter.value.splice(i, 1) : selectedMenFilter.value.push(v) }
const selectedDuanFilter = ref<string[]>([])
function toggleDuanFilter(v: string) { const i = selectedDuanFilter.value.indexOf(v); i > -1 ? selectedDuanFilter.value.splice(i, 1) : selectedDuanFilter.value.push(v); }

const selectedHeShuFilter = ref<string[]>([])
function toggleHeShuFilter(v: string) { const i = selectedHeShuFilter.value.indexOf(v); i > -1 ? selectedHeShuFilter.value.splice(i, 1) : selectedHeShuFilter.value.push(v) }

const availableHeads = computed(() => { const s = new Set<number>(); for (const n of selectedNumbers.value) s.add(Math.floor(n / 10)); return Array.from(s).sort((a, b) => a - b) })
const availableUnits = computed(() => { const s = new Set<number>(); for (const n of selectedNumbers.value) s.add(n % 10); return Array.from(s).sort((a, b) => a - b) })

function toggleHead(h: number) { const i = selectedHeads.value.indexOf(h); i > -1 ? selectedHeads.value.splice(i, 1) : selectedHeads.value.push(h) }
function toggleUnit(u: number) { const i = selectedUnits.value.indexOf(u); i > -1 ? selectedUnits.value.splice(i, 1) : selectedUnits.value.push(u) }

function clearAllFilters() {
  oddEvenFilter.value = 'all'; sumOddEvenFilter.value = 'all'; selectedHeads.value = []; selectedUnits.value = []
  homeWildFilter.value = 'all'; skyEarthFilter.value = 'all'; selectedElementsFilter.value = []
  selectedWaveColors.value = []; selectedWaveOddEven.value = []; selectedZodiacsFilter.value = []
  selectedMenFilter.value = []; selectedDuanFilter.value = []; selectedHeShuFilter.value = []
  toast('已清空所有过滤')
}

const filteredGridNumbers = computed(() => numbers.value.slice())

const filteredSelectedRecords = computed(() => {
  const base = selectedNumbers.value.map(id => recordById.value.get(id)).filter((r): r is any => !!r)
  let list = base
  if (oddEvenFilter.value !== 'all') list = list.filter((i: any) => i.oddAndEven === oddEvenFilter.value)
  if (sumOddEvenFilter.value !== 'all') { const val = sumOddEvenFilter.value === 'oddSum' ? 'odd' : 'even'; list = list.filter((i: any) => i.sumOddAndEven === val) }
  if (selectedHeads.value.length > 0) list = list.filter((i: any) => selectedHeads.value.includes(i.head))
  if (selectedUnits.value.length > 0) list = list.filter((i: any) => selectedUnits.value.includes(i.tail))
  if (homeWildFilter.value !== 'all') { const key = homeWildFilter.value === 'home' ? '家禽' : '野兽'; const allowedIds = new Set(getOtherAttrIds(key)); list = list.filter((i: any) => allowedIds.has(i.id)) }
  if (skyEarthFilter.value !== 'all') { const key = skyEarthFilter.value === 'sky' ? '天肖' : '地肖'; const allowedIds = new Set(getOtherAttrIds(key)); list = list.filter((i: any) => allowedIds.has(i.id)) }
  if (selectedElementsFilter.value.length > 0) list = list.filter((i: any) => selectedElementsFilter.value.includes(i.wuxing.key))
  if (selectedWaveColors.value.length > 0) list = list.filter((i: any) => selectedWaveColors.value.includes(i.wave.key))
  if (selectedWaveOddEven.value.length > 0) list = list.filter((i: any) => selectedWaveOddEven.value.includes(`${i.wave.key}-${i.oddAndEven}` as WaveOddEven))
  if (selectedZodiacsFilter.value.length > 0) list = list.filter((i: any) => selectedZodiacsFilter.value.includes(i.zodiac.key))
  if (selectedMenFilter.value.length > 0) list = list.filter((i: any) => selectedMenFilter.value.includes(i.men))
  if (selectedDuanFilter.value.length > 0) list = list.filter((i: any) => selectedDuanFilter.value.includes(i.duan))
  if (selectedHeShuFilter.value.length > 0) { const allowedHeShu = selectedHeShuFilter.value.map(k => '合' + k.replace('合', '').padStart(2, '0')); list = list.filter((i: any) => allowedHeShu.includes(i.heShu)) }
  return list
})

const STORAGE_KEY = 'num-chose-state'
async function saveAndCopy() {
  const payload = { selectedNumbers: selectedNumbers.value, selectedZodiacs: selectedZodiacs.value, oddEvenFilter: oddEvenFilter.value, sumOddEvenFilter: sumOddEvenFilter.value, selectedHeads: selectedHeads.value, selectedUnits: selectedUnits.value, homeWildFilter: homeWildFilter.value, skyEarthFilter: skyEarthFilter.value, selectedElementsFilter: selectedElementsFilter.value, selectedWaveColors: selectedWaveColors.value, selectedWaveOddEven: selectedWaveOddEven.value, selectedZodiacsFilter: selectedZodiacsFilter.value, selectedMenFilter: selectedMenFilter.value, selectedDuanFilter: selectedDuanFilter.value, selectedHeShuFilter: selectedHeShuFilter.value, stickySelected: stickySelected.value, resultsStickySelected: resultsStickySelected.value }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)) } catch {}
  const text = filteredSelectedRecords.value.map((r: any) => pad2(Number(r.id))).join('.')
  if (!text) { toast('暂无可复制的过滤结果'); return }
  try { await navigator.clipboard.writeText(text); toast('已复制过滤结果,并保存') } catch {}
}

function deleteSaved() {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) { toast('暂无可删除记录'); return }; localStorage.removeItem(STORAGE_KEY); toast('已删除本地保存记录') } catch {}
}

onMounted(() => {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return; const data = JSON.parse(raw); if (Array.isArray(data.selectedNumbers)) selectedNumbers.value = data.selectedNumbers } catch {}
})

function getSortedNumbers() { const sorted = [...selectedNumbers.value]; sortOrder.value === 'asc' ? sorted.sort((a, b) => a - b) : sorted.sort((a, b) => b - a); return sorted }
function handleSelect(id: number) { if (typeof id !== 'number' || id < 1 || id > 49) return; const index = selectedNumbers.value.indexOf(id); index > -1 ? selectedNumbers.value.splice(index, 1) : selectedNumbers.value.push(id) }
function getWaveColorById(id: number): string { return recordById.value.get(id)?.wave.key || '' }
function clearSelectedNumbers() { selectedNumbers.value = []; sortOrder.value = 'none'; selectedConditionOptions.value = [] }
function toggleSortOrder() { if (sortOrder.value === 'none' || sortOrder.value === 'desc') sortOrder.value = 'asc'; else sortOrder.value = 'desc' }
async function copyNumbers() { if (selectedNumbers.value.length === 0) { toast('没有选中的号码可复制'); return }; try { const sortedNumbers = getSortedNumbers(); await navigator.clipboard.writeText(sortedNumbers.join('.')); toast('复制成功') } catch {} }
</script>

<template>
  <div class="flex flex-col min-h-full" style="background-color: var(--page-bg)">
    <!-- Header -->
    <div class="sticky top-0 z-50 bg-base-100 border-b border-base-200 flex items-center justify-between px-3 h-12">
      <div class="w-8"></div>
      <h1 class="text-base font-bold text-base-content">选号助手</h1>
      <div class="w-8"></div>
    </div>

    <div class="p-3 space-y-3 pb-24">
      <!-- Selected Card -->
      <section class="u-section py-3" :class="{ 'sticky top-12 z-40': stickyEnabled }">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-sm font-medium text-neutral">已选号码</span>
              <span class="text-xs text-secondary">{{ selectedNumbers.length }}/20</span>
            </div>
            <p v-if="selectedNumbers.length === 0" class="text-xs text-secondary mt-1">暂无选中数字</p>
          </div>
          <div class="flex items-center gap-3 text-xs">
            <button class="flex items-center gap-1 text-secondary hover:text-base-content transition-colors" @click="clearSelectedNumbers">
              <span class="icon-[tabler--trash] size-3.5"></span>
              <span>清空</span>
            </button>
            <button class="flex items-center gap-1 text-secondary hover:text-base-content transition-colors" @click="openManualInputDialog">
              <span class="icon-[tabler--pencil] size-3.5"></span>
              <span>手动输入</span>
            </button>
          </div>
        </div>
        <div v-if="selectedNumbers.length > 0" class="flex flex-wrap gap-2 mt-3">
          <span v-for="n in getSortedNumbers()" :key="n" class="inline-flex items-center justify-center w-9 h-9 rounded-full font-semibold text-sm cursor-pointer border transition-all"
            :class="{
              'bg-primary/10 text-primary border-primary/30': !['red','green','blue'].includes(getWaveColorById(n)),
              'bg-error/10 text-error border-error/30': getWaveColorById(n) === 'red',
              'bg-success/10 text-success border-success/30': getWaveColorById(n) === 'green',
              'bg-info/10 text-info border-info/30': getWaveColorById(n) === 'blue',
            }"
            @click="handleSelect(n)">{{ pad2(n) }}</span>
        </div>
      </section>

      <!-- Custom Tabs -->
      <div class="u-section p-1.5 overflow-hidden">
        <div class="grid grid-cols-4 gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-lg text-xs transition-colors"
            :class="activeTab === tab.key ? 'bg-primary text-primary-content shadow-sm' : 'text-secondary hover:bg-base-200'"
            @click="activeTab = tab.key"
          >
            <span :class="[tab.icon, 'size-4']"></span>
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- Five Elements -->
      <section v-if="activeTab==='five'" class="u-section">
        <div class="flex flex-wrap gap-2">
          <button v-for="opt in elementOptions" :key="opt.key" type="button" class="u-chip" :class="selectedElement===opt.key?'is-active':''" @click="setElement(opt.key)">{{ opt.label }}</button>
        </div>
        <p class="text-sm text-base-content mt-2">{{elementOptions.find(i=>i.key===selectedElement)?.label}}行号码</p>
        <div class="flex flex-wrap gap-2 mt-2">
          <NumberButton v-for="n in idsByElement[selectedElement]" :key="`el-${selectedElement}-${n}`" :id="n" :active="selectedNumbers.includes(n)" :wave-color="recordById.get(n)?.wave.key" :five-elements="recordById.get(n)?.wuxing.label" :chinese-zodiac="recordById.get(n)?.zodiac.label" :odd-and-even="recordById.get(n)?.oddAndEven==='odd'?'单':'双'" :sum-odd-and-even="recordById.get(n)?.sumOddAndEven==='odd'?'合单':'合双'" @select="handleSelect" />
        </div>
        <div class="mt-2"><button class="u-btn u-btn-primary" @click="selectAllCurrentElement"><span class="icon-[tabler--check] size-3.5"></span>全部选中</button></div>
        <div class="mt-3 text-xs text-secondary leading-relaxed">
          <div v-for="opt in elementOptions" :key="opt.key">{{ opt.label }}：{{ idsByElement[opt.key].join(', ') }}</div>
        </div>
      </section>

      <!-- Zodiac Selection -->
      <section v-else-if="activeTab==='zodiac'" class="u-section">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-neutral">生肖选号</h3>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5"><span class="text-xs text-secondary">按生肖</span><input type="checkbox" class="toggle toggle-xs" :value="zodiacCardOrderMode==='number'" @change="zodiacCardOrderMode=zodiacCardOrderMode==='number'?'zodiac':'number'" /><span class="text-xs text-secondary">按数字</span></div>
            <button class="u-btn u-btn-ghost u-btn-sm" @click="clearZodiac">清空</button>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3 mt-3">
          <div v-for="opt in zodiacCardList" :key="opt.key" class="relative flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all cursor-pointer"
            :class="isZodiacActive(opt.key)?'border-primary bg-primary/5 translate-y-[-2px]':'border-base-300'"
            @click="toggleZodiac(opt.key)">
            <div v-if="isZodiacActive(opt.key)" class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary text-primary-content flex items-center justify-center text-[11px]">✓</div>
            <div class="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center border-2" :class="isZodiacActive(opt.key)?'border-primary':'border-transparent'"><span class="text-xl">{{ opt.emoji }}</span></div>
            <span class="text-sm text-base-content">{{ opt.name }}</span>
            <div class="flex flex-wrap gap-1 justify-center">
              <span v-for="n in numbersByZodiac[opt.key]" :key="n" class="min-w-[28px] h-6 px-1.5 rounded-full text-xs inline-flex items-center justify-center border cursor-pointer transition-colors" :class="{ 'bg-primary text-primary-content border-primary': selectedNumbers.includes(n), 'bg-error/10 border-error/30 text-error': !selectedNumbers.includes(n) && recordById.get(n)?.wave.key==='red', 'bg-success/10 border-success/30 text-success': !selectedNumbers.includes(n) && recordById.get(n)?.wave.key==='green', 'bg-info/10 border-info/30 text-info': !selectedNumbers.includes(n) && recordById.get(n)?.wave.key==='blue', 'bg-base-100 border-base-300 text-secondary': !selectedNumbers.includes(n) && !['red','green','blue'].includes(recordById.get(n)?.wave.key) }" @click.stop="handleSelect(n)">{{ pad2(n) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Number Grid -->
      <section v-else-if="activeTab==='number'" class="u-section">
        <div class="grid grid-cols-7 gap-1.5 justify-items-center">
          <NumberButton v-for="number in filteredGridNumbers" :key="`num-${number.id}`" :id="Number(number.id)" :active="selectedNumbers.includes(Number(number.id))" :wave-color="number.wave.key" :five-elements="number.wuxing.label" :chinese-zodiac="number.zodiac.label" :odd-and-even="number.oddAndEven==='odd'?'单':'双'" :sum-odd-and-even="number.sumOddAndEven==='odd'?'合单':'合双'" @select="handleSelect" />
        </div>
        <p class="flex items-center justify-center gap-1 mt-3 text-xs text-secondary">
          <span class="icon-[tabler--info-circle] size-3.5"></span>
          点击号码可选择，长按可排除
        </p>
      </section>

      <!-- Condition Selection -->
      <section v-else-if="activeTab==='condition'" class="u-section">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-neutral">条件选号</h3>
          <button class="u-btn u-btn-ghost u-btn-sm" @click="clearAllConditions">清空条件</button>
        </div>
        <div v-for="group in conditionGroups" :key="group.label" class="mt-3">
          <p class="text-xs text-secondary mb-2">{{ group.label }}</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="opt in group.options" :key="opt" type="button" class="u-chip" :class="selectedConditionOptions.includes(opt)?'is-active':''" @click="toggleConditionOption(opt)">{{ opt }}</button>
          </div>
        </div>
      </section>

      <!-- Filters -->
      <section class="u-section">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-base-content flex items-center gap-1.5" @click="filtersExpanded = !filtersExpanded">
            <span class="icon-[tabler--adjustments-horizontal] size-4 text-secondary"></span>
            过滤条件
            <span class="icon-[tabler--chevron-down] size-3.5 text-secondary transition-transform" :class="filtersExpanded ? 'rotate-180' : ''"></span>
          </h3>
          <button class="text-xs text-secondary hover:text-secondary transition-colors" @click="clearAllFilters">清空</button>
        </div>

        <div v-show="filtersExpanded" class="divide-y divide-base-200 mt-1">
          <!-- 波色过滤 -->
          <div class="flex items-start gap-3 py-3">
            <div class="shrink-0 text-xs text-secondary pt-1.5 w-[3.5rem]">波色</div>
            <div class="flex flex-wrap gap-2 flex-1">
              <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedWaveColors.includes('red') ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleWaveColor('red')">红波</button>
              <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedWaveColors.includes('green') ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleWaveColor('green')">绿波</button>
              <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedWaveColors.includes('blue') ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleWaveColor('blue')">蓝波</button>
            </div>
          </div>

          <!-- 单双过滤 -->
          <div class="flex items-start gap-3 py-3">
            <div class="shrink-0 text-xs text-secondary pt-1.5 w-[3.5rem]">单双</div>
            <div class="flex flex-wrap gap-2 flex-1">
              <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="oddEvenFilter==='odd' ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="oddEvenFilter='odd'">单</button>
              <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="oddEvenFilter==='even' ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="oddEvenFilter='even'">双</button>
              <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="oddEvenFilter==='all' ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="oddEvenFilter='all'">全部</button>
            </div>
          </div>

          <!-- 五行过滤 -->
          <div class="flex items-start gap-3 py-3">
            <div class="shrink-0 text-xs text-secondary pt-1.5 w-[3.5rem]">五行</div>
            <div class="flex flex-wrap gap-2 flex-1">
              <button v-for="opt in elementOptions" :key="`fe-${opt.key}`" class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedElementsFilter.includes(opt.key) ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleElementFilter(opt.key)">{{ opt.label }}</button>
            </div>
          </div>

          <!-- 生肖过滤 -->
          <div class="flex items-start gap-3 py-3">
            <div class="shrink-0 text-xs text-secondary pt-1.5 w-[3.5rem]">生肖</div>
            <div class="flex flex-wrap gap-2 flex-1">
              <button v-for="opt in zodiacFilterOptions" :key="`zf-${opt.key}`" class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedZodiacsFilter.includes(opt.key) ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleZodiacFilter(opt.key)">{{ opt.name }}</button>
              <button class="px-2 py-1 text-xs text-primary flex items-center gap-0.5" @click="zodiacFilterExpanded = !zodiacFilterExpanded">
                {{ zodiacFilterExpanded ? '收起' : '更多' }}
                <span class="icon-[tabler--chevron-down] size-3 transition-transform" :class="zodiacFilterExpanded ? 'rotate-180' : ''"></span>
              </button>
            </div>
          </div>

          <!-- 合数过滤 -->
          <div class="flex items-start gap-3 py-3">
            <div class="shrink-0 text-xs text-secondary pt-1.5 w-[3.5rem]">合数</div>
            <div class="flex flex-wrap gap-2 flex-1">
              <button v-for="n in [1,2,3,4,5,6,7,8,9,10,11,12,13]" :key="`he-${n}`" class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedHeShuFilter.includes(`${n}合`) ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleHeShuFilter(`${n}合`)">{{ n }}合</button>
            </div>
          </div>

          <!-- 更多筛选 -->
          <div class="pt-3">
            <button class="w-full flex items-center justify-center gap-1 py-2 text-xs text-primary border border-dashed border-base-300 rounded-lg" @click="moreFiltersExpanded = !moreFiltersExpanded">
              {{ moreFiltersExpanded ? '收起更多筛选' : '展开更多筛选' }}
              <span class="icon-[tabler--chevron-down] size-3.5 transition-transform" :class="moreFiltersExpanded ? 'rotate-180' : ''"></span>
            </button>
          </div>

          <div v-show="moreFiltersExpanded" class="divide-y divide-base-200">
            <!-- 合单双过滤 -->
            <div class="flex items-start gap-3 py-3">
              <div class="shrink-0 text-xs text-secondary pt-1.5 w-[3.5rem]">合单双</div>
              <div class="flex flex-wrap gap-2 flex-1">
                <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="sumOddEvenFilter==='oddSum' ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="sumOddEvenFilter='oddSum'">合单</button>
                <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="sumOddEvenFilter==='evenSum' ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="sumOddEvenFilter='evenSum'">合双</button>
                <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="sumOddEvenFilter==='all' ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="sumOddEvenFilter='all'">全部</button>
              </div>
            </div>

            <!-- 波色单双 -->
            <div class="flex items-start gap-3 py-3">
              <div class="shrink-0 text-xs text-secondary pt-1.5 w-[3.5rem]">波色单双</div>
              <div class="flex flex-wrap gap-2 flex-1">
                <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedWaveOddEven.includes('red-odd') ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleWaveOddEven('red-odd')">红单</button>
                <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedWaveOddEven.includes('red-even') ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleWaveOddEven('red-even')">红双</button>
                <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedWaveOddEven.includes('green-odd') ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleWaveOddEven('green-odd')">绿单</button>
                <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedWaveOddEven.includes('green-even') ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleWaveOddEven('green-even')">绿双</button>
                <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedWaveOddEven.includes('blue-odd') ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleWaveOddEven('blue-odd')">蓝单</button>
                <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedWaveOddEven.includes('blue-even') ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleWaveOddEven('blue-even')">蓝双</button>
              </div>
            </div>

            <!-- 天地肖过滤 -->
            <div class="flex items-start gap-3 py-3">
              <div class="shrink-0 text-xs text-secondary pt-1.5 w-[3.5rem]">天地肖</div>
              <div class="flex flex-wrap gap-2 flex-1">
                <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="skyEarthFilter==='sky' ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="skyEarthFilter='sky'">天肖</button>
                <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="skyEarthFilter==='earth' ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="skyEarthFilter='earth'">地肖</button>
                <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="skyEarthFilter==='all' ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="skyEarthFilter='all'">全部</button>
              </div>
            </div>

            <!-- 家/野肖过滤 -->
            <div class="flex items-start gap-3 py-3">
              <div class="shrink-0 text-xs text-secondary pt-1.5 w-[3.5rem]">家野肖</div>
              <div class="flex flex-wrap gap-2 flex-1">
                <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="homeWildFilter==='home' ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="homeWildFilter='home'">家肖</button>
                <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="homeWildFilter==='wild' ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="homeWildFilter='wild'">野肖</button>
                <button class="px-3 py-1 rounded-full text-xs border transition-colors" :class="homeWildFilter==='all' ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="homeWildFilter='all'">全部</button>
              </div>
            </div>

            <!-- 门数过滤 -->
            <div class="flex items-start gap-3 py-3">
              <div class="shrink-0 text-xs text-secondary pt-1.5 w-[3.5rem]">门数</div>
              <div class="flex flex-wrap gap-2 flex-1">
                <button v-for="n in [1,2,3,4,5]" :key="`men-${n}`" class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedMenFilter.includes(`${n}门`) ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleMenFilter(`${n}门`)">{{ n }}门</button>
              </div>
            </div>

            <!-- 段数过滤 -->
            <div class="flex items-start gap-3 py-3">
              <div class="shrink-0 text-xs text-secondary pt-1.5 w-[3.5rem]">段数</div>
              <div class="flex flex-wrap gap-2 flex-1">
                <button v-for="n in [1,2,3,4,5,6,7]" :key="`duan-${n}`" class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedDuanFilter.includes(`${n}段`) ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleDuanFilter(`${n}段`)">{{ n }}段</button>
              </div>
            </div>

            <!-- 头数过滤 -->
            <div class="flex items-start gap-3 py-3">
              <div class="shrink-0 text-xs text-secondary pt-1.5 w-[3.5rem]">头数</div>
              <div class="flex flex-wrap gap-2 flex-1">
                <button v-for="h in availableHeads" :key="`head-${h}`" class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedHeads.includes(h) ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleHead(h)">{{ h }}头</button>
              </div>
            </div>

            <!-- 位数过滤 -->
            <div class="flex items-start gap-3 py-3">
              <div class="shrink-0 text-xs text-secondary pt-1.5 w-[3.5rem]">尾数</div>
              <div class="flex flex-wrap gap-2 flex-1">
                <button v-for="u in availableUnits" :key="`unit-${u}`" class="px-3 py-1 rounded-full text-xs border transition-colors" :class="selectedUnits.includes(u) ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 text-secondary border-base-300 hover:border-base-300'" @click="toggleUnit(u)">{{ u }}尾</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Filter Results -->
      <section class="u-section">
        <div class="flex items-center justify-between cursor-pointer" @click="resultsExpanded = !resultsExpanded">
          <h3 class="text-sm font-semibold text-base-content">
            当前过滤结果 <span class="text-xs font-normal text-secondary">{{ filteredSelectedRecords.length }}注</span>
          </h3>
          <button class="text-xs text-secondary flex items-center gap-0.5">
            {{ resultsExpanded ? '收起' : '展开' }}
            <span class="icon-[tabler--chevron-down] size-3.5 transition-transform" :class="resultsExpanded ? 'rotate-180' : ''"></span>
          </button>
        </div>
        <div v-if="resultsExpanded">
          <div v-if="filteredSelectedRecords.length===0" class="text-sm text-secondary mt-3">暂无过滤结果</div>
          <div v-else class="flex flex-wrap gap-2 mt-3">
            <NumberButton v-for="rec in filteredSelectedRecords" :key="`sel-${rec.id}`" :id="Number(rec.id)" :active="selectedNumbers.includes(Number(rec.id))" :wave-color="rec.wave.key" :five-elements="rec.wuxing.label" :chinese-zodiac="rec.zodiac.label" :odd-and-even="rec.oddAndEven==='odd'?'单':'双'" :sum-odd-and-even="rec.sumOddAndEven==='odd'?'合单':'合双'" @select="handleSelect" />
          </div>
        </div>
      </section>

      <!-- Save Bar -->
      <div class="flex flex-col gap-2 pt-1">
        <button class="w-full h-11 rounded-xl bg-primary text-primary-content text-sm font-semibold shadow-md shadow-accent active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5" @click="saveAndCopy">
          <span class="icon-[tabler--copy] size-4"></span>
          复制保存
        </button>
        <button class="w-full h-10 text-sm text-red-500 hover:text-red-600 active:scale-[0.98] transition-transform" @click="deleteSaved">
          删除本地记录
        </button>
      </div>

      <!-- Manual Input Drawer from bottom -->
      <div v-if="showManualInputDialog" class="fixed inset-0 z-[100]">
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/40" />
        <!-- Drawer 内容 -->
        <div class="absolute inset-x-0 bottom-0 bg-base-100 rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)]" style="max-height: 85vh; overflow-y: auto;">
          <div class="drawer-header relative flex items-center justify-center px-4 py-3.5 border-b border-base-200">
            <h3 class="text-base font-semibold text-neutral">手动输入号码</h3>
            <button type="button" class="btn btn-text btn-circle btn-sm absolute end-3 top-1/2 -translate-y-1/2" @click="closeManualInputDialog" aria-label="Close">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>
          <div class="drawer-body px-4 py-4 space-y-3">
            <div class="space-y-1.5">
              <label class="text-xs text-secondary">号码</label>
              <textarea
                v-model="manualInputText"
                class="w-full min-h-[100px] px-3 py-2 text-sm text-neutral bg-base-100 border border-base-300 rounded-lg outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-secondary resize-none"
                placeholder="请输入号码，多个号码用逗号、空格、换行或英文句号分隔，支持1-49的数字"
                rows="6"
              />
            </div>
            <div class="flex items-center gap-2 pt-2">
              <span class="text-xs text-secondary whitespace-nowrap">自定义分隔符</span>
              <input
                v-model="customDelimiter"
                type="text"
                class="flex-1 h-9 px-3 text-sm text-neutral bg-base-100 border border-base-300 rounded-lg outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-secondary"
                placeholder="请输入分隔符"
                maxlength="5"
              />
            </div>
          </div>
          <div class="drawer-footer px-4 py-3 border-t border-base-200 flex items-center gap-2">
            <button
              class="u-btn u-btn-ghost flex-1 h-10"
              @click="closeManualInputDialog"
            >
              取消
            </button>
            <button
              class="u-btn u-btn-primary flex-1 h-10"
              @click="handleManualInputConfirm"
            >
              <span class="icon-[tabler--check] size-4"></span>
              确认
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
