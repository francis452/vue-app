<template>
  <div class="rem-stage">
    <StatusBadge
      variant="success"
      :text="`Rem: ${currentFontSize.toFixed(1)}px`"
      :detail="`比例: ${currentScale.toFixed(3)}`"
    />
    <DashboardContent title="城市运营监控指挥中心 · Rem 适配" />
  </div>
</template>

<script setup lang="ts">
import DashboardContent from './components/DashboardContent.vue'
import StatusBadge from './components/StatusBadge.vue'
import { useRem } from './hooks/useRem'

const { currentFontSize, currentScale } = useRem({ designHeight: 1080 })
</script>

<style lang="scss" scoped>
.rem-stage {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-size: 1rem;
}
</style>
