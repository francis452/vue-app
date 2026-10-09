# 大屏适配方案说明

## 背景

`full-screen-demo` 使用同一套“城市运营监控指挥中心”业务面板，分别接入四种屏幕适配方案。四条路由都会在新标签页打开，并通过路由 `meta.hideAppHeader` 隐藏应用顶部导航，保证大屏占满完整视口。

- 方案入口：`/full-screen-demo`
- 共享业务面板：`src/views/full-screen-demo/components/DashboardContent.vue`
- 设计稿基准：`1920 × 1080`

## 方案一：Scale 等比缩放

### 实现细节

- 路由：`/full-screen-demo/scale`
- 页面：`src/views/full-screen-demo/ScaleDemoView.vue`
- 核心 Hook：`src/views/full-screen-demo/hooks/useScale.ts`

页面保留一个固定为 `1920 × 1080` 的画布，业务内容按设计稿像素直接实现。Hook 会读取父容器宽高，并计算：

```text
scale = min(containerWidth / 1920, containerHeight / 1080)
```

随后通过以下方式缩放并居中画布：

```css
transform: scale(var(--scale));
transform-origin: 0 0;
```

Hook 同时监听 `window.resize` 和父容器 `ResizeObserver`，窗口或容器尺寸变化时都会重新计算。该方案优先保证设计稿比例不变，非 16:9 屏幕会自动留边。

### 优点

- 设计稿还原度最高，元素坐标、间距和布局比例完全不变。
- 图表密集、版式复杂的固定大屏最容易实施。
- 开发阶段可以直接按设计稿像素值还原，不需要大量单位换算。
- 统一缩放整体画面，不同模块之间不会出现比例不一致。

### 缺点

- 目标屏幕与 16:9 比例差异较大时，会出现明显黑边或留白。
- 浏览器窗口很小时，文字、图标和边框会被等比缩小，可读性下降。
- 浏览器整体缩放细节、图表清晰度和交互坐标需要额外验证。
- 更适合展示型大屏，不太适合需要精细输入或大量滚动内容的业务系统。

### 适用场景

- 设计稿已经固定，且要求高保真还原。
- 拼接屏、指挥中心大屏、展会大屏等展示型场景。
- 页面结构复杂、图表多、希望降低多分辨率适配工作量的场景。

## 方案二：Rem 动态适配

### 实现细节

- 路由：`/full-screen-demo/rem`
- 页面：`src/views/full-screen-demo/RemDemoView.vue`
- 核心 Hook：`src/views/full-screen-demo/hooks/useRem.ts`

Hook 会动态修改 `document.documentElement.style.fontSize`。当前实现取宽度和高度两个比例中较小的一个，避免只按宽度缩放时在窄高比屏幕中纵向溢出：

```text
scale = min(
  viewportWidth / 1920,
  viewportHeight / 1080
)

rootFontSize = 100px × scale
```

共享面板内部大量使用 `em` 单位，外层页面设置 `font-size: 1rem`，使字体、间距、圆角、卡片尺寸随根字体联动变化。组件卸载时会恢复进入页面前的根字体大小，避免污染其他路由。

### 优点

- 文字、间距和组件尺寸可以整体联动缩放。
- 不依赖 `transform` 缩放整体画布，原生布局、选择、点击和滚动行为更稳定。
- 相比 Scale，能更好地保留文字渲染和交互细节。
- 团队可以约定设计稿 `px / 100 = rem` 的换算规则，降低协作成本。

### 缺点

- 历史 px 样式和第三方组件需要统一换算或覆盖。
- 如果第三方组件内部写死 px，根字体变化无法影响这些组件。
- 所有业务代码都使用 rem 时，可读性不如直接使用 px。
- 只用宽度作为基准时，极端宽高比仍可能出现溢出；当前实现取宽高较小比例，则可能留出空间。

### 适用场景

- 长期维护的业务型大屏。
- 需要兼顾浏览器缩放、文本可读性和交互体验的页面。
- 团队能够统一样式规范，并对第三方组件做适配合规约束。

## 方案三：纯 vw / vh 视口单位适配

### 实现细节

- 路由：`/full-screen-demo/vwvh`
- 页面：`src/views/full-screen-demo/VwvhDemoView.vue`

页面本身不依赖 JavaScript 计算适配参数，直接使用视口单位：

```css
.vw-stage {
  width: 100vw;
  height: 100dvh;
  font-size: 0.78vw;
}
```

共享面板继续使用 `em` 和百分比布局，因此字体、间距和面板比例会跟随视口宽度变化。窗口尺寸变化时浏览器即时重排，无需监听 `resize`。

### 优点

- 纯 CSS 实现，无运行时监听和动态计算成本。
- 窗口变化即时响应，没有等待 JavaScript 更新根字体的过程。
- 实现简单，适合快速搭建标准比例大屏。
- 不修改全局根字体，不会影响其他路由。

### 缺点

- 宽高比差异较大时，水平与垂直方向的比例容易失衡。
- 小窗口下文字可能过小，超大屏上文字可能过大。
- 复杂页面需要大量 `vw`、`vh`、`vmin`、`vmax` 换算，维护成本上升。
- 单独使用时缺少业务可读性边界，例如最小字号和最大字号。

### 适用场景

- 简单展示页、活动大屏或标准分辨率设备。
- 对 JavaScript 依赖要求极低的静态页面。
- 页面元素较少、宽高比范围可控的场景。

## 方案四：Hybrid 混合适配

### 实现细节

- 路由：`/full-screen-demo/hybrid`
- 页面：`src/views/full-screen-demo/HybridDemoView.vue`

混合方案结合多种技术：

```css
.hybrid-stage {
  width: 100%;
  height: 100vh;
  font-size: clamp(9px, 0.72vw, 18px);
}
```

共享面板使用 Grid、Flex、`minmax` 和比例行高实现弹性布局；字体使用 `clamp()` 限制最小值和最大值；宽高比差异较大时通过媒体查询调整列数。图表等关键画布可以按需继续使用 Scale，而普通业务区域保持原生布局。

### 优点

- 可以按模块选择最合适的适配方式，兼顾还原度、可读性和交互体验。
- `clamp()` 能避免极端窗口下文字过小或过大。
- 弹性布局能更好兼容超宽屏、窄屏、高分屏和浏览器窗口模式。
- 适合长期演进的生产系统，可以逐步引入规则并按设备优化。

### 缺点

- 实现和维护复杂度最高。
- 需要覆盖更多分辨率、宽高比和设备组合进行测试。
- 多套适配规则并存时，问题定位和样式排查成本更高。
- 如果缺少规范，不同模块可能出现字体、间距和比例不一致。

### 适用场景

- 需要长期维护的生产级大屏。
- 用户可能在浏览器窗口、投影、电视、拼接屏等多种环境下使用。
- 页面既有高保真图表区域，也有业务表格、表单或可交互内容。

## 对比总览

| 维度 | Scale | Rem | vw / vh | Hybrid |
| --- | --- | --- | --- | --- |
| 设计稿还原度 | 最高 | 高 | 中 | 可按模块调整 |
| 文字可读性 | 极端窗口下较弱 | 较好 | 易失衡 | 最好 |
| 交互稳定性 | 需验证 | 好 | 好 | 好 |
| JavaScript 成本 | 中 | 中 | 无 | 低到中 |
| 实现复杂度 | 低 | 中 | 低 | 高 |
| 多设备兼容性 | 一般 | 较好 | 一般 | 最好 |
| 长期维护性 | 一般 | 好 | 一般 | 最好 |

## 核心 Hooks 操作手册

所有 Hook 位于 `src/views/full-screen-demo/hooks/`，应在 Vue `setup` 或组合式 API 上下文中调用。包含定时器、事件监听或 `ResizeObserver` 的 Hook 会在组件卸载时自动清理。

### useScale

文件：`src/views/full-screen-demo/hooks/useScale.ts`

`useScale` 用于把固定尺寸设计稿画布等比缩放到父容器内，并自动水平、垂直居中。

#### API

