/**
 * 号码匹配引擎 —— 统一的条件 -> 号码匹配逻辑
 * 合并了原 num-chose 中 idsForOption 与 filter-numbers 中 matchNumber 的重复逻辑
 */
import { lotteryDataService, type LotteryNumber, type ZodiacKey, type WaveKey } from '../services/lotteryData'

// ── 映射表 ──

const ZH_TO_ZODIAC: Record<string, ZodiacKey> = {
  '鼠': 'rat', '牛': 'ox', '虎': 'tiger', '兔': 'rabbit', '龙': 'dragon', '蛇': 'snake',
  '马': 'horse', '羊': 'goat', '猴': 'monkey', '鸡': 'rooster', '狗': 'dog', '猪': 'pig',
}

const ZH_TO_ELEMENT: Record<string, 'metal' | 'wood' | 'water' | 'fire' | 'earth'> = {
  '金': 'metal', '木': 'wood', '水': 'water', '火': 'fire', '土': 'earth',
}

const ZH_TO_WAVE: Record<string, WaveKey> = { '红': 'red', '绿': 'green', '蓝': 'blue' }

const OTHER_ATTR_MAP: Record<string, string> = {
  '天肖': '天肖', '地肖': '地肖',
  '家肖': '家禽', '野肖': '野兽',
  '左肖': '左肖', '右肖': '右肖',
  '前肖': '前肖', '后肖': '后肖',
  '阴肖': '阴性', '阳肖': '阳性',
}

// ── 缓存 ──

let cachedAllIds: number[] | null = null
let cachedNumbers: LotteryNumber[] | null = null

function getAllIds(): number[] {
  if (!cachedAllIds) {
    cachedAllIds = lotteryDataService.getAllNumbers().map(n => n.id)
  }
  return cachedAllIds
}

function getAllNumbers(): LotteryNumber[] {
  if (!cachedNumbers) {
    cachedNumbers = lotteryDataService.getAllNumbers()
  }
  return cachedNumbers
}

/** 刷新缓存（数据变更后调用） */
export function invalidateMatcherCache() {
  cachedAllIds = null
  cachedNumbers = null
}

// ── 分类识别 ──

export type FilterCategory =
  | 'oddEven' | 'bigSmall' | 'wave' | 'poultryBeast' | 'sumOddEven' | 'sumBigSmall'
  | 'bigSmallOddEven' | 'tailBigSmall' | 'fiveElements' | 'colorOddEven' | 'zodiac'
  | 'tailExact' | 'head' | 'men' | 'duan' | 'heShu' | 'skyEarth' | 'yinYang'
  | 'leftRight' | 'frontBack' | 'headOddEven' | 'heWei' | 'other'

export function getFilterCategory(filter: string): FilterCategory {
  if (['单', '双'].includes(filter)) return 'oddEven'
  if (['大', '小'].includes(filter)) return 'bigSmall'
  if (['红波', '绿波', '蓝波'].includes(filter)) return 'wave'
  if (['家禽', '野兽'].includes(filter)) return 'poultryBeast'
  if (['合单', '合双'].includes(filter)) return 'sumOddEven'
  if (['合大', '合小'].includes(filter)) return 'sumBigSmall'
  if (['大单', '小单', '大双', '小双'].includes(filter)) return 'bigSmallOddEven'
  if (['尾大', '尾小'].includes(filter)) return 'tailBigSmall'
  if (['金', '木', '水', '火', '土'].includes(filter)) return 'fiveElements'
  if (['红单', '红双', '绿单', '绿双', '蓝单', '蓝双'].includes(filter)) return 'colorOddEven'
  if (['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'].includes(filter)) return 'zodiac'
  if (filter.endsWith('尾') && filter !== '大尾' && filter !== '小尾') return 'tailExact'
  if (filter.endsWith('头') && !filter.includes('头单') && !filter.includes('头双')) return 'head'
  if (filter.endsWith('门')) return 'men'
  if (filter.endsWith('段')) return 'duan'
  if (filter.endsWith('合') && !filter.startsWith('合')) return 'heShu'
  if (['天肖', '地肖'].includes(filter)) return 'skyEarth'
  if (['阴肖', '阳肖'].includes(filter)) return 'yinYang'
  if (['左肖', '右肖'].includes(filter)) return 'leftRight'
  if (['前肖', '后肖'].includes(filter)) return 'frontBack'
  if (/\d头[单双]/.test(filter)) return 'headOddEven'
  if (/\d合尾/.test(filter)) return 'heWei'
  return 'other'
}

