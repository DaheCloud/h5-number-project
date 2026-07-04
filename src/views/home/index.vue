<script setup lang="ts">
import type { ListItem } from "@/views/home/components/types"
import Card from "./components/card.vue"

const list: ListItem[] = [
  { id: 1, title: "数字选择助手", description: "在 01-49 的数字池里快速点选、排序与复制，适合高频手动筛选。", hint: "适合直觉式选号", path: "/num-chose" },
  { id: 2, title: "生肖筛选中心", description: "基于生肖关系做交叉筛选，支持分组观察和结果聚焦。", hint: "偏向结构化分析", path: "/zodiac-filter" },
  { id: 3, title: "头尾过滤", description: "围绕头数与尾数建立组合条件，快速形成可复用过滤组。", hint: "用于缩小候选范围", path: "/head-tail-filter" },
  { id: 4, title: "筛选号码", description: "将多维条件合并计算，保留可操作结果并支持后续保存。", hint: "最终结果收敛入口", path: "/filter-numbers" },
]
</script>

<template>
  <section class="min-h-full px-3 pt-2 pb-5" style="background-color: var(--page-bg)">
    <!-- Navbar -->
    <div class="sticky top-0 z-50 bg-base-100 border-b border-base-300 shadow-sm rounded-b-xl px-4 h-12 flex items-center justify-center mb-4">
      <h1 class="text-base font-bold text-base-content">选号工具箱</h1>
    </div>

    <!-- Hero -->
    <div class="bg-base-100 border border-base-300 rounded-2xl p-4 mb-4 shadow-sm md:p-5">
      <p class="text-[11px] font-bold tracking-widest text-secondary">HOME</p>
      <h1 class="mt-2 text-[22px] font-bold text-base-content leading-tight md:text-[26px]">从首页直接进入常用筛选流程</h1>
      <p class="mt-2 text-[13px] text-secondary leading-relaxed">每个入口只保留必要说明，减少切换成本，适合移动端快速操作。</p>
      <div class="mt-3 grid grid-cols-[90px_1fr] gap-2">
        <div class="bg-base-200 border border-base-300 rounded-xl p-2">
          <p class="text-[11px] text-secondary">工具数量</p>
          <p class="text-lg font-bold text-neutral">{{ list.length }}</p>
        </div>
        <div class="bg-base-200 border border-base-300 rounded-xl p-2">
          <p class="text-[11px] text-secondary">推荐路径</p>
          <p class="text-xs text-base-content">选号 → 筛选中心 → 筛选号码</p>
        </div>
      </div>
    </div>

    <!-- Cards -->
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-3.5 lg:gap-4">
      <Card v-for="(item, index) in list" :key="item.id" :item="item" :index="index" />
    </div>
  </section>
</template>
