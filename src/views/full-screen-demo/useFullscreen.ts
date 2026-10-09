import { onBeforeUnmount, onMounted, ref } from 'vue'

export interface UseFullscreenReturn {
  /** 当前是否处于全屏状态 */
  isFullscreen: ReturnType<typeof ref<boolean>>
  /** 进入全屏（默认全屏整个 documentElement，可指定某个元素） */
  enter: (target?: HTMLElement) => Promise<void>
  /** 退出全屏 */
  exit: () => Promise<void>
  /** 根据当前状态切换 */
  toggle: (target?: HTMLElement) => Promise<void>
}

function getFullscreenElement(): Element | null {
  return document.fullscreenElement
}

/**
 * Fullscreen API 封装。
 *  - 监听 document.fullscreenchange 同步 isFullscreen
 *  - enter/exit 兼容 Promise 风格
 *
 * 注意：浏览器要求全屏调用必须由用户手势（click 等）触发。
 */
export function useFullscreen(): UseFullscreenReturn {
  const isFullscreen = ref<boolean>(false)

  function syncState(): void {
    isFullscreen.value = getFullscreenElement() !== null
  }

  async function enter(target?: HTMLElement): Promise<void> {
    const el = target ?? document.documentElement
    if (!el.requestFullscreen) return
    try {
      await el.requestFullscreen()
    } catch {
      // 用户拒绝或浏览器不允许时静默忽略
    }
  }

  async function exit(): Promise<void> {
    if (!document.exitFullscreen) return
    try {
      await document.exitFullscreen()
    } catch {
      // 忽略
    }
  }

  async function toggle(target?: HTMLElement): Promise<void> {
    if (isFullscreen.value) {
      await exit()
    } else {
      await enter(target)
    }
  }

  onMounted(() => {
    syncState()
    document.addEventListener('fullscreenchange', syncState)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', syncState)
  })

  return { isFullscreen, enter, exit, toggle }
}