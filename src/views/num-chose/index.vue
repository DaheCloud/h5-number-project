<script setup lang="ts">
defineOptions({ name: 'NumChosePage' })
import { ref, computed, onMounted, watch } from 'vue'
import NumberButton from './components/NumberButton.vue'
import numData from '../../../num-data.json'
import zodiacOrderRaw from '../../../num-data.md?raw'
import sourceDataRaw from '../../../source-data.md?raw'

// 页面状态
const activeTab = ref<'number' | 'zodiac' | 'five' | 'condition'>('number')
// 初始化为数字类型的数组，确保与JSON数据中的id类型一致
const selectedNumbers = ref<number[]>([])
// 排序状态（asc: 升序, desc: 降序, none: 不排序）
const sortOrder = ref<'asc' | 'desc' | 'none'>('none')
// 确保numbers是数组类型
const numbers = ref(Array.isArray(numData) ? numData : [])

type FiveElement = 'metal' | 'wood' | 'water' | 'fire' | 'earth'
const elementOptions: { key: FiveElement; label: string }[] = [
  { key: 'metal', label: '金' },
  { key: 'wood', label: '木' },
  { key: 'water', label: '水' },
  { key: 'fire', label: '火' },
  { key: 'earth', label: '土' },
]
const selectedElement = ref<FiveElement>('metal')
const stickySelected = ref<boolean>(false)
const stickyEnabled = computed(() => stickySelected.value)
const resultsStickySelected = ref<boolean>(false)
const resultsStickyEnabled = computed(() => resultsStickySelected.value)

const idsByElement = elementOptions.reduce((acc, cur) => {
  acc[cur.key] = numbers.value
    .filter((i: any) => i.fiveElements === cur.key)
    .map((i: any) => Number(i.id))
    .sort((a: number, b: number) => a - b)
  return acc
}, {} as Record<FiveElement, number[]>)

function setElement(key: FiveElement) {
  selectedElement.value = key
}

const recordById = computed(() => {
  const m = new Map<number, any>()
  for (const i of numbers.value) {
    m.set(Number(i.id), i)
  }
  return m
})

type ZodiacKey = 'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake' | 'horse' | 'goat' | 'monkey' | 'rooster' | 'dog' | 'pig'
const zhToKey: Record<string, ZodiacKey> = {
  '鼠': 'rat', '牛': 'ox', '虎': 'tiger', '兔': 'rabbit', '龙': 'dragon', '蛇': 'snake',
  '马': 'horse', '羊': 'goat', '猴': 'monkey', '鸡': 'rooster', '狗': 'dog', '猪': 'pig',
}
const metaByKey: Record<ZodiacKey, { name: string; emoji: string }> = {
  rat: { name: '鼠', emoji: '🐭' },
  ox: { name: '牛', emoji: '🐮' },
  tiger: { name: '虎', emoji: '🐯' },
  rabbit: { name: '兔', emoji: '🐰' },
  dragon: { name: '龙', emoji: '🐲' },
  snake: { name: '蛇', emoji: '🐍' },
  horse: { name: '马', emoji: '🐴' },
  goat: { name: '羊', emoji: '🐑' },
  monkey: { name: '猴', emoji: '🐵' },
  rooster: { name: '鸡', emoji: '🐔' },
  dog: { name: '狗', emoji: '🐶' },
  pig: { name: '猪', emoji: '🐷' },
}
const zodiacOrderLines = zodiacOrderRaw.split('\n').map((l) => l.trim()).filter(Boolean)
const orderKeys: ZodiacKey[] = []
for (const line of zodiacOrderLines) {
  const parts = line.replace(/\s+/g, ' ').split(' ')
  const zh = parts[1] as string | undefined
  const key = zh ? zhToKey[zh] : undefined
  if (key) orderKeys.push(key)
}
const zodiacOptions: { key: ZodiacKey; name: string; emoji: string }[] = (orderKeys.length
  ? orderKeys
  : (['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'] as ZodiacKey[]))
  .map((key) => ({ key, name: metaByKey[key].name, emoji: metaByKey[key].emoji }))
