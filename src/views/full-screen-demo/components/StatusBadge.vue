<template>
  <div class="status-badge" :class="`status-badge--${variant}`">
    <span>{{ text }}</span>
    <span class="detail" v-if="detail">{{ detail }}</span>
  </div>
</template>

<script setup lang="ts">

type BadgeVariant = 'info' | 'warning' | 'success' | 'purple'

withDefaults(defineProps<{
  text?: string
  detail?: string
  variant?: BadgeVariant
}>(), {
  variant: 'info'
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables' as *;

.status-badge {
  position: fixed;
  top: 10px;
  right: 10px;
  padding: 8px 16px;
  border-radius: $radius-pill;
  font-size: 14px;
  font-weight: bold;
  z-index: 9999;
  pointer-events: none;

  &--info {
    background: rgba($accent-indigo, 0.9);
    color: #fff;
  }

  &--warning {
    background: rgba(#f0a500, 0.9);
    color: #000;
  }

  &--success {
    background: rgba($trend-down, 0.9);
    color: #fff;
  }

  &--purple {
    background: linear-gradient(135deg, $accent-indigo, $accent-purple);
    color: #fff;
  }

  .detail {
    font-size: 12px;
    opacity: 0.8;
    margin-left: 6px;
  }
}
</style>