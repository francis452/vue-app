import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const message = ref('欢迎使用 Pinia!')
  const doubleCount = computed(() => count.value * 2)
  const tripleCount = computed(() => count.value * 3)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = 0
  }

  function updateMessage(newMessage: string) {
    message.value = newMessage
  }

  return {
    count,
    message,
    doubleCount,
    tripleCount,
    increment,
    decrement,
    reset,
    updateMessage
  }
})