const numbersByZodiac = zodiacOptions.reduce((acc, cur) => {
  acc[cur.key] = numbers.value
    .filter((i: any) => i.chineseZodiac === cur.key)
    .map((i: any) => Number(i.id))
    .sort((a: number, b: number) => a - b)
  return acc
}, {} as Record<ZodiacKey, number[]>)
const zodiacOptionsSorted = computed(() => {
  const list = zodiacOptions.slice()
  list.sort((a, b) => {
    const an = numbersByZodiac[a.key]?.[0] ?? 999
    const bn = numbersByZodiac[b.key]?.[0] ?? 999
    return an - bn
  })
  return list
})
const zodiacCardOrderMode = ref<'zodiac' | 'number'>('number')
const zodiacCardList = computed(() => zodiacCardOrderMode.value === 'number' ? zodiacOptionsSorted.value : zodiacOptions)
const zodiacOrderSwitch = computed({
  get() { return zodiacCardOrderMode.value === 'number' },
  set(v: boolean) { zodiacCardOrderMode.value = v ? 'number' : 'zodiac' }
})
const idsByMen = (() => {
  const map: Record<string, number[]> = {}
  const re = /([1-5]门)[^\n]*\n([^\n]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(sourceDataRaw)) !== null) {
    const key = m[1] as string | undefined
    const line = m[2] as string | undefined
    if (!key || !line) continue
    const nums = line.trim().split(/\s+/).map((s) => Number(s))
    map[key] = nums
  }
  return map
})()
const idsByDuan = (() => {
  const map: Record<string, number[]> = {}
  const re = /([1-7]段)[^\n]*\n([^\n]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(sourceDataRaw)) !== null) {
    const key = m[1] as string | undefined
    const line = m[2] as string | undefined
    if (!key || !line) continue
    const nums = line.trim().split(/\s+/).map((s) => Number(s))
    map[key] = nums
  }
  return map
})()
const idsByHeShu = (() => {
  const map: Record<string, number[]> = {}
  const re = /(合\d{2})[^\n]*\n([^\n]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(sourceDataRaw)) !== null) {
    const key = m[1] as string | undefined
    const line = m[2] as string | undefined
    if (!key || !line) continue
    const nums = line.trim().split(/\s+/).map((s) => Number(s))
    map[key] = nums
  }
  return map
})()
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
  { label: '天肖组合', options: ['天肖', '左肖', '前肖', '独字肖', '阴肖'] },
  { label: '地肖组合', options: ['地肖', '右肖', '后肖', '合字肖', '阳肖'] },
]
const selectedConditionOptions = ref<string[]>([])
function toggleConditionOption(opt: string) {
  const i = selectedConditionOptions.value.indexOf(opt)
  if (i > -1) selectedConditionOptions.value.splice(i, 1)
  else selectedConditionOptions.value.push(opt)
}
function clearAllConditions() { selectedConditionOptions.value = [] }
function sumDigits(n: number) { return Math.floor(n / 10) + (n % 10) }
const labelToElement: Record<string, FiveElement> = { 金: 'metal', 木: 'wood', 水: 'water', 火: 'fire', 土: 'earth' }
const allIds = computed(() => numbers.value.map((i: any) => Number(i.id)))
function idsForOption(opt: string): number[] {
  const all = allIds.value
  {
    const el = labelToElement[opt as any]
    if (el) return idsByElement[el]
  }
  if (opt === '天肖') return skyKeys.flatMap(k => numbersByZodiac[k])
  if (opt === '地肖') return earthKeys.flatMap(k => numbersByZodiac[k])
  if (opt === '大尾') return all.filter(n => n % 10 >= 5)
  if (opt === '小尾') return all.filter(n => n % 10 <= 4)
  const tailMatch = opt.match(/^([0-9])尾$/)
  if (tailMatch) { const d = Number(tailMatch[1]); return all.filter(n => n % 10 === d) }
  const headMatch = opt.match(/^([0-9])头$/)
  if (headMatch) { const d = Number(headMatch[1]); return all.filter(n => Math.floor(n / 10) === d) }
  const zodiacZh = opt as string
  if (zhToKey[zodiacZh]) { const k = zhToKey[zodiacZh]; return numbersByZodiac[k] }
  if (/^[1-5]门$/.test(opt)) return idsByMen[opt] || []
  if (/^[1-7]段$/.test(opt)) return idsByDuan[opt] || []
  if (opt === '合单') return all.filter(n => recordById.value.get(n)?.sumOddAndEven === 'oddSum')
  if (opt === '合双') return all.filter(n => recordById.value.get(n)?.sumOddAndEven === 'evenSum')
  if (opt === '合小') return all.filter(n => sumDigits(n) <= 9)
  if (opt === '尾小') return all.filter(n => n % 10 <= 4)
  if (opt === '大双') return all.filter(n => recordById.value.get(n)?.oddAndEven === 'even' && (n % 10 >= 5))
  if (opt === '小双') return all.filter(n => recordById.value.get(n)?.oddAndEven === 'even' && (n % 10 <= 4))
  const waveOddEven = opt.match(/^(红|绿|蓝)(单|双)$/)
  if (waveOddEven) {
    const wave = waveOddEven[1] === '红' ? 'red' : waveOddEven[1] === '绿' ? 'green' : 'blue'
    const oe = waveOddEven[2] === '单' ? 'odd' : 'even'
    return all.filter(n => recordById.value.get(n)?.waveColor === wave && recordById.value.get(n)?.oddAndEven === oe)
  }
  const heShu = opt.match(/^([0-9]{1,2})合$/)
  if (heShu) {
    const key = '合' + String(heShu[1]).padStart(2, '0')
    const byDoc = idsByHeShu[key]
    if (byDoc && byDoc.length) return byDoc
    const t = Number(heShu[1])
    return all.filter(n => sumDigits(n) === t)
  }
  const heWei = opt.match(/^([0-9])合尾$/)
  if (heWei) { const t = Number(heWei[1]); return all.filter(n => sumDigits(n) % 10 === t) }
  const headOddEven = opt.match(/^([0-9])头(单|双)$/)
  if (headOddEven) { const h = Number(headOddEven[1]); const isOdd = headOddEven[2] === '单'; return all.filter(n => Math.floor(n / 10) === h && (n % 2 === (isOdd ? 1 : 0))) }
  const modMatch = opt.match(/^([3-7])余([0-6])$/)
  if (modMatch) { const base = Number(modMatch[1]); const r = Number(modMatch[2]); return all.filter(n => n % base === r) }
  return []
}
const conditionResultNumbers = computed(() => {
  const sets: Set<number>[] = []
  for (const g of conditionGroups) {
    const sel = selectedConditionOptions.value.filter(o => g.options.includes(o))
    if (sel.length > 0) {
      const u = new Set<number>()
      for (const o of sel) for (const n of idsForOption(o)) u.add(n)
      sets.push(u)
    }
  }
  if (sets.length === 0) return []
  const first = sets[0] ?? new Set<number>()
  let result = Array.from(first)
  for (let i = 1; i < sets.length; i++) {
    const s = sets[i]!
    result = result.filter(n => s.has(n))
  }
  return result.sort((a, b) => a - b)
})
watch(selectedConditionOptions, (vals) => { if (vals.length > 0) selectedNumbers.value = conditionResultNumbers.value; else selectedNumbers.value = [] }, { deep: true })
const selectedZodiacs = ref<ZodiacKey[]>([])
function toggleZodiac(key: ZodiacKey) {
  const i = selectedZodiacs.value.indexOf(key)
  if (i > -1) {
    selectedZodiacs.value.splice(i, 1)
    const removeSet = new Set<number>(numbersByZodiac[key])
    selectedNumbers.value = selectedNumbers.value.filter((n) => !removeSet.has(n))
  } else {
    selectedZodiacs.value.push(key)
    const set = new Set<number>(selectedNumbers.value)
    for (const n of numbersByZodiac[key]) set.add(n)
    selectedNumbers.value = Array.from(set).sort((a, b) => a - b)
  }
}
function clearZodiac() {
  const remove = new Set<number>()
  for (const k of selectedZodiacs.value) for (const n of numbersByZodiac[k]) remove.add(n)
  selectedZodiacs.value = []
  selectedNumbers.value = selectedNumbers.value.filter((n) => !remove.has(n))
}
// 已移除按钮确认逻辑
function pad2(n: number) { return String(n).padStart(2, '0') }
function colorClassById(id: number) {
  const w = recordById.value.get(id)?.waveColor
  return w === 'red' ? 'z-num--red' : w === 'green' ? 'z-num--green' : w === 'blue' ? 'z-num--blue' : ''
}
function isZodiacActive(key: ZodiacKey) {
  return numbersByZodiac[key].some((n) => selectedNumbers.value.includes(n))
}
function selectAllCurrentElement() {
  const set = new Set<number>(selectedNumbers.value)
  for (const n of idsByElement[selectedElement.value]) set.add(n)
  selectedNumbers.value = Array.from(set).sort((a, b) => a - b)
}

