<script setup lang="ts">
defineOptions({ name: 'NumChosePage' })
import { ref, computed, onMounted, watch } from 'vue'
import NumberButton from './components/NumberButton.vue'
import { lotteryDataService, type ZodiacKey, type WuxingKey } from '@/services/lotteryData'
import { toast } from '@/utils/feedback'
import { getFilterIds } from '@/utils/numberMatcher'

// 手动输入弹窗状态
const showManualInputDialog = ref(false)
const manualInputText = ref('')
const customDelimiter = ref(',')
// 手动输入的号码池（作为条件选号的筛选基数）
const manualNumbers = ref<number[]>([])

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
  manualNumbers.value = Array.from(new Set([...manualNumbers.value, ...uniqueNumbers])).sort((a, b) => a - b)
  // 有条件时结果由条件决定（手动池作为基数）；无条件时直接合并
  if (includeConditionOptions.value.length > 0 || excludeConditionOptions.value.length > 0) {
    selectedNumbers.value = conditionHitNumbers.value
  } else {
    const existingSet = new Set(selectedNumbers.value); for (const n of uniqueNumbers) existingSet.add(n)
    selectedNumbers.value = Array.from(existingSet).sort((a, b) => a - b)
  }
  toast(`已添加 ${uniqueNumbers.length} 个号码`); closeManualInputDialog()
}

// 页面状态
const activeTab = ref<'number' | 'zodiac' | 'five' | 'condition'>('number')
const selectedNumbers = ref<number[]>([])
const sortOrder = ref<'asc' | 'desc' | 'none'>('none')

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

// 条件选号配置（与 filter-numbers 过滤条件对齐：基础属性/生肖联动/头尾/合数门段）
type ConditionChipType = 'wave' | 'wuxing' | 'zodiac' | 'tag' | 'tail'
interface ConditionSubGroup { label: string; type: ConditionChipType; options: string[] }
interface ConditionGroup {
  label: string
  type: ConditionChipType | 'combined'
  options: string[]
  groups?: ConditionSubGroup[]
}
interface ConditionSection { name: string; groups: ConditionGroup[] }

const conditionSections: ConditionSection[] = [
  { name: '常用', groups: [
    { label: '生肖', type: 'zodiac', options: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] },
    { label: '头数', type: 'tail', options: ['0头', '1头', '2头', '3头', '4头'] },
    { label: '尾数', type: 'tail', options: ['0尾', '1尾', '2尾', '3尾', '4尾', '5尾', '6尾', '7尾', '8尾', '9尾'] },
    { label: '属性', type: 'combined', options: [], groups: [
      { label: '单双大小', type: 'tag', options: ['单', '双', '大', '小'] },
      { label: '五行', type: 'wuxing', options: ['金', '木', '水', '火', '土'] },
      { label: '波色单双', type: 'wave', options: ['红单', '红双', '绿单', '绿双', '蓝单', '蓝双'] },
    ]},
    { label: '波色', type: 'wave', options: ['红波', '绿波', '蓝波'] },
  ]},
  { name: '其他', groups: [
    { label: '门数', type: 'tag', options: ['1门', '2门', '3门', '4门', '5门'] },
    { label: '段数', type: 'tag', options: ['1段', '2段', '3段', '4段', '5段', '6段', '7段'] },
    { label: '合数', type: 'tag', options: ['1合', '2合', '3合', '4合', '5合', '6合', '7合', '8合', '9合', '10合', '11合', '12合', '13合'] },
    { label: '家禽野兽', type: 'tag', options: ['家禽', '野兽'] },
    { label: '男/女肖', type: 'tag', options: ['男肖', '女肖'] },
    { label: '肉/菜/草肖', type: 'tag', options: ['肉肖', '菜肖', '草肖'] },
    { label: '前/后/左/右肖', type: 'tag', options: ['前肖', '后肖', '左肖', '右肖'] },
    { label: '阴/阳肖', type: 'tag', options: ['阴肖', '阳肖'] },
    { label: '季节', type: 'tag', options: ['春', '夏', '秋', '冬'] },
    { label: '天气', type: 'tag', options: ['风', '雨', '雷', '电'] },
    { label: '琴棋书画', type: 'tag', options: ['琴', '棋', '书', '画'] },
    { label: '合单双', type: 'tag', options: ['合单', '合双'] },
    { label: '合大小', type: 'tag', options: ['合大', '合小'] },
    { label: '尾大小', type: 'tag', options: ['尾大', '尾小'] },
    { label: '大小单双', type: 'tag', options: ['大单', '小单', '大双', '小双'] },
  ]},
]


