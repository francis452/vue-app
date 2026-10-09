import { onBeforeUnmount, onMounted, ref } from 'vue'

interface RemOptions {
  designWidth?: number
  designHeight?: number
  baseFontSize?: number
}

export function useRem(options: RemOptions = {}) {
  const { designWidth = 1920, designHeight = 1080, baseFontSize = 100 } = options
  if (designWidth <= 0 || designHeight <= 0 || baseFontSize <= 0) {
    throw new Error('useRem: design dimensions and baseFontSize must be greater than 0')
  }

  const currentFontSize = ref<number>(baseFontSize)
  const currentScale = ref<number>(1)
  let initialFontSize = ''
  let frameId: number | null = null

  function scheduleUpdate(): void {
    if (frameId !== null) return
    frameId = window.requestAnimationFrame(() => {
      frameId = null
      updateRem()
    })
  }

  function updateRem(): void {
    const root = document.documentElement
    const scale = Math.min(window.innerWidth / designWidth, window.innerHeight / designHeight)
    const fontSize = baseFontSize * scale

    root.style.fontSize = `${fontSize}px`
    currentFontSize.value = Math.round(fontSize * 10) / 10
    currentScale.value = scale
  }

  onMounted(() => {
    initialFontSize = document.documentElement.style.fontSize
    updateRem()
    window.addEventListener('resize', scheduleUpdate)
  })

  onBeforeUnmount(() => {
    if (frameId !== null) window.cancelAnimationFrame(frameId)
    frameId = null
    window.removeEventListener('resize', scheduleUpdate)
    document.documentElement.style.fontSize = initialFontSize
  })

  return {
    currentFontSize,
    currentScale,
  }
}
