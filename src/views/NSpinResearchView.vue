<template>
  <main class="spin-research">
    <section class="page-header">
      <h1>NSpin 研究页</h1>
      <p>集中观察 Naive UI 的 n-spin 在不同尺寸、描述、延迟和包裹内容场景下的表现。</p>
    </section>

    <n-space vertical size="large">
      <n-card title="基础控制" size="small">
        <template #header-extra>
          <n-switch v-model:value="basicLoading">
            <template #checked>加载中</template>
            <template #unchecked>已完成</template>
          </n-switch>
        </template>

        <div class="center-demo">
          <n-spin :show="basicLoading" description="正在加载数据...">
            <div>这里是要显示的内容......</div>
            <div>这里是要显示的内容......</div>
            <div>这里是要显示的内容......</div>
            <div>这里是要显示的内容......</div>
            <div>这里是要显示的内容......</div>
            <div>这里是要显示的内容......</div>
          </n-spin>
        </div>
      </n-card>

      <n-card title="尺寸对比" size="small">
        <n-space align="center" size="large">
          <div v-for="size in spinSizes" :key="size" class="size-demo">
            <n-spin :size="size" />
            <span>{{ size }}</span>
          </div>
        </n-space>
      </n-card>

      <n-card title="包裹内容" size="small">
        <template #header-extra>
          <n-button size="small" @click="refreshCard">模拟刷新</n-button>
        </template>

        <n-spin :show="cardLoading" description="刷新列表中">
          <div class="content-grid">
            <article v-for="item in mockItems" :key="item.title" class="content-item">
              <strong>{{ item.title }}</strong>
              <span>{{ item.description }}</span>
            </article>
          </div>
        </n-spin>
      </n-card>

      <n-card title="延迟展示" size="small">
        <template #header-extra>
          <n-button size="small" @click="triggerDelayedLoading">触发 800ms 延迟</n-button>
        </template>

        <n-spin :show="delayLoading" :delay="800" description="短请求不会闪一下">
          <div class="delay-panel">
            <span>当前状态</span>
            <strong>{{ delayLoading ? '请求处理中' : '空闲' }}</strong>
          </div>
        </n-spin>
      </n-card>
    </n-space>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { NButton, NCard, NSpace, NSpin, NSwitch } from 'naive-ui'

const basicLoading = ref(false)
const cardLoading = ref(false)
const delayLoading = ref(false)
const spinSizes = ['small', 'medium', 'large'] as const

const mockItems = [
  {
    title: '列表区域',
    description: '观察 spin 遮罩如何覆盖已有内容。',
  },
  {
    title: '交互反馈',
    description: '刷新时按钮保持在卡片头部，内容区域进入加载态。',
  },
  {
    title: '文案说明',
    description: 'description 适合放短状态，不适合放长段落。',
  },
]

const refreshCard = () => {
  cardLoading.value = true

  window.setTimeout(() => {
    cardLoading.value = false
  }, 1600)
}

const triggerDelayedLoading = () => {
  delayLoading.value = true

  window.setTimeout(() => {
    delayLoading.value = false
  }, 1800)
}

watch(() => basicLoading.value, () => {
  setTimeout(() => {
    basicLoading.value = false
  }, 5000)
})

onMounted(() => {
  basicLoading.value = true
})
</script>

<style scoped>
.spin-research {
  width: min(960px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 32px 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px;
  color: #1f2328;
  font-size: 28px;
  line-height: 1.25;
}

.page-header p {
  margin: 0;
  color: #667085;
  font-size: 14px;
}

.center-demo {
  display: grid;
  min-height: 120px;
  place-items: center;
}

.size-demo {
  display: grid;
  min-width: 88px;
  min-height: 96px;
  place-items: center;
  gap: 10px;
  color: #667085;
  font-size: 13px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.content-item {
  display: grid;
  gap: 6px;
  min-height: 104px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.content-item strong,
.delay-panel strong {
  color: #1f2328;
}

.content-item span,
.delay-panel span {
  color: #667085;
  font-size: 13px;
}

.delay-panel {
  display: grid;
  min-height: 96px;
  place-items: center;
  gap: 6px;
  border: 1px dashed #d0d5dd;
  border-radius: 8px;
  background: #fafafa;
}

@media (max-width: 720px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
