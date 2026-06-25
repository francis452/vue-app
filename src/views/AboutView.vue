<script setup lang="ts">
import { NCard, NAvatar, NTag, NSpace, NStatistic } from 'naive-ui'
</script>

<template>
  <n-space vertical size="large">
    <n-card title="关于本项目" style="max-width: 800px; margin: 0 auto;">
      <template #header>
        <n-space align="center">
          <n-avatar
            round
            src="https://www.naiveui.com/assets/logo.svg"
            style="width: 40px; height: 40px;"
          />
          <span>Vue3 + Naive UI 项目</span>
        </n-space>
      </template>

      <div style="text-align: center; padding: 20px 0;">
        <h2>项目介绍</h2>
        <p style="margin: 20px 0; line-height: 1.6;">
          这是一个使用现代前端技术栈构建的示例项目。项目集成了 Vue 3 的最新特性，
          结合了优秀的 UI 组件库 Naive UI，为你提供开箱即用的开发体验。
        </p>

        <n-space vertical size="large" style="max-width: 600px; margin: 0 auto;">
          <n-statistic label="Vue 版本" :value="'3.4.0'" />
          <n-statistic label="组件库" :value="'Naive UI'" />
          <n-statistic label="状态管理" :value="'Pinia'" />
          <n-statistic label="路由管理" :value="'Vue Router'" />
        </n-space>
      </div>

      <div style="margin-top: 30px;">
        <h3>技术特点</h3>
        <n-space vertical>
          <n-tag type="success">响应式设计</n-tag>
          <n-tag type="warning">TypeScript 支持</n-tag>
          <n-tag type="info">组件化开发</n-tag>
          <n-tag type="error">类型安全</n-tag>
        </n-space>
      </div>
    </n-card>
  </n-space>
</template>

<style scoped>
@media (min-width: 768px) {
  n-card {
    margin: 0 auto;
  }
}
</style>
