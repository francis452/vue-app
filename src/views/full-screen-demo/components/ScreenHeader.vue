<template>
  <header class="screen-header">
    <h1 class="screen-header__title">{{ title }}</h1>
    <span class="screen-header__time">{{ time }}</span>
  </header>
</template>
<script setup lang="ts">
import { useClock } from '../hooks/useClock'
withDefaults(defineProps<{
  title?: string
}>(), {
  title: '数据可视化大屏'
})

const { time } = useClock('full')

</script>
<style lang="scss" scoped>

</style>