const oddEvenFilter = ref<'all' | 'odd' | 'even'>('all')
const sumOddEvenFilter = ref<'all' | 'oddSum' | 'evenSum'>('all')
const selectedHeads = ref<number[]>([])
const selectedUnits = ref<number[]>([])
const selectedElementsFilter = ref<FiveElement[]>([])
function toggleElementFilter(e: FiveElement) {
  const i = selectedElementsFilter.value.indexOf(e)
  if (i > -1) selectedElementsFilter.value.splice(i, 1)
  else selectedElementsFilter.value.push(e)
}
const homeKeys: ZodiacKey[] = ['ox', 'horse', 'goat', 'rooster', 'dog', 'pig']
const wildKeys: ZodiacKey[] = ['rat', 'tiger', 'rabbit', 'dragon', 'snake', 'monkey']
const homeWildFilter = ref<'all' | 'home' | 'wild'>('all')
const skyKeys: ZodiacKey[] = ['pig', 'ox', 'monkey', 'horse', 'rabbit', 'dragon']
const earthKeys: ZodiacKey[] = ['snake', 'goat', 'rooster', 'dog', 'rat', 'tiger']
const skyEarthFilter = ref<'all' | 'sky' | 'earth'>('all')

type WaveColor = 'red' | 'green' | 'blue'
const selectedWaveColors = ref<WaveColor[]>([])
function toggleWaveColor(c: WaveColor) {
  const i = selectedWaveColors.value.indexOf(c)
  if (i > -1) selectedWaveColors.value.splice(i, 1)
  else selectedWaveColors.value.push(c)
}
type WaveOddEven = 'red-odd' | 'red-even' | 'green-odd' | 'green-even' | 'blue-odd' | 'blue-even'
const selectedWaveOddEven = ref<WaveOddEven[]>([])
function toggleWaveOddEven(v: WaveOddEven) {
  const i = selectedWaveOddEven.value.indexOf(v)
  if (i > -1) selectedWaveOddEven.value.splice(i, 1)
  else selectedWaveOddEven.value.push(v)
}
const selectedZodiacsFilter = ref<ZodiacKey[]>([])
function toggleZodiacFilter(k: ZodiacKey) {
  const i = selectedZodiacsFilter.value.indexOf(k)
  if (i > -1) selectedZodiacsFilter.value.splice(i, 1)
  else selectedZodiacsFilter.value.push(k)
}
const selectedMenFilter = ref<string[]>([])
function toggleMenFilter(v: string) {
  const i = selectedMenFilter.value.indexOf(v)
  if (i > -1) selectedMenFilter.value.splice(i, 1)
  else selectedMenFilter.value.push(v)
}
const selectedDuanFilter = ref<string[]>([])
function toggleDuanFilter(v: string) {
  const i = selectedDuanFilter.value.indexOf(v)
  if (i > -1) selectedDuanFilter.value.splice(i, 1)
  else selectedDuanFilter.value.push(v)
}
const selectedHeShuFilter = ref<string[]>([])
function toggleHeShuFilter(v: string) {
  const i = selectedHeShuFilter.value.indexOf(v)
  if (i > -1) selectedHeShuFilter.value.splice(i, 1)
  else selectedHeShuFilter.value.push(v)
}

const availableHeads = computed(() => {
  const s = new Set<number>()
  for (const n of selectedNumbers.value) s.add(Math.floor(n / 10))
  return Array.from(s).sort((a, b) => a - b)
})

const availableUnits = computed(() => {
  const s = new Set<number>()
  for (const n of selectedNumbers.value) s.add(n % 10)
  return Array.from(s).sort((a, b) => a - b)
})

function toggleHead(h: number) {
  const i = selectedHeads.value.indexOf(h)
  if (i > -1) selectedHeads.value.splice(i, 1)
  else selectedHeads.value.push(h)
}

function toggleUnit(u: number) {
  const i = selectedUnits.value.indexOf(u)
  if (i > -1) selectedUnits.value.splice(i, 1)
  else selectedUnits.value.push(u)
}

function clearAllFilters() {
  oddEvenFilter.value = 'all'
  sumOddEvenFilter.value = 'all'
  selectedHeads.value = []
  selectedUnits.value = []
  homeWildFilter.value = 'all'
  skyEarthFilter.value = 'all'
  selectedElementsFilter.value = []
  selectedWaveColors.value = []
  selectedWaveOddEven.value = []
  selectedZodiacsFilter.value = []
  selectedMenFilter.value = []
  selectedDuanFilter.value = []
  selectedHeShuFilter.value = []
  try { showToast('已清空所有过滤') } catch { }
}


// 网格内容不受下方过滤条件影响，始终展示全量号码
const filteredGridNumbers = computed(() => numbers.value.slice())

