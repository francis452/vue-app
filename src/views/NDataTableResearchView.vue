<template>
  <!-- 页面容器：水平居中、最大宽 1200px、两侧各留 16px、上下留白 32px -->
  <main class="mx-auto w-[min(1200px,calc(100vw-32px))] py-8">
    <!-- 页头说明区 -->
    <section class="mb-6">
      <!-- 28px / 1.25 行高 / 深灰标题 -->
      <h1 class="mb-2 text-[28px] leading-tight text-[#1f2328]">设备台账 · 多记录展开</h1>
      <!-- 14px 辅助说明文字 -->
      <p class="m-0 text-sm text-[#667085]">
        展开时设备拆分为多条子记录行（条数取履历与故障的最大值，不足的一侧留空），其余列合并单元格；收起时仅显示第一条。
      </p>
    </section>

    <n-card size="small">
      <n-data-table :columns="columns" :data="physicalRows" :row-key="physicalRowKey" :scroll-x="1110" />
    </n-card>
  </main>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { NButton, NCard, NDataTable, NIcon, useMessage, type DataTableColumns } from 'naive-ui'
import { ChevronForward } from '@vicons/ionicons5'

/** 单条履历 / 故障记录：内容 + 对应时间 */
interface DeviceRecord {
  content: string
  time: string
}

/** 设备台账行数据：设备基础信息 + 两组相互独立的多记录列表 */
interface Device {
  id: number
  region: string
  company: string
  station: string
  name: string
  type: string
  model: string
  brand: string
  /** 设备履历列表（可多条） */
  histories: DeviceRecord[]
  /** 故障记录列表（可多条，与履历相互独立、条数可以不同） */
  faults: DeviceRecord[]
}

/** mock 数据：刻意覆盖履历 / 故障的各种条数组合，便于观察拆行与合并效果 */
const devices: Device[] = [
  // 履历 2 条 + 故障 2 条：最常见的多记录场景，展开拆为 2 行子记录
  {
    id: 1,
    region: '华东',
    company: '南京新能源',
    station: '滨江电站',
    name: '1#逆变器',
    type: '逆变器',
    model: 'SG250HX',
    brand: '华为',
    histories: [
      { content: '年度定检，更换散热风扇', time: '2025-03-12 09:30' },
      { content: '固件升级至 V100R023', time: '2025-08-04 14:20' },
    ],
    faults: [
      { content: '直流绝缘阻抗异常', time: '2026-07-21 06:12' },
      { content: '散热器过温告警', time: '2026-08-10 08:00' },
    ],
  },
  // 履历 1 条 + 故障 1 条：无可展开内容，行首不渲染箭头
  {
    id: 2,
    region: '华北',
    company: '天津绿电',
    station: '塘沽电站',
    name: '2#汇流箱',
    type: '汇流箱',
    model: 'PV-16D',
    brand: '阳光电源',
    histories: [{ content: '投运验收合格', time: '2024-11-02 10:00' }],
    faults: [{ content: '通讯中断告警', time: '2026-08-10 08:00' }],
  },
  // 履历 3 条 + 故障 2 条：展开拆为 3 行，第 3 行故障两列为空
  {
    id: 3,
    region: '华中',
    company: '武汉光伏',
    station: '江夏电站',
    name: '3#箱变',
    type: '箱式变压器',
    model: 'ZGS11-1250',
    brand: '特变电工',
    histories: [
      { content: '例行巡检，无异常', time: '2025-01-18 09:00' },
      { content: '更换高压熔断器', time: '2025-06-27 15:40' },
      { content: '预防性试验通过', time: '2026-02-09 11:15' },
    ],
    faults: [
      { content: '油温越限告警', time: '2026-05-30 13:05' },
      { content: '风机启动异常', time: '2026-08-10 08:00' },
    ],
  },
  // 履历 2 条 + 故障 3 条：展开拆为 3 行，第 3 行履历两列为空
  {
    id: 4,
    region: '西北',
    company: '银川旷能',
    station: '贺兰电站',
    name: '5#逆变器',
    type: '逆变器',
    model: 'SG100CX',
    brand: '华为',
    histories: [
      { content: '更换交流接触器', time: '2025-04-15 16:50' },
      { content: '清扫滤网并复紧端子', time: '2026-03-03 08:45' },
    ],
    faults: [
      { content: '电网过压停机', time: '2026-06-18 12:30' },
      { content: '组串电流失衡', time: '2026-07-02 07:55' },
      { content: '散热器过温告警', time: '2026-08-10 08:00' },
    ],
  },
  // 履历 1 条 + 故障 2 条：展开拆为 2 行，第 2 行履历两列为空
  {
    id: 5,
    region: '华南',
    company: '佛山氢能',
    station: '顺德电站',
    name: '1#汇流箱',
    type: '汇流箱',
    model: 'PV-12D',
    brand: '阳光电源',
    histories: [{ content: '防雷模块检测正常', time: '2025-09-21 10:25' }],
    faults: [
      { content: '熔断器熔断告警', time: '2026-07-15 09:40' },
      { content: '通讯中断告警', time: '2026-08-10 08:00' },
    ],
  },
  // 履历 2 条 + 故障 1 条：展开拆为 2 行，第 2 行故障两列为空
  {
    id: 6,
    region: '西南',
    company: '成都蜀光',
    station: '金堂电站',
    name: '2#箱变',
    type: '箱式变压器',
    model: 'ZGS11-800',
    brand: '特变电工',
    histories: [
      { content: '低压侧柜体除湿', time: '2025-12-08 14:30' },
      { content: '红外测温无热点', time: '2026-04-19 09:10' },
    ],
    faults: [{ content: '轻瓦斯告警', time: '2026-08-10 08:00' }],
  },
  // 履历 1 条 + 故障 1 条（占位）：行首同样无箭头
  {
    id: 7,
    region: '华东',
    company: '杭州湾电力',
    station: '前湾电站',
    name: '4#逆变器',
    type: '逆变器',
    model: 'SG250HX',
    brand: '华为',
    histories: [{ content: '投运验收合格', time: '2026-01-06 10:00' }],
    faults: [{ content: '无', time: '—' }],
  },
  // 履历 3 条 + 故障 0 条：极端不等长——展开拆为 3 行，故障两列整列为空；
  // 行首箭头由履历条数决定
  {
    id: 8,
    region: '西北',
    company: '西安风能',
    station: '泾河电站',
    name: '2#逆变器',
    type: '逆变器',
    model: 'SG110CX',
    brand: '华为',
    histories: [
      { content: '安装调试完成', time: '2026-05-11 09:00' },
      { content: '首月发电巡检正常', time: '2026-06-20 10:30' },
      { content: '远程校准功率曲线', time: '2026-07-08 15:00' },
    ],
    faults: [],
  },
]

