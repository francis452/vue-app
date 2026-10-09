import { onMounted, onUnmounted, ref } from "vue"

export interface TrendData {
  categories: string[]
  series: {
    name: string
    data: number[]
    color: string
    areaColor: string
  }[]
}

export interface PieDataItem {
  name: string
  value: number
  color: string
}

export interface Metrics {
  totalRequests: number
  availability: number
  avgLatency: number
  onlineUsers: number
}

export interface SystemResources {
  cpu: number
  memory: number
  disk: number
  network: number
}

export interface ServerNode {
  name: string
  value: [number, number]
}

export interface RegionData {
  categories: string[]
  series: {
    name: string
    data: number[]
    color: string
  }[]
}


// 趋势数据
export function useTrendData(options: {
  points?: number
  min?: number
  max?: number
  interval?: number
} = {}) {
  const { points = 12, min = 100, max = 1000, interval = 3000 } = options

  const now = new Date()
  const initialCategories = Array.from({ length: points }, (_, i) => {
    const d = new Date(now.getTime() - (points - 1 - i) * 5000)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  })

  const categories = ref<string[]>([...initialCategories])
  const requestData = ref<number[]>(
    Array.from({ length: points }, () => Math.floor(Math.random() * (max - min) + min))
  )
  const responseTimeData = ref<number[]>(
    Array.from({ length: points }, () => Math.floor(Math.random() * 80 + 20))
  )

  let timer: ReturnType<typeof setInterval> | null = null

  function pushData() {
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    categories.value.push(timeStr)
    requestData.value.push(Math.floor(Math.random() * (max - min) + min))
    responseTimeData.value.push(Math.floor(Math.random() * 80 + 20))

    if (categories.value.length > points) {
      categories.value.shift()
      requestData.value.shift()
      responseTimeData.value.shift()
    }
  }

  onMounted(() => {
    if (interval > 0) timer = setInterval(pushData, interval)
  })
  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return { categories, requestData, responseTimeData }
}

// 饼图数据
export function usePieData() {
  return ref<PieDataItem[]>([
    { name: 'Web 应用', value: 35, color: '#4facfe' },
    { name: 'API 网关', value: 28, color: '#00f2fe' },
    { name: '数据库', value: 18, color: '#43e97b' },
    { name: '缓存服务', value: 12, color: '#f093fb' },
    { name: '消息队列', value: 7, color: '#f5576c' },
  ])
}

// 实时指标
export function useMetrics() {
  const metrics = ref<Metrics>({
    totalRequests: 128456,
    availability: 98.7,
    avgLatency: 45,
    onlineUsers: 2847,
  })

  let timer: ReturnType<typeof setInterval> | null = null

  function update() {
    metrics.value = {
      totalRequests: metrics.value.totalRequests + Math.floor(Math.random() * 50),
      availability: +(Math.min(100, Math.max(95, metrics.value.availability + (Math.random() - 0.5) * 0.1))).toFixed(1),
      avgLatency: Math.floor(Math.random() * 20 + 35),
      onlineUsers: metrics.value.onlineUsers + Math.floor(Math.random() * 20 - 10),
    }
  }

  onMounted(() => { timer = setInterval(update, 2000) })
  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return metrics
}

// 系统资源
export function useSystemResources() {
  const resources = ref<SystemResources>({ cpu: 65, memory: 42, disk: 78, network: 56 })
  let timer: ReturnType<typeof setInterval> | null = null

  function update() {
    resources.value = {
      cpu: Math.floor(Math.random() * 30 + 50),
      memory: Math.floor(Math.random() * 20 + 35),
      disk: Math.floor(Math.random() * 10 + 72),
      network: Math.floor(Math.random() * 30 + 40),
    }
  }

  onMounted(() => { timer = setInterval(update, 3000) })
  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return resources
}

// 服务器节点
export function useServerNodes() {
  return ref<ServerNode[]>([
    { name: 'Node-01', value: [120, 85] },
    { name: 'Node-02', value: [200, 65] },
    { name: 'Node-03', value: [150, 45] },
    { name: 'Node-04', value: [280, 72] },
    { name: 'Node-05', value: [90, 55] },
    { name: 'Node-06', value: [320, 38] },
  ])
}

// 地区分布
export function useRegionData() {
  return ref<RegionData>({
    categories: ['华东', '华南', '华北', '西南', '华中', '东北', '西北'],
    series: [
      { name: '请求量', data: [3200, 2800, 2400, 1800, 1500, 1200, 800], color: '#4facfe' },
      { name: '带宽(Mbps)', data: [850, 720, 680, 450, 380, 320, 200], color: '#43e97b' },
    ],
  })
}

// 格式化数字
export function formatNumber(num: number): string {
  return num?.toLocaleString() || '0'
}