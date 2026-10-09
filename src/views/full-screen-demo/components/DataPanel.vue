<template>
  <section class="panel-card" :class="`panel-card--${variant}`">
    <h3 class="panel-card_title" v-if="title">
      {{ title }}
      <span class="unit">{{ unit }}</span>
    </h3>
    <slot />
  </section>
</template>

<script setup lang="ts">
type Variant = 'default' | 'half' | 'full'

withDefaults(defineProps<{
  title?: string
  unit?: string
  variant?: Variant
}>(), {
  variant: 'default'
})
</script>

<style lang="scss" scoped>

</style>