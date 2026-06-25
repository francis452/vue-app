<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NSpace, NButton, NTabs, NTabPane, NInput, NCheckbox, NDivider, NStatistic, useMessage } from 'naive-ui'
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const message = useMessage()
const counterStore = useCounterStore()
const { count, message: storeMessage, doubleCount, tripleCount } = storeToRefs(counterStore)

const handleClick = () => {
  message.success('操作成功！')
}

const handleInfo = () => {
  message.info('这是一个信息提示')
}

const handleSuccess = () => {
  message.success('操作完成！')
}

const checked = ref(false)

const increment = () => {
  counterStore.increment()
}

const decrement = () => {
  counterStore.decrement()
}

const reset = () => {
  counterStore.reset()
}
</script>

<template>
  <n-space vertical size="large">
    <n-card title="欢迎使用 Vue3 + Naive UI 应用">
      <template #header-extra>
        <n-button type="primary" ghost>更多</n-button>
      </template>

      <div style="padding: 20px 0;">
        <p>这是一个基于 Vue3、Vue Router、Pinia 和 Naive UI 构建的现代前端应用。</p>
        <p>使用了 TypeScript 确保代码质量。</p>
      </div>

      <n-space vertical>
        <n-button type="primary" @click="handleClick">点击测试</n-button>
        <n-button type="info" @click="handleInfo">信息按钮</n-button>
        <n-button type="success" @click="handleSuccess">成功按钮</n-button>
      </n-space>
    </n-card>

    <n-card title="Pinia 状态管理示例">
      <div style="text-align: center;">
        <p style="font-size: 18px; margin-bottom: 20px;">{{ message }}</p>

        <n-space vertical size="large" style="max-width: 400px; margin: 0 auto;">
          <n-statistic label="Count" :value="count" />
          <n-statistic label="Double Count" :value="doubleCount" />
          <n-statistic label="Triple Count" :value="tripleCount" />
        </n-space>

        <NDivider />

        <n-space justify="center" size="medium">
          <n-button type="error" @click="decrement">-1</n-button>
          <n-button type="primary" @click="increment">+1</n-button>
          <n-button type="warning" @click="reset">Reset</n-button>
        </n-space>
      </div>
    </n-card>

    <n-card title="功能特性">
      <n-tabs type="line" animated>
        <n-tab-pane name="tech" tab="技术栈">
          <n-space vertical>
            <div><strong>Vue 3</strong> - 渐进式JavaScript框架</div>
            <div><strong>TypeScript</strong> - 类型安全的JavaScript超集</div>
            <div><strong>Vue Router</strong> - 官方路由管理</div>
            <div><strong>Pinia</strong> - 轻量级状态管理</div>
            <div><strong>Naive UI</strong> - Vue 3 组件库</div>
          </n-space>
        </n-tab-pane>
        <n-tab-pane name="features" tab="功能">
          <n-space vertical>
            <n-input placeholder="这是一个输入框" />
            <n-checkbox v-model:checked="checked">复选框</n-checkbox>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </n-space>
</template>
