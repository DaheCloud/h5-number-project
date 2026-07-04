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
    {{ String(props.id).padStart(2, '0') }}
  </button>
</template>

<style scoped>
.num-btn {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--color-base-300);
  background: var(--color-base-100);
  color: var(--color-base-content);
  font-weight: 600;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform .12s ease, box-shadow .12s ease, background-color .12s ease, border-color .12s ease, color .12s ease;
  box-shadow: var(--shadow-button);
  flex-shrink: 0;
}

@media (min-width: 360px) {
  .num-btn { width: 42px; height: 42px; font-size: 15px; }
}

.num-btn:active:not(.is-disabled) { transform: scale(0.92); }

/* 波色：鲜艳文字 + 同色系细边框 */
.num-btn.color-red {
  background-color: var(--color-base-100);
  border-color: color-mix(in srgb, var(--color-error) 30%, transparent);
  color: var(--color-error);
}

.num-btn.color-green {
  background-color: var(--color-base-100);
  border-color: color-mix(in srgb, var(--color-success) 30%, transparent);
  color: var(--color-success);
}

.num-btn.color-blue {
  background-color: var(--color-base-100);
  border-color: color-mix(in srgb, var(--color-info) 30%, transparent);
  color: var(--color-info);
}

/* 选中态：填充波色 + 白色文字 */
.num-btn.is-active.color-red {
  background-color: var(--color-error);
  color: var(--color-error-content);
  border-color: var(--color-error);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--color-error) 35%, transparent);
}

.num-btn.is-active.color-green {
  background-color: var(--color-success);
  color: var(--color-success-content);
  border-color: var(--color-success);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

.num-btn.is-active.color-blue {
  background-color: var(--color-info);
  color: var(--color-info-content);
  border-color: var(--color-info);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--color-info) 35%, transparent);
}

/* 无波色时的选中态回退到翠绿主色 */
.num-btn.is-active:not(.color-red):not(.color-green):not(.color-blue) {
  background-color: var(--color-primary);
  color: var(--color-primary-content);
  border-color: var(--color-primary);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

.num-btn.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
