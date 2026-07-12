<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from '@/utils/feedback'

interface ZodiacGroup {
  zodiac: string
  items: { num: string; wave: string; wuxing: string }[]
}

const props = defineProps<{
  totalItems: number
  selectedCount: number
  selectedFilters: string[]
  filteredNumbers: string[]
  getWaveColor: (id: number) => string
  groupedByZodiac: ZodiacGroup[]
}>()

const emit = defineEmits<{
  (e: 'clear'): void
  (e: 'removeFilter', item: string): void
  (e: 'toggleExclusion', num: string): void
}>()

const showHeader = computed(() => props.selectedCount > 0 || props.filteredNumbers.length > 0)

// ── 详情弹窗 ──
const showDetail = ref(false)
const openDetail = () => {
  if (props.filteredNumbers.length === 0) {
    toast('暂无结果可查看')
    return
  }
  showDetail.value = true
}
const closeDetail = () => { showDetail.value = false }

// 删除整个生肖分组
const removeGroup = (group: ZodiacGroup) => {
  group.items.forEach(item => emit('toggleExclusion', item.num))
  toast(`已删除${group.zodiac}肖 ${group.items.length} 个号码`)
}

// 按 ESC 关闭
watch(showDetail, (v) => {
  if (!v) return
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { showDetail.value = false; window.removeEventListener('keydown', onKey) }
  }
  window.addEventListener('keydown', onKey)
})

const copyResults = async () => {
  if (props.filteredNumbers.length === 0) { toast('暂无结果可复制'); return }
  const text = props.filteredNumbers.join(', ')
  try { await navigator.clipboard.writeText(text); toast('已复制到剪贴板') } catch {
    const textArea = document.createElement('textarea')
    textArea.value = text; document.body.appendChild(textArea); textArea.select()
    try { document.execCommand('copy'); toast('已复制到剪贴板') } catch { toast('复制失败') }
    document.body.removeChild(textArea)
  }
}
</script>