// 过滤结果：基于已选号码进行单双/合单双过滤
const filteredSelectedRecords = computed(() => {
  const base = selectedNumbers.value
    .map((id) => recordById.value.get(id))
    .filter((r): r is any => !!r)
  let list = base
  if (oddEvenFilter.value !== 'all') list = list.filter((i: any) => i.oddAndEven === oddEvenFilter.value)
  if (sumOddEvenFilter.value !== 'all') list = list.filter((i: any) => i.sumOddAndEven === sumOddEvenFilter.value)
  if (selectedHeads.value.length > 0) list = list.filter((i: any) => selectedHeads.value.includes(Math.floor(Number(i.id) / 10)))
  if (selectedUnits.value.length > 0) list = list.filter((i: any) => selectedUnits.value.includes(Number(i.id) % 10))
  if (homeWildFilter.value !== 'all') {
    const group = homeWildFilter.value === 'home' ? homeKeys : wildKeys
    const allowed = new Set<ZodiacKey>(selectedZodiacs.value.filter((k) => group.includes(k)))
    list = list.filter((i: any) => allowed.has(i.chineseZodiac))
  }
  if (skyEarthFilter.value !== 'all') {
    const group = skyEarthFilter.value === 'sky' ? skyKeys : earthKeys
    const allowed = new Set<ZodiacKey>(selectedZodiacs.value.filter((k) => group.includes(k)))
    list = list.filter((i: any) => allowed.has(i.chineseZodiac))
  }
  if (selectedElementsFilter.value.length > 0) {
    list = list.filter((i: any) => selectedElementsFilter.value.includes(i.fiveElements))
  }
  if (selectedWaveColors.value.length > 0) {
    list = list.filter((i: any) => selectedWaveColors.value.includes(i.waveColor))
  }
  if (selectedWaveOddEven.value.length > 0) {
    list = list.filter((i: any) => selectedWaveOddEven.value.includes(`${i.waveColor}-${i.oddAndEven}` as WaveOddEven))
  }
  if (selectedZodiacsFilter.value.length > 0) {
    list = list.filter((i: any) => {
      const z = i?.chineseZodiac as ZodiacKey | undefined
      return z ? selectedZodiacsFilter.value.includes(z) : false
    })
  }
  if (selectedMenFilter.value.length > 0) {
    const allowed = new Set<number>()
    for (const k of selectedMenFilter.value) for (const n of (idsByMen[k] || [])) allowed.add(n)
    list = list.filter((i: any) => allowed.has(Number(i.id)))
  }
  if (selectedDuanFilter.value.length > 0) {
    const allowed = new Set<number>()
    for (const k of selectedDuanFilter.value) for (const n of (idsByDuan[k] || [])) allowed.add(n)
    list = list.filter((i: any) => allowed.has(Number(i.id)))
  }
  if (selectedHeShuFilter.value.length > 0) {
    const allowed = new Set<number>()
    for (const k of selectedHeShuFilter.value) {
      const key = '合' + String(k.replace('合', '')).padStart(2, '0')
      const arr = idsByHeShu[key]
      if (arr && arr.length) for (const n of arr) allowed.add(n)
    }
    list = list.filter((i: any) => allowed.has(Number(i.id)))
  }
  return list
})

const STORAGE_KEY = 'num-chose-state'
async function saveAndCopy() {
  const payload = {
    selectedNumbers: selectedNumbers.value,
    selectedZodiacs: selectedZodiacs.value,
    oddEvenFilter: oddEvenFilter.value,
    sumOddEvenFilter: sumOddEvenFilter.value,
    selectedHeads: selectedHeads.value,
    selectedUnits: selectedUnits.value,
    homeWildFilter: homeWildFilter.value,
    skyEarthFilter: skyEarthFilter.value,
    selectedElementsFilter: selectedElementsFilter.value,
    selectedWaveColors: selectedWaveColors.value,
    selectedWaveOddEven: selectedWaveOddEven.value,
    selectedZodiacsFilter: selectedZodiacsFilter.value,
    selectedMenFilter: selectedMenFilter.value,
    selectedDuanFilter: selectedDuanFilter.value,
    selectedHeShuFilter: selectedHeShuFilter.value,
    stickySelected: stickySelected.value,
    resultsStickySelected: resultsStickySelected.value,
  }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)) } catch { }
  const text = filteredSelectedRecords.value.map((r: any) => pad2(Number(r.id))).join('.')
  if (!text) { try { showToast('暂无可复制的过滤结果') } catch { } return }
  try { await navigator.clipboard.writeText(text); try { showToast('已复制过滤结果,并保存') } catch { } } catch { }
}

function deleteSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) { try { showToast('暂无可删除记录') } catch { } return }
    localStorage.removeItem(STORAGE_KEY)
    try { showToast('已删除本地保存记录') } catch { }
  } catch { }
}

onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    if (Array.isArray(data.selectedNumbers)) selectedNumbers.value = data.selectedNumbers.filter((n: any) => typeof n === 'number')
    const zodiacKeys: ZodiacKey[] = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig']
    if (Array.isArray(data.selectedZodiacs)) selectedZodiacs.value = data.selectedZodiacs.filter((k: any) => zodiacKeys.includes(k))
    if (data.oddEvenFilter === 'all' || data.oddEvenFilter === 'odd' || data.oddEvenFilter === 'even') oddEvenFilter.value = data.oddEvenFilter
    if (data.sumOddEvenFilter === 'all' || data.sumOddEvenFilter === 'oddSum' || data.sumOddEvenFilter === 'evenSum') sumOddEvenFilter.value = data.sumOddEvenFilter
    if (Array.isArray(data.selectedHeads)) selectedHeads.value = data.selectedHeads.filter((n: any) => typeof n === 'number')
    if (Array.isArray(data.selectedUnits)) selectedUnits.value = data.selectedUnits.filter((n: any) => typeof n === 'number')
    if (data.homeWildFilter === 'all' || data.homeWildFilter === 'home' || data.homeWildFilter === 'wild') homeWildFilter.value = data.homeWildFilter
    if (data.skyEarthFilter === 'all' || data.skyEarthFilter === 'sky' || data.skyEarthFilter === 'earth') skyEarthFilter.value = data.skyEarthFilter
    const elementKeys: FiveElement[] = ['metal', 'wood', 'water', 'fire', 'earth']
    if (Array.isArray(data.selectedElementsFilter)) selectedElementsFilter.value = data.selectedElementsFilter.filter((e: any) => elementKeys.includes(e))
    const waveKeys: WaveColor[] = ['red','green','blue']
    if (Array.isArray(data.selectedWaveColors)) selectedWaveColors.value = data.selectedWaveColors.filter((e: any) => waveKeys.includes(e))
    const waveOEKeys: WaveOddEven[] = ['red-odd','red-even','green-odd','green-even','blue-odd','blue-even']
    if (Array.isArray(data.selectedWaveOddEven)) selectedWaveOddEven.value = data.selectedWaveOddEven.filter((e: any) => waveOEKeys.includes(e))
    if (Array.isArray(data.selectedZodiacsFilter)) selectedZodiacsFilter.value = data.selectedZodiacsFilter.filter((k: any) => zodiacKeys.includes(k))
    const menKeys = ['1门', '2门', '3门', '4门', '5门']
    if (Array.isArray(data.selectedMenFilter)) selectedMenFilter.value = data.selectedMenFilter.filter((k: any) => menKeys.includes(k))
    const duanKeys = ['1段', '2段', '3段', '4段', '5段', '6段', '7段']
    if (Array.isArray(data.selectedDuanFilter)) selectedDuanFilter.value = data.selectedDuanFilter.filter((k: any) => duanKeys.includes(k))
    const heShuKeys = ['1合', '2合', '3合', '4合', '5合', '6合', '7合', '8合', '9合', '10合', '11合', '12合', '13合']
    if (Array.isArray(data.selectedHeShuFilter)) selectedHeShuFilter.value = data.selectedHeShuFilter.filter((k: any) => heShuKeys.includes(k))
    if (typeof data.stickySelected === 'boolean') stickySelected.value = data.stickySelected
    if (typeof data.resultsStickySelected === 'boolean') resultsStickySelected.value = data.resultsStickySelected
  } catch { }
})

// 获取排序后的已选数字
function getSortedNumbers() {
  if (sortOrder.value === 'none') {
    return selectedNumbers.value
  }

  const sorted = [...selectedNumbers.value]
  if (sortOrder.value === 'asc') {
    sorted.sort((a, b) => a - b)
  } else {
    sorted.sort((a, b) => b - a)
  }
  return sorted
}

// 处理选中事件，添加类型安全检查
function handleSelect(id: number) {
  // 确保id是有效数字
  if (typeof id !== 'number' || id < 1 || id > 49) {
    return
  }

  const index = selectedNumbers.value.indexOf(id)
  if (index > -1) {
    // 取消选中
    selectedNumbers.value.splice(index, 1)
  } else {
    // 添加选中
    selectedNumbers.value.push(id)
  }
}

// 根据数字ID获取对应的waveColor
function getWaveColorById(id: number): string {
  const number = numbers.value.find(num => Number(num.id) === id)
  return number?.waveColor || ''
}

// 添加清空功能
function clearSelectedNumbers() {
  selectedNumbers.value = []
  // 清空时重置排序状态
  sortOrder.value = 'none'
  selectedConditionOptions.value = []
}

// 切换排序方式
function toggleSortOrder() {
  if (sortOrder.value === 'none' || sortOrder.value === 'desc') {
    sortOrder.value = 'asc'
  } else if (sortOrder.value === 'asc') {
    sortOrder.value = 'desc'
  }
}

// 复制号码功能
async function copyNumbers() {
  console.log('copyNumbers函数被调用');

  // 检查是否有选中的号码
  if (selectedNumbers.value.length === 0) {
    console.log('没有选中的号码');
    // 使用alert作为备选方案
    alert('没有选中的号码可复制');
    return
  }

  try {
    // 获取排序后的号码并转为字符串
    const sortedNumbers = getSortedNumbers()
    const numbersString = sortedNumbers.join('.')
    console.log('准备复制的号码:', numbersString);

    // 使用 Clipboard API 复制文本
    await navigator.clipboard.writeText(numbersString)
    console.log('复制成功');
    // 同时使用showToast和alert确保用户能看到提示
    try {
      showToast('复制成功');
    } catch (toastError) {
      console.error('showToast调用失败:', toastError);
    }
    // 添加alert作为备选
  } catch (error) {
    console.error('复制失败:', error);
    // 使用alert作为备选方案
  }
}
</script>

