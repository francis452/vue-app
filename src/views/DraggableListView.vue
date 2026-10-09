<template>
  <div class="draggable-list">
    <n-card title="vuedraggable 拖拽排序列表" class="list-card">
      <template #header-extra>
        <n-space>
          <n-button type="primary" @click="resetList">重置列表</n-button>
        </n-space>
      </template>

      <p class="tip">提示：拖拽下方任意行，可对列表进行重新排序。当前共 {{ list.length }} 条数据。</p>

      <draggable
        v-model="list"
        item-key="id"
        :animation="200"
        ghost-class="ghost-item"
        chosen-class="chosen-item"
        drag-class="dragging-item"
        handle=".drag-handle"
        @start="onDragStart"
        @end="onDragEnd"
      >
        <template #item="{ element, index }">
          <div class="list-item">
            <div class="drag-handle" title="按住此处拖动">
              <span class="drag-icon">⋮⋮</span>
            </div>
            <div class="item-index">{{ index + 1 }}</div>
            <div class="item-content">
              <div class="item-title">{{ element.title }}</div>
              <div class="item-desc">{{ element.description }}</div>
            </div>
            <n-tag :type="tagType(element.priority)" size="small" round>
              {{ priorityLabel(element.priority) }}
            </n-tag>
            <div class="item-date">{{ element.date }}</div>
          </div>
        </template>
      </draggable>
    </n-card>

    <n-card title="排序后顺序" class="order-card" v-if="lastOrderChanged">
      <ol class="order-list">
        <li v-for="item in list" :key="item.id">{{ item.title }}</li>
      </ol>
      <template #footer>
        <n-text depth="3">最近一次拖动时间：{{ lastChangedAt }}</n-text>
      </template>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'
import { NCard, NButton, NSpace, NTag, NText } from 'naive-ui'

interface ListItem {
  id: number
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  date: string
}

const initialList: ListItem[] = Array.from({ length: 24 }, (_, i) => {
  const priorities: ListItem['priority'][] = ['high', 'medium', 'low']
  const priority: ListItem['priority'] = priorities[i % 3] ?? 'medium'
  return {
    id: i + 1,
    title: `任务 #${i + 1} - ${['需求评审', '接口联调', '数据迁移', '性能优化', 'Bug 修复'][i % 5]}`,
    description: `这是第 ${i + 1} 条数据的描述信息，演示 vuedraggable 的拖拽排序效果。`,
    priority,
    date: `2026-07-${String((i % 30) + 1).padStart(2, '0')}`,
  }
})

const list = ref<ListItem[]>([...initialList])

const lastOrderChanged = ref(false)
const lastChangedAt = ref('')

const priorityLabel = (p: ListItem['priority']) => {
  return { high: '高', medium: '中', low: '低' }[p]
}

const tagType = (p: ListItem['priority']) => {
  return { high: 'error', medium: 'warning', low: 'success' }[p] as 'error' | 'warning' | 'success'
}

const onDragStart = () => {
  // 拖拽开始
}

const onDragEnd = () => {
  lastOrderChanged.value = true
  lastChangedAt.value = new Date().toLocaleString('zh-CN', { hour12: false })
}

const resetList = () => {
  list.value = [...initialList]
  lastOrderChanged.value = false
}
</script>

<style scoped>
.draggable-list {
  padding: 2rem;
  max-width: 960px;
  margin: 0 auto;
}

.list-card,
.order-card {
  margin-bottom: 1.5rem;
}

.tip {
  color: #666;
  font-size: 14px;
  margin-bottom: 1rem;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.list-item:hover {
  background: #f0f7ff;
  border-color: #b3d8ff;
}

.drag-handle {
  cursor: grab;
  padding: 4px 8px;
  color: #999;
  user-select: none;
  font-size: 16px;
  line-height: 1;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-icon {
  display: inline-block;
  letter-spacing: -2px;
}

.item-index {
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  background: #1890ff;
  color: #fff;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-desc {
  font-size: 12px;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-date {
  font-size: 12px;
  color: #aaa;
  flex-shrink: 0;
}

/* vuedraggable 拖拽过程中的样式 */
.ghost-item {
  opacity: 0.4;
  background: #cce5ff !important;
  border: 1px dashed #1890ff !important;
}

.chosen-item {
  background: #e6f7ff !important;
}

.dragging-item {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.order-list {
  margin: 0;
  padding-left: 20px;
  color: #333;
}

.order-list li {
  padding: 4px 0;
}
</style>
