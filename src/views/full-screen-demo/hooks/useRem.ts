import { onBeforeUnmount, onMounted, ref } from 'vue'

interface RemOptions {
  designWidth?: number
  designHeight?: number
  baseFontSize?: number
}

export function useRem(options: RemOptions = {}) {
  const { designWidth = 1920, designHeight = 1080, baseFontSize = 100 } = options

  const currentFontSize = ref<number>(baseFontSize)
  const currentScale = ref<number>(1)
  let initialFontSize = ''

  function updateRem(): void {
    const root = document.documentElement
    const scale = Math.min(root.clientWidth / designWidth, root.clientHeight / designHeight)
    const fontSize = baseFontSize * scale

    root.style.fontSize = `${fontSize}px`
    currentFontSize.value = Math.round(fontSize * 10) / 10
    currentScale.value = scale
  }

  onMounted(() => {
    initialFontSize = document.documentElement.style.fontSize
    updateRem()
    window.addEventListener('resize', updateRem)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateRem)
    document.documentElement.style.fontSize = initialFontSize
  })

  return {
    currentFontSize,
    currentScale,
  }
}
