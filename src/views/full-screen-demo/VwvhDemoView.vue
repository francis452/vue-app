<template>
  <div class="vw-stage">
    <StatusBadge
      variant="info"
      text="VW / VH"
      :detail="`窗口: ${width} × ${height}`"
    />
    <DashboardContent title="城市运营监控指挥中心 · 视口单位适配" />
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import DashboardContent from './components/DashboardContent.vue'
import StatusBadge from './components/StatusBadge.vue'

const { width, height } = useWindowSize()
</script>

<style lang="scss" scoped>
.vw-stage {
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  font-size: 0.78vw;
}
</style>
