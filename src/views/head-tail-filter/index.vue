<script setup lang="ts">
defineOptions({ name: 'HeadTailFilterPage' })
import { ref, computed } from 'vue'

const activeTab = ref<'head' | 'tail'>('head')

const heads = [0, 1, 2, 3, 4]
const units = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

const selectedHeads = ref<number[]>([])
const selectedUnits = ref<number[]>([])

function toggleHead(n: number) {
  const i = selectedHeads.value.indexOf(n)
  if (i > -1) selectedHeads.value.splice(i, 1)
  else selectedHeads.value.push(n)
}

function toggleUnit(n: number) {
  const i = selectedUnits.value.indexOf(n)
  if (i > -1) selectedUnits.value.splice(i, 1)
  else selectedUnits.value.push(n)
}

function clearCurrent() {
  if (activeTab.value === 'head') selectedHeads.value = []
  else selectedUnits.value = []
}

async function copySelected() {
  const list = activeTab.value === 'head' ? selectedHeads.value : selectedUnits.value
  if (list.length === 0) { try { showToast('暂无选择') } catch {} return }
  const text = list.join('.')
  try { await navigator.clipboard.writeText(text); try { showToast('复制成功') } catch {} } catch { try { showToast('复制失败') } catch {} }
}

const groupsHead = ref<number[][]>([])
const groupsUnit = ref<number[][]>([])

function confirmGroup() {
  if (activeTab.value === 'head') {
    if (selectedHeads.value.length === 0) { try { showToast('请先选择头数') } catch {} return }
    groupsHead.value.push([...selectedHeads.value])
    selectedHeads.value = []
    try { showToast('已添加一组') } catch {}
  } else {
    if (selectedUnits.value.length === 0) { try { showToast('请先选择尾数') } catch {} return }
    groupsUnit.value.push([...selectedUnits.value])
    selectedUnits.value = []
    try { showToast('已添加一组') } catch {}
  }
}

function deleteGroup(index: number) {
  if (activeTab.value === 'head') groupsHead.value.splice(index, 1)
  else groupsUnit.value.splice(index, 1)
  try { showToast('已删除该组') } catch {}
}

async function clearAllGroups() {
  try {
    await showConfirmDialog({
      title: '确认操作',
      message: '确定要清空所有组吗？此操作不可撤销',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      showCancelButton: true,
    })
    if (activeTab.value === 'head') groupsHead.value = []
    else groupsUnit.value = []
    try { showToast('所有组已成功清空') } catch {}
  } catch {}
}

const totalCount = computed(() => {
  const list = activeTab.value === 'head' ? groupsHead.value : groupsUnit.value
  return list.reduce((s, g) => s + g.length, 0)
})

const ranking = computed(() => {
  const list = activeTab.value === 'head' ? groupsHead.value : groupsUnit.value
  if (totalCount.value === 0) return [] as { name: string; count: number; ratio: number }[]
  const m = new Map<number, number>()
  for (const g of list) for (const n of g) m.set(n, (m.get(n) || 0) + 1)
  return Array.from(m.entries())
    .map(([name, count]) => ({ name: String(name), count, ratio: count / totalCount.value }))
    .sort((a, b) => b.ratio - a.ratio)
})
</script>

