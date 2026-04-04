<script setup lang="ts">
import { computed } from "vue"
import type { ListItem } from "@/views/home/components/types"
import Card from "./components/card.vue"

const list: ListItem[] = [
  {
    id: 1,
    title: "数字选择助手",
    description: "在 01-49 的数字池里快速点选、排序与复制，适合高频手动筛选。",
    hint: "适合直觉式选号",
    path: "/num-chose",
  },
  {
    id: 2,
    title: "生肖筛选中心",
    description: "基于生肖关系做交叉筛选，支持分组观察和结果聚焦。",
    hint: "偏向结构化分析",
    path: "/zodiac-filter",
  },
  {
    id: 3,
    title: "头尾过滤",
    description: "围绕头数与尾数建立组合条件，快速形成可复用过滤组。",
    hint: "用于缩小候选范围",
    path: "/head-tail-filter",
  },
  {
    id: 4,
    title: "筛选号码",
    description: "将多维条件合并计算，保留可操作结果并支持后续保存。",
    hint: "最终结果收敛入口",
    path: "/filter-numbers",
  },
]

const totalTools = computed(() => list.length)
const recommendedPath = computed(() => "选号 -> 筛选中心 -> 筛选号码")
</script>

<template>
  <section class="home-page">
    <header class="header-fixed">
      <van-nav-bar title="选号工具箱" class="top-nav" />
    </header>

    <div class="hero">
      <p class="hero-kicker">HOME</p>
      <h1 class="hero-title">从首页直接进入常用筛选流程</h1>
      <p class="hero-subtitle">
        每个入口只保留必要说明，减少切换成本，适合移动端快速操作。
      </p>

      <div class="hero-metrics">
        <article class="metric-card">
          <p class="metric-label">工具数量</p>
          <p class="metric-value">{{ totalTools }}</p>
        </article>
        <article class="metric-card metric-card--wide">
          <p class="metric-label">推荐路径</p>
          <p class="metric-value metric-value--small">{{ recommendedPath }}</p>
        </article>
      </div>
    </div>

    <div class="card-grid">
      <Card
        v-for="(item, index) in list"
        :key="item.id"
        :item="item"
        :index="index"
      />
    </div>
  </section>
</template>

<style scoped>
.home-page {
  min-height: 100%;
  padding: 8px 12px 18px;
  background: #f3f4f6;
}

.top-nav {
  --van-nav-bar-background: #ffffff;
  --van-nav-bar-title-text-color: #1f2937;
  --van-nav-bar-icon-color: #1f2533;
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-soft);
}

.hero {
  position: relative;
  margin: 10px 0 14px;
  border-radius: var(--radius-md);
  padding: 16px 14px;
  background: #ffffff;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
}

.hero-kicker {
  margin: 0;
  color: #9ca3af;
  font-size: 11px;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.hero-title {
  margin: 8px 0 0;
  color: #1f2937;
  line-height: 1.36;
  font-size: 22px;
  font-weight: 700;
}

.hero-subtitle {
  margin: 10px 0 0;
  color: #6b7280;
  line-height: 1.6;
  font-size: 13px;
}

.hero-metrics {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 8px;
}

.metric-card {
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: #f8fafc;
  padding: 8px 10px;
}

.metric-card--wide {
  min-width: 0;
}

.metric-label {
  margin: 0;
  color: #9ca3af;
  font-size: 11px;
}

.metric-value {
  margin: 4px 0 0;
  color: #111827;
  font-size: 18px;
  line-height: 1.15;
  font-weight: 700;
}

.metric-value--small {
  font-size: 12px;
  color: #374151;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 768px) {
  .home-page {
    padding: 10px 18px 22px;
  }

  .hero {
    margin: 12px 0 16px;
    padding: 20px 18px;
  }

  .hero-title {
    font-size: 26px;
  }

  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
}

@media (min-width: 1024px) {
  .home-page {
    max-width: 1040px;
    margin: 0 auto;
    padding-inline: 22px;
  }

  .card-grid {
    gap: 16px;
  }
}
</style>
