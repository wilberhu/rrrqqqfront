<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import { debounce } from '@/utils'

export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '630px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null,
      sidebarElm: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  activated() {
    this.initChart()
    if (this.autoResize) {
      this.__resizeHandler = debounce(() => {
        if (this.chart) {
          this.chart.resize()
        }
      }, 100)
      window.addEventListener('resize', this.__resizeHandler)
    }

    // 监听侧边栏的变化
    this.sidebarElm = document.getElementsByClassName('sidebar-container')[0]
    this.sidebarElm && this.sidebarElm.addEventListener('transitionend', this.sidebarResizeHandler)
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    if (this.autoResize) {
      window.removeEventListener('resize', this.__resizeHandler)
    }

    this.sidebarElm && this.sidebarElm.removeEventListener('transitionend', this.sidebarResizeHandler)

    this.chart.dispose()
    this.chart = null
  },
  methods: {
    sidebarResizeHandler(e) {
      if (e.propertyName === 'width') {
        this.__resizeHandler()
      }
    },
    // 直角坐标系内绘图网格
    makeGrid(top, height, opt) {
      return echarts.util.merge({
        left: 70,
        right: 30,
        top: top,
        height: height
      }, opt || {}, true)
    },

    // X轴生成器
    makeXAxis(gridIndex, opt) {
      // 避免X轴数据显示过于频繁
      var axisLabelFlag = false
      if (gridIndex === 2) {
        axisLabelFlag = true
      }

      return echarts.util.merge({
        type: 'category',
        gridIndex: gridIndex,
        // 统一时间轴数据
        // data: overviewDate,
        data: this.chartData.date,
        axisLabel: {
          show: axisLabelFlag
          /*          formatter: function(value) {
                    return echarts.format.formatTime('MM-dd', value);
                }*/
        }
      }, opt || {}, true)
    },

    // Y轴生成器
    makeYAxis(gridIndex, opt) {
      return echarts.util.merge({
        type: 'value',
        nameLocation: 'middle',
        nameGap: '50',
        gridIndex: gridIndex,
        nameTextStyle: {
          color: '#333'
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true
        }
      }, opt || {}, true)
    },

    // 数据生成器
    makeGridData(xAxisIndex, yAxisIndex, chartType, chartName, chartData, opt) {
      return echarts.util.merge({
        type: chartType,
        name: chartName,
        xAxisIndex: xAxisIndex,
        yAxisIndex: yAxisIndex,
        data: chartData
      }, opt || {}, true)
    },
    setOptions(chartData) {
      // 图表定位
      var chartGridTop = 50
      var chartGridHeight = 150

      const series = [
        this.makeGridData(0, 0, 'line', 'portfolio', chartData.portfolio),
        this.makeGridData(0, 0, 'line', 'benchmark_portfolio', chartData.benchmark_portfolio),
        this.makeGridData(1, 1, 'bar', 'daily_returns', chartData.daily_returns, {})
      ]
      if (chartData.params_index) {
        for (let i = 0; i < chartData.params_index.length - 3; i++) {
          series.push(this.makeGridData(2, 2, 'bar', chartData.params_index[i + 3], chartData.amount[i], {
            stack: 'DBTIME'
          }))
        }
      }

      this.chart.setOption({
        animation: false,
        // 标题组件，包含主标题和副标题
        title: {
          x: 'center',
          text: '收益概览',
          subtext: echarts.format.formatTime('yyyy年MM月dd', new Date()),
          padding: 0
        },
        tooltip: {
          // 移动端展示方式
          trigger: 'axis',
          transitionDuration: 0,
          confine: true,
          bordeRadius: 4,
          borderWidth: 1,
          borderColor: '#333',
          backgroundColor: 'rgba(255,255,255,0.9)',
          textStyle: {
            fontSize: 12,
            color: '#333'
          },
          formatter: function(params) {
            const params_index = []
            if (chartData.params_index && params) {
              for (let i = 0; i < chartData.params_index.length; i++) {
                for (let j = 0; j < params.length; j++) {
                  if (chartData.params_index[i] === params[j].seriesName) {
                    params_index.push(j)
                  }
                }
              }
            }
            let ret = chartData.date[params[0].dataIndex] + '<br>' +
              params[params_index[0]].marker + ' ' + params[params_index[0]].seriesName + ': ' + params[params_index[0]].data + '<br>' +
              params[params_index[1]].marker + ' ' + params[params_index[1]].seriesName + ': ' + params[params_index[1]].data + '<br>' +
              chartData.date[params[0].dataIndex] + '<br>' +
              params[params_index[2]].marker + ' ' + params[params_index[2]].seriesName + ': ' + params[params_index[2]].data + '<br>' +
              chartData.date[params[0].dataIndex] + '<br>'

            if (chartData.params_index && params) {
              for (let i = 3; i < chartData.params_index.length; i++) {
                ret += params[params_index[i]].marker + ' ' + params[params_index[i]].seriesName + ': ' + chartData.side[i - 3][params[params_index[i]].dataIndex] + ' ' + params[params_index[i]].data + '<br>'
              }
            }
            return ret
          }
        },
        // 工具栏
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        // 坐标轴指示器（axisPointer）的全局公用设置
        axisPointer: {
          type: 'shadow',
          link: {
            xAxisIndex: 'all'
          }
        },
        // 直角坐标系内绘图网格
        grid: [
          this.makeGrid(chartGridTop, chartGridHeight),
          this.makeGrid(chartGridTop + (chartGridHeight + 25), chartGridHeight),
          this.makeGrid(chartGridTop + (chartGridHeight + 25) * 2, chartGridHeight)
        ],
        xAxis: [
          this.makeXAxis(0),
          this.makeXAxis(1),
          this.makeXAxis(2)
        ],
        yAxis: [
          this.makeYAxis(0, {
            name: '累计收益'
            // min: 20,
            // max: 80
          }),
          this.makeYAxis(1, {
            name: '每日盈亏'
            // max: 1000
          }),
          this.makeYAxis(2, {
            name: '成交记录'
            // max: 80
          })
        ],
        // dataZoom 组件 用于区域缩放
        dataZoom: [{
          type: 'slider',
          xAxisIndex: [0, 1, 2],
          realtime: true,
          // 移动端展示方式
          handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
        }],
        // 每个系列通过 type 决定自己的图表类型
        series: series
      })
    },
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    }
  }
}
</script>
