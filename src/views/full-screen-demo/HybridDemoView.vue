<template>
  <div class="hybrid-stage">
    <StatusBadge
      variant="purple"
      text="Hybrid"
      :detail="`窗口: ${width} × ${height} · 宽高比: ${aspectRatio}`"
    />
    <DashboardContent title="城市运营监控指挥中心 · 混合适配" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import DashboardContent from './components/DashboardContent.vue'
import StatusBadge from './components/StatusBadge.vue'

const { width, height } = useWindowSize()
const aspectRatio = computed(() => (width.value / height.value).toFixed(2))
</script>

<style lang="scss" scoped>
.hybrid-stage {
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  font-size: clamp(9px, 0.72vw, 18px);
}
</style>
