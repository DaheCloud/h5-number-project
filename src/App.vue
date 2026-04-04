<script setup lang="ts">
import { computed } from 'vue'
import { ConfigProvider } from 'vant'

const themeVars = computed(() => ({
  primaryColor: '#2f3137',
  successColor: '#52c41a',
  warningColor: '#faad14',
  dangerColor: '#ff4d4f',
  textColor: '#323233',
  textColor2: '#646566',
  textColor3: '#969799',
  borderColor: '#ebedf0',
  background: '#f7f8fa',
  background2: '#ffffff',
  navBarBackground: '#ffffff',
  navBarTitleTextColor: '#323233',
  navBarTextColor: '#2f3137',
  tabTextColor: '#646566',
  tabActiveTextColor: '#2f3137',
  buttonPrimaryBackground: '#2f3137',
  buttonPrimaryBorderColor: '#2f3137',
}))

</script>

<template>
  <ConfigProvider theme="light" :theme-vars="themeVars">
    <div class="app-shell">
      <main class="app-main">
        <RouterView />
      </main>

      <van-tabbar route fixed safe-area-inset-bottom class="floating-tabbar">
        <van-tabbar-item replace to="/home" icon="home-o">首页</van-tabbar-item>
        <van-tabbar-item replace to="/num-chose" icon="apps-o">选号</van-tabbar-item>
        <van-tabbar-item replace to="/filter-center" icon="filter-o">筛选</van-tabbar-item>
        <van-tabbar-item replace to="/filter-numbers" icon="search">分析</van-tabbar-item>
      </van-tabbar>
    </div>
  </ConfigProvider>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  background: #f7f8fa;
}

.app-main {
  flex: 1;
  min-height: 0;
  padding-bottom: 76px;
}

:deep(.floating-tabbar) {
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 64px;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: #ffffff;
  box-shadow: 0 -6px 14px rgba(15, 23, 42, 0.08);
  border-top: 1px solid var(--color-border);
  padding-bottom: env(safe-area-inset-bottom);
}

:deep(.floating-tabbar::after) {
  display: none;
}

:deep(.floating-tabbar .van-tabbar-item) {
  color: #8a90a0;
  font-size: 10px;
  line-height: 1;
}

:deep(.floating-tabbar .van-tabbar-item--active) {
  color: #1f2533;
  font-weight: 600;
}

:deep(.floating-tabbar .van-tabbar-item__icon) {
  font-size: 16px;
  margin-bottom: 4px;
}

:deep(.floating-tabbar .van-tabbar-item--active .van-tabbar-item__icon) {
  transform: translateY(-1px);
}
</style>
