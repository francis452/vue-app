import type { EChartsOption } from 'echarts'

const textStyle = {
  color: '#8892b0',
  fontSize: 12,
}

export const tooltipDefaults: EChartsOption['tooltip'] = {
  backgroundColor: 'rgba(0,0,0,0.7)',
  borderColor: 'rgba(102,126,234,0.3)',
  textStyle: { color: '#fff', fontSize: 12 },
}

export const lineChartDefaults: EChartsOption = {
  backgroundColor: 'transparent',
  tooltip: { ...tooltipDefaults, trigger: 'axis' },
  legend: {
    bottom: 0,
    textStyle: { color: '#8892b0', fontSize: 11 },
    itemWidth: 15,
    itemHeight: 3,
  },
  grid: { top: 20, left: 50, right: 30, bottom: 40 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    axisLabel: textStyle,
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLabel: textStyle,
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' } },
  },
}

export const barChartDefaults: EChartsOption = {
  backgroundColor: 'transparent',
  tooltip: { ...tooltipDefaults, trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { top: 10, left: 50, right: 20, bottom: 30 },
  xAxis: {
    type: 'category',
    axisLabel: textStyle,
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLabel: textStyle,
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' } },
  },
}