<template>
  <section v-if="showHeader" class="result-bar">
    <!-- 第一行：统计 + 操作 -->
    <div class="result-bar__summary">
      <div class="result-bar__stats">
        <span class="stat-item">
          <span class="stat-label">已选</span>
          <span class="stat-value text-primary">{{ selectedCount }}</span>
        </span>
        <span class="stat-divider"></span>
        <span class="stat-item">
          <span class="stat-label">结果</span>
          <span class="stat-value">{{ totalItems }}</span>
        </span>
      </div>
      <div class="result-bar__actions">
        <button class="mini-btn mini-btn--ghost" @click="copyResults" title="复制结果">
          <span class="icon-[tabler--copy] size-3.5"></span>
        </button>
        <button class="mini-btn mini-btn--info" @click="openDetail" title="按生肖查看详情">
          <span class="icon-[tabler--layout-grid] size-3.5"></span>
        </button>
        <button class="mini-btn mini-btn--danger ml-2" @click="emit('clear')" title="清空">
          <span class="icon-[tabler--trash] size-3.5"></span>
        </button>
      </div>
    </div>

    <!-- 已选筛选标签（横向滚动） -->
    <div v-if="selectedCount > 0" class="result-bar__tags scrollbar-hide">
      <button v-for="item in selectedFilters" :key="item"
        class="result-tag"
        @click="emit('removeFilter', item)"
      >
        {{ item }}
        <span class="icon-[tabler--x] size-3 opacity-70"></span>
      </button>
    </div>

    <!-- 结果数字（横向网格） -->
    <div v-if="filteredNumbers.length > 0" class="result-bar__numbers scrollbar-hide">
      <div v-for="num in filteredNumbers" :key="num"
        class="result-num"
        :class="{
          'result-num--red': getWaveColor(Number(num)) === 'red',
          'result-num--green': getWaveColor(Number(num)) === 'green',
          'result-num--blue': getWaveColor(Number(num)) === 'blue',
          'result-num--plain': !['red','green','blue'].includes(getWaveColor(Number(num))),
        }"
        @click="emit('toggleExclusion', num)"
        :title="`点击移除 ${num}`"
      >{{ num }}</div>
    </div>
    <div v-else-if="selectedCount > 0" class="result-bar__empty">无匹配号码</div>

    <!-- ═══ 详情 Drawer：底部弹出，按生肖分类展示 ═══ -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div v-if="showDetail" class="drawer-overlay" @click.self="closeDetail">
          <Transition name="drawer-slide" appear>
            <div v-if="showDetail" class="drawer-sheet">
              <!-- 拖拽指示器 -->
              <div class="drawer-sheet__handle" @click="closeDetail"></div>

              <!-- 头部 -->
              <div class="drawer-sheet__header">
                <div class="flex items-center gap-2">
                  <span class="icon-[tabler--layout-grid] size-4 text-primary"></span>
                  <h3 class="drawer-sheet__title">按生肖分类</h3>
                  <span class="drawer-sheet__count">{{ filteredNumbers.length }} 号</span>
                </div>
                <button class="drawer-sheet__close" @click="closeDetail">
                  <span class="icon-[tabler--x] size-4"></span>
                </button>
              </div>

              <!-- 内容：生肖分组 -->
              <div class="drawer-sheet__body scrollbar-hide">
                <div
                  v-for="group in groupedByZodiac"
                  :key="group.zodiac"
                  class="zodiac-group"
                >
                  <div class="zodiac-group__header">
                    <div class="flex items-center gap-1.5">
                      <span class="zodiac-group__name">{{ group.zodiac }}</span>
                      <span class="zodiac-group__count">{{ group.items.length }}</span>
                    </div>
                    <button
                      class="zodiac-group__delete"
                      title="删除整组"
                      @click.stop="removeGroup(group)"
                    >
                      <span class="icon-[tabler--trash] size-3.5"></span>
                      <span>删除</span>
                    </button>
                  </div>
                  <div class="zodiac-group__items">
                    <div
                      v-for="item in group.items"
                      :key="item.num"
                      class="zodiac-num"
                      :class="{
                        'zodiac-num--red': item.wave === 'red',
                        'zodiac-num--green': item.wave === 'green',
                        'zodiac-num--blue': item.wave === 'blue',
                      }"
                    >
                      <button
                        class="zodiac-num__delete"
                        title="删除"
                        @click.stop="emit('toggleExclusion', item.num)"
                      >
                        <span class="icon-[tabler--x] size-2.5"></span>
                      </button>
                      <span class="zodiac-num__value">{{ item.num }}</span>
                      <span class="zodiac-num__wuxing">{{ item.wuxing }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 底部 -->
              <div class="drawer-sheet__footer">
                <button class="drawer-btn" @click="copyResults">
                  <span class="icon-[tabler--copy] size-3.5"></span>
                  <span>复制</span>
                </button>
                <button class="drawer-btn drawer-btn--primary" @click="closeDetail">
                  <span>关闭</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.result-bar {
  position: sticky;
  top: 44px;
  z-index: 40;
  background: color-mix(in srgb, var(--color-base-100) 92%, transparent);
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-base-300);
  border-radius: 12px;
  padding: 8px 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.result-bar__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.result-bar__stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--color-secondary);
}

.stat-item {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}

.stat-label { font-weight: 500; }

.stat-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-base-content);
  font-variant-numeric: tabular-nums;
}

.stat-divider {
  width: 1px;
  height: 10px;
  background: var(--color-base-300);
}

.result-bar__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mini-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--color-base-200);
  color: var(--color-base-content);
  border: 1px solid var(--color-base-300);
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.mini-btn:hover { background: var(--color-base-300); }
.mini-btn:active { transform: scale(0.94); }
.mini-btn--info {
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  border-color: color-mix(in srgb, var(--color-primary) 25%, transparent);
}
.mini-btn--info:hover {
  background: color-mix(in srgb, var(--color-primary) 18%, transparent);
}
.mini-btn--danger {
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
  border-color: color-mix(in srgb, var(--color-error) 20%, transparent);
}
.mini-btn--danger:hover {
  background: color-mix(in srgb, var(--color-error) 16%, transparent);
}

.result-bar__tags {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.result-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  transition: background 0.15s;
}
.result-tag:hover {
  background: color-mix(in srgb, var(--color-primary) 25%, transparent);
}

.result-bar__numbers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  gap: 4px;
  max-height: 130px;
  overflow-y: auto;
  padding: 2px 0;
}

.result-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1;
  max-width: 32px;
  max-height: 32px;
  margin: 0 auto;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  border: 1px solid;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.15s;
  user-select: none;
}
.result-num:active { transform: scale(0.92); }
.result-num:hover { opacity: 0.8; }

