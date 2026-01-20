export const ALL_ZODIACS = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']

export function computeRanking(groups) {
  const total = groups.reduce((s, g) => s + g.length, 0)
  if (total === 0) return []
  const m = new Map()
  for (const g of groups) for (const n of g) m.set(n, (m.get(n) || 0) + 1)
  return Array.from(m.entries())
    .map(([name, count]) => ({ name, count, ratio: count / total }))
    .sort((a, b) => b.ratio - a.ratio)
}

export function clearAll() {
  return { groups: [], selected: [] }
}

export function addGroup(groups, selected) {
  return [...groups, [...selected]]
}