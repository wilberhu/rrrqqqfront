<template>
  <div :id="id" :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
import resize from '@/components/Charts/mixins/resize'

export default {
  name: 'CompareChart',
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'compare_chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: 'calc(90vh - 200px)'
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
    draw: function(form) {
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
      this.initChart()

      this.chartData = Object.assign({}, form)
      this.chartDataNorm = Object.assign({}, this.chartData)

      this.onDataZoom()

      this.setOptions(this.chartDataNorm, this.benchmarkNorm)
    },
    initChart: function() {
      this.start_index = 0
      this.chart = echarts.init(this.$el, 'macarons')

      var _this = this
      this.chart.on('dataZoom', function(params) {
        _this.start_index = Number(_this.chart.getModel().option.xAxis[0].rangeStart)
        _this.onDataZoom()
      })
    },
    onDataZoom() {
      if (this.chartData.close_data != null) {
        for (let i = 0; i < this.chartData.close_data.length; i++) {
          var base = 1
          if (this.chartData.close_data[i][this.start_index] !== '') {
            base = this.chartData.close_data[i][this.start_index]
          } else {
            base = 1
          }
          this.chartDataNorm.close_data[i] = this.chartData.close_data[i].map(item => item === '' ? '' : item / base)
        }
      }
      if (this.benchmark.histData != null && this.benchmark.histData.length > 0) {
        this.benchmarkNorm.histData = this.benchmark.histData.map(item => item === '' ? '' : item / this.benchmark.histData[this.start_index])
      }
      this.setOptions(this.chartDataNorm, this.benchmarkNorm)
    },
    makeGridData(chartData, benchmark) {
      var ret = []
      var type_list = Array.from(new Set(chartData.type_list))
      for (var i = 0; i < chartData.ts_code_list.length; i++) {
        if (type_list.indexOf(chartData.type_list[i]) < 2) {
          ret.push({
            name: chartData.name_list[i],
            type: 'line',
            yAxisIndex: type_list.indexOf(chartData.type_list[i]),
            animation: false,
            lineStyle: {
              width: 1
            },
            data: chartData.close_data[i],
            smooth: false
          })
        }
      }
      return ret
    },
    setOptions(chartData, benchmark) {
      this.chart.setOption({
        title: {
          text: '对比图',
          x: 'center',
          align: 'right'
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
          }
        ],
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
        series: this.makeGridData(chartData, benchmark),
        formatter: function(params) {
          if (params instanceof Array) {
            var ret = params.length > 0 ? params[0].axisValue + '<br>' : ''
            var sum = params.reduce((total, item) => total + item.data, 0)
            for (let i = 0; i < params.length; i++) {
              ret += params[i].marker + ' ' +
                params[i].seriesName + ' (' +
                Math.round(params[i].data / sum * 100) + '%) : ' +
                Math.round(params[i].data * 100) / 100 + '<br>'
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