<template>
  <div class="page num-chose-1">
    <!-- 顶部导航 -->
    <header class="header-fixed">
      <van-nav-bar title="选号助手">
        <template #right>
          <van-icon name="setting-o" />
        </template>
      </van-nav-bar>
    </header>

    <div class="content">
      <!-- 已选号码卡片 -->
      <section class="selected-card" :class="{ 'sticky-enabled': stickyEnabled }">
        <div class="selected-head">
          <div class="selected-title-group">
            <span class="selected-title">已选号码</span>
            <span class="selected-count">{{ selectedNumbers.length }}</span>
          </div>
          <div class="head-actions">
            <span class="head-tip">置顶</span>
            <van-switch v-model="stickySelected" size="20px" />
          </div>
        </div>
        <div class="number-tags">
          <span v-for="n in getSortedNumbers()" :key="n" class="tag" :class="[
            'tag--selected',
            getWaveColorById(n) === 'red' ? 'tag--red' : '',
            getWaveColorById(n) === 'green' ? 'tag--green' : '',
            getWaveColorById(n) === 'blue' ? 'tag--blue' : ''
          ]" role="button" @click="handleSelect(n)">
            {{ pad2(n) }}
          </span>
          <span v-if="selectedNumbers.length === 0" class="tag tag--empty">暂无选中数字</span>
        </div>
        <div class="actions">
          <van-button size="small" plain type="primary" @click="copyNumbers">复制号码</van-button>
          <van-button size="small" plain @click="clearSelectedNumbers">清空</van-button>
          <van-button size="small" plain>
            <van-icon name="arrow-down" />
            <span class="ml-4">展开详情</span>
          </van-button>
          <van-button v-if="selectedNumbers.length > 0" size="small" plain @click="toggleSortOrder">
            <van-icon
              :name="sortOrder === 'asc' ? 'arrow-up' : sortOrder === 'desc' ? 'arrow-down' : 'arrow-up-down'" />
            <span class="ml-4">
              {{ sortOrder === 'asc' ? '升序' : sortOrder === 'desc' ? '降序' : '排序' }}
            </span>
          </van-button>
        </div>
      </section>

      <!-- Tabs 切换区域 -->
      <section class="tabs-section">
        <van-tabs v-model:active="activeTab" type="line">
          <van-tab title="数字选号" name="number" />
          <van-tab title="生肖选号" name="zodiac" />
          <van-tab title="五行选号" name="five" />
          <van-tab title="条件选号" name="condition" />
        </van-tabs>
      </section>

      <section v-if="activeTab === 'five'" class="five-section">
        <div class="chip-row">
          <button v-for="opt in elementOptions" :key="opt.key" type="button" class="chip"
            :class="selectedElement === opt.key ? 'chip--active' : ''" @click="setElement(opt.key)">
            {{ opt.label }}
          </button>
        </div>

        <div class="element-title">{{elementOptions.find(i => i.key === selectedElement)?.label}}行号码</div>
        <div class="element-numbers">
          <NumberButton v-for="n in idsByElement[selectedElement]" :key="`el-${selectedElement}-${n}`" :id="n"
            :active="selectedNumbers.includes(n)" :wave-color="recordById.get(n)?.waveColor"
            :five-elements="recordById.get(n)?.fiveElements" :chinese-zodiac="recordById.get(n)?.chineseZodiac"
            :odd-and-even="recordById.get(n)?.oddAndEven" :sum-odd-and-even="recordById.get(n)?.sumOddAndEven"
            @select="handleSelect" />
        </div>
        <div class="element-actions">
          <van-button size="small" type="primary" plain @click="selectAllCurrentElement">全部选中</van-button>
        </div>

        <div class="element-summary">
          <div>金：{{ idsByElement.metal.join(', ') }}</div>
          <div>木：{{ idsByElement.wood.join(', ') }}</div>
          <div>水：{{ idsByElement.water.join(', ') }}</div>
          <div>火：{{ idsByElement.fire.join(', ') }}</div>
          <div>土：{{ idsByElement.earth.join(', ') }}</div>
        </div>
      </section>

      <section v-else-if="activeTab === 'zodiac'" class="zodiac-section">
        <div class="z-head">
          <div class="z-title">生肖选号</div>
          <div class="z-actions">
            <div class="z-order-switch">
              <span class="z-switch-label">按生肖</span>
              <van-switch v-model="zodiacOrderSwitch" size="20px" />
              <span class="z-switch-label">按数字</span>
            </div>
            <van-button size="small" plain @click="clearZodiac">清空</van-button>
          </div>
        </div>
        <div class="z-grid">
          <div v-for="opt in zodiacCardList" :key="opt.key" class="z-card"
            :class="isZodiacActive(opt.key) ? 'z-card--active' : ''" @click="toggleZodiac(opt.key)">
            <div class="z-avatar"><span class="z-emoji">{{ opt.emoji }}</span></div>
            <div class="z-name">{{ opt.name }}</div>
            <div class="z-pill-row">
              <span v-for="n in numbersByZodiac[opt.key]" :key="n"
                :class="['z-num', colorClassById(n), selectedNumbers.includes(n) ? 'is-active' : '']"
                @click="handleSelect(n)">
                {{ pad2(n) }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="activeTab === 'number'" class="numbers-grid">
        <div class="grid">
          <NumberButton v-for="number in filteredGridNumbers" :key="`num-${number.id}`" :id="Number(number.id)"
            :active="selectedNumbers.includes(Number(number.id))" :disabled="number.disabled === 'true'"
            :wave-color="number.waveColor" :five-elements="number.fiveElements" :chinese-zodiac="number.chineseZodiac"
            :odd-and-even="number.oddAndEven" :sum-odd-and-even="number.sumOddAndEven" @select="handleSelect" />
        </div>
      </section>

      <section v-else-if="activeTab === 'condition'" class="condition-section">
        <div class="c-head">
          <div class="c-title">条件选号</div>
          <van-button size="small" plain @click="clearAllConditions">
            <van-icon name="delete" />
            <span class="ml-4">清空条件</span>
          </van-button>
        </div>
        <div class="filter-group" v-for="group in conditionGroups" :key="group.label">
          <div class="filter-label">{{ group.label }}</div>
          <div class="chip-row">
            <button v-for="opt in group.options" :key="opt" class="chip"
              :class="selectedConditionOptions.includes(opt) ? 'chip--active' : ''" type="button"
              @click="toggleConditionOption(opt)">
              {{ opt }}
            </button>
          </div>
        </div>
      </section>

      <!-- 过滤区 -->
      <section class="filters">
        <div class="filters-head">
          <h3 class="section-title">过滤条件</h3>
          <van-button size="small" plain @click="clearAllFilters">
            <van-icon name="delete" />
            <span class="ml-4">清空所有过滤</span>
          </van-button>
        </div>
        <div class="filter-group">
          <div class="filter-label">五行过滤</div>
          <div class="chip-row">
            <button v-for="opt in elementOptions" :key="`fe-${opt.key}`" class="chip"
              :class="selectedElementsFilter.includes(opt.key) ? 'chip--active' : ''" type="button"
              @click="toggleElementFilter(opt.key)">
              {{ opt.label }}
            </button>
            <van-button v-if="selectedElementsFilter.length" size="small" plain
              @click="selectedElementsFilter = []">清空五行</van-button>
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-label">波色过滤</div>
          <div class="chip-row">
            <button class="chip" :class="selectedWaveColors.includes('red') ? 'chip--active' : ''" type="button" @click="toggleWaveColor('red')">红波</button>
            <button class="chip" :class="selectedWaveColors.includes('green') ? 'chip--active' : ''" type="button" @click="toggleWaveColor('green')">绿波</button>
            <button class="chip" :class="selectedWaveColors.includes('blue') ? 'chip--active' : ''" type="button" @click="toggleWaveColor('blue')">蓝波</button>
            <van-button v-if="selectedWaveColors.length" size="small" plain @click="selectedWaveColors=[]">清空波色</van-button>
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-label">波色单双过滤</div>
          <div class="chip-row">
            <button class="chip" :class="selectedWaveOddEven.includes('red-odd') ? 'chip--active' : ''" type="button" @click="toggleWaveOddEven('red-odd')">红单</button>
            <button class="chip" :class="selectedWaveOddEven.includes('red-even') ? 'chip--active' : ''" type="button" @click="toggleWaveOddEven('red-even')">红双</button>
            <button class="chip" :class="selectedWaveOddEven.includes('green-odd') ? 'chip--active' : ''" type="button" @click="toggleWaveOddEven('green-odd')">绿单</button>
            <button class="chip" :class="selectedWaveOddEven.includes('green-even') ? 'chip--active' : ''" type="button" @click="toggleWaveOddEven('green-even')">绿双</button>
            <button class="chip" :class="selectedWaveOddEven.includes('blue-odd') ? 'chip--active' : ''" type="button" @click="toggleWaveOddEven('blue-odd')">蓝单</button>
            <button class="chip" :class="selectedWaveOddEven.includes('blue-even') ? 'chip--active' : ''" type="button" @click="toggleWaveOddEven('blue-even')">蓝双</button>
            <van-button v-if="selectedWaveOddEven.length" size="small" plain @click="selectedWaveOddEven=[]">清空波色单双</van-button>
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-label">十二生肖过滤</div>
          <div class="chip-row">
            <button v-for="opt in zodiacOptions" :key="`zf-${opt.key}`" class="chip"
              :class="selectedZodiacsFilter.includes(opt.key) ? 'chip--active' : ''" type="button"
              @click="toggleZodiacFilter(opt.key)">
              {{ opt.name }}
            </button>
            <van-button v-if="selectedZodiacsFilter.length" size="small" plain
              @click="selectedZodiacsFilter = []">清空生肖</van-button>
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-label">门数过滤</div>
          <div class="chip-row">
            <button v-for="n in [1, 2, 3, 4, 5]" :key="`men-${n}`" class="chip"
              :class="selectedMenFilter.includes(`${n}门`) ? 'chip--active' : ''" type="button"
              @click="toggleMenFilter(`${n}门`)">{{ n }}门</button>
            <van-button v-if="selectedMenFilter.length" size="small" plain
              @click="selectedMenFilter = []">清空门数</van-button>
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-label">段数过滤</div>
          <div class="chip-row">
            <button v-for="n in [1, 2, 3, 4, 5, 6, 7]" :key="`duan-${n}`" class="chip"
              :class="selectedDuanFilter.includes(`${n}段`) ? 'chip--active' : ''" type="button"
              @click="toggleDuanFilter(`${n}段`)">{{ n }}段</button>
            <van-button v-if="selectedDuanFilter.length" size="small" plain
              @click="selectedDuanFilter = []">清空段数</van-button>
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-label">合数过滤</div>
          <div class="chip-row">
            <button v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]" :key="`he-${n}`" class="chip"
              :class="selectedHeShuFilter.includes(`${n}合`) ? 'chip--active' : ''" type="button"
              @click="toggleHeShuFilter(`${n}合`)">{{ n }}合</button>
            <van-button v-if="selectedHeShuFilter.length" size="small" plain
              @click="selectedHeShuFilter = []">清空合数</van-button>
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-label">单双过滤</div>
          <div class="chip-row">
            <button class="chip" :class="oddEvenFilter === 'odd' ? 'chip--active' : ''" type="button"
              @click="oddEvenFilter = 'odd'">单</button>
            <button class="chip" :class="oddEvenFilter === 'even' ? 'chip--active' : ''" type="button"
              @click="oddEvenFilter = 'even'">双</button>
            <button class="chip" :class="oddEvenFilter === 'all' ? 'chip--active' : ''" type="button"
              @click="oddEvenFilter = 'all'">全部</button>
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-label">合单双过滤</div>
          <div class="chip-row">
            <button class="chip" :class="sumOddEvenFilter === 'oddSum' ? 'chip--active' : ''" type="button"
              @click="sumOddEvenFilter = 'oddSum'">合单</button>
            <button class="chip" :class="sumOddEvenFilter === 'evenSum' ? 'chip--active' : ''" type="button"
              @click="sumOddEvenFilter = 'evenSum'">合双</button>
            <button class="chip" :class="sumOddEvenFilter === 'all' ? 'chip--active' : ''" type="button"
              @click="sumOddEvenFilter = 'all'">全部</button>
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-label">家/野肖过滤</div>
          <div class="chip-row">
            <button class="chip" :class="homeWildFilter === 'home' ? 'chip--active' : ''" type="button"
              @click="homeWildFilter = 'home'">家肖</button>
            <button class="chip" :class="homeWildFilter === 'wild' ? 'chip--active' : ''" type="button"
              @click="homeWildFilter = 'wild'">野肖</button>
            <button class="chip" :class="homeWildFilter === 'all' ? 'chip--active' : ''" type="button"
              @click="homeWildFilter = 'all'">全部</button>
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-label">天/地肖过滤</div>
          <div class="chip-row">
            <button class="chip" :class="skyEarthFilter === 'sky' ? 'chip--active' : ''" type="button"
              @click="skyEarthFilter = 'sky'">天肖</button>
            <button class="chip" :class="skyEarthFilter === 'earth' ? 'chip--active' : ''" type="button"
              @click="skyEarthFilter = 'earth'">地肖</button>
            <button class="chip" :class="skyEarthFilter === 'all' ? 'chip--active' : ''" type="button"
              @click="skyEarthFilter = 'all'">全部</button>
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-label">头数过滤</div>
          <div class="chip-row">
            <button v-for="h in availableHeads" :key="`head-${h}`" class="chip"
              :class="selectedHeads.includes(h) ? 'chip--active' : ''" type="button" @click="toggleHead(h)">{{ h
              }}</button>
            <van-button v-if="availableHeads.length" size="small" plain @click="selectedHeads = []">清空头数</van-button>
          </div>
        </div>
        <div class="filter-group">
          <div class="filter-label">位数过滤</div>
          <div class="chip-row">
            <button v-for="u in availableUnits" :key="`unit-${u}`" class="chip"
              :class="selectedUnits.includes(u) ? 'chip--active' : ''" type="button" @click="toggleUnit(u)">{{ u
              }}</button>
            <van-button v-if="availableUnits.length" size="small" plain @click="selectedUnits = []">清空位数</van-button>
          </div>
        </div>

      </section>

      <!-- 过滤结果（基于已选号码） -->
      <section class="filters-result" :class="{ 'sticky-enabled': resultsStickyEnabled }">
        <div class="results-head">
          <h3 class="section-title">过滤结果（基于已选）<span class="selected-count">{{ filteredSelectedRecords.length }}</span>
          </h3>
          <div class="head-actions">
            <span class="head-tip">置顶</span>
            <van-switch v-model="resultsStickySelected" size="20px" />
          </div>
        </div>
        <div v-if="filteredSelectedRecords.length === 0" class="empty">暂无过滤结果</div>
        <div v-else class="result-grid">
          <NumberButton v-for="rec in filteredSelectedRecords" :key="`sel-${rec.id}`" :id="Number(rec.id)"
            :active="selectedNumbers.includes(Number(rec.id))" :disabled="rec.disabled === 'true'"
            :wave-color="rec.waveColor" :five-elements="rec.fiveElements" :chinese-zodiac="rec.chineseZodiac"
            :odd-and-even="rec.oddAndEven" :sum-odd-and-even="rec.sumOddAndEven" @select="handleSelect" />
        </div>
      </section>

      <!-- 底部操作按钮 -->
      <div class="save-bar">
        <van-button type="primary" block @click="saveAndCopy">复制保存</van-button>
        <van-button type="danger" block plain @click="deleteSaved">删除本地记录</van-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.header-fixed {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.content {
  padding: 12px;
  padding-bottom: 80px;
  /* 为底部按钮留出空间 */
  background: #f7f7f7;
}

.selected-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  box-shadow: var(--shadow-soft);
}

