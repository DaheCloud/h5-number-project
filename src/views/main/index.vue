<script setup lang="ts">

</script>
<template>
  <div class="layout-container">
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <KeepAlive :include="['NumChosePage','ZodiacFilterPage','HeadTailFilterPage']">
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </main>
    <footer>
      <van-tabbar route safe-area-inset-bottom active-color="var(--color-primary)" inactive-color="var(--color-text-muted)">
        <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
        <van-tabbar-item to="/num-chose" icon="apps-o">选号</van-tabbar-item>
        <van-tabbar-item to="/zodiac-filter" icon="orders-o">生肖</van-tabbar-item>
        <van-tabbar-item to="/head-tail-filter" icon="setting-o">头尾</van-tabbar-item>
      </van-tabbar>
    </footer>
  </div>
</template>
<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  /* padding-top: 46px; header 高度 */
  padding-bottom: calc(56px + env(safe-area-inset-bottom)); /* Tabbar 高度 + 安全区 */
  box-sizing: border-box;
}

.header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--color-bg);
}

footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}
</style>