// 波色样式辅助（与 filter-numbers 一致：未选中按波色着色，选中实色填充）
function waveClass(label: string): string {
  if (label.startsWith('红')) return 'chip-wave--red'
  if (label.startsWith('绿')) return 'chip-wave--green'
  if (label.startsWith('蓝')) return 'chip-wave--blue'
  return ''
}
// 按 chip 类型拼装 class
function conditionChipClass(type: ConditionChipType | 'combined', opt: string, active: boolean): string {
  switch (type) {
    case 'wave': return `chip-wave ${waveClass(opt)} ${active ? 'chip-wave--active' : ''}`
    case 'wuxing': return `chip-wuxing ${active ? 'chip-wuxing--active' : ''}`
    case 'zodiac': return `chip-zodiac ${active ? 'chip-zodiac--active' : ''}`
    case 'tail': return `chip-tail ${active ? 'chip-tail--active' : ''}`
    default: return `chip-tag ${active ? 'chip-tag--active' : ''}`
  }
}
// 包含 / 排除 两分区（各分区内条件组间为 AND，组内 OR；排除取并集）
const includeExpanded = ref(true)
const excludeExpanded = ref(false)
// 常用 / 其他 分组切换
const includeGroupTab = ref<'常用' | '其他'>('常用')
const excludeGroupTab = ref<'常用' | '其他'>('常用')
const includeConditionOptions = ref<string[]>([])
const excludeConditionOptions = ref<string[]>([])
function toggleIncludeOption(opt: string) { const i = includeConditionOptions.value.indexOf(opt); i > -1 ? includeConditionOptions.value.splice(i, 1) : includeConditionOptions.value.push(opt) }
function toggleExcludeOption(opt: string) { const i = excludeConditionOptions.value.indexOf(opt); i > -1 ? excludeConditionOptions.value.splice(i, 1) : excludeConditionOptions.value.push(opt) }
function clearAllConditions() { includeConditionOptions.value = []; excludeConditionOptions.value = [] }

const conditionGroups = computed<ConditionSubGroup[]>(() =>
  conditionSections.flatMap(s => s.groups).flatMap(g => g.type === 'combined' && g.groups ? g.groups : [g as ConditionSubGroup])
)
const conditionGroupNames = computed<('常用' | '其他')[]>(() => conditionSections.map(s => s.name as '常用' | '其他'))

// 包含结果：组内 OR、组间 AND（交集）
const includeResultNumbers = computed(() => {
  const sets: Set<number>[] = []
  for (const g of conditionGroups.value) {
    const sel = includeConditionOptions.value.filter(o => g.options.includes(o))
    if (sel.length > 0) { const u = new Set<number>(); for (const o of sel) for (const n of getFilterIds(o)) u.add(n); sets.push(u) }
  }
  if (sets.length === 0) return []
  let result = Array.from(sets[0] ?? new Set<number>())
  for (let i = 1; i < sets.length; i++) { result = result.filter(n => sets[i]!.has(n)) }
  return result.sort((a, b) => a - b)
})

// 排除集合：满足任一排除条件即排除（并集）
const excludeResultNumbers = computed(() => {
  const u = new Set<number>()
  for (const o of excludeConditionOptions.value) for (const n of getFilterIds(o)) u.add(n)
  return u
})

// 当前条件下命中的号码（独立于 selectedNumbers，实时反映包含/排除结果）
// 基数：优先使用手动输入的号码池，否则为全部号码
const conditionHitNumbers = computed(() => {
  const hasInclude = includeConditionOptions.value.length > 0
  const hasExclude = excludeConditionOptions.value.length > 0
  if (!hasInclude && !hasExclude) return manualNumbers.value.slice().sort((a, b) => a - b)
  const pool = manualNumbers.value.length > 0 ? manualNumbers.value : numbers.value.map(n => n.id)
  let base = hasInclude ? includeResultNumbers.value.filter(n => pool.includes(n)) : pool.slice()
  if (hasExclude) base = base.filter(n => !excludeResultNumbers.value.has(n))
  return base.sort((a, b) => a - b)
})

watch([includeConditionOptions, excludeConditionOptions], () => {
  selectedNumbers.value = conditionHitNumbers.value
}, { deep: true })
const conditionHitPreview = computed(() => conditionHitNumbers.value.slice(0, 20))
function waveHitClass(id: number): string {
  const w = recordById.value.get(id)?.wave.key
  if (w === 'red') return 'bg-error/10 text-error border-error/30'
  if (w === 'green') return 'bg-success/10 text-success border-success/30'
  if (w === 'blue') return 'bg-info/10 text-info border-info/30'
  return 'bg-primary/10 text-primary border-primary/30'
}
function copyConditionHit() {
  const text = conditionHitNumbers.value.map(pad2).join('.')
  if (!text) { toast('暂无命中号码'); return }
  navigator.clipboard.writeText(text).then(() => toast('已复制命中号码')).catch(() => {})
}

