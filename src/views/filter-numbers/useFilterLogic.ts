import { ref, computed } from 'vue'
import { lotteryDataService, type LotteryNumber } from '@/services/lotteryData'
import { matchesFilter, getFilterCategory } from '@/utils/numberMatcher'
import { toast } from '@/utils/feedback'

export function useFilterLogic() {
  const allNumbers = ref<LotteryNumber[]>([])

  try {
    allNumbers.value = lotteryDataService.getAllNumbers()
  } catch (error) {
    console.error('Failed to load lottery data:', error)
    toast('数据加载失败，请刷新重试')
  }

  const selectedFilters = ref<string[]>([])
  const excludedNumbers = ref<string[]>([])
  const searchText = ref('')
  const searchType = ref<'exact' | 'fuzzy' | 'regex'>('fuzzy')
  const sortType = ref<'asc' | 'desc'>('asc')

  const getWaveColorById = (id: number): string => {
    const number = allNumbers.value.find((num) => num.id === id)
    return number?.wave.key || ''
  }

  const getNumberById = (id: number): LotteryNumber | undefined => {
    return allNumbers.value.find((num) => num.id === id)
  }

  /** 按生肖分组当前筛选结果，返回 [生肖, 号码详情[]] 数组 */
  const groupedByZodiac = computed(() => {
    const groups: { zodiac: string; items: { num: string; wave: string; wuxing: string }[] }[] = []
    const zodiacOrder = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
    const map = new Map<string, { num: string; wave: string; wuxing: string }[]>()

    for (const numStr of filteredNumbers.value) {
      const id = Number(numStr)
      const numObj = allNumbers.value.find((n) => n.id === id)
      if (!numObj) continue
      const zodiacLabel = numObj.zodiac.label
      if (!map.has(zodiacLabel)) map.set(zodiacLabel, [])
      map.get(zodiacLabel)!.push({
        num: numStr,
        wave: numObj.wave.key,
        wuxing: numObj.wuxing.label,
      })
    }

    for (const z of zodiacOrder) {
      const items = map.get(z)
      if (items && items.length > 0) {
        groups.push({ zodiac: z, items })
      }
    }
    return groups
  })

  const filteredNumbers = computed(() => {
    if (selectedFilters.value.length === 0 && !searchText.value) {
      return []
    }

    let result = allNumbers.value

    // 条件过滤
    if (selectedFilters.value.length > 0) {
      const filtersByCategory: Record<string, string[]> = {}
      selectedFilters.value.forEach(f => {
        const cat = getFilterCategory(f)
        if (!filtersByCategory[cat]) filtersByCategory[cat] = []
        filtersByCategory[cat].push(f)
      })

      result = result.filter(numObj => {
        return Object.keys(filtersByCategory).every(category => {
          const filtersInCat = filtersByCategory[category]
          if (!filtersInCat) return true
          return filtersInCat.some(filter => matchesFilter(numObj, filter))
        })
      })
    }

    // 搜索
    if (searchText.value) {
      const query = searchText.value.trim()
      if (searchType.value === 'exact') {
        result = result.filter(n => n.id.toString() === query || n.id.toString().padStart(3, '0') === query)
      } else if (searchType.value === 'fuzzy') {
        result = result.filter(n => n.id.toString().includes(query))
      } else if (searchType.value === 'regex') {
        try {
          const regex = new RegExp(query)
          result = result.filter(n => regex.test(n.id.toString()))
        } catch {
          return []
        }
      }
    }

    // 手动排除
    if (excludedNumbers.value.length > 0) {
      result = result.filter(n => !excludedNumbers.value.includes(n.id.toString().padStart(2, '0')))
    }

    // 排序
    result = [...result].sort((a, b) => {
      const valA = a.id.toString().padStart(3, '0')
      const valB = b.id.toString().padStart(3, '0')
      return sortType.value === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA)
    })

    return result.map(n => n.id.toString().padStart(2, '0'))
  })

  const totalItems = computed(() => filteredNumbers.value.length)

  const toggleFilter = (item: string) => {
    const index = selectedFilters.value.indexOf(item)
    if (index === -1) {
      selectedFilters.value.push(item)
    } else {
      selectedFilters.value.splice(index, 1)
    }
  }

  const clearFilters = () => {
    selectedFilters.value = []
    excludedNumbers.value = []
    toast('已清空条件')
  }

  const toggleExclusion = (num: string) => {
    const idx = excludedNumbers.value.indexOf(num)
    if (idx > -1) {
      excludedNumbers.value.splice(idx, 1)
    } else {
      excludedNumbers.value.push(num)
    }
  }

  const onSave = () => {
    try {
      const settings = {
        filters: selectedFilters.value,
        excluded: excludedNumbers.value
      }
      localStorage.setItem('filterSettings', JSON.stringify(settings))
      toast('筛选条件已保存')
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }

  const onLoad = () => {
    const saved = localStorage.getItem('filterSettings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        selectedFilters.value = settings.filters || []
        excludedNumbers.value = settings.excluded || []
        toast('筛选条件已加载')
      } catch (e) {
        console.error('Failed to parse saved settings')
      }
    } else {
      toast('暂无保存的条件')
    }
  }

  return {
    selectedFilters,
    filteredNumbers,
    totalItems,
    searchText,
    searchType,
    sortType,
    toggleFilter,
    clearFilters,
    toggleExclusion,
    onSave,
    onLoad,
    getWaveColorById,
    getNumberById,
    groupedByZodiac
  }
}