// 轻提示：用于操作列按钮（App.vue 已挂 NMessageProvider，可直接使用）
const message = useMessage()

// ========== 展开状态管理（纯外部状态，不依赖表格内部） ==========

// 已展开行的设备 id 集合：只存 id，不存整行数据
const expandedRowIds = ref<number[]>([])

/** 某设备当前是否处于展开态 */
const isExpanded = (id: number) => expandedRowIds.value.includes(id)

/** 切换某设备展开 / 收起：已在集合中则移除，不在则追加 */
const toggleRow = (id: number) => {
  expandedRowIds.value = isExpanded(id)
    ? expandedRowIds.value.filter((item) => item !== id)
    : [...expandedRowIds.value, id]
}

/** 该设备是否有多记录可展开：履历或故障任一超过 1 条 */
const hasMultiRecords = (device: Device) => device.histories.length > 1 || device.faults.length > 1

// ========== 物理行拆分（本方案核心） ==========

/**
 * 表格实际渲染的物理行：一台设备在展开时拆为多条子记录行。
 * 拆行规则：条数 = max(履历条数, 故障条数)，不足的一侧对应下标留空；
 * 例如 4 条履历 / 6 条故障 → 拆 6 行，后 2 行的履历为空。
 */
interface PhysicalRow {
  /** 物理行 key：`${设备id}-${记录下标}`，保证展开前后行标识稳定 */
  key: string
  /** 源设备数据（基础信息列、操作列都从它取值） */
  device: Device
  /** 本行对应第几条记录（0 起） */
  recordIndex: number
  /** 本设备拆出的总行数（合并单元格的 rowspan 值） */
  recordCount: number
  /** 是否首行：需要合并的列只在首行渲染，后续行由 naive-ui 自动跳过 */
  isFirst: boolean
}

/** 展开状态变化时自动重算：展开设备 → max 条子行；收起设备 / 无多记录 → 单行 */
const physicalRows = computed<PhysicalRow[]>(() =>
  devices.flatMap((device) => {
    const count =
      isExpanded(device.id) && hasMultiRecords(device)
        ? Math.max(device.histories.length, device.faults.length)
        : 1
    return Array.from({ length: count }, (_, index) => ({
      key: `${device.id}-${index}`,
      device,
      recordIndex: index,
      recordCount: count,
      isFirst: index === 0,
    }))
  }),
)

