<template>
  <div class="scale-stage">
    <StatusBadge
      variant="warning"
      :text="`Scale: ${scale.toFixed(3)}`"
      :detail="`窗口: ${width} × ${height}`"
    />
    <section ref="screenRef" class="scale-screen">
      <DashboardContent title="城市运营监控指挥中心 · Scale 适配" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import DashboardContent from './components/DashboardContent.vue'
import StatusBadge from './components/StatusBadge.vue'
import { useScale } from './hooks/useScale'

const screenRef = ref<HTMLElement | null>(null)
const { scale } = useScale(screenRef)
const { width, height } = useWindowSize()
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.scale-stage {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #05070f;
}

.scale-screen {
  position: absolute;
  width: #{$design-width}px;
  height: #{$design-height}px;
  transform-origin: 0 0;
  font-size: 16px;
}
</style>
