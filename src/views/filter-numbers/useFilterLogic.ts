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
  const excludedFilters = ref<string[]>([])
  const excludedNumbers = ref<string[]>([])

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
    if (selectedFilters.value.length === 0 && excludedFilters.value.length === 0) {
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

    // 反过滤：排除匹配禁止条件的号码
    if (excludedFilters.value.length > 0) {
      result = result.filter(numObj => {
        return !excludedFilters.value.some(filter => matchesFilter(numObj, filter))
      })
    }

    // 手动排除
    if (excludedNumbers.value.length > 0) {
      result = result.filter(n => !excludedNumbers.value.includes(n.id.toString().padStart(2, '0')))
    }

    // 数据源本身按号码升序，无需再排序
    return result.map(n => n.id.toString().padStart(2, '0'))
  })

  const totalItems = computed(() => filteredNumbers.value.length)

  const toggleFilter = (item: string) => {
    const index = selectedFilters.value.indexOf(item)
    if (index > -1) {
      selectedFilters.value.splice(index, 1)
      return
    }
    // 与反过滤互斥：同名条件自动解除禁止，避免结果恒为空
    if (excludedFilters.value.includes(item)) {
      excludedFilters.value = excludedFilters.value.filter(f => f !== item)
      toast(`已取消反过滤「${item}」`)
    }
    selectedFilters.value.push(item)
  }

  const clearFilters = () => {
    selectedFilters.value = []
    excludedFilters.value = []
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

  const toggleExcludedFilter = (item: string) => {
    const index = excludedFilters.value.indexOf(item)
    if (index > -1) {
      excludedFilters.value.splice(index, 1)
      return
    }
    // 与正向筛选互斥：同名条件自动取消筛选
    if (selectedFilters.value.includes(item)) {
      selectedFilters.value = selectedFilters.value.filter(f => f !== item)
      toast(`已取消筛选「${item}」`)
    }
    excludedFilters.value.push(item)
  }

  const onSave = () => {
    try {
      const settings = {
        filters: selectedFilters.value,
        excludedFilters: excludedFilters.value,
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
        excludedFilters.value = settings.excludedFilters || []
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
    excludedFilters,
    excludedNumbers,
    filteredNumbers,
    totalItems,
    toggleFilter,
    clearFilters,
    toggleExclusion,
    toggleExcludedFilter,
    onSave,
    onLoad,
    getWaveColorById,
    getNumberById,
    groupedByZodiac
  }
}
