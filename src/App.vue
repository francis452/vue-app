<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NLayout, NMessageProvider, NConfigProvider, NLayoutContent, NLayoutHeader } from 'naive-ui'

const route = useRoute()
const shouldShowAppHeader = computed(() => !route.meta.hideAppHeader)
</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <n-layout style="min-height: 100vh;">
        <n-layout-header v-if="shouldShowAppHeader" bordered class="app-header">
          <div class="app-title">Vue App</div>
          <nav class="app-nav">
            <RouterLink to="/naive-ui-test">Naive UI 测试</RouterLink>
            <RouterLink to="/draggable-list">拖拽列表</RouterLink>
            <RouterLink to="/n-spin-research">NSpin 研究</RouterLink>
            <RouterLink to="/n-data-table-research">NDataTable 研究</RouterLink>
            <RouterLink to="/full-screen-demo">全屏适配 Demo</RouterLink>
          </nav>
        </n-layout-header>
        <n-layout-content>
          <RouterView />
        </n-layout-content>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 0 2rem;
  height: 56px;
}

.app-title {
  width: 100px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.app-nav {
  display: flex;
  gap: 1.5rem;
}

.app-nav a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.app-nav a:hover {
  color: #1890ff;
}

.app-nav a.router-link-exact-active {
  color: #1890ff;
  font-weight: 500;
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
