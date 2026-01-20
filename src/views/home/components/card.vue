<script setup lang="ts">
  import type { ListItem } from "./types";

  interface Props {
    item: ListItem;
  }

  defineProps<Props>();

  // 生成随机高度，用于演示瀑布流效果
  const getRandomHeight = () => {
    return Math.floor(Math.random() * 100) + 100;
  };
</script>

<template>
  <div class="card u-card">
    <RouterLink :to="item.path">
    <div 
      class="card-image" 
      :style="{ height: getRandomHeight() + 'px' }"
    >
      <!-- 实际项目中这里应该是真实的图片 -->
      <div class="placeholder-image"></div>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ item.title }}</h3>
      <p class="card-description">{{ item.description || '这是卡片的描述信息' }}</p>
      <div class="card-meta">
        <span class="card-author">{{ item.author || '作者' }}</span>
        <span class="card-date">{{ item.date || '2023-05-01' }}</span>
      </div>
    </div>
    </RouterLink>
  </div>
</template>

<style scoped>
.card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: transform 0.28s ease, box-shadow 0.28s ease;
  animation: cardIn 0.44s ease-out forwards;
  opacity: 0;
  transform: translateY(14px);
}

.card:nth-child(2n) {
  animation-delay: 0.1s;
}

.card:nth-child(3n) {
  animation-delay: 0.2s;
}

.card:nth-child(4n) {
  animation-delay: 0.3s;
}

@keyframes cardIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.card-image {
  width: 100%;
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.placeholder-image {
  width: 60px;
  height: 60px;
  background: #ddd;
  border-radius: 50%;
}

.card-content {
  padding: var(--space-4);
}

.card-title {
  margin: 0 0 var(--space-2) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
}

.card-description {
  margin: 0 0 var(--space-3) 0;
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.card-author {
  font-weight: 500;
}

.card-date {
  color: #bbb;
}
</style>
