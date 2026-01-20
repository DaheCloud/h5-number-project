import { describe, it, expect } from 'vitest'
import { computeRanking, clearAll, addGroup } from '../src/utils/zodiac'

describe('zodiac utils', () => {
  it('compute ranking ordered by ratio desc', () => {
    const groups = [
      ['鼠','牛','虎'],
      ['鼠','兔'],
      ['龙','鼠']
    ]
    const r = computeRanking(groups)
    expect(r[0].name).toBe('鼠')
    expect(r[0].count).toBe(3)
    expect(Math.round(r[0].ratio * 100)).toBe(Math.round((3/7)*100))
    const names = r.map(i => i.name)
    expect(names).toContain('牛')
    expect(names).toContain('虎')
    expect(names).toContain('兔')
    expect(names).toContain('龙')
  })

  it('clearAll resets groups and selected', () => {
    const groups = [['鼠'], ['牛','虎']]
    const selected = ['兔']
    const r = clearAll(groups, selected)
    expect(r.groups.length).toBe(0)
    expect(r.selected.length).toBe(0)
  })

  it('addGroup appends a copy of selected', () => {
    const groups: string[][] = []
    const selected = ['鼠','牛']
    const g2 = addGroup(groups, selected)
    expect(g2.length).toBe(1)
    selected.push('虎')
    expect(g2[0]).toEqual(['鼠','牛'])
  })
})