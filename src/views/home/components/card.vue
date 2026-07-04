<script setup lang="ts">
  import type { ListItem } from "./types";

  interface Props {
    item: ListItem;
    index: number;
  }

  defineProps<Props>();
</script>

<template>
  <article class="card" :style="{ '--card-delay': `${index * 80}ms` }">
    <RouterLink :to="item.path" class="card-link">
      <div class="card-index">0{{ index + 1 }}</div>
      <h3 class="card-title">{{ item.title }}</h3>
      <p class="card-description">{{ item.description }}</p>
      <p v-if="item.hint" class="card-hint">{{ item.hint }}</p>
      <span class="card-action">进入功能</span>
    </RouterLink>
    <div class="card-corner" aria-hidden="true"></div>
  </article>
 </template>

<style scoped>
.card {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-base-300);
  background: var(--color-base-100);
  box-shadow: var(--shadow-card);
  animation: cardIn 540ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
  animation-delay: var(--card-delay);
}

.card-link {
  display: block;
  padding: 18px 16px 16px;
  color: inherit;
}

.card-index {
  width: fit-content;
  margin-bottom: 10px;
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--color-secondary);
  background: var(--color-base-200);
}

.card-title {
  margin: 0;
  color: var(--color-neutral);
  line-height: 1.34;
  font-size: 18px;
  font-weight: 700;
}

.card-description {
  margin: 10px 0 0;
  color: var(--color-secondary);
  line-height: 1.58;
  font-size: 13px;
}

.card-hint {
  margin: 10px 0 0;
  color: var(--color-secondary);
  line-height: 1.5;
  font-size: 12px;
}

.card-action {
  display: inline-flex;
  margin-top: 16px;
  color: var(--color-neutral);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.03em;
  background: var(--color-base-200);
  border: 1px solid var(--color-base-300);
  border-radius: 999px;
  padding: 5px 10px;
}

.card-corner {
  position: absolute;
  right: -14px;
  top: -14px;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-neutral) 8%, transparent);
  transition: transform 260ms ease;
}

.card:active {
  transform: translateY(1px) scale(0.996);
}

.card:hover {
  box-shadow: var(--shadow-hover);
  border-color: var(--color-base-300);
}

.card:hover .card-corner {
  transform: scale(1.25);
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 768px) {
  .card-link {
    padding: 20px 18px 18px;
  }

  .card-title {
    font-size: 20px;
  }
}
</style>
