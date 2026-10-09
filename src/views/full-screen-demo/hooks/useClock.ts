import { ref, onMounted, onUnmounted } from 'vue'

type ClockFormat = 'full' | 'time'

export function useClock(format: ClockFormat = 'full') {
  const time = ref<string>('')
  let timer: ReturnType<typeof setInterval> | null = null

  function update() {
    const now = new Date()
    if (format === 'full') {
      time.value = now.toLocaleString('zh-CN', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } else {
      time.value = now.toLocaleTimeString('zh-CN', { hour12: false })
    }
  }

  onMounted(() => {
    update()
    timer = setInterval(update, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return { time }
}