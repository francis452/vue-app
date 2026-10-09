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