// ── 单个号码匹配检查 ──

function sumDigits(n: number): number {
  return Math.floor(n / 10) + (n % 10)
}

/** 检查一个号码是否匹配某个条件 */
export function matchesFilter(numObj: LotteryNumber, filter: string): boolean {
  const id = numObj.id
  switch (filter) {
    case '单': return numObj.oddAndEven === 'odd'
    case '双': return numObj.oddAndEven === 'even'
    case '大': return id >= 25
    case '小': return id <= 24
    case '红波': return numObj.wave.key === 'red'
    case '绿波': return numObj.wave.key === 'green'
    case '蓝波': return numObj.wave.key === 'blue'
    case '合单': return numObj.sumOddAndEven === 'odd'
    case '合双': return numObj.sumOddAndEven === 'even'
    case '合大': return sumDigits(id) >= 7
    case '合小': return sumDigits(id) <= 6
    case '尾大': return numObj.tail >= 5
    case '尾小': return numObj.tail <= 4
    case '大单': return id >= 25 && numObj.oddAndEven === 'odd'
    case '小单': return id <= 24 && numObj.oddAndEven === 'odd'
    case '大双': return id >= 25 && numObj.oddAndEven === 'even'
    case '小双': return id <= 24 && numObj.oddAndEven === 'even'
  }

  // 五行
  if (filter in ZH_TO_ELEMENT) {
    return numObj.wuxing.key === ZH_TO_ELEMENT[filter]
  }

  // 生肖
  if (filter in ZH_TO_ZODIAC) {
    return numObj.zodiac.key === ZH_TO_ZODIAC[filter]
  }

  // 波色单双
  const waveOE = filter.match(/^(红|绿|蓝)(单|双)$/)
  if (waveOE) {
    return numObj.wave.key === ZH_TO_WAVE[waveOE[1]]
      && numObj.oddAndEven === (waveOE[2] === '单' ? 'odd' : 'even')
  }

  // 头单双
  const headOE = filter.match(/^(\d)头(单|双)$/)
  if (headOE) {
    const h = Number(headOE[1])
    return Math.floor(id / 10) === h && (id % 2 === (headOE[2] === '单' ? 1 : 0))
  }

  // 合尾
  const hw = filter.match(/^(\d)合尾$/)
  if (hw) return sumDigits(id) % 10 === Number(hw[1])

  // 尾数精确
  const tail = filter.match(/^(\d)尾$/)
  if (tail) return id % 10 === Number(tail[1])

  // 头数
  const head = filter.match(/^(\d)头$/)
  if (head) return Math.floor(id / 10) === Number(head[1])

  // 门数
  if (/^[1-5]门$/.test(filter)) return numObj.men === filter

  // 段位
  if (/^[1-7]段$/.test(filter)) return numObj.duan === filter

  // 合数
  const hs = filter.match(/^(\d{1,2})合$/)
  if (hs) {
    const num = hs[1].padStart(2, '0')
    return numObj.heShu === `合${num}`
  }

  // 其它属性
  return checkOtherAttribute(numObj, filter)
}

// ── 批量 ID 查询 ──

