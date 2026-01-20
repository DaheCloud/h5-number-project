<script setup lang="ts">
defineOptions({ name: 'ZodiacFilterPage' })
import { ref, computed } from 'vue'

const zodiacs = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']

const selected = ref<string[]>([])
const groups = ref<string[][]>([])

function toggle(name: string) {
  const i = selected.value.indexOf(name)
  if (i > -1) selected.value.splice(i, 1)
  else selected.value.push(name)
}

function clearAll() {
  selected.value = []
}

async function copySelected() {
  if (selected.value.length === 0) {
    showToast('暂无选择')
    return
  }
  const text = selected.value.join('.')
  try {
    await navigator.clipboard.writeText(text)
    showToast('复制成功')
  } catch {
    showToast('复制失败')
  }
}

function confirmGroup() {
  if (selected.value.length === 0) {
    showToast('请先选择生肖')
    return
  }
  groups.value.push([...selected.value])
  selected.value = []
  showToast('已添加一组')
}

const totalCount = computed(() => groups.value.reduce((s, g) => s + g.length, 0))
const ranking = computed(() => {
  if (totalCount.value === 0) return [] as { name: string; count: number; ratio: number }[]
  const m = new Map<string, number>()
  for (const g of groups.value) for (const n of g) m.set(n, (m.get(n) || 0) + 1)
  return Array.from(m.entries())
    .map(([name, count]) => ({ name, count, ratio: count / totalCount.value }))
    .sort((a, b) => b.ratio - a.ratio)
})

async function clearAllGroups() {
  try {
    await showConfirmDialog({
      title: '确认操作',
      message: '确定要清空所有组吗？此操作不可撤销',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      showCancelButton: true,
    })
    groups.value = []
    selected.value = []
    showToast('所有组已成功清空')
  } catch {}
}

function deleteGroup(index: number) {
  groups.value.splice(index, 1)
  try { showToast('已删除该组') } catch {}
}
</script>

<template>
  <div class="page zodiac-filter">
    <header class="header-fixed">
      <van-nav-bar title="生肖选择过滤" />
    </header>

    <div class="content">
      <section class="selected-card">
        <div class="selected-head">
          <span class="selected-title">已选生肖</span>
        </div>
        <div class="number-tags">
          <span v-for="n in selected" :key="n" class="tag tag--selected">{{ n }}</span>
          <span v-if="selected.length === 0" class="tag tag--empty">暂无选择</span>
        </div>
        <div class="actions">
          <van-button size="small" plain type="primary" @click="copySelected">复制</van-button>
          <van-button size="small" plain @click="clearAll">清空</van-button>
          <van-button size="small" type="primary" @click="confirmGroup">确认本组</van-button>
        </div>
      </section>

      <section class="grid-section">
        <div class="grid">
          <button
            v-for="name in zodiacs"
            :key="name"
            type="button"
            class="chip"
            :class="selected.includes(name) ? 'chip--active' : ''"
            @click="toggle(name)"
          >
            {{ name }}
          </button>
        </div>
      </section>

  <section class="groups-section">
        <div class="groups-head">
          <h3 class="section-title">已添加的组</h3>
          <van-button size="small" type="danger" plain @click="clearAllGroups">
            <van-icon name="delete" />
            <span class="ml-4">清空所有组</span>
          </van-button>
        </div>
        <div v-if="groups.length === 0" class="empty">暂无分组</div>
        <div v-else class="groups">
          <div v-for="(g, i) in groups" :key="i" class="group">
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
.grid-section { margin-top: 12px; background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-3); }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2); }
.chip { padding: 10px 14px; border-radius: var(--radius-full); border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); font-size: 14px; transition: transform .12s ease, box-shadow .12s ease, background-color .12s ease, border-color .12s ease; }
.chip:hover { box-shadow: var(--shadow-soft); transform: translateY(-1px); }
.chip:active { transform: translateY(-2px); }
.chip--active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
@media (max-width: 480px) { .grid { grid-template-columns: repeat(3, 1fr); } }

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
</style>
