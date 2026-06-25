<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { NButton, NSpace } from 'naive-ui'

import { useMessage } from 'naive-ui'

const message = useMessage()

const handleClick = () => {
  message.success('Clicked!')
}
</script>

<template>
  <n-config-provider>
    <n-layout style="min-height: 100vh;">
      <n-layout-header bordered>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <img alt="Vue logo" src="@/assets/logo.svg" width="40" height="40" />
            <n-space>
              <RouterLink to="/" style="text-decoration: none;">
                <n-button>Home</n-button>
              </RouterLink>
              <RouterLink to="/about" style="text-decoration: none;">
                <n-button>About</n-button>
              </RouterLink>
            </n-space>
          </div>
          <div>
            <n-button type="primary" @click="handleClick">Primary</n-button>
          </div>
        </div>
      </n-layout-header>

      <n-layout-content style="padding: 20px;">
        <RouterView />
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>

<style scoped>
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
