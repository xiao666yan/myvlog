<template>
  <div class="dashboard">
    <div class="header">
      <h2>后台仪表盘</h2>
      <button @click="loadData" class="refresh-btn">刷新数据</button>
    </div>
    
    <!-- Stats Cards -->
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="cards">
      <div class="card">
        <div class="value">{{ stats.articleCount }}</div>
        <div class="label">文章数量</div>
      </div>
      <div class="card">
        <div class="value">{{ stats.categoryCount }}</div>
        <div class="label">分类数量</div>
      </div>
      <div class="card">
        <div class="value">{{ stats.userCount }}</div>
        <div class="label">注册用户</div>
      </div>
      <div class="card">
        <div class="value">{{ stats.totalViews }}</div>
        <div class="label">总浏览量</div>
      </div>
      <div class="card">
        <div class="value">{{ stats.projectCount }}</div>
        <div class="label">项目数量</div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-container">
      <div class="chart-card">
        <h3>文章热度排行 (Top 10)</h3>
        <div ref="heatChartRef" class="chart-box"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 后台管理仪表盘组件
 * 包含全站核心指标统计卡片以及基于 ECharts 的文章热度排行图表
 */
import { onMounted, ref, nextTick, onUnmounted } from 'vue';
import { getDashboardStats, getHeatData } from '@/api/dashboard';
import * as echarts from 'echarts';

// 响应式状态：存储统计数据
const stats = ref({ 
  articleCount: 0, 
  projectCount: 0, 
  totalViews: 0,
  categoryCount: 0,
  userCount: 0
});
const loading = ref(false); // 加载状态标识

// ECharts 图表容器引用和实例
const heatChartRef = ref(null);
let heatChart = null;

/**
 * 初始化并渲染文章热度排行图表
 * @param {Array} data 后端返回的文章热度数据列表
 */
const initHeatChart = (data) => {
  if (!heatChartRef.value) return;
  
  // 1. 初始化图表实例 (如果尚未创建)
  if (!heatChart) {
    heatChart = echarts.init(heatChartRef.value);
  }

  // 2. 配置 ECharts 选项
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: 'category',
      // 将数据反转，使热度最高的排在最上方
      data: data.map(item => {
        // 对过长的标题进行截断显示
        return item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title;
      }).reverse()
    },
    series: [
      {
        name: '热度分数',
        type: 'bar',
        data: data.map(item => item.score).reverse(),
        itemStyle: {
          color: '#42b983' // 使用主题绿色
        }
      }
    ]
  };

  // 3. 应用配置
  heatChart.setOption(option);
};

/**
 * 窗口尺寸变化处理：自动缩放图表
 */
const handleResize = () => {
  heatChart?.resize();
};

/**
 * 从后端加载仪表盘数据
 */
const loadData = async () => {
  loading.value = true;
  try {
    console.log('Fetching dashboard stats...');
    // 1. 获取核心统计卡片数据
    const res = await getDashboardStats();
    console.log('Dashboard stats response:', res);
    
    // 兼容不同的后端返回格式 (直接返回或包装在 value 字段中)
    const data = res?.value || res || {};
    
    // 填充统计值，优先使用 camelCase 字段，兼容 snake_case
    stats.value = {
      articleCount: data.articleCount ?? data.article_count ?? 0,
      projectCount: data.projectCount ?? data.project_count ?? 0,
      totalViews: data.totalViews ?? data.total_views ?? 0,
      categoryCount: data.categoryCount ?? data.category_count ?? 0,
      userCount: data.userCount ?? data.user_count ?? 0
    };
    
    // 2. 获取图表排行数据
    let heatDataRes = await getHeatData();
    console.log('Heat data response:', heatDataRes);
    const heatData = Array.isArray(heatDataRes) ? heatDataRes : (heatDataRes?.value || []);
    
    // 3. 如果有数据，则渲染图表
    if (heatData && heatData.length > 0) {
      // 使用 nextTick 确保 DOM 元素已经完成挂载和布局
      await nextTick();
      initHeatChart(heatData);
    }
  } catch (e) {
    console.error('加载仪表盘失败', e);
  } finally {
    loading.value = false;
  }
};

// 生命周期：组件挂载
onMounted(() => {
  loadData();
  // 监听窗口缩放事件，确保图表自适应
  window.addEventListener('resize', handleResize);
});

// 生命周期：组件卸载
onUnmounted(() => {
  // 销毁监听器和图表实例，释放内存
  window.removeEventListener('resize', handleResize);
  heatChart?.dispose();
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.refresh-btn {
  padding: 8px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
.card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 24px 16px;
  text-align: center;
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.value {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 4px;
}
.label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}
.charts-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
.chart-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
}
.chart-card h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.1rem;
  color: var(--text-primary);
}
.chart-box {
  width: 100%;
  height: 400px;
}
</style>