// 物理行 row-key：不能用设备 id（展开时同一设备会有多行，key 必须唯一）
const physicalRowKey = (row: PhysicalRow) => row.key

/**
 * 合并单元格：除四个记录列外的列（箭头、区域、品牌、操作）共用。
 * 首行返回总行数（rowspan=N），后续行返回 1——这些行的单元格
 * 已被首行 rowspan 覆盖，naive-ui 会自动跳过渲染。
 */
const mergeRowSpan = (row: PhysicalRow) => (row.isFirst ? row.recordCount : 1)

// ========== 行首展开 / 收起图标 ==========
/**
 * 渲染行首箭头按钮（渲染在设备首行、跨子行合并的单元格里）：
 * - 无多记录的设备返回 null，单元格留空；
 * - 收起时箭头朝右，展开时（必然多行）旋转 90° 朝下，带过渡动画。
 */
const renderExpandIcon = (device: Device) => {
  if (!hasMultiRecords(device)) return null
  const expanded = isExpanded(device.id)
  return h(
    'button',
    {
      // 22px 见方的透明图标按钮：去边框、去内边距、指针手势
      class: 'inline-flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded bg-transparent p-0 [border:none]',
      onClick: () => toggleRow(device.id),
      'aria-label': expanded ? '收起' : '展开',
    },
    h(
      NIcon,
      {
        size: 14,
        color: '#667085',
        // transition-transform 提供旋转过渡；rotate-90 / rotate-0 切换展开方向
        class: ['transition-transform duration-200', expanded ? 'rotate-90' : 'rotate-0'],
      },
      { default: () => h(ChevronForward) },
    ),
  )
}

// ========== 列定义 ==========
const columns: DataTableColumns<PhysicalRow> = [
  // 行首列：展开 / 收起箭头，跨子行合并（无多记录的设备渲染为空）
  {
    title: '',
    key: 'expand',
    width: 50,
    align: 'center',
    rowSpan: mergeRowSpan,
    render: (row) => renderExpandIcon(row.device),
  },
  // 区域：基础信息列，跨子行合并，取源设备字段
  { title: '区域', key: 'region', width: 80, rowSpan: mergeRowSpan, render: (row) => row.device.region },
  // 以下基础列暂时注释，按需恢复（恢复时同样加 rowSpan: mergeRowSpan）
  // { title: '项目公司', key: 'company', width: 150, rowSpan: mergeRowSpan, render: (row) => row.device.company },
  // { title: '电站', key: 'station', width: 150, rowSpan: mergeRowSpan, render: (row) => row.device.station },
  // { title: '设备名称', key: 'name', width: 130, rowSpan: mergeRowSpan, render: (row) => row.device.name },
  // { title: '设备类型', key: 'type', width: 120, rowSpan: mergeRowSpan, render: (row) => row.device.type },
  // { title: '设备型号', key: 'model', width: 130, rowSpan: mergeRowSpan, render: (row) => row.device.model },
  // 设备品牌：基础信息列，跨子行合并
  {
    title: '设备品牌',
    key: 'brand',
    width: 110,
    rowSpan: mergeRowSpan,
    render: (row) => row.device.brand,
  },
  // 设备履历：按物理行下标取第 N 条履历内容，越界（履历比故障少）补空字符串
  {
    title: '设备履历',
    key: 'histories',
    minWidth: 200,
    render: (row) => row.device.histories[row.recordIndex]?.content ?? '',
  },
  // 履历添加时间：与设备履历同下标一一对应，越界补空
  {
    title: '履历添加时间',
    key: 'historyTimes',
    width: 150,
    render: (row) => row.device.histories[row.recordIndex]?.time ?? '',
  },
  // 故障描述：按物理行下标取第 N 条故障内容，越界（故障比履历少）补空字符串
  {
    title: '故障描述',
    key: 'faults',
    minWidth: 200,
    render: (row) => row.device.faults[row.recordIndex]?.content ?? '',
  },
  // 故障发生时间：与故障描述同下标一一对应，越界补空
  {
    title: '故障发生时间',
    key: 'faultTimes',
    width: 150,
    render: (row) => row.device.faults[row.recordIndex]?.time ?? '',
  },
  // 操作列：查看按钮（演示用，仅弹 message），跨子行合并、垂直居中
  {
    title: '操作',
    key: 'actions',
    width: 70,
    rowSpan: mergeRowSpan,
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          type: 'primary',
          size: 'small',
          onClick: () => message.info(`查看 ${row.device.name} 详情（演示）`),
        },
        { default: () => '查看' },
      ),
  },
]
</script>
