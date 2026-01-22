<script setup lang="ts">
  import { ref } from "vue";
  import type { ListItem } from "@/views/home/components/types";
  import Card from "./components/card.vue"

  const list = ref<ListItem[]>([]);
  const loading = ref(false);
  const finished = ref(false);
  
  // 生成随机描述
  const getRandomDescription = () => {
    const descriptions = [
      '这是一个精彩的项目展示',
      '探索更多可能性',
      '创新设计理念',
      '用户体验至上',
      '技术驱动发展',
      '品质成就未来',
      '专注细节打磨',
      '追求卓越品质'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };
  
  // 生成随机作者
  const getRandomAuthor = () => {
    const authors = ['张三', '李四', '王五', '赵六', '钱七', '孙八'];
    return authors[Math.floor(Math.random() * authors.length)];
  };
  
  // 生成随机日期
  const getRandomDate = () => {
    const days = Math.floor(Math.random() * 30) + 1;
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };
  
  // list 列表加载
  const onLoadList = () => {
    setTimeout(() => {
      const start = list.value.length;
      list.value.push({
        id: start,
        title: `数字选择助手`,
        description: getRandomDescription(),
        author: getRandomAuthor(),
        date: getRandomDate(),
        path: "/num-chose",
      });
      list.value.push({
        id: start + 1,
        title: `生肖选择过滤`,
        description: getRandomDescription(),
        author: getRandomAuthor(),
        date: getRandomDate(),
        path: "/zodiac-filter",
      });
      list.value.push({
        id: start + 2,
        title: `头尾过滤`,
        description: getRandomDescription(),
        author: getRandomAuthor(),
        date: getRandomDate(),
        path: "/head-tail-filter",
      });
      list.value.push({
        id: start + 3,
        title: `筛选号码`,
        description: getRandomDescription(),
        author: getRandomAuthor(),
        date: getRandomDate(),
        path: "/filter-numbers",
      });
      loading.value = false;
      finished.value = true;
    }, 500);
  }
</script>

<template>
  <header class="header-fixed">
    <van-nav-bar title="标题" />
  </header>
  <div class="waterfall-container">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoadList"
    >
      <div class="waterfall-grid">
        <card 
          v-for="item in list" 
          :key="item.id" 
          :item="item" 
        />
      </div>
    </van-list>
  </div>
</template>

<style scoped>
.waterfall-container {
  padding: 12px;
}

.waterfall-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-flow: row dense;
  gap: 12px;
}

@media (min-width: 768px) {
  .waterfall-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .waterfall-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
