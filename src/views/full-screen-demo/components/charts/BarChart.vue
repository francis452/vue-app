<template>
  <BaseChart :option="chartOption" :height="height" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import BaseChart from './BaseChart.vue'
import { barChartDefaults } from './chartConfig'

interface SeriesItem {
  name: string
  data: number[]
  color?: string
}

interface Props {
  data: {
    categories: string[]
    series: SeriesItem[]
  }
  height?: string
  horizontal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  horizontal: false,
})

const chartOption = computed<EChartsOption>(() => {
  const { categories, series } = props.data
  const baseDefaults = JSON.parse(JSON.stringify(barChartDefaults)) as EChartsOption

  return {
    ...baseDefaults,
    ...(props.horizontal
      ? {
          xAxis: { type: 'value', ...(baseDefaults.yAxis as object) },
          yAxis: {
            type: 'category',
            data: categories,
            ...(baseDefaults.xAxis as object),
            axisTick: undefined,
            axisLabel: (baseDefaults.xAxis as any)?.axisLabel,
          },
        }
      : {
          xAxis: { ...(baseDefaults.xAxis as object), data: categories },
          yAxis: { ...(baseDefaults.yAxis as object) },
        }),
    series: series.map(s => ({
      type: 'bar',
      name: s.name,
      data: s.data,
      barWidth: '50%',
      itemStyle: {
        borderRadius: props.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
        color: s.color || new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#4facfe' },
          { offset: 1, color: '#0050b3' },
        ]),
      },
    })),
  }
})
</script>