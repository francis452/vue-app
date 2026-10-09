<template>
  <div ref="chartRef" class="base-chart" :style="{ height: height }"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  option: EChartsOption
  height?: string
  theme?: string
  autoResize?: boolean
}>(), {
  height: '100%',
  theme: 'dark',
  autoResize: true,
})

const emit = defineEmits(['chartReady'])

const chartRef = ref(null)

let chartInstance: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null
let resizeFrameId: number | null = null

function initChart() {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()

  chartInstance = echarts.init(chartRef.value, props.theme, { renderer: 'svg' })
  chartInstance.setOption(props.option)
  emit('chartReady', chartInstance)
}

function handleResize() {
  chartInstance?.resize()
}

function scheduleResize() {
  if (resizeFrameId !== null) return
  resizeFrameId = window.requestAnimationFrame(() => {
    resizeFrameId = null
    handleResize()
  })
}

onMounted(() => {
  initChart()
  if (props.autoResize) {
    window.addEventListener('resize', handleResize)

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(scheduleResize)
      if (chartRef.value) resizeObserver.observe(chartRef.value)
    }
  }
})

onUnmounted(() => {
  if (props.autoResize) {
    if (resizeFrameId !== null) window.cancelAnimationFrame(resizeFrameId)
    resizeFrameId = null
    resizeObserver?.disconnect()
    resizeObserver = null
    window.removeEventListener('resize', handleResize)
  }
  chartInstance?.dispose()
  chartInstance = null
})

watch(
  () => props.option,
  () => {
    chartInstance?.setOption(props.option, { notMerge: false })
  },
  { deep: true }
)

defineExpose({
  getInstance: () => chartInstance,
  resize: handleResize,
})

</script>

<style lang="scss" scoped>
.base-chart {
  width: 100%;
  min-height: 100px;
}
</style>