// 生肖选号
const selectedZodiacs = ref<ZodiacKey[]>([])
function toggleZodiac(key: ZodiacKey) {
  const zodiacNums = numbersByZodiac.value[key]
  // 以"该生肖号码当前是否已在选中集合"为判断依据，保证与显示状态一致（含手动输入来源），点击一次即可取消
  const hasSelected = zodiacNums.some(n => selectedNumbers.value.includes(n))
  if (hasSelected) {
    const i = selectedZodiacs.value.indexOf(key)
    if (i > -1) selectedZodiacs.value.splice(i, 1)
    const removeSet = new Set(zodiacNums)
    selectedNumbers.value = selectedNumbers.value.filter(n => !removeSet.has(n))
  } else {
    if (!selectedZodiacs.value.includes(key)) selectedZodiacs.value.push(key)
    const set = new Set(selectedNumbers.value)
    for (const n of zodiacNums) set.add(n)
    selectedNumbers.value = Array.from(set).sort((a, b) => a - b)
  }
}
function clearZodiac() {
  const remove = new Set<number>()
  for (const k of selectedZodiacs.value) for (const n of numbersByZodiac.value[k]) remove.add(n)
  selectedZodiacs.value = []
  selectedNumbers.value = selectedNumbers.value.filter(n => !remove.has(n))
}

function pad2(n: number) { return String(n).padStart(2, '0') }
function isZodiacActive(key: ZodiacKey) { return numbersByZodiac.value[key].some(n => selectedNumbers.value.includes(n)) }
function selectAllCurrentElement() { const set = new Set(selectedNumbers.value); for (const n of idsByElement.value[selectedElement.value]) set.add(n); selectedNumbers.value = Array.from(set).sort((a, b) => a - b) }

const filteredGridNumbers = computed(() => numbers.value.slice())

const STORAGE_KEY = 'num-chose-state'
async function saveAndCopy() {
  const payload = { selectedNumbers: selectedNumbers.value, selectedZodiacs: selectedZodiacs.value, stickySelected: stickySelected.value }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)) } catch {}
  const text = selectedNumbers.value.map(pad2).join('.')
  if (!text) { toast('暂无可复制的号码'); return }
  try { await navigator.clipboard.writeText(text); toast('已复制号码,并保存') } catch {}
}

function deleteSaved() {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) { toast('暂无可删除记录'); return }; localStorage.removeItem(STORAGE_KEY); toast('已删除本地保存记录') } catch {}
}

onMounted(() => {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return; const data = JSON.parse(raw); if (Array.isArray(data.selectedNumbers)) selectedNumbers.value = data.selectedNumbers } catch {}
})

function getSortedNumbers() { const sorted = [...selectedNumbers.value]; sortOrder.value === 'asc' ? sorted.sort((a, b) => a - b) : sorted.sort((a, b) => b - a); return sorted }
function getWaveColorById(id: number): string { return recordById.value.get(id)?.wave.key || '' }
function clearSelectedNumbers() { selectedNumbers.value = []; manualNumbers.value = []; sortOrder.value = 'none'; clearAllConditions() }