.selected-card.sticky-enabled {
  position: sticky;
  top: 46px;
  z-index: 1000;
  backdrop-filter: saturate(180%) blur(6px);
  background: color-mix(in oklab, var(--color-surface), white 90%);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 2px 12px 0 #9c9c9c;
}

.selected-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.head-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.head-tip {
  font-size: 12px;
  color: var(--color-text-muted);
}

.selected-title {
  font-size: 14px;
  color: #222;
}

.selected-title-group {
  display: inline-flex;
  align-items: center;
}

.selected-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  margin-left: 8px;
  padding: 0 6px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1;
}

.number-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.tag--selected {
  background: #1989fa;
  color: #fff;
}

/* 红色标签样式 */
.tag--red {
  background: #ff4d4f;
  color: #fff;
}

/* 绿色标签样式 */
.tag--green {
  background: #52c41a;
  color: #fff;
}

/* 蓝色标签样式 */
.tag--blue {
  background: #1890ff;
  color: #fff;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.tabs-section {
  margin-top: 12px;
}

.numbers-grid {
  margin-top: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-2);
  justify-items: center;
  align-items: center;
}

.num-btn {
  height: 40px;
  border-radius: 999px;
  border: 1px solid #e5e5e5;
  background: #fff;
  color: #333;
}

