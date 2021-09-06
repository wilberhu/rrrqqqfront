<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from '../../../components/Charts/mixins/resize'

export default {
  mixins: [resize],
  props: {
    form: {
      type: Object,
      default: function() {
        return {
          ts_code: null,
          name: null,
          histData: null,
          maData: null
        }
      }
    },
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
    }
  },
  data() {
    return {
      chart: null,
      chartData: {
        time_line: [],
        ts_code_list: [],
        close_data: []
      },
      chartDataNorm: {
        time_line: [],
        ts_code_list: [],
        close_data: []
      },
      benchmark: {
        ts_code: null,
        name: null,
        histData: null,
        maData: null
      },
      benchmarkNorm: {
        time_line: [],
        ts_code_list: [],
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
    initChart() {
      this.start_index = 0
      this.chart = echarts.init(this.$el, 'macarons')
      var _this = this
      this.chart.on('dataZoom', function(params) {
        _this.start_index = Number(_this.chart.getModel().option.xAxis[0].rangeStart)
        if (_this.chartData.close_data != null) {
          _this.chartDataNorm.close_data[0] = _this.chartData.close_data[0].map(item => item === '' ? '' : item / _this.chartData.close_data[0][_this.start_index])
        }
        if (_this.benchmark.histData != null && _this.benchmark.histData.length > 0) {
          _this.benchmarkNorm.histData = _this.benchmark.histData.map(item => item === '' ? '' : item / _this.benchmark.histData[_this.start_index])
        }
        _this.setOptions(_this.chartDataNorm, _this.benchmarkNorm)
      })
    },
    updateData(chartData, benchmark, clear = false) {
      if (clear) {
        this.chart.dispose()
        this.chart = null
        this.initChart()
      }
      this.chartData = Object.assign({}, chartData)
      this.chartDataNorm = Object.assign({}, chartData)
      if (chartData.close_data) {
        this.chartDataNorm.close_data[0] = this.chartData.close_data[0].map(item => item === '' ? '' : item / this.chartData.close_data[0][this.start_index])
      }
      this.benchmark = Object.assign({}, benchmark)
      this.benchmarkNorm = Object.assign({}, benchmark)
      if (benchmark.histData) {
        this.benchmarkNorm.histData = this.benchmark.histData.map(item => item === '' ? '' : item / this.benchmark.histData[this.start_index])
      }
      this.setOptions(this.chartDataNorm, this.benchmarkNorm)
    },
    makeGridData(chartData, benchmark) {
      const ret = []
      ret.push(
        echarts.util.merge({
          yAxisIndex: 0,
          name: chartData.ts_code_list ? chartData.ts_code_list[0] : '',
          type: 'line',
          smooth: false,
          hoverAnimation: false,
          data: chartData.ts_code_list ? chartData.close_data[0] : ''
        })
      )
      if (benchmark.ts_code != null) {
        ret.push(
          echarts.util.merge({
            yAxisIndex: 0,
            name: benchmark.ts_code,
            type: 'line',
            smooth: false,
            hoverAnimation: false,
            data: benchmark.histData
          })
        )
      }
      return ret
    },
    setOptions(chartData, benchmark) {
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
            xAxisIndex: [0],
            realtime: false,
            // 移动端展示方式
            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
          },
          {
            type: 'inside',
            xAxisIndex: [0],
            realtime: false,
            // 移动端展示方式
            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
          }],
        grid: [{
          left: 100,
          right: 50,
          top: '10%',
          height: '80%'
        }],
        xAxis: [
          {
            type: 'category',
            boundaryGap: true,
            axisTick: { alignWithLabel: true },
            axisLine: { onZero: true },
            data: chartData.time_line
          }
        ],
        yAxis: [
          {
            name: '收益率',
            type: 'value',
            scale: true
          }
        ],
        series: this.makeGridData(chartData, benchmark)
      })
    }
  }
}
</script>
