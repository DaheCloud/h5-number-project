import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMainStore = defineStore('main', () => {
  /** 全局选中的号码列表 */
  const selectedNumbers = ref<number[]>([])

  function addNumber(num: number) {
    if (!selectedNumbers.value.includes(num)) {
      selectedNumbers.value.push(num)
    }
  }

  function removeNumber(num: number) {
    selectedNumbers.value = selectedNumbers.value.filter(n => n !== num)
  }

  function clearAll() {
    selectedNumbers.value = []
  }

  return { selectedNumbers, addNumber, removeNumber, clearAll }
})
