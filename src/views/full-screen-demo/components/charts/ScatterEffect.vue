<template>
  <BaseChart :option="chartOption" :height="height" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from './BaseChart.vue'

interface ScatterDataItem {
  name: string
  value: [number, number]
}

interface Props {
  data: ScatterDataItem[]
  height?: string
  xAxisName?: string
  yAxisName?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  xAxisName: '',
  yAxisName: '',
})

const chartOption = computed<EChartsOption>(() => {
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderColor: 'rgba(102,126,234,0.3)',
      textStyle: { color: '#fff' },
    },
    xAxis: {
      type: 'value',
      name: props.xAxisName,
      nameTextStyle: { color: '#8892b0' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#8892b0' },
    },
    yAxis: {
      type: 'value',
      name: props.yAxisName,
      nameTextStyle: { color: '#8892b0' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#8892b0' },
    },
    series: [{
      type: 'effectScatter',
      symbolSize: 15,
      showEffectOn: 'render',
      rippleEffect: {
        brushType: 'stroke',
        scale: 4,
        period: 4,
        color: '#4facfe',
      },
      itemStyle: {
        color: '#4facfe',
        shadowBlur: 10,
        shadowColor: 'rgba(79,172,254,0.5)',
      },
      data: props.data.map(d => ({
        name: d.name,
        value: d.value,
      })),
    }],
  }
})
</script>