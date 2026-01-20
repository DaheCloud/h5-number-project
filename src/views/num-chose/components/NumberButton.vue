<script setup lang="ts">
interface Props {
  id: number; // 1-49 的数字ID（核心）
  active?: boolean; // 选中态（占位，后续联动）
  disabled?: boolean;
  waveColor?: string;
  fiveElements?: string;
  chineseZodiac?: string;
  oddAndEven?: string;
  sumOddAndEven?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'select', id: number): void }>();

function onClick() {
  if (props.disabled) return;
  emit('select', props.id);
}
</script>

<template>
  <button
    class="num-btn"
    :class="{ 
      'is-active': props.active, 
      'is-disabled': props.disabled,
      'color-red': props.waveColor === 'red',
      'color-green': props.waveColor === 'green',
      'color-blue': props.waveColor === 'blue'
    }"
    type="button"
    :aria-label="`number ${String(props.id).padStart(2,'0')}`"
    :title="`${String(props.id).padStart(2,'0')}\n五行: ${props.fiveElements}\n生肖: ${props.chineseZodiac}\n单双: ${props.oddAndEven}\n大小: ${props.sumOddAndEven}`"
    @click="onClick"
  >
    {{ String(props.id).padStart(2,'0') }}
  </button>
</template>

<style scoped>
.num-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform .15s ease, box-shadow .15s ease, background-color .15s ease, border-color .15s ease, color .15s ease;
}

.num-btn:hover { transform: scale(1.04); box-shadow: var(--shadow-soft); }

/* 红色调 */
.num-btn.color-red {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

/* 绿色调 */
.num-btn.color-green {
  border-color: #52c41a;
  color: #52c41a;
}

/* 蓝色调 */
.num-btn.color-blue {
  border-color: #1890ff;
  color: #1890ff;
}

/* 选中态（统一样式） */
/* 选中态保持原始波色 */
.num-btn.is-active.color-red {
  background-color: #ff4d4f;
  color: #fff;
  border-color: #ff4d4f;
  box-shadow: var(--shadow-card);
}

.num-btn.is-active.color-green {
  background-color: #52c41a;
  color: #fff;
  border-color: #52c41a;
  box-shadow: var(--shadow-card);
}

.num-btn.is-active.color-blue {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
  box-shadow: var(--shadow-card);
}

/* 无波色时的选中态回退到品牌色 */
.num-btn.is-active:not(.color-red):not(.color-green):not(.color-blue) {
  background-color: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-card);
}

.num-btn.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
