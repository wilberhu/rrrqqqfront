<template>
  <div :class="className" :id="id" :style="{height:height,width:width}"/>
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'

export default {
  name: 'Chart',
  mixins: [resize],
  props: {
    form: {
      type: Object,
      default: function() {
        return {
          ts_code_list: [],
          name_list: [],
          type_list: [],
          timeLine: [],
          closeData: []
        }
      }
    },
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '200px'
    },
    height: {
      type: String,
      default: '200px'
    }
  },
  computed: {
    series() {
      var ret = []
      for (var i = 0; i < this.form.ts_code_list.length; i++) {
        ret.push({
          name: this.form.name_list[i],
          type: 'line',
          yAxisIndex: this.form.type_list[i],
          animation: false,
          lineStyle: {
            width: 1
          },
          data: this.form.closeData[i]
        })
      }
      return ret
    }
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    draw: function() {
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
      this.initChart()
    },
    initChart: function() {
      this.chart = echarts.init(document.getElementById(this.id))

      this.chart.setOption({

        title: {
          text: 'K线图',
          x: 'center',
          align: 'right'
        },
        grid: {
          bottom: 80
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
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            animation: false,
            label: {
              backgroundColor: '#505765'
            }
          }
        },
        legend: {
          data: this.form.name_list,
          x: 'left'
        },
        dataZoom: [
          {
            type: 'inside',
            start: 70,
            end: 100
          },
          {
            show: true,
            type: 'slider',
            start: 70,
            end: 100,
            // 移动端展示方式
            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
          }
        ],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            axisLine: { onZero: false },
            data: this.form.timeLine
          }
        ],
        yAxis: [
          {
            name: '股票',
            type: 'value',
            scale: true
          },
          {
            name: '大盘',
            type: 'value',
            scale: true
          }
        ],
        series: this.series
      })
    }
  }
}
</script>