function handleSelect(id: number) {
  if (typeof id !== 'number' || id < 1 || id > 49) return
  const index = selectedNumbers.value.indexOf(id)
  index > -1 ? selectedNumbers.value.splice(index, 1) : selectedNumbers.value.push(id)
}
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
      </section>

      <!-- Condition Selection -->
      <section v-else-if="activeTab==='condition'" class="space-y-2.5">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-base font-semibold text-neutral">条件选号</h3>
          <button class="u-btn u-btn-ghost u-btn-sm" @click="clearAllConditions">清空条件</button>
        </div>

        <!-- 包含分区 -->
        <section class="filter-section filter-section--include">
          <button type="button" class="section-header" @click="includeExpanded = !includeExpanded">
            <div class="flex items-center gap-2 min-w-0">
              <span class="section-dot"></span>
              <h2 class="section-title">包含</h2>
              <span v-if="includeConditionOptions.length > 0" class="section-count">{{ includeConditionOptions.length }}</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="section-tip">全部满足才保留</span>
              <span class="icon-[tabler--chevron-down] size-4 text-secondary transition-transform duration-200" :class="{ 'rotate-180': includeExpanded }"></span>
            </div>
          </button>

          <div v-if="includeExpanded" class="section-body">
            <div class="segment-tabs">
              <button v-for="name in conditionGroupNames" :key="name" type="button" class="segment-tab" :class="{ 'is-active': includeGroupTab === name }" @click="includeGroupTab = name">{{ name }}</button>
            </div>
            <template v-for="g in conditionSections.find(s => s.name === includeGroupTab)?.groups" :key="`inc-${g.label}`">
              <div v-if="g.type === 'combined' && g.groups" class="filter-block filter-block--combined">
                <template v-for="sub in g.groups" :key="`inc-${g.label}-${sub.label}`">
                  <div class="filter-block__label">{{ sub.label }}</div>
                  <div class="filter-block__opts">
                    <button v-for="opt in sub.options" :key="opt" type="button" :class="conditionChipClass(sub.type, opt, includeConditionOptions.includes(opt))" @click="toggleIncludeOption(opt)">{{ opt }}</button>
                  </div>
                </template>
              </div>
              <div v-else class="filter-block">
                <div class="filter-block__label">{{ g.label }}</div>
                <div class="filter-block__opts">
                  <button v-for="opt in g.options" :key="opt" type="button" :class="conditionChipClass(g.type, opt, includeConditionOptions.includes(opt))" @click="toggleIncludeOption(opt)">{{ opt }}</button>
                </div>
              </div>
            </template>
          </div>
        </section>

        <!-- 排除分区 -->
        <section class="filter-section filter-section--exclude">
          <button type="button" class="section-header" @click="excludeExpanded = !excludeExpanded">
            <div class="flex items-center gap-2 min-w-0">
              <span class="section-dot"></span>
              <h2 class="section-title">排除</h2>
              <span v-if="excludeConditionOptions.length > 0" class="section-count">{{ excludeConditionOptions.length }}</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="section-tip">满足任一即排除</span>
              <span class="icon-[tabler--chevron-down] size-4 text-secondary transition-transform duration-200" :class="{ 'rotate-180': excludeExpanded }"></span>
            </div>
          </button>

          <div v-if="excludeExpanded" class="section-body">
            <div class="segment-tabs">
              <button v-for="name in conditionGroupNames" :key="name" type="button" class="segment-tab" :class="{ 'is-active': excludeGroupTab === name }" @click="excludeGroupTab = name">{{ name }}</button>
            </div>
            <template v-for="g in conditionSections.find(s => s.name === excludeGroupTab)?.groups" :key="`exc-${g.label}`">
              <div v-if="g.type === 'combined' && g.groups" class="filter-block filter-block--combined">
                <template v-for="sub in g.groups" :key="`exc-${g.label}-${sub.label}`">
                  <div class="filter-block__label">{{ sub.label }}</div>
                  <div class="filter-block__opts">
                    <button v-for="opt in sub.options" :key="opt" type="button" :class="conditionChipClass(sub.type, opt, excludeConditionOptions.includes(opt))" @click="toggleExcludeOption(opt)">{{ opt }}</button>
                  </div>
                </template>
              </div>
              <div v-else class="filter-block">
                <div class="filter-block__label">{{ g.label }}</div>
                <div class="filter-block__opts">
                  <button v-for="opt in g.options" :key="opt" type="button" :class="conditionChipClass(g.type, opt, excludeConditionOptions.includes(opt))" @click="toggleExcludeOption(opt)">{{ opt }}</button>
                </div>
              </div>
            </template>
          </div>
        </section>

        <!-- 命中结果反馈 -->
        <section class="filter-section filter-section--result">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 min-w-0">
              <span class="section-dot"></span>
              <h2 class="section-title">命中结果</h2>
              <span class="section-count" :class="conditionHitNumbers.length > 0 ? 'is-hit' : ''">{{ conditionHitNumbers.length }}注</span>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <button type="button" class="result-btn" @click="copyConditionHit">
                <span class="icon-[tabler--copy] size-3.5"></span>复制
              </button>
              <button type="button" class="result-btn" @click="activeTab = 'number'">
                <span class="icon-[tabler--apps] size-3.5"></span>去数字选号
              </button>
            </div>
          </div>

          <div v-if="conditionHitNumbers.length === 0" class="result-empty">
            未选择任何条件，暂无命中号码
          </div>
          <div v-else class="result-numbers">
            <span v-for="n in conditionHitPreview" :key="`hit-${n}`" class="result-num" :class="waveHitClass(n)">{{ pad2(n) }}</span>
            <span v-if="conditionHitNumbers.length > conditionHitPreview.length" class="result-more">+{{ conditionHitNumbers.length - conditionHitPreview.length }}</span>
          </div>
        </section>
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
                class="w-full min-h-[100px] px-3 py-2 text-sm text-base-content bg-base-100 border border-base-300 rounded-lg outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-secondary resize-none"
                placeholder="请输入号码，多个号码用逗号、空格、换行或英文句号分隔，支持1-49的数字"
                rows="6"
              />
            </div>
            <div class="flex items-center gap-2 pt-2">
              <span class="text-xs text-secondary whitespace-nowrap">自定义分隔符</span>
              <input
                v-model="customDelimiter"
                type="text"
                class="flex-1 h-9 px-3 text-sm text-base-content bg-base-100 border border-base-300 rounded-lg outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-secondary"
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

