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
  margin-bottom: 12px;
}

.group-label {
  font-size: 12px;
  color: #969799;
  margin-bottom: 8px;
  font-weight: 500;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  padding: 6px 14px;
  background: #f2f3f5;
  border-radius: 6px;
  font-size: 13px;
  color: #323233;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  border: 1px solid transparent;
  min-width: 44px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip:active {
  transform: scale(0.95);
}

.chip--active {
  background: #e6f7ff;
  color: #1989fa;
  border-color: #1989fa;
  font-weight: 600;
}

.chip--red-text { color: #ff4d4f; }
.chip--green-text { color: #52c41a; }
.chip--blue-text { color: #1890ff; }

.chip--active.chip--red-text { color: #ff4d4f; background: #fff1f0; border-color: #ff4d4f; }
.chip--active.chip--green-text { color: #52c41a; background: #f6ffed; border-color: #52c41a; }
.chip--active.chip--blue-text { color: #1890ff; background: #e6f7ff; border-color: #1890ff; }
</style>