```ts
import { ref } from 'vue'
import { useScale } from './hooks/useScale'

const screenRef = ref<HTMLElement | null>(null)

const {
  scale,   // Ref<number>：实际缩放比例
  remBase, // Ref<number>：100 × scale
} = useScale(screenRef, {
  designWidth: 1920,
  designHeight: 1080,
})
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `containerRef` | `Ref<HTMLElement | null>` | 必传 | 需要缩放的大屏画布元素 |
| `designWidth` | `number` | `1920` | 设计稿宽度 |
| `designHeight` | `number` | `1080` | 设计稿高度 |

| 返回值 | 类型 | 说明 |
| --- | --- | --- |
| `scale` | `Ref<number>` | `min(parentWidth / designWidth, parentHeight / designHeight)` |
| `remBase` | `Ref<number>` | `100 × scale` |

Hook 会读取画布元素的 `parentElement` 作为适配容器，因此画布必须有父级，父级必须有确定高度：

```vue
<template>
  <div class="scale-stage">
    <section ref="screenRef" class="scale-screen">
      <DashboardContent title="大屏标题" />
    </section>
  </div>
</template>

<style scoped>
.scale-stage {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.scale-screen {
  position: absolute;
  width: 1920px;
  height: 1080px;
  transform-origin: 0 0;
  font-size: 16px;
}
</style>
```

`position: absolute` 和 `transform-origin: 0 0` 是必要条件。Hook 会直接写入 `transform`、`left` 和 `top`，实现缩放和居中。

更新与清理机制：

- 挂载后立即计算一次。
- 同时监听 `window.resize` 和父容器 `ResizeObserver`。
- 父容器因路由、全屏或侧栏变化而改变尺寸时也会重新计算。
- 卸载时移除 `resize` 监听并断开 `ResizeObserver`。

### useRem

文件：`src/views/full-screen-demo/hooks/useRem.ts`

`useRem` 动态设置 HTML 根元素字体大小。共享面板内部使用 `em` 和百分比布局，页面外层设置 `font-size: 1rem` 后即可整体联动。

#### API

```ts
import { useRem } from './hooks/useRem'

const {
  currentFontSize, // Ref<number>：当前根字体，保留一位小数
  currentScale,    // Ref<number>：当前适配比例
} = useRem({
  designWidth: 1920,
  designHeight: 1080,
  baseFontSize: 100,
})
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `designWidth` | `number` | `1920` | 设计稿宽度 |
| `designHeight` | `number` | `1080` | 设计稿高度 |
| `baseFontSize` | `number` | `100` | 基准根字体，表示设计稿下 `1rem = 100px` |

计算公式：

```text
scale = min(
  document.documentElement.clientWidth / designWidth,
  document.documentElement.clientHeight / designHeight,
)

rootFontSize = baseFontSize × scale
```

取 `min` 是为了保证宽高两个方向都不溢出。非 16:9 视口下，该方案保留原生布局并可能产生留白。

页面接入示例：

```vue
<template>
  <div class="rem-stage">
    <DashboardContent title="大屏标题" />
  </div>
</template>

<script setup lang="ts">
import DashboardContent from './components/DashboardContent.vue'
import { useRem } from './hooks/useRem'

const { currentFontSize, currentScale } = useRem()
</script>

<style scoped>
.rem-stage {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-size: 1rem;
}
</style>
```

更新与恢复机制：

- 挂载时记录进入页面前的根字体大小。
- 挂载后立即计算一次，并在 `window.resize` 时重新计算。
- 卸载前移除监听，并恢复进入页面前的根字体大小。

注意事项：

- 页面外层必须设置 `font-size: 1rem`，否则共享面板中的 `em` 不会跟随根字体变化。
- 该 Hook 修改全局根字体；同一浏览器标签内同一时间只应激活一个 Rem 适配页面。
- 第三方组件内部如果写死 px 字体，需要单独覆盖。

### useClock

文件：`src/views/full-screen-demo/hooks/useClock.ts`

`useClock` 提供大屏头部实时时间。

```ts
const { time } = useClock('full')
```

| 参数 | 类型 | 默认值 | 可选值 | 输出示例 |
| --- | --- | --- | --- | --- |
| `format` | `'full' | 'time'` | `'full'` | `'full'`、`'time'` | `2026/10/09 10:20:30` 或 `10:20:30` |

返回 `time: Ref<string>`。挂载后立即更新，每秒刷新，卸载时清理定时器。

### useMockData

文件：`src/views/full-screen-demo/hooks/useMockData.ts`

该文件提供大屏演示数据和数字格式化函数，分为定时更新数据、静态数据和工具函数三类。

#### useTrendData：趋势数据

```ts
const {
  categories,       // Ref<string[]>：时间分类
  requestData,      // Ref<number[]>：请求量
  responseTimeData, // Ref<number[]>：响应时间
} = useTrendData({
  points: 24,     // 数据点数量，默认 12
  min: 500,       // 请求量最小值，默认 100
  max: 1800,      // 请求量最大值，默认 1000
  interval: 2000, // 刷新间隔 ms；0 表示不自动刷新，默认 3000
})
```

初始化会生成 `points` 个历史点；自动刷新时向尾部追加新点，并从头部移除旧点，保持长度不变。响应时间当前按 `20–99ms` 随机生成。

#### useMetrics：核心指标

```ts
const metrics = useMetrics()
```

返回 `Ref<Metrics>`，每 2 秒更新一次：

```ts
interface Metrics {
  totalRequests: number
  availability: number
  avgLatency: number
  onlineUsers: number
}
```

更新规则：

- 总请求递增。
- 可用率限制在 `95–100`。
- 平均延迟在 `35–54ms`。
- 在线用户小幅波动。

#### useSystemResources：系统资源

```ts
const resources = useSystemResources()
```

返回 `Ref<SystemResources>`，每 3 秒更新一次：

```ts
interface SystemResources {
  cpu: number
  memory: number
  disk: number
  network: number
}
```

| 字段 | 随机范围 |
| --- | --- |
| `cpu` | `50–79` |
| `memory` | `35–54` |
| `disk` | `72–81` |
| `network` | `40–69` |

#### usePieData：请求来源静态数据

```ts
const pieData = usePieData()
```

返回 `Ref<PieDataItem[]>`：

```ts
interface PieDataItem {
  name: string
  value: number
  color: string
}
```

包含 Web 应用、API 网关、数据库、缓存服务、消息队列五类数据，可直接传给 `PieChart`。

#### useServerNodes：节点矩阵静态数据

```ts
const serverNodes = useServerNodes()
```

返回 `Ref<ServerNode[]>`。每个节点的 `value` 是 `[负载, 响应时间]`：

```ts
interface ServerNode {
  name: string
  value: [number, number]
}
```

当前包含 `Node-01` 到 `Node-06` 六个节点，可直接传给 `ScatterEffect`。

#### useRegionData：区域分布静态数据

```ts
const region = useRegionData()
```

返回 `Ref<RegionData>`：

```ts
interface RegionData {
  categories: string[]
  series: {
    name: string
    data: number[]
    color: string
  }[]
}
```

包含华东、华南、华北、西南、华中、东北、西北七个区域，以及请求量和带宽两条系列。

#### formatNumber：数字格式化

```ts
formatNumber(128456) // 128,456
formatNumber(0)      // 0
```

内部使用 `toLocaleString()`。如果传入空值，返回 `'0'`。

### 接入实时数据的完整步骤

1. 引入需要的 Hook：

```ts
import { useMetrics } from './hooks/useMockData'
```

2. 在 `setup` 中调用并保存响应式数据：

```ts
const metrics = useMetrics()
```

3. 模板中直接读取响应式字段：

```vue
<span>{{ metrics.totalRequests }}</span>
```

4. 传给普通函数时读取 `.value`：

```ts
formatNumber(metrics.value.totalRequests)
```

5. 组装图表数据时必须在 `computed` 内部显式读取 `.value`，避免把 `Ref` 嵌入普通对象：

```ts
const trendData = computed(() => ({
  categories: categories.value,
  series: [
    { name: '请求量', data: requestData.value, color: '#4facfe' },
  ],
}))
```

6. 不需要手动清理 Hook 内部的定时器和监听，组件卸载时会自动执行。

## 选型建议

- 追求最高还原度、页面以展示为主：优先选择 **Scale**。
- 业务系统长期维护、需要兼顾文字和交互：优先选择 **Rem**。
- 页面简单、目标设备比例稳定、希望零 JS：选择 **vw / vh**。
- 设备来源复杂、需要长期迭代、要求可读性和稳定性：选择 **Hybrid**。

生产项目中也可以组合使用：整体布局采用 Rem 或弹性布局，个别必须精确还原的图表或地图区域采用 Scale，同时用 `clamp()` 和媒体查询处理极端设备。

## 其他实现说明

- 四个大屏路由通过 `src/router/index.ts` 的 `meta.hideAppHeader` 隐藏顶部导航。
- 实时事件超过 5 条时自动循环滚动，滚动区域由固定视口裁切，不会侵入相邻模块；鼠标悬停会暂停滚动。
- ECharts 容器开启 `autoResize`，窗口变化后图表会跟随容器重新计算尺寸。

## 最优实现检查与优化记录

- `useScale` 与 `useRem` 使用 `requestAnimationFrame` 合并高频 resize 计算，避免布局抖动和重复读写。
- `useScale` 增加设计稿尺寸校验、父容器零尺寸保护，并同时监听窗口与父容器尺寸。
- `useRem` 增加参数校验，使用视口尺寸计算比例，卸载时恢复进入页面前的根字体。
- 四个大屏页统一使用 `100dvh`，比固定 `100vh` 更适配移动端动态工具栏。
- ECharts 使用 SVG 渲染器，Scale 放大到高分屏时保持矢量清晰度。
- ECharts 自动 resize 同时观察自身容器和窗口，嵌入容器变化时也能正确重算。

## 完整源码归档

本节归档当前 demo 的完整页面、Hook、组件、样式与路由源码。只依据本节内容复制文件，即可在已有 Vue 3 + Vite + Naive UI + ECharts 项目中复现整个 demo。

### 文件清单

1. `src/views/full-screen-demo/hooks/useScale.ts`
2. `src/views/full-screen-demo/hooks/useRem.ts`
3. `src/views/full-screen-demo/hooks/useClock.ts`
4. `src/views/full-screen-demo/hooks/useMockData.ts`
5. `src/views/full-screen-demo/ScaleDemoView.vue`
6. `src/views/full-screen-demo/RemDemoView.vue`
7. `src/views/full-screen-demo/VwvhDemoView.vue`
8. `src/views/full-screen-demo/HybridDemoView.vue`
9. `src/views/full-screen-demo/components/DashboardContent.vue`
10. `src/views/full-screen-demo/FullScreenDemoHome.vue`
11. `src/views/full-screen-demo/components/DataPanel.vue`
12. `src/views/full-screen-demo/components/ScreenHeader.vue`
13. `src/views/full-screen-demo/components/StatItem.vue`
14. `src/views/full-screen-demo/components/StatusBadge.vue`
15. `src/views/full-screen-demo/components/charts/BaseChart.vue`
16. `src/views/full-screen-demo/components/charts/chartConfig.ts`
17. `src/views/full-screen-demo/components/charts/BarChart.vue`
18. `src/views/full-screen-demo/components/charts/GaugeChart.vue`
19. `src/views/full-screen-demo/components/charts/LineChart.vue`
20. `src/views/full-screen-demo/components/charts/PieChart.vue`
21. `src/views/full-screen-demo/components/charts/ScatterEffect.vue`
22. `src/views/full-screen-demo/useFullscreen.ts`
23. `src/router/index.ts`
24. `src/App.vue`
25. `src/assets/styles/_variables.scss`
26. `src/assets/styles/_mixins.scss`
27. `src/assets/styles/common.scss`

### `src/views/full-screen-demo/hooks/useScale.ts`

```ts
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

interface ScaleOptions {
  designWidth?: number
  designHeight?: number
}

export function useScale(containerRef: Ref<HTMLElement | null>, options: ScaleOptions = {}) {
  const { designWidth = 1920, designHeight = 1080 } = options
  if (designWidth <= 0 || designHeight <= 0) {
    throw new Error('useScale: designWidth and designHeight must be greater than 0')
  }

  const scale = ref(1)
  const remBase = ref(100)
  let resizeObserver: ResizeObserver | null = null
  let frameId: number | null = null

  function scheduleUpdate(): void {
    if (frameId !== null) return
    frameId = window.requestAnimationFrame(() => {
      frameId = null
      updateScale()
    })
  }

  function updateScale(): void {
    const el = containerRef.value
    if (!el) return
    const container = el.parentElement
    if (!container) return
    if (container.clientWidth === 0 || container.clientHeight === 0) return

    const finalScale = Math.min(
      container.clientWidth / designWidth,
      container.clientHeight / designHeight,
    )

    el.style.transform = `scale(${finalScale})`
    el.style.transformOrigin = '0 0'
    el.style.left = `${(container.clientWidth - designWidth * finalScale) / 2}px`
    el.style.top = `${(container.clientHeight - designHeight * finalScale) / 2}px`

    scale.value = finalScale
    remBase.value = 100 * finalScale
  }

  onMounted(() => {
    updateScale()
    window.addEventListener('resize', scheduleUpdate)

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(scheduleUpdate)
      if (containerRef.value?.parentElement) {
        resizeObserver.observe(containerRef.value.parentElement)
      }
    }
  })

  onBeforeUnmount(() => {
    if (frameId !== null) window.cancelAnimationFrame(frameId)
    frameId = null
    resizeObserver?.disconnect()
    resizeObserver = null
    window.removeEventListener('resize', scheduleUpdate)
  })

  return {
    scale,
    remBase
  }
}
```

### `src/views/full-screen-demo/hooks/useRem.ts`

```ts
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface RemOptions {
  designWidth?: number
  designHeight?: number
  baseFontSize?: number
}

export function useRem(options: RemOptions = {}) {
  const { designWidth = 1920, designHeight = 1080, baseFontSize = 100 } = options
  if (designWidth <= 0 || designHeight <= 0 || baseFontSize <= 0) {
    throw new Error('useRem: design dimensions and baseFontSize must be greater than 0')
  }

  const currentFontSize = ref<number>(baseFontSize)
  const currentScale = ref<number>(1)
  let initialFontSize = ''
  let frameId: number | null = null

  function scheduleUpdate(): void {
    if (frameId !== null) return
    frameId = window.requestAnimationFrame(() => {
      frameId = null
      updateRem()
    })
  }

  function updateRem(): void {
    const root = document.documentElement
    const scale = Math.min(window.innerWidth / designWidth, window.innerHeight / designHeight)
    const fontSize = baseFontSize * scale

    root.style.fontSize = `${fontSize}px`
    currentFontSize.value = Math.round(fontSize * 10) / 10
    currentScale.value = scale
  }

  onMounted(() => {
    initialFontSize = document.documentElement.style.fontSize
    updateRem()
    window.addEventListener('resize', scheduleUpdate)
  })

  onBeforeUnmount(() => {
    if (frameId !== null) window.cancelAnimationFrame(frameId)
    frameId = null
    window.removeEventListener('resize', scheduleUpdate)
    document.documentElement.style.fontSize = initialFontSize
  })

  return {
    currentFontSize,
    currentScale,
  }
}
```

### `src/views/full-screen-demo/hooks/useClock.ts`

```ts
import { ref, onMounted, onUnmounted } from 'vue'

type ClockFormat = 'full' | 'time'

export function useClock(format: ClockFormat = 'full') {
  const time = ref<string>('')
  let timer: ReturnType<typeof setInterval> | null = null

  function update() {
    const now = new Date()
    if (format === 'full') {
      time.value = now.toLocaleString('zh-CN', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } else {
      time.value = now.toLocaleTimeString('zh-CN', { hour12: false })
    }
  }

  onMounted(() => {
    update()
    timer = setInterval(update, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return { time }
}
```

### `src/views/full-screen-demo/hooks/useMockData.ts`

```ts
import { onMounted, onUnmounted, ref } from "vue"

export interface TrendData {
  categories: string[]
  series: {
    name: string
    data: number[]
    color: string
    areaColor: string
  }[]
}

export interface PieDataItem {
  name: string
  value: number
  color: string
}

export interface Metrics {
  totalRequests: number
  availability: number
  avgLatency: number
  onlineUsers: number
}

export interface SystemResources {
  cpu: number
  memory: number
  disk: number
  network: number
}

export interface ServerNode {
  name: string
  value: [number, number]
}

export interface RegionData {
  categories: string[]
  series: {
    name: string
    data: number[]
    color: string
  }[]
}


// 趋势数据
export function useTrendData(options: {
  points?: number
  min?: number
  max?: number
  interval?: number
} = {}) {
  const { points = 12, min = 100, max = 1000, interval = 3000 } = options

  const now = new Date()
  const initialCategories = Array.from({ length: points }, (_, i) => {
    const d = new Date(now.getTime() - (points - 1 - i) * 5000)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  })

  const categories = ref<string[]>([...initialCategories])
  const requestData = ref<number[]>(
    Array.from({ length: points }, () => Math.floor(Math.random() * (max - min) + min))
  )
  const responseTimeData = ref<number[]>(
    Array.from({ length: points }, () => Math.floor(Math.random() * 80 + 20))
  )

  let timer: ReturnType<typeof setInterval> | null = null

  function pushData() {
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    categories.value.push(timeStr)
    requestData.value.push(Math.floor(Math.random() * (max - min) + min))
    responseTimeData.value.push(Math.floor(Math.random() * 80 + 20))

    if (categories.value.length > points) {
      categories.value.shift()
      requestData.value.shift()
      responseTimeData.value.shift()
    }
  }

  onMounted(() => {
    if (interval > 0) timer = setInterval(pushData, interval)
  })
  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return { categories, requestData, responseTimeData }
}

// 饼图数据
export function usePieData() {
  return ref<PieDataItem[]>([
    { name: 'Web 应用', value: 35, color: '#4facfe' },
    { name: 'API 网关', value: 28, color: '#00f2fe' },
    { name: '数据库', value: 18, color: '#43e97b' },
    { name: '缓存服务', value: 12, color: '#f093fb' },
    { name: '消息队列', value: 7, color: '#f5576c' },
  ])
}

// 实时指标
export function useMetrics() {
  const metrics = ref<Metrics>({
    totalRequests: 128456,
    availability: 98.7,
    avgLatency: 45,
    onlineUsers: 2847,
  })

  let timer: ReturnType<typeof setInterval> | null = null

  function update() {
    metrics.value = {
      totalRequests: metrics.value.totalRequests + Math.floor(Math.random() * 50),
      availability: +(Math.min(100, Math.max(95, metrics.value.availability + (Math.random() - 0.5) * 0.1))).toFixed(1),
      avgLatency: Math.floor(Math.random() * 20 + 35),
      onlineUsers: metrics.value.onlineUsers + Math.floor(Math.random() * 20 - 10),
    }
  }

  onMounted(() => { timer = setInterval(update, 2000) })
  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return metrics
}

// 系统资源
export function useSystemResources() {
  const resources = ref<SystemResources>({ cpu: 65, memory: 42, disk: 78, network: 56 })
  let timer: ReturnType<typeof setInterval> | null = null

  function update() {
    resources.value = {
      cpu: Math.floor(Math.random() * 30 + 50),
      memory: Math.floor(Math.random() * 20 + 35),
      disk: Math.floor(Math.random() * 10 + 72),
      network: Math.floor(Math.random() * 30 + 40),
    }
  }

  onMounted(() => { timer = setInterval(update, 3000) })
  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return resources
}

// 服务器节点
export function useServerNodes() {
  return ref<ServerNode[]>([
    { name: 'Node-01', value: [120, 85] },
    { name: 'Node-02', value: [200, 65] },
    { name: 'Node-03', value: [150, 45] },
    { name: 'Node-04', value: [280, 72] },
    { name: 'Node-05', value: [90, 55] },
    { name: 'Node-06', value: [320, 38] },
  ])
}

// 地区分布
export function useRegionData() {
  return ref<RegionData>({
    categories: ['华东', '华南', '华北', '西南', '华中', '东北', '西北'],
    series: [
      { name: '请求量', data: [3200, 2800, 2400, 1800, 1500, 1200, 800], color: '#4facfe' },
      { name: '带宽(Mbps)', data: [850, 720, 680, 450, 380, 320, 200], color: '#43e97b' },
    ],
  })
}

// 格式化数字
export function formatNumber(num: number): string {
  return num?.toLocaleString() || '0'
}
```

### `src/views/full-screen-demo/ScaleDemoView.vue`

```vue
<template>
  <div class="scale-stage">
    <StatusBadge
      variant="warning"
      :text="`Scale: ${scale.toFixed(3)}`"
      :detail="`窗口: ${width} × ${height}`"
    />
    <section ref="screenRef" class="scale-screen">
      <DashboardContent title="城市运营监控指挥中心 · Scale 适配" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import DashboardContent from './components/DashboardContent.vue'
import StatusBadge from './components/StatusBadge.vue'
import { useScale } from './hooks/useScale'

const screenRef = ref<HTMLElement | null>(null)
const { scale } = useScale(screenRef)
const { width, height } = useWindowSize()
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.scale-stage {
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background: #05070f;
}

.scale-screen {
  position: absolute;
  width: #{$design-width}px;
  height: #{$design-height}px;
  transform-origin: 0 0;
  font-size: 16px;
}
</style>
```

### `src/views/full-screen-demo/RemDemoView.vue`

```vue
<template>
  <div class="rem-stage">
    <StatusBadge
      variant="success"
      :text="`Rem: ${currentFontSize.toFixed(1)}px`"
      :detail="`比例: ${currentScale.toFixed(3)}`"
    />
    <DashboardContent title="城市运营监控指挥中心 · Rem 适配" />
  </div>
</template>

<script setup lang="ts">
import DashboardContent from './components/DashboardContent.vue'
import StatusBadge from './components/StatusBadge.vue'
import { useRem } from './hooks/useRem'

const { currentFontSize, currentScale } = useRem({ designHeight: 1080 })
</script>

<style lang="scss" scoped>
.rem-stage {
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  font-size: 1rem;
}
</style>
```

### `src/views/full-screen-demo/VwvhDemoView.vue`

```vue
<template>
  <div class="vw-stage">
    <StatusBadge
      variant="info"
      text="VW / VH"
      :detail="`窗口: ${width} × ${height}`"
    />
    <DashboardContent title="城市运营监控指挥中心 · 视口单位适配" />
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import DashboardContent from './components/DashboardContent.vue'
import StatusBadge from './components/StatusBadge.vue'

const { width, height } = useWindowSize()
</script>

<style lang="scss" scoped>
.vw-stage {
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  font-size: 0.78vw;
}
</style>
```

### `src/views/full-screen-demo/HybridDemoView.vue`

```vue
<template>
  <div class="hybrid-stage">
    <StatusBadge
      variant="purple"
      text="Hybrid"
      :detail="`窗口: ${width} × ${height} · 宽高比: ${aspectRatio}`"
    />
    <DashboardContent title="城市运营监控指挥中心 · 混合适配" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import DashboardContent from './components/DashboardContent.vue'
import StatusBadge from './components/StatusBadge.vue'

const { width, height } = useWindowSize()
const aspectRatio = computed(() => (width.value / height.value).toFixed(2))
</script>

<style lang="scss" scoped>
.hybrid-stage {
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  font-size: clamp(9px, 0.72vw, 18px);
}
</style>
```

### `src/views/full-screen-demo/components/DashboardContent.vue`

```vue
<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div>
        <p class="dashboard-header__eyebrow">OPERATIONS COMMAND CENTER</p>
        <h1>{{ title }}</h1>
      </div>
      <div class="dashboard-header__meta">
        <span class="dashboard-header__chip is-live">
          <i></i>实时采集中
        </span>
        <span>{{ clock }}</span>
      </div>
    </header>

    <section class="dashboard-kpis">
      <article v-for="kpi in kpiItems" :key="kpi.label" class="kpi-card">
        <span>{{ kpi.label }}</span>
        <strong>{{ kpi.value }}</strong>
        <small :class="kpi.direction">{{ kpi.trend }}</small>
      </article>
    </section>

    <main class="dashboard-main">
      <aside class="dashboard-column">
        <section class="dashboard-panel">
          <h2>请求来源分布</h2>
          <PieChart :data="pieData" />
        </section>

        <section class="dashboard-panel">
          <h2>资源使用率</h2>
          <div class="resource-grid">
            <GaugeChart :value="resources.cpu" title="CPU" />
            <GaugeChart :value="resources.memory" title="内存" />
          </div>
        </section>
      </aside>

      <section class="dashboard-center">
        <section class="dashboard-panel dashboard-panel--map">
          <h2>服务节点负载 / 响应矩阵</h2>
          <ScatterEffect :data="serverNodes" x-axis-name="负载 %" y-axis-name="延迟 ms" />
        </section>

        <section class="dashboard-panel dashboard-panel--trend">
          <h2>实时请求与响应时间</h2>
          <LineChart :data="trendData" />
        </section>
      </section>

      <aside class="dashboard-column">
        <section class="dashboard-panel">
          <h2>区域请求量</h2>
          <BarChart :data="regionData" />
        </section>

        <section class="dashboard-panel dashboard-panel--alerts">
          <h2>实时事件</h2>
          <div class="event-viewport" :class="{ 'event-viewport--scrollable': shouldAutoScrollEvents }">
            <div class="event-list" :class="{ 'event-list--scrollable': shouldAutoScrollEvents }">
              <div class="event-group">
                <div v-for="event in events" :key="event.id" class="event-item" :class="`is-${event.level}`">
                  <strong>{{ event.title }}</strong>
                  <span>{{ event.description }}</span>
                  <time>{{ event.time }}</time>
                </div>
              </div>
              <div v-if="shouldAutoScrollEvents" class="event-group" aria-hidden="true">
                <div v-for="event in events" :key="`clone-${event.id}`" class="event-item" :class="`is-${event.level}`">
                  <strong>{{ event.title }}</strong>
                  <span>{{ event.description }}</span>
                  <time>{{ event.time }}</time>
                </div>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BarChart from './charts/BarChart.vue'
import GaugeChart from './charts/GaugeChart.vue'
import LineChart from './charts/LineChart.vue'
import PieChart from './charts/PieChart.vue'
import ScatterEffect from './charts/ScatterEffect.vue'
import { useClock } from '../hooks/useClock'
import {
  formatNumber,
  useMetrics,
  usePieData,
  useRegionData,
  useServerNodes,
  useSystemResources,
  useTrendData,
} from '../hooks/useMockData'

defineProps<{
  title: string
}>()

const { time: clock } = useClock('full')
const { categories, requestData, responseTimeData } = useTrendData({
  points: 24,
  min: 500,
  max: 1800,
  interval: 2000,
})
const metrics = useMetrics()
const resources = useSystemResources()
const pieData = usePieData()
const serverNodes = useServerNodes()
const region = useRegionData()

const trendData = computed(() => ({
  categories: categories.value,
  series: [
    {
      name: '请求量',
      data: requestData.value,
      color: '#4facfe',
      areaColor: 'rgba(79,172,254,0.35)',
    },
    {
      name: '响应时间',
      data: responseTimeData.value,
      color: '#43e97b',
      areaColor: 'rgba(67,233,123,0.25)',
    },
  ],
}))

const regionData = computed(() => ({
  categories: region.value.categories,
  series: region.value.series.map(series => ({
    ...series,
    data: series.data.map(value => Math.round(value / 10)),
  })),
}))

const kpiItems = computed(() => [
  { label: '今日请求', value: formatNumber(metrics.value.totalRequests), trend: '↑ 12.4%', direction: 'up' },
  { label: '服务可用率', value: `${metrics.value.availability}%`, trend: '↑ 0.2%', direction: 'up' },
  { label: '平均响应', value: `${metrics.value.avgLatency}ms`, trend: '↓ 8.6%', direction: 'down' },
  { label: '在线用户', value: formatNumber(metrics.value.onlineUsers), trend: '↑ 3.1%', direction: 'up' },
])

const events = [
  { id: 1, level: 'critical', title: 'P1 告警', description: 'API 网关华北节点延迟升高', time: '10:24:18' },
  { id: 2, level: 'warning', title: '容量预警', description: '订单集群 CPU 持续超过 82%', time: '10:22:04' },
  { id: 3, level: 'info', title: '发布完成', description: '搜索服务 v3.8.2 全量发布', time: '10:18:47' },
  { id: 4, level: 'warning', title: '依赖波动', description: '第三方支付成功率下降 1.8%', time: '10:15:32' },
  { id: 5, level: 'info', title: '自动扩容', description: 'Web 应用新增 4 个实例', time: '10:12:09' },
  { id: 6, level: 'critical', title: 'P2 告警', description: 'Redis 主从复制延迟 820ms', time: '10:08:55' },
]

const shouldAutoScrollEvents = computed(() => events.length > 5)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.dashboard {
  --panel-padding: 0.9em;
  --panel-title: 0.92em;
  --body-text: 0.75em;
  --number-text: 1.5em;

  display: flex;
  flex-direction: column;
  gap: 0.8em;
  width: 100%;
  height: 100%;
  padding: 1em 1.1em 1.1em;
  color: $text-primary;
  font-family: $font-family-base;
  background:
    radial-gradient(circle at 18% 8%, rgba(79, 172, 254, 0.16), transparent 28%),
    radial-gradient(circle at 82% 92%, rgba(118, 75, 162, 0.18), transparent 30%),
    $bg-primary;
  overflow: hidden;
}

.dashboard-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex: 0 0 3.6em;
  padding-bottom: 0.65em;
  border-bottom: 1px solid rgba(102, 126, 234, 0.35);
  background: linear-gradient(180deg, rgba(16, 24, 66, 0.75), transparent);

  h1 {
    font-size: 1.65em;
    letter-spacing: 0.08em;
    @include gradient-text(#fff, $text-accent);
  }

  &__eyebrow {
    margin-bottom: 0.15em;
    color: rgba(#a0c4ff, 0.68);
    font-family: $font-family-mono;
    font-size: 0.62em;
    letter-spacing: 0.35em;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.6em;
    color: $text-secondary;
    font-family: $font-family-mono;
    font-size: 0.75em;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35em;
    padding: 0.25em 0.6em;
    border: 1px solid rgba($trend-down, 0.4);
    border-radius: 999px;
    color: $trend-down;

    i {
      width: 0.45em;
      height: 0.45em;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 1.4s ease-in-out infinite;
    }
  }
}

.dashboard-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8em;
  flex: 0 0 4.8em;
}

.kpi-card {
  @include glass-effect(rgba(16, 24, 66, 0.72), 6px);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 0.55em 0.9em;
  border: 1px solid rgba(102, 126, 234, 0.28);
  border-radius: 0.45em;
  overflow: hidden;

  &::after {
    position: absolute;
    inset: auto 0 0;
    height: 2px;
    content: '';
    background: linear-gradient(90deg, transparent, $accent-blue, transparent);
  }

  span {
    color: $text-secondary;
    font-size: var(--body-text);
  }

  strong {
    margin-top: 0.1em;
    font-family: $font-family-mono;
    font-size: var(--number-text);
    line-height: 1.15;
  }

  small {
    font-family: $font-family-mono;
    font-size: 0.62em;

    &.up { color: $trend-up; }
    &.down { color: $trend-down; }
  }
}

.dashboard-main {
  display: grid;
  grid-template-columns: 22% 1fr 24%;
  gap: 0.8em;
  flex: 1;
  min-height: 0;
}

.dashboard-column,
.dashboard-center {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
  min-width: 0;
  min-height: 0;
}

.dashboard-panel {
  @include glass-effect(rgba(16, 24, 66, 0.62), 5px);
  @include card-top-line;
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: var(--panel-padding);
  border: 1px solid rgba(102, 126, 234, 0.24);
  border-radius: 0.4em;

  h2 {
    flex: 0 0 auto;
    margin-bottom: 0.55em;
    padding-left: 0.5em;
    border-left: 3px solid $accent-blue;
    color: $text-accent;
    font-size: var(--panel-title);
    font-weight: 600;
  }
}

.dashboard-column .dashboard-panel:first-child { flex: 1; }
.dashboard-column .dashboard-panel:last-child { flex: 1.05; }
.dashboard-panel--map { flex: 1.35; }
.dashboard-panel--trend { flex: 1; }

.resource-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  flex: 1;
  min-height: 0;
}

.event-viewport {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  &--scrollable {
    mask-image: linear-gradient(180deg, transparent 0, #000 12%, #000 88%, transparent 100%);
  }
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 0;

  &--scrollable {
    animation: event-auto-scroll 9s linear infinite;
    will-change: transform;

    &:hover {
      animation-play-state: paused;
    }
  }
}

.event-group {
  display: flex;
  flex-direction: column;
  gap: 0.4em;
  padding-bottom: 0.4em;
}

.event-item {
  display: grid;
  grid-template-columns: 6.2em 1fr auto;
  gap: 0.4em;
  align-items: center;
  padding: 0.4em 0.45em;
  border-radius: 0.25em;
  background: rgba(255, 255, 255, 0.035);
  font-size: var(--body-text);

  strong {
    color: $text-primary;
    white-space: nowrap;
  }
  span {
    min-width: 0;
    overflow: hidden;
    color: $text-secondary;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  time {
    color: rgba(#8892b0, 0.75);
    font-family: $font-family-mono;
    font-size: 0.82em;
  }

  &.is-critical strong { color: $accent-red; }
  &.is-warning strong { color: #f0a500; }
  &.is-info strong { color: $accent-blue; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.75); }
}

@keyframes event-auto-scroll {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}

@media (max-aspect-ratio: 14 / 9) {
  .dashboard-main { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dashboard-panel--trend { grid-column: 1 / -1; }
}
</style>
```

### `src/views/full-screen-demo/FullScreenDemoHome.vue`

```vue
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
```

### `src/views/full-screen-demo/components/DataPanel.vue`

```vue
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
```

### `src/views/full-screen-demo/components/ScreenHeader.vue`

```vue
<template>
  <header class="screen-header">
    <h1 class="screen-header__title">{{ title }}</h1>
    <span class="screen-header__time">{{ time }}</span>
  </header>
</template>
<script setup lang="ts">
import { useClock } from '../hooks/useClock'
withDefaults(defineProps<{
  title?: string
}>(), {
  title: '数据可视化大屏'
})

const { time } = useClock('full')

</script>
<style lang="scss" scoped>

</style>
```

### `src/views/full-screen-demo/components/StatItem.vue`

```vue
<template>
  <div class="stat-item">
    <div class="stat-item__value">
      {{ value }}<span v-if="suffix" style="font-size: 18px;">{{ suffix }}</span> 
    </div>
    <div class="stat-item__label">{{ label }}</div>
    <div v-if="trend" class="stat-item__trend" :class="`stat-item__trend--${trendDirection}`">
      {{ trend }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  value: string | number
  suffix?: string
  label?: string
  trend?: string
}>()

const trendDirection = computed(() => {
  if (!props.trend) return ''
  return props.trend.includes('↑') || props.trend.includes('+') ? 'up' : 'down'
})
</script>
```

### `src/views/full-screen-demo/components/StatusBadge.vue`

```vue
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
```

### `src/views/full-screen-demo/components/charts/BaseChart.vue`

```vue
<template>
  <div ref="chartRef" class="base-chart" :style="{ height: height }"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  option: EChartsOption
  height?: string
  theme?: string
  autoResize?: boolean
}>(), {
  height: '100%',
  theme: 'dark',
  autoResize: true,
})

const emit = defineEmits(['chartReady'])

const chartRef = ref(null)

let chartInstance: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null
let resizeFrameId: number | null = null

function initChart() {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()

  chartInstance = echarts.init(chartRef.value, props.theme, { renderer: 'svg' })
  chartInstance.setOption(props.option)
  emit('chartReady', chartInstance)
}

function handleResize() {
  chartInstance?.resize()
}

function scheduleResize() {
  if (resizeFrameId !== null) return
  resizeFrameId = window.requestAnimationFrame(() => {
    resizeFrameId = null
    handleResize()
  })
}

onMounted(() => {
  initChart()
  if (props.autoResize) {
    window.addEventListener('resize', handleResize)

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(scheduleResize)
      if (chartRef.value) resizeObserver.observe(chartRef.value)
    }
  }
})

onUnmounted(() => {
  if (props.autoResize) {
    if (resizeFrameId !== null) window.cancelAnimationFrame(resizeFrameId)
    resizeFrameId = null
    resizeObserver?.disconnect()
    resizeObserver = null
    window.removeEventListener('resize', handleResize)
  }
  chartInstance?.dispose()
  chartInstance = null
})

watch(
  () => props.option,
  () => {
    chartInstance?.setOption(props.option, { notMerge: false })
  },
  { deep: true }
)

defineExpose({
  getInstance: () => chartInstance,
  resize: handleResize,
})

</script>

<style lang="scss" scoped>
.base-chart {
  width: 100%;
  min-height: 100px;
}
</style>
```

### `src/views/full-screen-demo/components/charts/chartConfig.ts`

```ts
import type { EChartsOption } from 'echarts'

const textStyle = {
  color: '#8892b0',
  fontSize: 12,
}

export const tooltipDefaults: EChartsOption['tooltip'] = {
  backgroundColor: 'rgba(0,0,0,0.7)',
  borderColor: 'rgba(102,126,234,0.3)',
  textStyle: { color: '#fff', fontSize: 12 },
}

export const lineChartDefaults: EChartsOption = {
  backgroundColor: 'transparent',
  tooltip: { ...tooltipDefaults, trigger: 'axis' },
  legend: {
    bottom: 0,
    textStyle: { color: '#8892b0', fontSize: 11 },
    itemWidth: 15,
    itemHeight: 3,
  },
  grid: { top: 20, left: 50, right: 30, bottom: 40 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    axisLabel: textStyle,
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLabel: textStyle,
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' } },
  },
}

export const barChartDefaults: EChartsOption = {
  backgroundColor: 'transparent',
  tooltip: { ...tooltipDefaults, trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { top: 10, left: 50, right: 20, bottom: 30 },
  xAxis: {
    type: 'category',
    axisLabel: textStyle,
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLabel: textStyle,
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' } },
  },
}
```

### `src/views/full-screen-demo/components/charts/BarChart.vue`

```vue
<template>
  <BaseChart :option="chartOption" :height="height" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import BaseChart from './BaseChart.vue'
import { barChartDefaults } from './chartConfig'

interface SeriesItem {
  name: string
  data: number[]
  color?: string
}

interface Props {
  data: {
    categories: string[]
    series: SeriesItem[]
  }
  height?: string
  horizontal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  horizontal: false,
})

const chartOption = computed<EChartsOption>(() => {
  const { categories, series } = props.data
  const baseDefaults = JSON.parse(JSON.stringify(barChartDefaults)) as EChartsOption

  return {
    ...baseDefaults,
    ...(props.horizontal
      ? {
          xAxis: { type: 'value', ...(baseDefaults.yAxis as object) },
          yAxis: {
            type: 'category',
            data: categories,
            ...(baseDefaults.xAxis as object),
            axisTick: undefined,
            axisLabel: (baseDefaults.xAxis as any)?.axisLabel,
          },
        }
      : {
          xAxis: { ...(baseDefaults.xAxis as object), data: categories },
          yAxis: { ...(baseDefaults.yAxis as object) },
        }),
    series: series.map(s => ({
      type: 'bar',
      name: s.name,
      data: s.data,
      barWidth: '50%',
      itemStyle: {
        borderRadius: props.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
        color: s.color || new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#4facfe' },
          { offset: 1, color: '#0050b3' },
        ]),
      },
    })),
  }
})
</script>
```

### `src/views/full-screen-demo/components/charts/GaugeChart.vue`

```vue
<template>
  <BaseChart :option="chartOption" :height="height" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from './BaseChart.vue'

interface Props {
  value: number
  title?: string
  height?: string
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  title: '',
  max: 100,
})

const chartOption = computed<EChartsOption>(() => {
  return {
    series: [{
      type: 'gauge',
      startAngle: 210,
      endAngle: -30,
      center: ['50%', '55%'],
      radius: '85%',
      min: 0,
      max: props.max,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 20,
          color: [
            [0.3, '#52c41a'],
            [0.7, '#4facfe'],
            [1, '#f5222d'],
          ],
        },
      },
      pointer: {
        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        length: '60%',
        width: 8,
        offsetCenter: [0, '-10%'],
        itemStyle: { color: 'auto' },
      },
      axisTick: { length: 12, lineStyle: { color: 'auto', width: 2 } },
      splitLine: { length: 20, lineStyle: { color: 'auto', width: 4 } },
      axisLabel: { color: '#8892b0', fontSize: 10, distance: 25 },
      title: props.title
        ? { offsetCenter: [0, '80%'], fontSize: 14, color: '#8892b0' }
        : { show: false },
      detail: {
        valueAnimation: true,
        fontSize: 28,
        fontWeight: 'bold',
        offsetCenter: [0, '45%'],
        formatter: '{value}%',
        color: '#fff',
        fontFamily: 'DIN, Consolas, monospace',
      },
      data: [{ value: props.value, name: props.title }],
    }],
  }
})
</script>
```

### `src/views/full-screen-demo/components/charts/LineChart.vue`

```vue
<template>
  <BaseChart :option="chartOption" :height="height" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import BaseChart from './BaseChart.vue'
import { lineChartDefaults } from './chartConfig'

interface SeriesItem {
  name: string
  data: number[]
  color: string
  areaColor?: string
}

interface Props {
  data: {
    categories: string[]
    series: SeriesItem[]
  }
  height?: string
  showArea?: boolean
  yAxisName?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  showArea: true,
  yAxisName: '',
})

const chartOption = computed<EChartsOption>(() => {
  const { categories, series } = props.data

  return {
    ...lineChartDefaults,
    xAxis: { ...(lineChartDefaults.xAxis as object), data: categories },
    yAxis: {
      ...(lineChartDefaults.yAxis as object),
      name: props.yAxisName,
    },
    series: series.map(s => ({
      type: 'line',
      name: s.name,
      data: s.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2, color: s.color },
      itemStyle: { color: s.color },
      areaStyle: props.showArea
        ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: s.areaColor || s.color || '#4facfe' },
              { offset: 1, color: 'rgba(79,172,254,0)' },
            ]),
          }
        : undefined,
    })),
  }
})
</script>
```

### `src/views/full-screen-demo/components/charts/PieChart.vue`

```vue
<template>
  <BaseChart :option="chartOption" :height="height" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from './BaseChart.vue'

interface PieDataItem {
  name: string
  value: number
  color?: string
}

interface Props {
  data: PieDataItem[]
  height?: string
  radius?: [string, string]
  roseType?: 'area' | 'radius'
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  radius: () => ['40%', '70%'],
})

const defaultColors = [
  '#4facfe', '#00f2fe', '#43e97b', '#f093fb',
  '#f5576c', '#667eea', '#764ba2', '#11998e',
]

const chartOption = computed<EChartsOption>(() => {
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderColor: 'rgba(102,126,234,0.3)',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#8892b0', fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [{
      type: 'pie',
      radius: props.radius,
      roseType: props.roseType || undefined,
      center: ['50%', '45%'],
      itemStyle: {
        borderRadius: 4,
        borderColor: 'rgba(10, 14, 39, 0.8)',
        borderWidth: 3,
      },
      label: { color: '#8892b0', fontSize: 11, formatter: '{b}\n{d}%' },
      emphasis: { label: { fontSize: 16, fontWeight: 'bold' }, scaleSize: 10 },
      data: props.data,
    }],
    color: props.data.map(
      (item, index) => item.color ?? defaultColors[index % defaultColors.length] ?? '#4facfe',
    ),
  }
})
</script>
```

### `src/views/full-screen-demo/components/charts/ScatterEffect.vue`

```vue
<template>
  <BaseChart :option="chartOption" :height="height" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from './BaseChart.vue'

interface ScatterDataItem {
  name: string
  value: [number, number]
}

interface Props {
  data: ScatterDataItem[]
  height?: string
  xAxisName?: string
  yAxisName?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  xAxisName: '',
  yAxisName: '',
})

const chartOption = computed<EChartsOption>(() => {
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderColor: 'rgba(102,126,234,0.3)',
      textStyle: { color: '#fff' },
    },
    xAxis: {
      type: 'value',
      name: props.xAxisName,
      nameTextStyle: { color: '#8892b0' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#8892b0' },
    },
    yAxis: {
      type: 'value',
      name: props.yAxisName,
      nameTextStyle: { color: '#8892b0' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#8892b0' },
    },
    series: [{
      type: 'effectScatter',
      symbolSize: 15,
      showEffectOn: 'render',
      rippleEffect: {
        brushType: 'stroke',
        scale: 4,
        period: 4,
        color: '#4facfe',
      },
      itemStyle: {
        color: '#4facfe',
        shadowBlur: 10,
        shadowColor: 'rgba(79,172,254,0.5)',
      },
      data: props.data.map(d => ({
        name: d.name,
        value: d.value,
      })),
    }],
  }
})
</script>
```

### `src/views/full-screen-demo/useFullscreen.ts`

```ts
import { onBeforeUnmount, onMounted, ref } from 'vue'

export interface UseFullscreenReturn {
  /** 当前是否处于全屏状态 */
  isFullscreen: ReturnType<typeof ref<boolean>>
  /** 进入全屏（默认全屏整个 documentElement，可指定某个元素） */
  enter: (target?: HTMLElement) => Promise<void>
  /** 退出全屏 */
  exit: () => Promise<void>
  /** 根据当前状态切换 */
  toggle: (target?: HTMLElement) => Promise<void>
}

function getFullscreenElement(): Element | null {
  return document.fullscreenElement
}

/**
 * Fullscreen API 封装。
 *  - 监听 document.fullscreenchange 同步 isFullscreen
 *  - enter/exit 兼容 Promise 风格
 *
 * 注意：浏览器要求全屏调用必须由用户手势（click 等）触发。
 */
export function useFullscreen(): UseFullscreenReturn {
  const isFullscreen = ref<boolean>(false)

  function syncState(): void {
    isFullscreen.value = getFullscreenElement() !== null
  }

  async function enter(target?: HTMLElement): Promise<void> {
    const el = target ?? document.documentElement
    if (!el.requestFullscreen) return
    try {
      await el.requestFullscreen()
    } catch {
      // 用户拒绝或浏览器不允许时静默忽略
    }
  }

  async function exit(): Promise<void> {
    if (!document.exitFullscreen) return
    try {
      await document.exitFullscreen()
    } catch {
      // 忽略
    }
  }

  async function toggle(target?: HTMLElement): Promise<void> {
    if (isFullscreen.value) {
      await exit()
    } else {
      await enter(target)
    }
  }

  onMounted(() => {
    syncState()
    document.addEventListener('fullscreenchange', syncState)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', syncState)
  })

  return { isFullscreen, enter, exit, toggle }
}
```

### `src/router/index.ts`

```ts
import { createRouter, createWebHistory } from 'vue-router'
import NaiveUiTestView from '../views/NaiveUiTestView.vue'
import DraggableListView from '../views/DraggableListView.vue'
import NSpinResearchView from '../views/NSpinResearchView.vue'
import NDataTableResearchView from '../views/NDataTableResearchView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/naive-ui-test',
    },
    {
      path: '/naive-ui-test',
      name: 'naive-ui-test',
      component: NaiveUiTestView,
    },
    {
      path: '/draggable-list',
      name: 'draggable-list',
      component: DraggableListView,
    },
    {
      path: '/n-spin-research',
      name: 'n-spin-research',
      component: NSpinResearchView,
    },
    {
      path: '/n-data-table-research',
      name: 'n-data-table-research',
      component: NDataTableResearchView,
    },
    {
      path: '/full-screen-demo',
      name: 'full-screen-demo',
      component: () => import('@/views/full-screen-demo/FullScreenDemoHome.vue'),
    },
    {
      path: '/full-screen-demo/scale',
      name: 'full-screen-demo-scale',
      component: () => import('@/views/full-screen-demo/ScaleDemoView.vue'),
      meta: { hideAppHeader: true },
    },
    {
      path: '/full-screen-demo/rem',
      name: 'full-screen-demo-rem',
      component: () => import('@/views/full-screen-demo/RemDemoView.vue'),
      meta: { hideAppHeader: true },
    },
    {
      path: '/full-screen-demo/vwvh',
      name: 'full-screen-demo-vwvh',
      component: () => import('@/views/full-screen-demo/VwvhDemoView.vue'),
      meta: { hideAppHeader: true },
    },
    {
      path: '/full-screen-demo/hybrid',
      name: 'full-screen-demo-hybrid',
      component: () => import('@/views/full-screen-demo/HybridDemoView.vue'),
      meta: { hideAppHeader: true },
    },
  ],
})

export default router
```

### `src/App.vue`

```vue
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
```

### `src/assets/styles/_variables.scss`

```scss
@use 'sass:math';

// ═══════════════════════════════════════
// 设计稿基准
// ═══════════════════════════════════════

$design-width: 1920;
$design-height: 1080;
$design-ratio: math.div(16, 9);

// ═══════════════════════════════════════
// 颜色系统
// ═══════════════════════════════════════
$bg-primary: #0a0e27;
$bg-card: rgba(16, 24, 66, 0.6);

$border-color: rgba(102, 126, 234, 0.25);

$text-primary: #ffffff;
$text-secondary: #8892b0;
$text-accent: #a0c4ff;

$accent-blue: #4facfe;
$accent-cyan: #00f2fe;
$accent-green: #43e97b;
$accent-pink: #f093fb;
$accent-red: #f5576c;
$accent-purple: #764ba2;
$accent-indigo: #667eea;

$trend-up: #f5222d;
$trend-down: #52c41a;

// ═══════════════════════════════════════
// 间距
// ═══════════════════════════════════════
$gap-xs: 4px;
$gap-sm: 8px;
$gap-md: 12px;
$gap-lg: 16px;
$gap-xl: 20px;
$gap-2xl: 24px;

// ═══════════════════════════════════════
// 字体
// ═══════════════════════════════════════
$font-family-base: 'Microsoft YaHei', -apple-system, sans-serif;
$font-family-mono: 'DIN', 'Consolas', monospace;

// ═══════════════════════════════════════
// 圆角
// ═══════════════════════════════════════
$radius-sm: 4px;
$radius-md: 6px;
$radius-lg: 12px;
$radius-pill: 20px;

// ═══════════════════════════════════════
// 断点
// ═══════════════════════════════════════
$breakpoint-sm: 1366px;
$breakpoint-ultrawide: math.div(21, 9);
$breakpoint-narrow: math.div(14, 9);
```

### `src/assets/styles/_mixins.scss`

```scss
@use 'variables' as *;


// 渐变文字
@mixin gradient-text($from: #fff, $to: $accent-blue) {
  background: linear-gradient(180deg, $from, $to);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

// 卡片顶部发光线
@mixin card-top-line($color: $accent-blue) {
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, $color, transparent);
    pointer-events: none;
  }
}

// 毛玻璃效果
@mixin glass-effect($bg: $bg-card, $blur: 4px) {
  background: $bg;
  backdrop-filter: blur($blur);
  -webkit-backdrop-filter: blur($blur);
}

// 微网格背景
@mixin micro-grid($color: rgba(102, 126, 234, 0.05), $size: 20px) {
  background-image: 
    linear-gradient(135deg, $color 25%, transparent 25%),
    linear-gradient(225deg, $color 25%, transparent 25%),
    linear-gradient(315deg, $color 25%, transparent 25%),
    linear-gradient(45deg, $color 25%, transparent 25%);
  background-size: $size $size;
}

// 超宽屏
@mixin ultrawide {
  @media screen and (min-aspect-ratio: $breakpoint-ultrawide) {
    @content;
  }
}

// 窄屏
@mixin narrow-screen {
  @media screen and (max-aspect-ratio: $breakpoint-narrow) {
    @content;
  }
}

// 标准屏
@mixin standard-screen {
  @media screen and (min-aspect-ratio: $breakpoint-narrow) and (max-aspect-ratio: $breakpoint-ultrawide) {
    @content;
  }
}

// 小窗口
@mixin small-window {
  @media screen and (max-width: $breakpoint-sm) {
    @content;
  }
}
```

### `src/assets/styles/common.scss`

```scss
@use 'variables' as *;
@use 'mixins' as *;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  background: $bg-primary;
  color: $text-primary;
  font-family: $font-family-base;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// ═══════════════════════════════════════
// 头部
// ═══════════════════════════════════════
.screen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 $gap-2xl;
  height: 80px;
  background: linear-gradient(180deg, rgba(16, 24, 66, 0.9), rgba(16, 24, 66, 0));
  border-bottom: 1px solid $border-color;

  &__title {
    font-size: 32px;
    font-weight: bold;
    @include gradient-text(#fff, $text-accent);
    letter-spacing: 4px;
  }

  &__time {
    font-size: 18px;
    color: $text-secondary;
    font-family: $font-family-mono;
  }
}

// ═══════════════════════════════════════
// 三栏布局
// ═══════════════════════════════════════
.screen-layout {
  display: flex;
  gap: $gap-lg;
  padding: $gap-lg $gap-2xl;
  height: calc(100% - 80px);
}

.side-panel {
  width: 25%;
  display: flex;
  flex-direction: column;
  gap: $gap-lg;
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $gap-lg;
}

// ═══════════════════════════════════════
// 卡片
// ═══════════════════════════════════════
.panel-card {
  @include glass-effect;
  @include card-top-line;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  padding: $gap-lg;

  &__title {
    font-size: 16px;
    color: $text-accent;
    margin-bottom: $gap-md;
    padding-left: $gap-md;
    border-left: 3px solid $accent-blue;

    .unit {
      font-size: 12px;
      color: $text-secondary;
      margin-left: $gap-sm;
      font-weight: normal;
    }
  }

  &--half {
    flex: 1;
    min-height: 0;
  }

  &--full {
    flex: 1;
    min-height: 0;
  }
}

// ═══════════════════════════════════════
// 统计数据
// ═══════════════════════════════════════
.stat-grid {
  display: flex;
  justify-content: space-around;
  text-align: center;
  flex-wrap: wrap;
}

.stat-item {
  &__value {
    font-size: 36px;
    font-weight: bold;
    font-family: $font-family-mono;
    background: linear-gradient(180deg, $accent-blue, $accent-cyan);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &__label {
    font-size: 14px;
    color: $text-secondary;
    margin-top: $gap-xs;
  }

  &__trend {
    font-size: 12px;
    margin-top: 2px;

    &--up {
      color: $trend-up;
    }

    &--down {
      color: $trend-down;
    }
  }
}

// ═══════════════════════════════════════
// 数据条
// ═══════════════════════════════════════
.data-bar {
  display: flex;
  align-items: center;
  margin-bottom: $gap-md;
  font-size: 14px;

  &__name {
    width: 60px;
    color: $text-secondary;
    text-align: right;
    padding-right: $gap-md;
  }

  &__track {
    flex: 1;
    height: 10px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 5px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: 5px;
    transition: width 0.6s ease;
  }

  &__value {
    width: 50px;
    text-align: right;
    padding-left: $gap-md;
    font-family: $font-family-mono;
  }
}

// ═══════════════════════════════════════
// 特点列表 & 代码块
// ═══════════════════════════════════════
.feature-list {
  color: $text-secondary;
  font-size: 14px;
  line-height: 1.8;

  .highlight {
    color: $accent-blue;
  }

  .sub {
    font-size: 12px;
    padding-left: 16px;
    display: block;
  }
}

.code-snippet {
  background: rgba(0, 0, 0, 0.3);
  padding: $gap-md;
  border-radius: $radius-sm;
  font-family: $font-family-mono;
  font-size: 11px;
  color: $accent-blue;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
```

