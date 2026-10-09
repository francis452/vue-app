<template>
  <div class="stat-item">
    <div class="stat-item__value">
      {{ value }}<span v-if="suffix" style="font-size: 18px;">{{ suffix }}</span> 
    </div>
    <div class="stat-item__label">{{ label }}</div>
    <div v-if="trend" class="stat-item__trend" :class="`stat-item__trend--${trendDirection}`">
      {{ trend }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  value: string | number
  suffix?: string
  label?: string
  trend?: string
}>()

const trendDirection = computed(() => {
  if (!props.trend) return ''
  return props.trend.includes('↑') || props.trend.includes('+') ? 'up' : 'down'
})
</script>
