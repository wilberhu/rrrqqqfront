<template>
  <div :id="'stack_line_pie_chart'" :class="className" :style="{height:height,width:width}" />
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
    onDataZoom() {
      var times = this.chartData.close_data[0][this.start_index] / this.chartData.close_data[1][this.start_index]

      this.chartDataNorm.close_data[1] = this.chartData.close_data[1].map(item => item === '' ? '' : item * times)
      this.setOptions(this.chartDataNorm)
    },
    setOptions(chartData) {
      var _this = this

      this.chart.setOption({
        legend: {
          top: '5%'
        },
        tooltip: {
          trigger: 'axis',
          // alwaysShowContent: true,
          top: '10%'
        },
        xAxis: {
          type: 'category',
          data: chartData.time_line
        },
        yAxis: {
          gridIndex: 0,
          scale: true
        },
        grid: { top: '55%' },
        series: [
          {
            type: 'line',
            name: chartData.ts_code_list[0],
            smooth: false,
            seriesLayoutBy: 'row',
            data: chartData.close_data[0],
            emphasis: { focus: 'series' }
          },
          {
            type: 'line',
            name: chartData.ts_code_list[1],
            smooth: false,
            seriesLayoutBy: 'row',
            data: chartData.close_data[1],
            emphasis: { focus: 'series' }
          },
          {
            type: 'pie',
            id: 'pie',
            radius: '30%',
            center: ['50%', '35%'],
            emphasis: {
              focus: 'self'
            },
            label: {
              formatter: '{b}: {@9999} ({d}%)'
            },
            encode: {
              itemName: 'time_line',
              value: '9999',
              tooltip: '9999'
            },
            animation: false
          }
        ],
        dataZoom: [
          {
            type: 'slider',
            realtime: false,
            // 移动端展示方式
            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
          },
          {
            type: 'inside',
            realtime: false,
            // 移动端展示方式
            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
          }
        ],
        formatter: function(params) {
          if (params instanceof Array) {
            let ret = chartData.time_line[params[0].dataIndex] + '<br>'
            ret += '收益率：' + Math.round(params[0].data * 10000 / chartData.close_data[0][_this.start_index]) / 100 + '%<br>'
            for (let i = 0; i < _this.chartData.ts_code_list.length; i++) {
              if (params[i] && params[i].data !== 0) {
                ret += params[i].marker + ' ' + params[i].seriesName +
                  ' ' + chartData.name_list[chartData.ts_code_list.indexOf(params[i].seriesName)] +
                  '（' + Math.round(params[i].data * 10000 / params[0].data) / 100 + '%）: ' + params[i].data + '<br>'
              }
            }
            return ret
          }
          return params
        }
      })

      this.chart.on('updateAxisPointer', function(event) {
        const xAxisInfo = event.axesInfo[0]
        if (xAxisInfo) {
          _this.onxAxisChange(xAxisInfo.value)
        }
      })

      this.onxAxisChange(this.chartData.time_line.length - 1)
    },
    onxAxisChange(xAxis) {
      var pie_data = []
      for (let i = 2; i < this.chartData.close_data.length; i++) {
        if (Math.abs(this.chartData.close_data[i][xAxis] / this.chartData.close_data[0][xAxis]) > 0.005) {
          pie_data.push({
            value: parseFloat(this.chartData.close_data[i][xAxis]),
            name: this.chartData.ts_code_list[i] + this.chartData.name_list[i]
          })
        }
      }
      var dimension = xAxis + 1
      this.chart.setOption({
        title: {
          left: 'center',
          text: this.chartData.time_line[xAxis]
        },
        series: {
          id: 'pie',
          data: pie_data,
          label: {
            formatter: '{b}: {@[' + dimension + ']} ({d}%)'
          },
          encode: {
            value: dimension,
            tooltip: dimension
          }
        }
      })
    }
  }
}
</script>
