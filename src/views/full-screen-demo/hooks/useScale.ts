import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

interface ScaleOptions {
  designWidth?: number
  designHeight?: number
}

export function useScale(containerRef: Ref<HTMLElement | null>, options: ScaleOptions = {}) {
  const { designWidth = 1920, designHeight = 1080 } = options

  const scale = ref(1)
  const remBase = ref(100)

  function updateScale(): void {
    const el = containerRef.value
    if (!el) return
    const container = el.parentElement
    if (!container) return

    const finalScale = Math.min(
      container.clientWidth / designWidth,
      container.clientHeight / designHeight,
    )

    el.style.transform = `scale(${finalScale})`
    el.style.transformOrigin = '0 0'
    el.style.left = `${(container.clientWidth - designWidth * finalScale) / 2}px`
    el.style.top = `${(container.clientHeight - designHeight * finalScale) / 2}px`

    scale.value = finalScale
    remBase.value = 100 * finalScale
  }

  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    updateScale()
    window.addEventListener('resize', updateScale)

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(updateScale)
      if (containerRef.value?.parentElement) {
        resizeObserver.observe(containerRef.value.parentElement)
      }
    }
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
    window.removeEventListener('resize', updateScale)
  })

  return {
    scale,
    remBase
  }
}
