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

const tabs = [
  { name: 'head-tail' as const, label: '头尾筛选' },
  { name: 'zodiac' as const, label: '生肖筛选' },
  { name: 'condition' as const, label: '条件筛选' },
]

onMounted(() => {
  const tab = route.query.tab as string
  if (tab === 'zodiac') activeTab.value = 'zodiac'
  else if (tab === 'condition') activeTab.value = 'condition'
  else if (tab === 'head-tail') activeTab.value = 'head-tail'
})

watch(activeTab, (newVal) => {
  router.replace({ query: { ...route.query, tab: newVal } })
})

function onRefresh() {
  if (activeTab.value === 'head-tail') headTailRef.value?.refresh?.()
  else if (activeTab.value === 'condition') conditionRef.value?.refresh?.()
  else zodiacRef.value?.refresh?.()
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-[#f3f4f6]">
    <!-- Navbar -->
    <div class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 py-3">
      <h1 class="text-base font-bold text-[#1f2937]">筛选中心</h1>
      <button type="button" class="btn btn-text btn-circle btn-sm" @click="onRefresh" aria-label="刷新">
        <span class="icon-[tabler--reload] size-4.5"></span>
      </button>
    </div>

    <!-- Custom Tabs -->
    <div class="sticky top-[49px] z-40 bg-white border-b border-gray-200 px-2">
      <div class="flex">
        <button
          v-for="tab in tabs" :key="tab.name"
          type="button"
          class="flex-1 py-3 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === tab.name ? 'border-[#2f3137] text-[#2f3137]' : 'border-transparent text-gray-500'"
          @click="activeTab = tab.name"
        >{{ tab.label }}</button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1">
      <KeepAlive>
        <HeadTailFilter v-if="activeTab === 'head-tail'" ref="headTailRef" />
        <ZodiacFilter v-else-if="activeTab === 'zodiac'" ref="zodiacRef" />
        <ConditionFilter v-else-if="activeTab === 'condition'" ref="conditionRef" />
      </KeepAlive>
    </div>
  </div>
</template>
