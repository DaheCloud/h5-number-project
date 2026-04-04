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
  color: #6b7280;
  font-weight: 600;
  background: #f3f4f6;
}

.chip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 8px;
}

.chip {
  min-height: 38px;
  padding: 6px 8px;
  background: #f8fafc;
  border-radius: 12px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
  user-select: none;
  border: 1px solid #e5e7eb;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip:active {
  transform: scale(0.97);
}

.chip--active {
  background: #2f3137;
  color: #f8fafc;
  border-color: #2f3137;
  font-weight: 600;
  box-shadow: 0 6px 12px rgba(17, 24, 39, 0.24);
}

.chip--red-text { color: #ff4d4f; }
.chip--green-text { color: #52c41a; }
.chip--blue-text { color: #1890ff; }


.chip--active.chip--red-text { color: #b91c1c; border-color: #fca5a5; background: #fee2e2; }
.chip--active.chip--green-text { color: #166534; border-color: #86efac; background: #dcfce7; }
.chip--active.chip--blue-text { color: #1d4ed8; border-color: #93c5fd; background: #dbeafe; }

.chip--active::before {
  content: "✓";
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  margin-right: 6px;
  opacity: 0.95;
}
</style>
