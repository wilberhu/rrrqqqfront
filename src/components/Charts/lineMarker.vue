<template>
  <div :class="className" :id="id" :style="{height:height,width:width}"/>
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'

function splitData(rawData) {
  var categoryData = []
  var values = []
  var volumes = []
  for (let i = 0; i < rawData.length; i++) {
    categoryData.push(rawData[i].splice(0, 1)[0])
    values.push(rawData[i])
    volumes.push([i, rawData[i][6], rawData[i][0] > rawData[i][1] ? 1 : -1])
  }
  return {
    categoryData: categoryData,
    values: values,
    volumes: volumes
  }
}

function calculateMA(dayCount, data) {
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
    result.push(+(sum / dayCount).toFixed(3))
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
      var downColor = '#00da3c'

      this.chart = echarts.init(document.getElementById(this.id))

      this.chart.setOption({

        animation: false,
        legend: {
          bottom: 10,
          left: 'center',
          data: [this.form.ts_code, 'MA5', 'MA10', 'MA20', 'MA30']
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          textStyle: {
            color: '#000'
          },
          position: function(pos, params, el, elRect, size) {
            const obj = {
              top: 10
            }
            obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30
            return obj
          }
          // extraCssText: 'width: 170px'
        },
        axisPointer: {
          link: [
            {
              xAxisIndex: 'all'
            }
          ],
          label: {
            backgroundColor: '#777'
          }
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: false
            },
            brush: {
              type: ['lineX', 'clear']
            }
          }
        },
        brush: {
          xAxisIndex: 'all',
          brushLink: 'all',
          outOfBrush: {
            colorAlpha: 0.1
          }
        },
        visualMap: {
          show: false,
          seriesIndex: 5,
          dimension: 2,
          pieces: [
            {
              value: 1,
              color: downColor
            },
            {
              value: -1,
              color: upColor
            }
          ]
        },
        grid: [
          {
            left: '10%',
            right: '8%',
            height: '50%'
          },
          {
            left: '10%',
            right: '8%',
            top: '63%',
            height: '16%'
          }
        ],
        xAxis: [
          {
            type: 'category',
            data: this.data.categoryData,
            scale: true,
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false },
            min: 'dataMin',
            max: 'dataMax',
            axisPointer: {
              z: 100
            }
          },
          {
            type: 'category',
            gridIndex: 1,
            data: this.data.categoryData,
            scale: true,
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            min: 'dataMin',
            max: 'dataMax'
          }
        ],
        yAxis: [
          {
            scale: true,
            splitArea: {
              show: true
            }
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false }
          }
        ],
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1],
            start: 70,
            end: 100
          },
          {
            show: true,
            xAxisIndex: [0, 1],
            type: 'slider',
            top: '85%',
            start: 70,
            end: 100,
            // 移动端展示方式
            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
          }
        ],
        series: [
          {
            name: this.form.ts_code,
            type: 'candlestick',
            data: this.data.values,
            itemStyle: {
              color: upColor,
              color0: downColor,
              borderColor: undefined,
              borderColor0: undefined
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
            tooltip: {
              formatter: function(param) {
                param = param[0]
                return [
                  'Date: ' + param.name + '<hr size=1 style="margin: 3px 0">',
                  'Open: ' + param.data[0] + '<br/>',
                  'Close: ' + param.data[1] + '<br/>',
                  'Lowest: ' + param.data[2] + '<br/>',
                  'Highest: ' + param.data[3] + '<br/>',
                  'Change: ' + param.data[4] + '<br/>',
                  'PctChg: ' + param.data[5] + '<br/>'
                ].join('')
              }
            }
          },
          {
            name: 'MA5',
            type: 'line',
            data: calculateMA(5, this.data),
            smooth: true,
            lineStyle: {
              opacity: 0.5
            }
          },
          {
            name: 'MA10',
            type: 'line',
            data: calculateMA(10, this.data),
            smooth: true,
            lineStyle: {
              opacity: 0.5
            }
          },
          {
            name: 'MA20',
            type: 'line',
            data: calculateMA(20, this.data),
            smooth: true,
            lineStyle: {
              opacity: 0.5
            }
          },
          {
            name: 'MA30',
            type: 'line',
            data: calculateMA(30, this.data),
            smooth: true,
            lineStyle: {
              opacity: 0.5
            }
          },
          {
            name: 'Volume',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.data.volumes
          }
        ]
      })
    }
  }
}
</script>
