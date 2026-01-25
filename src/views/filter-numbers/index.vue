<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFilterLogic } from './useFilterLogic';
import FilterGroup from './components/FilterGroup.vue';
import ResultStickyHeader from './components/ResultStickyHeader.vue';

const router = useRouter();
const { 
  selectedFilters, 
  filteredNumbers, 
  totalItems, 
  toggleFilter, 
  clearFilters, 
  onSave, 
  onLoad, 
  getWaveColorById 
} = useFilterLogic();

const activeNames = ref(['basic', 'zodiac', 'advanced']);

const onClickLeft = () => {
  router.back();
};
</script>

<template>
  <div class="filter-numbers-page">
    <van-nav-bar
      title="筛选号码"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="onClickLeft"
    >
      <template #right>
        <van-popover
          placement="bottom-end"
          :actions="[{ text: '保存条件', icon: 'description' }, { text: '加载条件', icon: 'orders-o' }]"
          @select="(action) => action.text === '保存条件' ? onSave() : onLoad()"
        >
          <template #reference>
            <van-icon name="ellipsis" size="18" />
          </template>
        </van-popover>
      </template>
    </van-nav-bar>

    <ResultStickyHeader
      :total-items="totalItems"
      :selected-count="selectedFilters.length"
      :selected-filters="selectedFilters"
      :filtered-numbers="filteredNumbers"
      :get-wave-color="getWaveColorById"
      @clear="clearFilters"
      @remove-filter="toggleFilter"
    />

    <div class="content-area">
      <van-collapse v-model="activeNames" :border="false">
        
        <!-- 1. 基础属性 -->
        <van-collapse-item title="基础属性" name="basic">
          <FilterGroup 
            label="单双/大小" 
            :items="['单', '双', '大', '小']" 
            :selected-items="selectedFilters" 
            @toggle="toggleFilter"
          />
          <FilterGroup 
            label="波色" 
            :items="['红波', '绿波', '蓝波']" 
            :selected-items="selectedFilters" 
            @toggle="toggleFilter"
          />
          <FilterGroup 
            label="五行" 
            :items="['金', '木', '水', '火', '土']" 
            :selected-items="selectedFilters" 
            @toggle="toggleFilter"
          />
        </van-collapse-item>

        <!-- 2. 生肖筛选 -->
        <van-collapse-item title="生肖筛选" name="zodiac">
           <FilterGroup 
            :items="['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']" 
            :selected-items="selectedFilters" 
            @toggle="toggleFilter"
          />
           <FilterGroup 
            label="生肖属性"
            :items="['家禽', '野兽', '天肖', '地肖', '前肖', '后肖', '左肖', '右肖', '阴肖', '阳肖', '独字肖', '合字肖']" 
            :selected-items="selectedFilters" 
            @toggle="toggleFilter"
          />
        </van-collapse-item>

        <!-- 3. 高级筛选 -->
        <van-collapse-item title="高级筛选" name="advanced">
           <FilterGroup 
            label="合数/尾数"
            :items="['合单', '合双', '合大', '合小', '尾大', '尾小', '大单', '小单', '大双', '小双']" 
            :selected-items="selectedFilters" 
            @toggle="toggleFilter"
          />
           <FilterGroup 
            label="波色组合"
            :items="['红单', '红双', '绿单', '绿双', '蓝单', '蓝双']" 
            :selected-items="selectedFilters" 
            @toggle="toggleFilter"
          />
           <FilterGroup 
            label="尾数精确"
            :items="['0尾', '1尾', '2尾', '3尾', '4尾', '5尾', '6尾', '7尾', '8尾', '9尾']" 
            :selected-items="selectedFilters" 
            @toggle="toggleFilter"
          />
           <FilterGroup 
            label="头数/门数/段数"
            :items="['0头', '1头', '2头', '3头', '4头', '1门', '2门', '3门', '4门', '5门', '1段', '2段', '3段', '4段', '5段', '6段', '7段']" 
            :selected-items="selectedFilters" 
            @toggle="toggleFilter"
          />
           <FilterGroup 
            label="合数精确"
            :items="['1合', '2合', '3合', '4合', '5合', '6合', '7合', '8合', '9合', '10合', '11合', '12合', '13合']" 
            :selected-items="selectedFilters" 
            @toggle="toggleFilter"
          />
        </van-collapse-item>

      </van-collapse>
    </div>
  </div>
</template>

<style scoped>
.filter-numbers-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 40px;
}
.content-area {
  padding-bottom: 20px;
}
</style>
