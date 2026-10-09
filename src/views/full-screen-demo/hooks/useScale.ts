import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

interface ScaleOptions {
  designWidth?: number
  designHeight?: number
}

export function useScale(containerRef: Ref<HTMLElement | null>, options: ScaleOptions = {}) {
  const { designWidth = 1920, designHeight = 1080 } = options
  if (designWidth <= 0 || designHeight <= 0) {
    throw new Error('useScale: designWidth and designHeight must be greater than 0')
  }

  const scale = ref(1)
  const remBase = ref(100)
  let resizeObserver: ResizeObserver | null = null
  let frameId: number | null = null

  function scheduleUpdate(): void {
    if (frameId !== null) return
    frameId = window.requestAnimationFrame(() => {
      frameId = null
      updateScale()
    })
  }

  function updateScale(): void {
    const el = containerRef.value
    if (!el) return
    const container = el.parentElement
    if (!container) return
    if (container.clientWidth === 0 || container.clientHeight === 0) return

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

  onMounted(() => {
    updateScale()
    window.addEventListener('resize', scheduleUpdate)

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(scheduleUpdate)
      if (containerRef.value?.parentElement) {
        resizeObserver.observe(containerRef.value.parentElement)
      }
    }
  })

  onBeforeUnmount(() => {
    if (frameId !== null) window.cancelAnimationFrame(frameId)
    frameId = null
    resizeObserver?.disconnect()
    resizeObserver = null
    window.removeEventListener('resize', scheduleUpdate)
  })

  return {
    scale,
    remBase
  }
}