<style scoped>
/* ═══ 条件选号分区（包含/排除/命中结果） ═══ */
.filter-section {
  background: var(--color-base-100);
  border-radius: 14px;
  border: 1px solid var(--color-base-300);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.filter-section--include { border-top: 3px solid var(--color-success); }
.filter-section--exclude { border-top: 3px solid var(--color-error); }
.filter-section--result { border-top: 3px solid var(--color-primary); padding: 11px 12px 12px; display: flex; flex-direction: column; gap: 10px; }

.result-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 26px;
  padding: 0 10px;
  border: none;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  cursor: pointer;
  transition: filter 0.15s ease;
}
.result-btn:active { filter: brightness(0.92); }

.result-empty {
  font-size: 12px;
  color: var(--color-secondary);
  background: color-mix(in srgb, var(--color-base-200) 55%, transparent);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}

.result-numbers {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 132px;
  overflow-y: auto;
}

.result-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
  flex-shrink: 0;
}

.result-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-secondary);
}

.filter-section--include .section-header { background: color-mix(in srgb, var(--color-success) 5%, transparent); }
.filter-section--exclude .section-header { background: color-mix(in srgb, var(--color-error) 5%, transparent); }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 11px 12px;
  cursor: pointer;
  border: none;
  color: inherit;
  gap: 8px;
  transition: filter 0.15s ease;
}
.section-header:active { filter: brightness(0.97); }

.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.filter-section--include .section-dot {
  background: var(--color-success);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success) 16%, transparent);
}
.filter-section--exclude .section-dot {
  background: var(--color-error);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 16%, transparent);
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-base-content);
}

.section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 17px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}
.filter-section--include .section-count {
  background: color-mix(in srgb, var(--color-success) 16%, transparent);
  color: var(--color-success);
}
.filter-section--exclude .section-count {
  background: color-mix(in srgb, var(--color-error) 16%, transparent);
  color: var(--color-error);
}
.filter-section--result .section-count {
  background: color-mix(in srgb, var(--color-base-300) 60%, transparent);
  color: var(--color-secondary);
}
.filter-section--result .section-count.is-hit {
  background: color-mix(in srgb, var(--color-primary) 16%, transparent);
  color: var(--color-primary);
}

.section-tip {
  font-size: 10px;
  color: var(--color-secondary);
  white-space: nowrap;
}

.section-body {
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px dashed var(--color-base-300);
}

.segment-tabs {
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-base-300) 45%, transparent);
}

.segment-tab {
  flex: 1;
  height: 30px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-secondary);
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.segment-tab.is-active {
  background: var(--color-base-100);
  color: var(--color-base-content);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.filter-block {
  background: color-mix(in srgb, var(--color-base-200) 55%, transparent);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.filter-block__label {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filter-block__opts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 组合卡片（属性：单双大小/波色单双/五行） */
.filter-block--combined > :not(:last-child) {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed color-mix(in srgb, var(--color-base-300) 80%, transparent);
}

/* ═══ 波色按钮（大色块，按波色着色） ═══ */
.chip-wave {
  position: relative;
  height: 34px;
  padding: 0 12px;
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
  position: relative;
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
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
.chip-wuxing--active:hover { filter: brightness(1.08); }

/* ═══ 生肖 ═══ */
.chip-zodiac {
  position: relative;
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
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

/* ═══ 标签芯片（药丸） ═══ */
.chip-tag {
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
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

/* ═══ 头数 / 尾数 ═══ */
.chip-tail {
  position: relative;
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
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
.chip-tail--active:hover { filter: brightness(1.08); }

/* ═══ 选中态勾选角标 ═══ */
.chip-wave--active::after,
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
