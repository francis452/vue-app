<template>
  <BaseChart :option="chartOption" :height="height" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from './BaseChart.vue'

interface PieDataItem {
  name: string
  value: number
  color?: string
}

interface Props {
  data: PieDataItem[]
  height?: string
  radius?: [string, string]
  roseType?: 'area' | 'radius'
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  radius: () => ['40%', '70%'],
})

const defaultColors = [
  '#4facfe', '#00f2fe', '#43e97b', '#f093fb',
  '#f5576c', '#667eea', '#764ba2', '#11998e',
]

const chartOption = computed<EChartsOption>(() => {
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderColor: 'rgba(102,126,234,0.3)',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#8892b0', fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [{
      type: 'pie',
      radius: props.radius,
      roseType: props.roseType || undefined,
      center: ['50%', '45%'],
      itemStyle: {
        borderRadius: 4,
        borderColor: 'rgba(10, 14, 39, 0.8)',
        borderWidth: 3,
      },
      label: { color: '#8892b0', fontSize: 11, formatter: '{b}\n{d}%' },
      emphasis: { label: { fontSize: 16, fontWeight: 'bold' }, scaleSize: 10 },
      data: props.data,
    }],
    color: props.data.map(
      (item, index) => item.color ?? defaultColors[index % defaultColors.length] ?? '#4facfe',
    ),
  }
})
</script>
