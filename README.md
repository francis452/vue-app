# Vue App

这是一个基于 Vue 3、Vite、TypeScript、Naive UI 和 ECharts 的前端实验与组件研究项目。项目当前包含两类主要内容：

1. **Naive UI / 交互组件研究页**：用于验证表格、加载、拖拽列表等组件的使用方式。
2. **大屏适配方案 Demo**：使用同一套“城市运营监控指挥中心”业务面板，对比 Scale、Rem、vw/vh 和 Hybrid 四种适配方案，并提供完整的方案文档与源码归档。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3 组合式 API |
| 构建 | Vite |
| 语言 | TypeScript、Vue SFC |
| 路由 | Vue Router |
| 状态管理 | Pinia |
| UI 组件 | Naive UI |
| 图表 | ECharts |
| 样式 | Sass、Tailwind CSS 工具类 |
| 工具库 | VueUse、SortableJS、vuedraggable |
| 代码质量 | ESLint、oxlint、Prettier、vue-tsc |

## 项目结构

```text
vue-app/
├── docs/
│   └── full-screen-demo.md        # 大屏适配方案、Hooks 手册和完整源码归档
├── public/                        # 静态资源
├── src/
│   ├── assets/styles/             # 全局样式、变量、 mixin、Tailwind 入口
│   ├── components/                # 通用组件
│   ├── router/                    # 路由配置
│   ├── stores/                    # Pinia store
│   ├── views/
│   │   ├── full-screen-demo/       # 大屏适配 Demo
│   │   │   ├── FullScreenDemoHome.vue
│   │   │   ├── ScaleDemoView.vue
│   │   │   ├── RemDemoView.vue
│   │   │   ├── VwvhDemoView.vue
│   │   │   ├── HybridDemoView.vue
│   │   │   ├── hooks/             # 适配、时间、模拟数据 Hooks
│   │   │   └── components/        # 共享大屏面板和图表组件
│   │   ├── NaiveUiTestView.vue
│   │   ├── DraggableListView.vue
│   │   ├── NSpinResearchView.vue
│   │   └── NDataTableResearchView.vue
│   ├── App.vue                    # 应用外壳与顶部导航
│   └── main.ts                    # 应用入口
├── index.html
├── package.json
└── vite.config.ts
```

## 核心功能

### 1. 大屏适配方案对比

入口：`/full-screen-demo`

父页面提供四种方案入口，并展示每种方案的原理、优点、缺点和适用场景。四个子页面均在新标签页打开，且自动隐藏应用顶部导航，占满完整视口。

| 方案 | 路由 | 特点 |
| --- | --- | --- |
| Scale 等比缩放 | `/full-screen-demo/scale` | 固定 1920×1080 设计稿，通过 `transform: scale()` 还原设计稿 |
| Rem 动态适配 | `/full-screen-demo/rem` | 根据视口比例动态修改根字体，面板使用 rem/em 联动缩放 |
| 纯 vw/vh | `/full-screen-demo/vwvh` | 使用视口单位和 CSS 弹性布局，不依赖 JavaScript 适配计算 |
| Hybrid 混合适配 | `/full-screen-demo/hybrid` | 使用 `clamp()`、Grid/Flex、媒体查询和比例约束组合适配 |

详细原理、选型建议、Hooks API 和完整源码见 [docs/full-screen-demo.md](docs/full-screen-demo.md)。

### 2. 真实大屏业务面板

四种方案共享同一套大屏面板，保证对比变量一致。面板包括：

- 顶部实时状态、标题和当前时间。
- 今日请求、服务可用率、平均响应、在线用户四项 KPI。
- 请求来源分布饼图。
- CPU 和内存使用率仪表盘。
- 服务节点负载 / 响应时间动态散点矩阵。
- 实时请求与响应时间趋势折线图。
- 区域请求量柱状图。
- 实时事件列表；事件较多时自动无缝滚动，悬停暂停，且不会溢出模块边界。

### 3. 适配与图表基础设施

- `useScale`：父容器尺寸监听、等比缩放、居中定位和 requestAnimationFrame 合并更新。
- `useRem`：视口比例计算、根字体动态更新和离开页面后的样式恢复。
- `useClock`：实时时钟格式化与定时清理。
- `useMockData`：趋势、指标、资源、节点、区域和饼图模拟数据。
- `BaseChart`：统一 ECharts 初始化、SVG 渲染、配置更新、容器观察和自动 resize。

### 4. 组件研究页面

| 页面 | 路由 | 用途 |
| --- | --- | --- |
| Naive UI 测试 | `/naive-ui-test` | 验证 Naive UI 基础组件用法 |
| 拖拽列表 | `/draggable-list` | 研究 SortableJS / vuedraggable 和列表交互 |
| NSpin 研究 | `/n-spin-research` | 验证加载态与 Spin 相关行为 |
| NDataTable 研究 | `/n-data-table-research` | 验证表格配置、数据展示和交互 |

## 环境要求

- Node.js `^22.18.0` 或 `>=24.12.0`
- 推荐使用支持 Vue Official 扩展的 VS Code

## 常用命令

### 安装依赖

```sh
npm install
```

### 启动开发服务

```sh
npm run dev
```

### 仅执行生产构建

```sh
npm run build-only
```

### 类型检查

```sh
npm run type-check
```

> 当前仓库的根 `tsconfig.json` 存在 project references 与 TypeScript 6 兼容配置问题，完整 `type-check` 可能报配置错误；源码级类型错误可结合 `vue-tsc` 输出和 `npm run build-only` 验证。

### 代码检查与格式化

```sh
npm run lint
npm run format
```

### 预览生产构建

```sh
npm run preview
```

## 推荐开发工具

- [VS Code](https://code.visualstudio.com/)
- [Vue Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Vue DevTools](https://devtools.vuejs.org/)

## 参考文档

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vite.dev/)
- [Vue Router 文档](https://router.vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Naive UI 文档](https://www.naiveui.com/)
- [ECharts 文档](https://echarts.apache.org/)
