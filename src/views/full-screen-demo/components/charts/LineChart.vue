<template>
  <BaseChart :option="chartOption" :height="height" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import BaseChart from './BaseChart.vue'
import { lineChartDefaults } from './chartConfig'

interface SeriesItem {
  name: string
  data: number[]
  color: string
  areaColor?: string
}

interface Props {
  data: {
    categories: string[]
    series: SeriesItem[]
  }
  height?: string
  showArea?: boolean
  yAxisName?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  showArea: true,
  yAxisName: '',
})

const chartOption = computed<EChartsOption>(() => {
  const { categories, series } = props.data

  return {
    ...lineChartDefaults,
    xAxis: { ...(lineChartDefaults.xAxis as object), data: categories },
    yAxis: {
      ...(lineChartDefaults.yAxis as object),
      name: props.yAxisName,
    },
    series: series.map(s => ({
      type: 'line',
      name: s.name,
      data: s.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2, color: s.color },
      itemStyle: { color: s.color },
      areaStyle: props.showArea
        ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: s.areaColor || s.color || '#4facfe' },
              { offset: 1, color: 'rgba(79,172,254,0)' },
            ]),
          }
        : undefined,
    })),
  }
})
</script>