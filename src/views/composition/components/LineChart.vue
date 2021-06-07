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
    },
    chartData: {
      type: Object,
      required: true
    },
    benchmark: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chart: null,
      data: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        if (this.chart) {
          this.chart.dispose()
          this.chart = null
        }
        this.initChart()
        this.setOptions(val, this.benchmark)
      }
    },
    benchmark: {
      deep: true,
      handler(val) {
        if (this.chart) {
          this.chart.dispose()
          this.chart = null
        }
        this.initChart()
        this.setOptions(this.chartData, val)
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
    makeGridData(chartData, benchmark) {
      const ret = []
      ret.push(
        echarts.util.merge({
          yAxisIndex: 0,
          name: chartData.codeList ? chartData.codeList[0] : '',
          type: 'line',
          smooth: false,
          hoverAnimation: false,
          data: chartData.codeList ? chartData.data[0] : ''
        })
      )
      ret.push(
        echarts.util.merge({
          yAxisIndex: 1,
          type: 'line',
          smooth: false,
          hoverAnimation: false,
          data: benchmark
        })
      )
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
            realtime: true,
            // 移动端展示方式
            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
          },
          {
            type: 'inside',
            xAxisIndex: [0],
            realtime: true,
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
            data: chartData.timestamp
          }
        ],
        yAxis: [
          {
            name: '收益',
            type: 'value',
            scale: true
          },
          {
            name: 'benchmark',
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
