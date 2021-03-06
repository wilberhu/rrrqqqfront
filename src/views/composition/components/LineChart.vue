<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from '../../../components/Charts/mixins/resize'

let chartDataGlobal = {}
export default {
  mixins: [resize],
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
      default: '600px'
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
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        chartDataGlobal = Object.assign({}, val)
        if (this.chart) {
          this.chart.dispose()
          this.chart = null
        }
        this.initChart()
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
    },
    makeGridData(chartData) {
      let ret = []
      ret.push(
        echarts.util.merge({
          name: chartData.codeList? chartData.codeList[0] : '',
          type: 'line',
          xAxisIndex: 1,
          yAxisIndex: 1,
          smooth: false,
          hoverAnimation: false,
          data: chartData.codeList? chartData.data[0] : ''
        })
      )
      for(let i = 1; i < chartData.codeList.length; i++){
        ret.push(
          echarts.util.merge({
            type: 'line',
            name: chartData.codeList[i],
            areaStyle: {},
            stack: '总量',
            data: chartData.data[i],
            smooth: false,
            hoverAnimation: false,
            animationDuration: 2000
          })
        )
      }
      return ret
    },
    setOptions(chartData) {
      this.chart.setOption({
        title: {
          text: '收益曲线',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false
          }
        },
        legend: {
          data: chartData.codeList,
          left: 10,
          top: 25
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
          }
        },
        axisPointer: {
          link: {xAxisIndex: 'all'}
        },
        dataZoom: [
          {
            type: 'slider',
            xAxisIndex: [0, 1],
            realtime: true,
            // 移动端展示方式
            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
          },
          {
            type: 'inside',
            xAxisIndex: [0, 1],
            realtime: true,
            // 移动端展示方式
            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
          }],
        grid: [{
          left: 100,
          right: 50,
          top: '15%',
          height: '33%'
        }, {
          left: 100,
          right: 50,
          top: '55%',
          height: '33%'
        }],
        xAxis: [
          {
            axisLabel: {
              show: false,
            },
            type: 'category',
            boundaryGap: true,
            axisTick: {
              alignWithLabel: true
            },
            axisLine: {onZero: true},
            data: chartData.timestamp
          },
          {
            gridIndex: 1,
            type: 'category',
            boundaryGap: true,
            axisTick: {
              alignWithLabel: true
            },
            axisLine: {onZero: true},
            data: chartData.timestamp,
          }
        ],
        yAxis: [
          {
            name: '资金占比',
            type: 'value'
          },
          {
            gridIndex: 1,
            name: '收益',
            type: 'value'
          }
        ],
        series: this.makeGridData(chartData),
        formatter: function(params) {
          const params_index = []
          if (params instanceof Array) {
            for (let i = 0; i < chartDataGlobal.codeList.length; i++) {
              for (let j = 0; j < params.length; j++) {
                if (chartDataGlobal.codeList[i] === params[j].seriesName) {
                  params_index.push(j)
                }
              }
            }
            let ret = chartDataGlobal.timestamp[params[0].dataIndex] + '<br>'
            for (let i = 0; i < chartDataGlobal.codeList.length; i++) {
              if(params[params_index[i]] && params[params_index[i]].data) {
                ret += params[params_index[i]].marker + ' ' + params[params_index[i]].seriesName + ': ' + params[params_index[i]].data + '<br>'
              }
            }
            return ret
          }
          return params
        }
      })
    }
  }
}
</script>
