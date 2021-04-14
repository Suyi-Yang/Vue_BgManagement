<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 2.在绘图前 为ECharts准备一个具备高宽的DOM容器 -->
      <div id="main" style="width: 750px; height: 400px;"></div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts' // 1.引入echarts
import _ from 'lodash'

export default {
  data() {
    return {
      options: { //需要合并的数据
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created(){

  },
  async mounted(){ //此时 [页面上的元素]已经被渲染完毕了
    // 3.基于准备好的dom 初始化一个echarts实例 (echarts.init方法)
    var myChart = echarts.init(document.getElementById('main'));

    // 发送请求：数据统计-基于时间统计的折线图
    const {data:res} = await this.$http.get('reports/type/1')
    if(res.meta.status!==200){
      return this.$message.error('获取折线图数据失败！')
    }

    // 4.指定图表的配置项和数据
    const result = _.merge(res.data, this.options)
    // 5.通过setOption方法生成一个简单的柱状图(使用刚指定的配置项和数据显示图表)
    myChart.setOption(result);
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>

</style>