.result-num--red {
  background: color-mix(in srgb, var(--color-error) 10%, transparent);
  border-color: color-mix(in srgb, var(--color-error) 30%, transparent);
  color: var(--color-error);
}
.result-num--green {
  background: color-mix(in srgb, var(--color-success) 10%, transparent);
  border-color: color-mix(in srgb, var(--color-success) 30%, transparent);
  color: var(--color-success);
}
.result-num--blue {
  background: color-mix(in srgb, var(--color-info) 10%, transparent);
  border-color: color-mix(in srgb, var(--color-info) 30%, transparent);
  color: var(--color-info);
}
.result-num--plain {
  background: var(--color-base-200);
  border-color: var(--color-base-300);
  color: var(--color-base-content);
}

.result-bar__empty {
  text-align: center;
  font-size: 11px;
  color: var(--color-secondary);
  padding: 6px 0;
}

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { scrollbar-width: none; }

/* ═══ 详情 Drawer：底部弹出 ═══ */
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.drawer-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: var(--color-base-100);
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  border-top: 1px solid var(--color-base-300);
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.2);
  padding-bottom: env(safe-area-inset-bottom);
}

.drawer-sheet__handle {
  width: 36px;
  height: 4px;
  border-radius: 999px;
  background: var(--color-base-300);
  margin: 8px auto 4px;
  cursor: pointer;
  flex-shrink: 0;
}
.drawer-sheet__handle:hover {
  background: var(--color-secondary);
}

.drawer-sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 14px 10px;
  border-bottom: 1px solid var(--color-base-300);
  flex-shrink: 0;
}

.drawer-sheet__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-base-content);
}

.drawer-sheet__count {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  padding: 2px 8px;
  border-radius: 999px;
}

.drawer-sheet__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: transparent;
  color: var(--color-secondary);
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.drawer-sheet__close:hover {
  background: var(--color-base-200);
  color: var(--color-base-content);
}

.drawer-sheet__body {
  padding: 10px 14px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
}

/* 生肖分组卡片 */
.zodiac-group {
  background: var(--color-base-200);
  border-radius: 10px;
  padding: 8px 10px;
  border: 1px solid var(--color-base-300);
}

.zodiac-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.zodiac-group__name {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-base-content);
}

.zodiac-group__count {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-secondary);
  background: var(--color-base-100);
  padding: 1px 7px;
  border-radius: 999px;
}

.zodiac-group__delete {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--color-primary);
  color: var(--color-primary-content);
  border: none;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.15s, transform 0.1s;
}
.zodiac-group__delete:hover { filter: brightness(1.08); }
.zodiac-group__delete:active { transform: scale(0.94); }

.zodiac-group__items {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.zodiac-num {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  padding: 3px 6px;
  border-radius: 8px;
  border: 1px solid;
  font-variant-numeric: tabular-nums;
}

.zodiac-num__delete {
  position: absolute;
  top: -5px;
  right: -5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-primary-content);
  border: 1.5px solid var(--color-base-100);
  cursor: pointer;
  transition: transform 0.1s, filter 0.15s;
  z-index: 1;
  line-height: 1;
}
.zodiac-num__delete:hover { filter: brightness(1.08); }
.zodiac-num__delete:active { transform: scale(0.85); }

.zodiac-num__value {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.1;
}

.zodiac-num__wuxing {
  font-size: 9px;
  font-weight: 500;
  opacity: 0.8;
  margin-top: 1px;
}

.zodiac-num--red {
  background: color-mix(in srgb, var(--color-error) 12%, transparent);
  border-color: color-mix(in srgb, var(--color-error) 30%, transparent);
  color: var(--color-error);
}
.zodiac-num--green {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  border-color: color-mix(in srgb, var(--color-success) 30%, transparent);
  color: var(--color-success);
}
.zodiac-num--blue {
  background: color-mix(in srgb, var(--color-info) 12%, transparent);
  border-color: color-mix(in srgb, var(--color-info) 30%, transparent);
  color: var(--color-info);
}

/* 底部按钮 */
.drawer-sheet__footer {
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--color-base-300);
  flex-shrink: 0;
}

.drawer-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  height: 38px;
  border-radius: 10px;
  background: var(--color-base-200);
  color: var(--color-base-content);
  border: 1px solid var(--color-base-300);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.drawer-btn:hover { background: var(--color-base-300); }
.drawer-btn--primary {
  background: var(--color-primary);
  color: var(--color-primary-content);
  border-color: var(--color-primary);
}
.drawer-btn--primary:hover {
  filter: brightness(1.08);
}

/* 遮罩过渡 */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

/* Drawer 滑入过渡 */
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateY(100%);
}
</style>
