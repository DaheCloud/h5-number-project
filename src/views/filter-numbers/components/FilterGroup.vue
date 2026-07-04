<script setup lang="ts">
defineProps<{
  items: string[];
  selectedItems: string[];
  label?: string;
}>();

defineEmits<{
  (e: 'toggle', item: string): void;
}>();
</script>

<template>
  <div class="filter-group">
    <div v-if="label" class="group-label">{{ label }}</div>
    <div class="chip-grid">
      <button 
        v-for="item in items" 
        :key="item"
        type="button"
        class="chip"
        :class="{ 
          'chip--active': selectedItems.includes(item),
          'chip--red-text': item.includes('红'),
          'chip--green-text': item.includes('绿'),
          'chip--blue-text': item.includes('蓝')
        }"
        @click="$emit('toggle', item)"
      >
        {{ item }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-group {
  margin-bottom: 14px;
}

.group-label {
  display: inline-flex;
  align-items: center;
  margin-bottom: 9px;
  border-radius: 8px;
  padding: 3px 8px;
  font-size: 11px;
  letter-spacing: 0.03em;
  color: var(--color-secondary);
  font-weight: 600;
  background: var(--color-base-100);
}

.chip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 8px;
}

.chip {
  min-height: 38px;
  padding: 6px 8px;
  background: var(--color-base-200);
  border-radius: 12px;
  font-size: 12px;
  color: var(--color-base-content);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
  user-select: none;
  border: 1px solid var(--color-base-300);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip:active {
  transform: scale(0.97);
}

.chip--active {
  background: var(--color-primary);
  color: var(--color-primary-content);
  border-color: var(--color-primary);
  font-weight: 600;
  box-shadow: 0 6px 12px rgba(120, 138, 148, 0.24);
}

.chip--red-text { color: var(--color-error); }
.chip--green-text { color: var(--color-success); }
.chip--blue-text { color: var(--color-info); }

/* 选中态下波色文字保持白色，统一主题色背景 */
.chip--active.chip--red-text,
.chip--active.chip--green-text,
.chip--active.chip--blue-text {
  color: var(--color-primary-content);
  border-color: var(--color-primary);
  background: var(--color-primary);
}

.chip--active::before {
  content: "✓";
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  margin-right: 6px;
  opacity: 0.95;
}
</style>
