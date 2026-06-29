<template>
  <div class="naive-ui-test">
    <h1>Naive UI 测试页面</h1>

    <n-form :model="formValue" label-placement="left" label-width="auto" require-mark-placement="right-hanging">
      <div>日期时间----{{ formValue.datetime }}</div>
      <div>placeholder----{{ formValue.datetime ? '' : '请选择日期时间' }}</div>
      <n-form-item label="选择日期时间" path="datetime">
        <n-date-picker
          v-model:value="formValue.datetime"
          type="datetime"
          format="yyyy-MM-dd HH:mm:ss"
          :placeholder="disabled ? '' : '请选择日期时间'"
          :actions="['clear', 'now']"
          clearable
          style="width: 300px"
        />
      </n-form-item>

      <n-form-item label="选中的值" path="result">
        <n-input :value="formatDateTime" readonly placeholder="未选择" style="width: 300px" />
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NForm, NFormItem, NDatePicker, NInput } from 'naive-ui'

const formValue = ref({
  datetime: null as number | null,
})

const disabled = ref(false)

const formatDateTime = computed(() => {
  if (!formValue.value.datetime) return ''
  const date = new Date(formValue.value.datetime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
})

const setDateTime = () => {
  setTimeout(() => {
    disabled.value = true
  }, 3000)
}

onMounted(() => {
  setDateTime()
})
</script>

<style scoped>
.naive-ui-test {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}
</style>