<template>
  <div :id="'stack_line_chart'" :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from '../../../components/Charts/mixins/resize'

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
      default: '700px'
    },
    autoResize: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      chart: null,
      chartData: {
        ts_code_list: [],
        name_list: [],
        type_list: [],
        time_line: [],
        close_data: []
      },
      chartDataNorm: {
        ts_code_list: [],
        name_list: [],
        type_list: [],
        time_line: [],
        close_data: []
      },
      start_index: 0
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
    draw: function(form) {
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
      this.initChart()

      this.chartData = Object.assign({}, form)
      this.chartDataNorm = Object.assign({}, this.chartData)
      this.onDataZoom()

      this.setOptions(this.chartDataNorm)
    },
    initChart() {
      this.start_index = 0
      this.chart = echarts.init(this.$el, 'macarons')

      var _this = this
      this.chart.on('dataZoom', function(params) {
        _this.start_index = Number(_this.chart.getModel().option.xAxis[0].rangeStart)
        _this.onDataZoom()
      })
    },
    makeGridData(chartData) {
      var ret = []
      for (let i = 0; i < 2; i++) {
        ret.push(
          echarts.util.merge({
            name: chartData.ts_code_list[i],
            type: 'line',
            xAxisIndex: 1,
            yAxisIndex: 1,
            smooth: false,
            hoverAnimation: false,
            data: chartData.ts_code_list ? chartData.close_data[i] : ''
          })
        )
      }
      for (let i = 2; i < chartData.ts_code_list.length; i++) { // # !!!!!!!!!!!!!!!!!!!!!!!!!
        ret.push(
          echarts.util.merge({
            type: 'line',
            name: chartData.ts_code_list[i],
            areaStyle: {},
            stack: '总量',
            data: chartData.close_data[i],
            smooth: false,
            hoverAnimation: false,
            animationDuration: 2000
          })
        )
      }
      return ret
    },
    onDataZoom() {
      if (this.chartData.close_data != null) {
        var times = this.chartData.close_data[0][this.start_index] / this.chartData.close_data[1][this.start_index]

        this.chartDataNorm.close_data[1] = this.chartData.close_data[1].map(item => item === '' ? '' : item * times)
        this.setOptions(this.chartDataNorm)
      }
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
          // data: chartData.ts_code_list,
          left: 10,
          top: 25,
          selectedMode: chartData.ts_code_list.length > 20 ? 'single' : 'multiple',
          formatter: function(ts_code) {
            return ts_code + ' ' + chartData.name_list[chartData.ts_code_list.indexOf(ts_code)]
          }
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
          link: { xAxisIndex: 'all' }
        },
        dataZoom: [
          {
            type: 'slider',
            xAxisIndex: [0, 1],
            realtime: false,
            // 移动端展示方式
            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
          },
          {
            type: 'inside',
            xAxisIndex: [0, 1],
            realtime: false,
            // 移动端展示方式
            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
          }],
        grid: [{
          left: 74,
          right: 18,
          top: '15%',
          height: '33%'
        }, {
          left: 74,
          right: 18,
          top: '55%',
          height: '33%'
        }],
        xAxis: [
          {
            axisLabel: {
              show: false
            },
            type: 'category',
            boundaryGap: true,
            axisTick: {
              alignWithLabel: true
            },
            axisLine: { onZero: true },
            data: chartData.time_line
          },
          {
            gridIndex: 1,
            type: 'category',
            boundaryGap: true,
            axisTick: {
              alignWithLabel: true
            },
            axisLine: { onZero: true },
            data: chartData.time_line
          }
        ],
        yAxis: [
          {
            name: '资金占比',
            type: 'value',
            scale: false
          },
          {
            gridIndex: 1,
            name: '收益',
            type: 'value',
            scale: true
          }
        ],
        series: this.makeGridData(chartData),
        formatter: function(params) {
          const params_index = []
          if (params instanceof Array) {
            for (let i = 0; i < chartData.ts_code_list.length; i++) {
              for (let j = 0; j < params.length; j++) {
                if (chartData.ts_code_list[i] === params[j].seriesName) {
                  params_index.push(j)
                }
              }
            }
            let ret = chartData.time_line[params[0].dataIndex] + '<br>'
            ret += '收益率：' + Math.round(params[params_index[0]].data * 10000 / chartData.close_data[0][0]) / 100 + '%<br>'
            for (let i = 0; i < chartData.ts_code_list.length; i++) {
              if (params[params_index[i]] && params[params_index[i]].data) {
                ret += params[params_index[i]].marker + ' ' + params[params_index[i]].seriesName +
                  ' ' + chartData.name_list[chartData.ts_code_list.indexOf(params[params_index[i]].seriesName)] +
                  '（' + Math.round(params[params_index[i]].data * 10000 / params[params_index[0]].data) / 100 + '%）: ' + params[params_index[i]].data + '<br>'
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