<template>
  <div class="page head-tail-filter">
    <header class="header-fixed">
      <van-nav-bar title="头尾过滤" />
    </header>

    <div class="content">
      <section class="selected-card">
        <div class="selected-head">
          <span class="selected-title">已选{{ activeTab === 'head' ? '头数' : '尾数' }}</span>
        </div>
        <div class="number-tags">
          <span v-for="n in (activeTab==='head'?selectedHeads:selectedUnits)" :key="n" class="tag tag--selected">{{ n }}</span>
          <span v-if="(activeTab==='head'?selectedHeads:selectedUnits).length === 0" class="tag tag--empty">暂无选择</span>
        </div>
        <div class="actions">
          <van-button size="small" plain type="primary" @click="copySelected">复制</van-button>
          <van-button size="small" plain @click="clearCurrent">清空</van-button>
          <van-button size="small" type="primary" @click="confirmGroup">确认本组</van-button>
        </div>
      </section>

      <section class="tabs-section">
        <van-tabs v-model:active="activeTab" type="line">
          <van-tab title="头数" name="head" />
          <van-tab title="尾数" name="tail" />
        </van-tabs>
      </section>

      <section class="grid-section">
        <div class="grid">
          <button
            v-for="n in (activeTab==='head'?heads:units)"
            :key="n"
            type="button"
            class="chip"
            :class="(activeTab==='head'?selectedHeads:selectedUnits).includes(n) ? 'chip--active' : ''"
            @click="activeTab==='head'?toggleHead(n):toggleUnit(n)"
          >
            {{ n }}
          </button>
        </div>
      </section>

      <section class="groups-section">
        <div class="groups-head">
          <van-button size="small" type="danger" plain @click="clearAllGroups">
            <van-icon name="delete" />
            <span class="ml-4">清空所有组</span>
          </van-button>
          <h3 class="section-title">已添加的组（{{ activeTab==='head' ? '头数' : '尾数' }}）</h3>
        </div>
        <div v-if="(activeTab==='head'?groupsHead:groupsUnit).length === 0" class="empty">暂无分组</div>
        <div v-else class="groups">
          <div v-for="(g, i) in (activeTab==='head'?groupsHead:groupsUnit)" :key="i" class="group">
            <div class="group-head">
              <span class="group-title">第{{ i + 1 }}组</span>
              <van-button
                icon="delete"
                size="mini"
                type="danger"
                plain
                class="group-delete-btn"
                @click="deleteGroup(i)"
              />
            </div>
            <div class="group-tags">
              <span v-for="n in g" :key="n" class="tag tag--selected">{{ n }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="stats-section">
        <h3 class="section-title">统计结果</h3>
        <div v-if="ranking.length === 0" class="empty">暂无数据</div>
        <div v-else class="stats">
          <div v-for="item in ranking" :key="item.name" class="stat-row">
            <div class="stat-label">{{ item.name }}</div>
            <div class="stat-bar">
              <div class="stat-fill" :style="{ width: Math.round(item.ratio * 100) + '%' }"></div>
            </div>
            <div class="stat-meta">{{ (item.ratio * 100).toFixed(1) }}%（{{ item.count }}）</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; min-height: 100%; }
.header-fixed { position: sticky; top: 0; z-index: 1000; }
.content { padding: 12px; padding-bottom: 80px; background: #f7f7f7; }
.selected-card { background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-3); box-shadow: var(--shadow-soft); }
.selected-head { display: flex; align-items: center; justify-content: space-between; }
.selected-title { font-size: 14px; color: #222; }
.number-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.tag { display: inline-flex; align-items: center; justify-content: center; min-width: 48px; height: 36px; padding: 0 8px; border-radius: 999px; font-weight: 600; font-size: 14px; }
.tag--selected { background: #1989fa; color: #fff; }
.actions { display: flex; gap: 8px; margin-top: 10px; }
.tabs-section { margin-top: 12px; background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-3); }
.grid-section { margin-top: 12px; background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-3); }
.grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-2); }
.chip { padding: 10px 14px; border-radius: var(--radius-full); border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); font-size: 14px; transition: transform .12s ease, box-shadow .12s ease, background-color .12s ease, border-color .12s ease; }
.chip:hover { box-shadow: var(--shadow-soft); transform: translateY(-1px); }
.chip:active { transform: translateY(-2px); }
.chip--active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

.groups-section { margin-top: 24px; background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-3); box-shadow: var(--shadow-soft); }
.groups-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-title { color: #000; }
.groups { display: flex; flex-direction: column; gap: 12px; }
.group { display: flex; flex-direction: column; gap: 6px; }
.group-title { font-size: 13px; color: var(--color-text-muted); }
.group-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.empty { font-size: 13px; color: #888; }

.group-head { display: flex; align-items: center; justify-content: space-between; }
.group-delete-btn { min-width: auto; width: 28px; height: 28px; padding: 0; border-radius: 999px; }

.stats-section { margin-top: 12px; background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-3); }
.stats { display: flex; flex-direction: column; gap: 10px; }
.stat-row { display: grid; grid-template-columns: 60px 1fr 80px; align-items: center; gap: 8px; }
.stat-label { font-size: 14px; color: var(--color-text); }
.stat-bar { height: 10px; background: #f0f0f0; border-radius: var(--radius-full); overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,.06); }
.stat-fill { height: 100%; background: var(--color-primary); transition: width .25s ease; }
.stat-meta { text-align: right; font-size: 12px; color: var(--color-text-muted); }

@media (max-width: 480px) { .grid { grid-template-columns: repeat(5, 1fr); } }
</style>
