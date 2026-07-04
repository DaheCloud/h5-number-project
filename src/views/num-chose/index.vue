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
function toggleDuanFilter(v: string) { const i = selectedDuanFilter.value.indexOf(v); i > -1 ? selectedDuanFilter.value.splice(i, 1) : selectedMenFilter.value.push(v); }

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
  <div class="flex flex-col min-h-screen bg-[#f3f4f6]">
    <!-- Navbar -->
    <div class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 py-3">
      <h1 class="text-base font-bold text-[#1f2937]">选号助手</h1>
      <span class="icon-[tabler--settings] size-5 text-gray-600"></span>
    </div>

    <div class="p-3 pb-20 space-y-3">
      <!-- Selected Card -->
      <section class="bg-white rounded-2xl p-3 shadow-sm border border-gray-200" :class="{ 'sticky top-[49px] z-40': stickyEnabled }">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-700">已选号码</span>
            <span class="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full border border-gray-200 bg-white text-xs text-gray-500">{{ selectedNumbers.length }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">置顶</span>
            <input type="checkbox" class="toggle toggle-sm" v-model="stickySelected" />
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-2">
          <span v-for="n in getSortedNumbers()" :key="n" class="inline-flex items-center justify-center w-9 h-9 rounded-full font-semibold text-sm cursor-pointer"
            :class="{
              'bg-[#2f3137] text-white': !['red','green','blue'].includes(getWaveColorById(n)),
              'bg-red-500 text-white': getWaveColorById(n) === 'red',
              'bg-green-500 text-white': getWaveColorById(n) === 'green',
              'bg-blue-500 text-white': getWaveColorById(n) === 'blue',
            }"
            @click="handleSelect(n)">{{ pad2(n) }}</span>
          <span v-if="selectedNumbers.length===0" class="text-sm text-gray-400">暂无选中数字</span>
        </div>
        <div class="flex gap-2 mt-3 flex-wrap">
          <button class="btn btn-xs btn-primary" @click="copyNumbers">复制号码</button>
          <button class="btn btn-xs btn-ghost" @click="clearSelectedNumbers">清空</button>
          <button class="btn btn-xs btn-ghost" @click="openManualInputDialog">
            <span class="icon-[tabler--arrow-bar-down] size-3.5 mr-1"></span>手动输入
          </button>
          <button v-if="selectedNumbers.length>0" class="btn btn-xs btn-ghost" @click="toggleSortOrder">
            <span class="size-3.5 mr-1" :class="sortOrder==='asc'?'icon-[tabler--arrow-up]':sortOrder==='desc'?'icon-[tabler--arrow-down]':'icon-[tabler--arrows-sort]'"></span>
            {{ sortOrder === 'asc' ? '升序' : sortOrder === 'desc' ? '降序' : '排序' }}
          </button>
        </div>
      </section>

      <!-- Custom Tabs -->
      <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div class="tabs tabs-boxed flex p-1 gap-0 w-full">
          <button class="tab tab-sm flex-1" :class="activeTab==='number'?'tab-active':''" @click="activeTab='number'">数字选号</button>
          <button class="tab tab-sm flex-1" :class="activeTab==='zodiac'?'tab-active':''" @click="activeTab='zodiac'">生肖选号</button>
          <button class="tab tab-sm flex-1" :class="activeTab==='five'?'tab-active':''" @click="activeTab='five'">五行选号</button>
          <button class="tab tab-sm flex-1" :class="activeTab==='condition'?'tab-active':''" @click="activeTab='condition'">条件选号</button>
        </div>
      </div>

      <!-- Five Elements -->
      <section v-if="activeTab==='five'" class="bg-white rounded-2xl p-3 border border-gray-200">
        <div class="flex flex-wrap gap-2">
          <button v-for="opt in elementOptions" :key="opt.key" type="button" class="u-chip" :class="selectedElement===opt.key?'is-active':''" @click="setElement(opt.key)">{{ opt.label }}</button>
        </div>
        <p class="text-sm text-gray-700 mt-2">{{elementOptions.find(i=>i.key===selectedElement)?.label}}行号码</p>
        <div class="flex flex-wrap gap-2 mt-2">
          <NumberButton v-for="n in idsByElement[selectedElement]" :key="`el-${selectedElement}-${n}`" :id="n" :active="selectedNumbers.includes(n)" :wave-color="recordById.get(n)?.wave.key" :five-elements="recordById.get(n)?.wuxing.label" :chinese-zodiac="recordById.get(n)?.zodiac.label" :odd-and-even="recordById.get(n)?.oddAndEven==='odd'?'单':'双'" :sum-odd-and-even="recordById.get(n)?.sumOddAndEven==='odd'?'合单':'合双'" @select="handleSelect" />
        </div>
        <div class="mt-2"><button class="btn btn-sm btn-primary btn-outline" @click="selectAllCurrentElement">全部选中</button></div>
        <div class="mt-3 text-xs text-gray-400 leading-relaxed">
          <div v-for="opt in elementOptions" :key="opt.key">{{ opt.label }}：{{ idsByElement[opt.key].join(', ') }}</div>
        </div>
      </section>

      <!-- Zodiac Selection -->
      <section v-else-if="activeTab==='zodiac'" class="bg-white rounded-2xl p-3 border border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-800">生肖选号</h3>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5"><span class="text-xs text-gray-400">按生肖</span><input type="checkbox" class="toggle toggle-xs" :value="zodiacCardOrderMode==='number'" @change="zodiacCardOrderMode=zodiacCardOrderMode==='number'?'zodiac':'number'" /><span class="text-xs text-gray-400">按数字</span></div>
            <button class="btn btn-xs btn-ghost" @click="clearZodiac">清空</button>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3 mt-3">
          <div v-for="opt in zodiacCardList" :key="opt.key" class="relative flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all cursor-pointer"
            :class="isZodiacActive(opt.key)?'border-[#2f3137] bg-[#2f3137]/4 translate-y-[-2px]':'border-gray-200'"
            @click="toggleZodiac(opt.key)">
            <div v-if="isZodiacActive(opt.key)" class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#2f3137] text-white flex items-center justify-center text-[11px]">✓</div>
            <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border-2" :class="isZodiacActive(opt.key)?'border-[#2f3137]':'border-transparent'"><span class="text-xl">{{ opt.emoji }}</span></div>
            <span class="text-sm text-gray-700">{{ opt.name }}</span>
            <div class="flex flex-wrap gap-1 justify-center">
              <span v-for="n in numbersByZodiac[opt.key]" :key="n" class="min-w-[28px] h-6 px-1.5 rounded-full text-xs inline-flex items-center justify-center border cursor-pointer" :class="{ 'bg-[#2f3137] text-white border-[#2f3137]': selectedNumbers.includes(n), 'border-red-400 text-red-500': !selectedNumbers.includes(n) && recordById.get(n)?.wave.key==='red', 'border-green-400 text-green-600': !selectedNumbers.includes(n) && recordById.get(n)?.wave.key==='green', 'border-blue-400 text-blue-500': !selectedNumbers.includes(n) && recordById.get(n)?.wave.key==='blue', 'border-gray-200 text-gray-500': !selectedNumbers.includes(n) && !['red','green','blue'].includes(recordById.get(n)?.wave.key) }" @click.stop="handleSelect(n)">{{ pad2(n) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Number Grid -->
      <section v-else-if="activeTab==='number'" class="bg-white rounded-2xl p-3 border border-gray-200">
        <div class="grid grid-cols-7 sm:grid-cols-7 xs:grid-cols-5 gap-2 justify-items-center">
          <NumberButton v-for="number in filteredGridNumbers" :key="`num-${number.id}`" :id="Number(number.id)" :active="selectedNumbers.includes(Number(number.id))" :wave-color="number.wave.key" :five-elements="number.wuxing.label" :chinese-zodiac="number.zodiac.label" :odd-and-even="number.oddAndEven==='odd'?'单':'双'" :sum-odd-and-even="number.sumOddAndEven==='odd'?'合单':'合双'" @select="handleSelect" />
        </div>
      </section>

      <!-- Condition Selection -->
      <section v-else-if="activeTab==='condition'" class="bg-white rounded-2xl p-3 border border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-800">条件选号</h3>
          <button class="btn btn-xs btn-ghost" @click="clearAllConditions">清空条件</button>
        </div>
        <div v-for="group in conditionGroups" :key="group.label" class="mt-3">
          <p class="text-xs text-gray-400 mb-2">{{ group.label }}</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="opt in group.options" :key="opt" type="button" class="u-chip" :class="selectedConditionOptions.includes(opt)?'is-active':''" @click="toggleConditionOption(opt)">{{ opt }}</button>
          </div>
        </div>
      </section>

      <!-- Filters -->
      <section class="bg-white rounded-2xl p-3 border border-gray-200">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-500">过滤条件</h3>
          <button class="btn btn-xs btn-ghost" @click="clearAllFilters">清空所有过滤</button>
        </div>

        <!-- 五行过滤 -->
        <div class="mb-3"><p class="text-xs text-gray-400 mb-2">五行过滤</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="opt in elementOptions" :key="`fe-${opt.key}`" class="u-chip" :class="selectedElementsFilter.includes(opt.key)?'is-active':''" @click="toggleElementFilter(opt.key)">{{ opt.label }}</button>
            <button v-if="selectedElementsFilter.length" class="btn btn-xs btn-ghost" @click="selectedElementsFilter=[]">清空五行</button>
          </div>
        </div>

        <!-- 波色过滤 -->
        <div class="mb-3"><p class="text-xs text-gray-400 mb-2">波色过滤</p>
          <div class="flex flex-wrap gap-2">
            <button class="u-chip" :class="selectedWaveColors.includes('red')?'is-active':''" @click="toggleWaveColor('red')">红波</button>
            <button class="u-chip" :class="selectedWaveColors.includes('green')?'is-active':''" @click="toggleWaveColor('green')">绿波</button>
            <button class="u-chip" :class="selectedWaveColors.includes('blue')?'is-active':''" @click="toggleWaveColor('blue')">蓝波</button>
            <button v-if="selectedWaveColors.length" class="btn btn-xs btn-ghost" @click="selectedWaveColors=[]">清空波色</button>
          </div>
        </div>

        <!-- 十二生肖过滤 -->
        <div class="mb-3"><p class="text-xs text-gray-400 mb-2">十二生肖过滤</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="opt in zodiacOptions" :key="`zf-${opt.key}`" class="u-chip" :class="selectedZodiacsFilter.includes(opt.key)?'is-active':''" @click="toggleZodiacFilter(opt.key)">{{ opt.name }}</button>
            <button v-if="selectedZodiacsFilter.length" class="btn btn-xs btn-ghost" @click="selectedZodiacsFilter=[]">清空生肖</button>
          </div>
        </div>

        <!-- 门数过滤 -->
        <div class="mb-3"><p class="text-xs text-gray-400 mb-2">门数过滤</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="n in [1,2,3,4,5]" :key="`men-${n}`" class="u-chip" :class="selectedMenFilter.includes(`${n}门`)?'is-active':''" @click="toggleMenFilter(`${n}门`)">{{ n }}门</button>
            <button v-if="selectedMenFilter.length" class="btn btn-xs btn-ghost" @click="selectedMenFilter=[]">清空门数</button>
          </div>
        </div>

        <!-- 段数过滤 -->
        <div class="mb-3"><p class="text-xs text-gray-400 mb-2">段数过滤</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="n in [1,2,3,4,5,6,7]" :key="`duan-${n}`" class="u-chip" :class="selectedDuanFilter.includes(`${n}段`)?'is-active':''" @click="toggleDuanFilter(`${n}段`)">{{ n }}段</button>
            <button v-if="selectedDuanFilter.length" class="btn btn-xs btn-ghost" @click="selectedDuanFilter=[]">清空段数</button>
          </div>
        </div>

        <!-- 合数过滤 -->
        <div class="mb-3"><p class="text-xs text-gray-400 mb-2">合数过滤</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="n in [1,2,3,4,5,6,7,8,9,10,11,12,13]" :key="`he-${n}`" class="u-chip" :class="selectedHeShuFilter.includes(`${n}合`)?'is-active':''" @click="toggleHeShuFilter(`${n}合`)">{{ n }}合</button>
            <button v-if="selectedHeShuFilter.length" class="btn btn-xs btn-ghost" @click="selectedHeShuFilter=[]">清空合数</button>
          </div>
        </div>

        <!-- 单双过滤 -->
        <div class="mb-3"><p class="text-xs text-gray-400 mb-2">单双过滤</p>
          <div class="flex flex-wrap gap-2">
            <button class="u-chip" :class="oddEvenFilter==='odd'?'is-active':''" @click="oddEvenFilter='odd'">单</button>
            <button class="u-chip" :class="oddEvenFilter==='even'?'is-active':''" @click="oddEvenFilter='even'">双</button>
            <button class="u-chip" :class="oddEvenFilter==='all'?'is-active':''" @click="oddEvenFilter='all'">全部</button>
          </div>
        </div>

        <!-- 合单双过滤 -->
        <div class="mb-3"><p class="text-xs text-gray-400 mb-2">合单双过滤</p>
          <div class="flex flex-wrap gap-2">
            <button class="u-chip" :class="sumOddEvenFilter==='oddSum'?'is-active':''" @click="sumOddEvenFilter='oddSum'">合单</button>
            <button class="u-chip" :class="sumOddEvenFilter==='evenSum'?'is-active':''" @click="sumOddEvenFilter='evenSum'">合双</button>
            <button class="u-chip" :class="sumOddEvenFilter==='all'?'is-active':''" @click="sumOddEvenFilter='all'">全部</button>
          </div>
        </div>

        <!-- 家/野肖 -->
        <div class="mb-3"><p class="text-xs text-gray-400 mb-2">家/野肖过滤</p>
          <div class="flex flex-wrap gap-2">
            <button class="u-chip" :class="homeWildFilter==='home'?'is-active':''" @click="homeWildFilter='home'">家肖</button>
            <button class="u-chip" :class="homeWildFilter==='wild'?'is-active':''" @click="homeWildFilter='wild'">野肖</button>
            <button class="u-chip" :class="homeWildFilter==='all'?'is-active':''" @click="homeWildFilter='all'">全部</button>
          </div>
        </div>

        <!-- 天/地肖 -->
        <div class="mb-3"><p class="text-xs text-gray-400 mb-2">天/地肖过滤</p>
          <div class="flex flex-wrap gap-2">
            <button class="u-chip" :class="skyEarthFilter==='sky'?'is-active':''" @click="skyEarthFilter='sky'">天肖</button>
            <button class="u-chip" :class="skyEarthFilter==='earth'?'is-active':''" @click="skyEarthFilter='earth'">地肖</button>
            <button class="u-chip" :class="skyEarthFilter==='all'?'is-active':''" @click="skyEarthFilter='all'">全部</button>
          </div>
        </div>

        <!-- 波色单双 -->
        <div class="mb-3"><p class="text-xs text-gray-400 mb-2">波色单双过滤</p>
          <div class="flex flex-wrap gap-2">
            <button class="u-chip" :class="selectedWaveOddEven.includes('red-odd')?'is-active':''" @click="toggleWaveOddEven('red-odd')">红单</button>
            <button class="u-chip" :class="selectedWaveOddEven.includes('red-even')?'is-active':''" @click="toggleWaveOddEven('red-even')">红双</button>
            <button class="u-chip" :class="selectedWaveOddEven.includes('green-odd')?'is-active':''" @click="toggleWaveOddEven('green-odd')">绿单</button>
            <button class="u-chip" :class="selectedWaveOddEven.includes('green-even')?'is-active':''" @click="toggleWaveOddEven('green-even')">绿双</button>
            <button class="u-chip" :class="selectedWaveOddEven.includes('blue-odd')?'is-active':''" @click="toggleWaveOddEven('blue-odd')">蓝单</button>
            <button class="u-chip" :class="selectedWaveOddEven.includes('blue-even')?'is-active':''" @click="toggleWaveOddEven('blue-even')">蓝双</button>
            <button v-if="selectedWaveOddEven.length" class="btn btn-xs btn-ghost" @click="selectedWaveOddEven=[]">清空</button>
          </div>
        </div>

        <!-- 头数过滤 -->
        <div class="mb-3"><p class="text-xs text-gray-400 mb-2">头数过滤</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="h in availableHeads" :key="`head-${h}`" class="u-chip" :class="selectedHeads.includes(h)?'is-active':''" @click="toggleHead(h)">{{ h }}</button>
            <button v-if="availableHeads.length" class="btn btn-xs btn-ghost" @click="selectedHeads=[]">清空头数</button>
          </div>
        </div>

        <!-- 位数过滤 -->
        <div class="mb-3"><p class="text-xs text-gray-400 mb-2">位数过滤</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="u in availableUnits" :key="`unit-${u}`" class="u-chip" :class="selectedUnits.includes(u)?'is-active':''" @click="toggleUnit(u)">{{ u }}</button>
            <button v-if="availableUnits.length" class="btn btn-xs btn-ghost" @click="selectedUnits=[]">清空位数</button>
          </div>
        </div>
      </section>

      <!-- Filter Results -->
      <section class="bg-white rounded-2xl p-3 border border-gray-200" :class="{ 'fixed top-0 left-0 w-full z-50': resultsStickyEnabled }">
        <div class="flex items-center justify-between">
          <h3 class="text-sm text-gray-500">过滤结果（基于已选）<span class="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 ml-2 rounded-full border border-gray-200 bg-white text-xs text-gray-500">{{ filteredSelectedRecords.length }}</span></h3>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">置顶</span>
            <input type="checkbox" class="toggle toggle-sm" v-model="resultsStickySelected" />
          </div>
        </div>
        <div v-if="filteredSelectedRecords.length===0" class="text-sm text-gray-400 mt-3">暂无过滤结果</div>
        <div v-else class="flex flex-wrap gap-2 mt-3">
          <NumberButton v-for="rec in filteredSelectedRecords" :key="`sel-${rec.id}`" :id="Number(rec.id)" :active="selectedNumbers.includes(Number(rec.id))" :wave-color="rec.wave.key" :five-elements="rec.wuxing.label" :chinese-zodiac="rec.zodiac.label" :odd-and-even="rec.oddAndEven==='odd'?'单':'双'" :sum-odd-and-even="rec.sumOddAndEven==='odd'?'合单':'合双'" @select="handleSelect" />
        </div>
      </section>

      <!-- Save Bar -->
      <div class="flex flex-col gap-2">
        <button class="btn btn-primary w-full" @click="saveAndCopy">复制保存</button>
        <button class="btn btn-error btn-outline w-full" @click="deleteSaved">删除本地记录</button>
      </div>

      <!-- Manual Input Popup (Drawer from bottom) -->
      <div v-if="showManualInputDialog" class="overlay overlay-open:opacity-100" role="dialog" tabindex="-1" @click.self="closeManualInputDialog">
        <div class="modal-dialog modal-bottom-end w-full max-w-full">
          <div class="modal-content rounded-t-2xl">
            <div class="modal-header">
              <h3 class="modal-title">手动输入号码</h3>
              <button type="button" class="btn btn-text btn-circle btn-sm absolute end-3 top-3" @click="closeManualInputDialog"><span class="icon-[tabler--x] size-4"></span></button>
            </div>
            <div class="modal-body space-y-3">
              <textarea v-model="manualInputText" class="textarea textarea-bordered w-full min-h-[100px]" placeholder="请输入号码，多个号码用逗号、空格、换行或英文句号分隔，支持1-49的数字" rows="6"></textarea>
              <div class="flex items-center gap-2 pt-3 border-t border-dashed border-gray-200">
                <span class="text-xs text-gray-400 whitespace-nowrap">自定义分隔符：</span>
                <input v-model="customDelimiter" type="text" class="input input-bordered input-sm flex-1" placeholder="请输入分隔符" maxlength="5" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary w-full" @click="handleManualInputConfirm">确认</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