/** 获取某个条件匹配的所有号码 ID */
export function getFilterIds(option: string): number[] {
  const allIds = getAllIds()
  const numbers = getAllNumbers()

  // 五行
  if (option in ZH_TO_ELEMENT) {
    return numbers.filter(n => n.wuxing.key === ZH_TO_ELEMENT[option]).map(n => n.id)
  }

  // 生肖
  if (option in ZH_TO_ZODIAC) {
    return numbers.filter(n => n.zodiac.key === ZH_TO_ZODIAC[option]).map(n => n.id)
  }

  // 门数
  if (/^[1-5]门$/.test(option)) {
    return numbers.filter(n => n.men === option).map(n => n.id)
  }

  // 段位
  if (/^[1-7]段$/.test(option)) {
    return numbers.filter(n => n.duan === option).map(n => n.id)
  }

  // 合数
  const heShuMatch = option.match(/^(\d{1,2})合$/)
  if (heShuMatch) {
    const key = '合' + heShuMatch[1].padStart(2, '0')
    return numbers.filter(n => n.heShu === key).map(n => n.id)
  }

  // 合单双
  if (option === '合单') return numbers.filter(n => n.heDanShuang === '单').map(n => n.id)
  if (option === '合双') return numbers.filter(n => n.heDanShuang === '双').map(n => n.id)

  // 头尾数
  if (option === '大尾') return allIds.filter(n => n % 10 >= 5)
  if (option === '小尾') return allIds.filter(n => n % 10 <= 4)
  const tailMatch = option.match(/^(\d)尾$/)
  if (tailMatch) { const d = Number(tailMatch[1]); return allIds.filter(n => n % 10 === d) }
  const headMatch = option.match(/^(\d)头$/)
  if (headMatch) { const d = Number(headMatch[1]); return allIds.filter(n => Math.floor(n / 10) === d) }

  // 波色单双
  const waveOddEven = option.match(/^(红|绿|蓝)(单|双)$/)
  if (waveOddEven) {
    const wave = ZH_TO_WAVE[waveOddEven[1]]
    const oe = waveOddEven[2] === '单' ? 'odd' : 'even'
    return numbers.filter(n => n.wave.key === wave && n.oddAndEven === oe).map(n => n.id)
  }

  // 头单双
  const headOddEven = option.match(/^(\d)头(单|双)$/)
  if (headOddEven) {
    const h = Number(headOddEven[1])
    const isOdd = headOddEven[2] === '单'
    return allIds.filter(n => Math.floor(n / 10) === h && (n % 2 === (isOdd ? 1 : 0)))
  }

  // 合尾
  const heWei = option.match(/^(\d)合尾$/)
  if (heWei) {
    const t = Number(heWei[1])
    return allIds.filter(n => sumDigits(n) % 10 === t)
  }

  // 其它属性（支持 UI 标签和 JSON key 两种传入方式）
  if (option in OTHER_ATTR_MAP) {
    return getOtherAttrIds(OTHER_ATTR_MAP[option])
  }
  // 也支持直接传入 JSON key（如 '家禽'、'野兽'）
  const directResult = getOtherAttrIds(option)
  if (directResult.length > 0) return directResult

  return []
}

// ── 其它属性辅助 ──

function checkOtherAttribute(numObj: LotteryNumber, attrName: string): boolean {
  const jsonKey = OTHER_ATTR_MAP[attrName] || attrName
  const values = lotteryDataService.getOtherAttributeZodiacs(jsonKey)
  return Array.isArray(values) && values.includes(numObj.zodiac.label)
}

/** 通过 JSON key 直接获取其它属性的匹配号码 ID */
export function getOtherAttrIds(jsonKey: string): number[] {
  const zodiacs = lotteryDataService.getOtherAttributeZodiacs(jsonKey)
  if (!zodiacs.length) return []
  const targetKeys = new Set<ZodiacKey>()
  zodiacs.forEach(z => {
    if (z in ZH_TO_ZODIAC) targetKeys.add(ZH_TO_ZODIAC[z])
  })
  const numbers = getAllNumbers()
  return numbers
    .filter(n => targetKeys.has(n.zodiac.key))
    .map(n => n.id)
}
