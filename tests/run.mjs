import assert from 'node:assert'
import { computeRanking, clearAll, addGroup } from '../src/utils/zodiac.js'

function testComputeRanking() {
  const groups = [ ['鼠','牛','虎'], ['鼠','兔'], ['龙','鼠'] ]
  const r = computeRanking(groups)
  assert.strictEqual(r[0].name, '鼠')
  assert.strictEqual(r[0].count, 3)
  const p = Math.round(r[0].ratio * 100)
  assert.strictEqual(p, Math.round((3/7)*100))
}

function testClearAll() {
  const res = clearAll([['鼠'], ['牛','虎']], ['兔'])
  assert.strictEqual(res.groups.length, 0)
  assert.strictEqual(res.selected.length, 0)
}

function testAddGroup() {
  const g1 = []
  const sel = ['鼠','牛']
  const g2 = addGroup(g1, sel)
  assert.strictEqual(g2.length, 1)
  sel.push('虎')
  assert.deepStrictEqual(g2[0], ['鼠','牛'])
}

function run() {
  testComputeRanking()
  testClearAll()
  testAddGroup()
  console.log('All tests passed')
}

run()