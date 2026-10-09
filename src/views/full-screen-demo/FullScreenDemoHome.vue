<template>
  <div class="home">
    <div class="home__container">
      <h1 class="home__title">🎛️ 大屏适配方案对比</h1>
      <p class="home__subtitle">
        每种方案打开后，尝试
        <span class="highlight">缩放浏览器窗口</span>
        感受差异
      </p>

      <div class="home__grid">
        <router-link
          v-for="demo in demos"
          :key="demo.path"
          :to="demo.path"
          class="home__card"
          target="_blank"
        >
          <div class="home__card-icon">{{ demo.icon }}</div>
          <div class="home__card-title">{{ demo.title }}</div>
          <div class="home__card-desc">{{ demo.desc }}</div>
          <div class="home__card-tradeoffs">
            <div class="home__card-tradeoff">
              <span class="home__card-tradeoff-title is-pro">优点</span>
              <ul>
                <li v-for="item in demo.pros" :key="item">{{ item }}</li>
              </ul>
            </div>
            <div class="home__card-tradeoff">
              <span class="home__card-tradeoff-title is-con">缺点</span>
              <ul>
                <li v-for="item in demo.cons" :key="item">{{ item }}</li>
              </ul>
            </div>
          </div>
          <span class="home__card-tag">{{ demo.tag }}</span>
        </router-link>
      </div>

      <p class="home__note">
        💡 提示：同时打开多个页面，
        <span>调整窗口大小</span>
        对比效果
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DemoItem {
  path: string
  icon: string
  title: string
  desc: string
  tag: string
  pros: string[]
  cons: string[]
}

const demos: DemoItem[] = [
  {
    path: '/full-screen-demo/scale',
    icon: '📐',
    title: '方案一：Scale 等比缩放',
    desc: '固定 1920×1080 设计稿，通过 CSS transform scale 等比缩放，保持完美比例。',
    tag: '完美还原设计稿',
    pros: ['设计稿还原度最高，布局位置不变', '适合图表密集、版式复杂的固定大屏', '开发时可直接按设计稿像素实现'],
    cons: ['屏幕比例不一致时会出现黑边或留白', '极端窗口下文字会变得过小', '缩放细节和交互体验需要额外验证'],
  },
  {
    path: '/full-screen-demo/rem',
    icon: '📏',
    title: '方案二：rem 动态适配',
    desc: '动态设置根字体大小，元素使用 rem 单位随屏幕宽度等比缩放。',
    tag: '字体友好',
    pros: ['文字和间距可整体等比缩放', '不依赖 transform，原生布局和交互更稳定', '第三方组件可通过统一根字体适配'],
    cons: ['历史 px 代码需要换算或迁移', '部分组件内部写死 px 时会失效', '只用宽度计算时，特殊比例仍可能溢出'],
  },
  {
    path: '/full-screen-demo/vwvh',
    icon: '🖥️',
    title: '方案三：纯 vw/vh 视口单位',
    desc: '所有尺寸用视口单位，简单直接，不需要任何 JS 计算。',
    tag: '零 JS 方案',
    pros: ['纯 CSS 实现，运行时成本最低', '窗口变化即时响应，无需监听 resize', '适合简单标准屏或快速搭建'],
    cons: ['宽高比差异大时文字和留白容易失衡', '小屏可能过小、大屏可能过大', '复杂布局需要大量单位换算'],
  },
  {
    path: '/full-screen-demo/hybrid',
    icon: '🔮',
    title: '方案四：混合方案',
    desc: 'Scale + rem + 媒体查询，生产环境的组合方案。',
    tag: '生产推荐',
    pros: ['按区域选择最适合的适配策略', '可兼顾设计还原、可读性和交互体验', '能通过媒体查询覆盖特殊设备'],
    cons: ['实现和维护复杂度最高', '需要覆盖更多分辨率和设备测试', '多套规则会增加排查成本'],
  },
]
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.home {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: calc(100vh - 56px);
  overflow: hidden;
  background: $bg-primary;
  color: $text-primary;
  font-family: $font-family-base;

  &__container {
    text-align: center;
    width: min(1480px, calc(100% - 48px));
    padding: 24px 0;
  }

  &__title {
    font-size: 32px;
    margin-bottom: 12px;
    background: linear-gradient(135deg, $accent-indigo, $accent-purple);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &__subtitle {
    color: $text-secondary;
    margin-bottom: 24px;
    font-size: 15px;

    .highlight { color: #f0a500; }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: $gap-lg;
  }

  &__card {
    background: linear-gradient(135deg, rgba($accent-indigo, 0.1), rgba($accent-purple, 0.1));
    border: 1px solid rgba($accent-indigo, 0.3);
    border-radius: $radius-lg;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 18px 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    color: $text-primary;
    display: block;

    &:hover {
      transform: translateY(-4px);
      border-color: $accent-indigo;
      box-shadow: 0 8px 30px rgba($accent-indigo, 0.3);
    }

    &-icon { font-size: 28px; margin-bottom: 8px; }
    &-title { font-size: 17px; font-weight: bold; margin-bottom: 6px; text-align: left; }
    &-desc {
      min-height: 44px;
      font-size: 12px;
      color: $text-secondary;
      line-height: 1.5;
      margin-bottom: 12px;
      text-align: left;
    }
    &-tradeoffs {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      width: 100%;
      margin-bottom: 12px;
    }

    &-tradeoff {
      min-width: 0;
      padding: 9px 10px;
      border-radius: $radius-md;
      background: rgba(0, 0, 0, 0.18);
      text-align: left;

      ul {
        margin: 4px 0 0;
        padding-left: 18px;
      }

      li {
        color: $text-secondary;
        font-size: 11px;
        line-height: 1.45;
      }
    }

    &-tradeoff-title {
      display: inline-block;
      font-size: 13px;
      font-weight: 600;

      &.is-pro { color: $trend-down; }
      &.is-con { color: $trend-up; }
    }

    &-tag {
      display: inline-block;
      margin-top: auto;
      padding: 4px 12px;
      border-radius: $radius-pill;
      font-size: 12px;
      background: rgba($accent-indigo, 0.2);
    }
  }

  &__note {
    margin-top: 18px;
    color: $text-secondary;
    font-size: 14px;
    span { color: $accent-indigo; }
  }

  @media (max-width: 1200px) {
    &__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 640px) {
    &__grid { grid-template-columns: 1fr; }
  }
}
</style>
