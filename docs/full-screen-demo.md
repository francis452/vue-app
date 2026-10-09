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
