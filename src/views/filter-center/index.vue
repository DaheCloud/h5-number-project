<script setup lang="ts">
defineOptions({ name: 'FilterCenterPage' })
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeadTailFilter from './components/HeadTailFilter.vue'
import ZodiacFilter from './components/ZodiacFilter.vue'
import ConditionFilter from './components/ConditionFilter.vue'

const route = useRoute()
const router = useRouter()
const activeTab = ref<'head-tail' | 'zodiac' | 'condition'>('head-tail')

const headTailRef = ref<InstanceType<typeof HeadTailFilter> | null>(null)
const zodiacRef = ref<InstanceType<typeof ZodiacFilter> | null>(null)
const conditionRef = ref<InstanceType<typeof ConditionFilter> | null>(null)

onMounted(() => {
    const tab = route.query.tab as string
    if (tab === 'zodiac') {
        activeTab.value = 'zodiac'
    } else if (tab === 'condition') {
        activeTab.value = 'condition'
    } else if (tab === 'head-tail') {
        activeTab.value = 'head-tail'
    }
})

watch(activeTab, (newVal) => {
    router.replace({ query: { ...route.query, tab: newVal } })
})

function onRefresh() {
    if (activeTab.value === 'head-tail') {
        headTailRef.value?.refresh?.()
    } else if (activeTab.value === 'condition') {
        conditionRef.value?.refresh?.()
    } else {
        zodiacRef.value?.refresh?.()
    }
}
</script>

<template>
  <div class="page filter-center">
    <header class="header-fixed">
      <van-nav-bar title="筛选中心" class="top-nav">
        <template #right>
            <van-icon name="replay" size="18" @click="onRefresh" />
        </template>
      </van-nav-bar>
    </header>
    
    <div class="main-content">
         <van-tabs v-model:active="activeTab" sticky offset-top="46px" swipeable animated>
            <van-tab title="头尾筛选" name="head-tail">
                <keep-alive>
                    <HeadTailFilter ref="headTailRef" />
                </keep-alive>
            </van-tab>
            <van-tab title="生肖筛选" name="zodiac">
                <keep-alive>
                    <ZodiacFilter ref="zodiacRef" />
                </keep-alive>
            </van-tab>
            <van-tab title="条件筛选" name="condition">
                <keep-alive>
                    <ConditionFilter ref="conditionRef" />
                </keep-alive>
            </van-tab>
        </van-tabs>
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; min-height: 100%; background: #f3f4f6; }
.header-fixed { position: sticky; top: 0; z-index: 1000; }
.main-content { flex: 1; display: flex; flex-direction: column; }
.top-nav {
  --van-nav-bar-background: #ffffff;
  --van-nav-bar-title-text-color: #1f2533;
  --van-nav-bar-icon-color: #1f2533;
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-soft);
}
:deep(.van-tabs__content) { flex: 1; }
:deep(.van-tab__pane) { height: 100%; }
</style>
