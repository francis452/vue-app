<template>
  <BaseChart :option="chartOption" :height="height" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from './BaseChart.vue'

interface Props {
  value: number
  title?: string
  height?: string
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  title: '',
  max: 100,
})

const chartOption = computed<EChartsOption>(() => {
  return {
    series: [{
      type: 'gauge',
      startAngle: 210,
      endAngle: -30,
      center: ['50%', '55%'],
      radius: '85%',
      min: 0,
      max: props.max,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 20,
          color: [
            [0.3, '#52c41a'],
            [0.7, '#4facfe'],
            [1, '#f5222d'],
          ],
        },
      },
      pointer: {
        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        length: '60%',
        width: 8,
        offsetCenter: [0, '-10%'],
        itemStyle: { color: 'auto' },
      },
      axisTick: { length: 12, lineStyle: { color: 'auto', width: 2 } },
      splitLine: { length: 20, lineStyle: { color: 'auto', width: 4 } },
      axisLabel: { color: '#8892b0', fontSize: 10, distance: 25 },
      title: props.title
        ? { offsetCenter: [0, '80%'], fontSize: 14, color: '#8892b0' }
        : { show: false },
      detail: {
        valueAnimation: true,
        fontSize: 28,
        fontWeight: 'bold',
        offsetCenter: [0, '45%'],
        formatter: '{value}%',
        color: '#fff',
        fontFamily: 'DIN, Consolas, monospace',
      },
      data: [{ value: props.value, name: props.title }],
    }],
  }
})
</script>