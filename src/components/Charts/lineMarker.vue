<template>
  <div :class="className" :id="id" :style="{height:height,width:width}"/>
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'

function splitData(rawData) {
  var categoryData = []
  var values = []
  for (var i = 0; i < rawData.length; i++) {
    categoryData.push(rawData[i].splice(0, 1)[0])
    values.push(rawData[i])
  }
  return {
    categoryData: categoryData,
    values: values
  }
}

function calculateMA(data, dayCount) {
  var result = []
  for (var i = 0, len = data.values.length; i < len; i++) {
    if (i < dayCount) {
      result.push('-')
      continue
    }
    var sum = 0
    for (var j = 0; j < dayCount; j++) {
      sum += data.values[i - j][1]
    }
    result.push(sum / dayCount)
  }
  return result
}

export default {
  name: 'Chart',
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
    },
    autoResize: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      chart: null,
      data: null
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
      this.data = splitData(this.form.histData)
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
      this.initChart()
    },
    initChart: function() {
      var upColor = '#ec0000'
      var upBorderColor = '#8A0000'
      var downColor = '#00da3c'
      var downBorderColor = '#008F28'
      this.chart = echarts.init(document.getElementById(this.id))

      this.chart.setOption({

        title: {
          text: this.form.name + ' ' + this.form.ts_code,
          left: 0
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['日K', 'MA5', 'MA10', 'MA20']
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: this.data.categoryData,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax'
        },
        yAxis: {
          scale: true,
          splitArea: {
            show: true
          }
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
            y: '90%',
            start: 50,
            end: 100,
            // 移动端展示方式
            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
          }
        ],
        series: [
          {
            name: '日K',
            type: 'candlestick',
            data: this.data.values,
            itemStyle: {
              normal: {
                color: upColor,
                color0: downColor,
                borderColor: upBorderColor,
                borderColor0: downBorderColor
              }
            },
            markPoint: {
              label: {
                normal: {
                  formatter: function(param) {
                    return param != null ? Math.round(param.value) : ''
                  }
                }
              },
              data: [
                {
                  name: 'highest value',
                  type: 'max',
                  valueDim: 'highest'
                },
                {
                  name: 'lowest value',
                  type: 'min',
                  valueDim: 'lowest'
                },
                {
                  name: 'average value on close',
                  type: 'average',
                  valueDim: 'close'
                }
              ],
              tooltip: {
                formatter: function(param) {
                  return param.name + '<br>' + (param.data.coord || '')
                }
              }
            },
            markLine: {
              symbol: ['none', 'none'],
              data: [
                [
                  {
                    name: 'from lowest to highest',
                    type: 'min',
                    valueDim: 'lowest',
                    symbol: 'circle',
                    symbolSize: 10,
                    label: {
                      normal: { show: false },
                      emphasis: { show: false }
                    }
                  },
                  {
                    type: 'max',
                    valueDim: 'highest',
                    symbol: 'circle',
                    symbolSize: 10,
                    label: {
                      normal: { show: false },
                      emphasis: { show: false }
                    }
                  }
                ],
                {
                  name: 'min line on close',
                  type: 'min',
                  valueDim: 'close'
                },
                {
                  name: 'max line on close',
                  type: 'max',
                  valueDim: 'close'
                }
              ]
            }
          },
          {
            name: 'MA5',
            type: 'line',
            data: this.form.maData == null ? calculateMA(this.data, 5) : this.form.maData[0],
            smooth: true,
            lineStyle: {
              normal: { opacity: 0.5 }
            }
          },
          {
            name: 'MA10',
            type: 'line',
            data: this.form.maData == null ? calculateMA(this.data, 10) : this.form.maData[1],
            smooth: true,
            lineStyle: {
              normal: { opacity: 0.5 }
            }
          },
          {
            name: 'MA20',
            type: 'line',
            data: this.form.maData == null ? calculateMA(this.data, 20) : this.form.maData[2],
            smooth: true,
            lineStyle: {
              normal: { opacity: 0.5 }
            }
          }
        ]
      })
    }
  }
}
</script>