.filters {
  margin-top: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.filters-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 14px;
  color: var(--color-text-muted);
}

.filter-group {
  margin-top: 12px;
}

.filter-label {
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.chip {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
  transition: transform .12s ease, box-shadow .12s ease, background-color .12s ease, border-color .12s ease;
}

.chip:hover {
  box-shadow: var(--shadow-soft);
  transform: translateY(-1px);
}

.chip:active {
  transform: translateY(-2px);
}

.chip--active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.five-section {
  margin-top: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.element-title {
  margin-top: 8px;
  font-size: 14px;
  color: #333;
}

.element-numbers {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: 8px;
}

.element-summary {
  margin-top: 12px;
  font-size: 12px;
  color: #666;
  line-height: 1.6;
}

.element-actions {
  margin-top: 8px;
}

.filters-result {
  margin-top: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.filters-result.sticky-enabled {
  width: 100%;
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 1000;
  backdrop-filter: saturate(180%) blur(6px);
  background: color-mix(in oklab, var(--color-surface), white 90%);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 4px 12px 0 #9c9c9c;
}

.results-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.result-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: 8px;
}

.empty {
  font-size: 12px;
  color: var(--color-text-muted);
}

.zodiac-section {
  margin-top: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.z-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.z-title {
  font-size: 16px;
  color: var(--color-text);
}

.z-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.z-switch-label {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0 6px;
}

.z-order-switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.condition-section {
  margin-top: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.c-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.c-title {
  font-size: 16px;
  color: var(--color-text);
}

.z-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  margin-top: var(--space-3);
  background: #fafafa;
}

.z-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: transform .2s ease, background-color .2s ease, border-color .2s ease;
  border: 2px solid var(--color-border);
}

.z-card--active {
  transform: translateY(-2px);
  border-color: var(--color-primary);
  background: color-mix(in oklab, var(--color-primary), white 92%);
}

.z-card--active::after {
  content: '✓';
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.z-avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid transparent;
}

.z-card--active .z-avatar {
  border-color: var(--color-primary);
}

.z-emoji {
  font-size: 24px;
}

.z-name {
  font-size: 14px;
  color: var(--color-text);
}

.z-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  justify-content: center;
}

.z-num {
  min-width: 28px;
  height: 24px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
}

.z-num--red {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.z-num--green {
  border-color: #52c41a;
  color: #52c41a;
}

.z-num--blue {
  border-color: #1890ff;
  color: #1890ff;
}

.z-num.is-active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.z-num.is-active.z-num--red {
  background: #ff4d4f;
  border-color: #ff4d4f;
  color: #fff;
}

.z-num.is-active.z-num--green {
  background: #52c41a;
  border-color: #52c41a;
  color: #fff;
}

.z-num.is-active.z-num--blue {
  background: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.save-bar {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
