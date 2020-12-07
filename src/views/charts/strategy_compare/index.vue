<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form">
      <el-form-item v-if="show">
        <div @click="prev">
          <svg-icon icon-class="left-arrow" class="icon-left-arrow" />
        </div>
      </el-form-item>
      <el-form-item label="">
        <el-tag
          v-for="tag in dynamicTags"
          :key="tag.id"
          :disable-transitions="false"
          closable
          @close="handleClose(tag)"
        >
          {{ tag.id }} {{ tag.title }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="saveTagInput"
          v-model="inputValue"
          class="input-new-tag"
          size="small"
          @keyup.enter.native="$event.target.blur"
          @blur="handleInputConfirm"
        />
        <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>

        <el-button type="primary" @click="drawCharts">submit</el-button>
      </el-form-item>
    </el-form>
    <Chart ref="Chart" :form="form" height="calc(100vh - 184px)" width="100%" />
  </div>
</template>

<script>
import Chart from '@/components/Charts/strategyCompareMarker'
import { fetchStrategyCompare, fetchItem } from '@/api/strategy'
import { Message } from 'element-ui'

export default {
  name: 'StrategyCompareChart',
  components: { Chart },
  data() {
    return {
      show: false,
      form: {
        strategyIds: [],
        strategyTitles: [],
        timeLine: [],
        strategyData: []
      },
      dynamicTags: [],
      inputVisible: false,
      inputValue: ''
    }
  },
  activated() {
    if (this.$route.params.codes) {
      this.show = true
      this.dynamicTags = []
      for (var i = 0; i < this.$route.params.codes.length; i++) {
        this.dynamicTags.push({
          'id': this.$route.params.codes[i].id,
          'title': this.$route.params.codes[i].title
        })
      }
      this.drawCharts()
    } else {
      this.show = false
    }
  },
  methods: {
    drawCharts() {
      var code = ''
      for (var i = 0; i < this.dynamicTags.length; i++) {
        code += this.dynamicTags[i].id + ' '
      }
      fetchStrategyCompare(code).then(response => {
        this.form.strategyIds = response.strategy_ids
        this.form.strategyTitles = response.strategy_titles
        this.form.timeLine = response.time_line
        this.form.strategyData = response.strategy_data
        this.$refs.Chart.draw()
      })
    },
    prev() {
      this.$router.go(-1)
    },
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
    },

    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    handleInputConfirm() {
      const inputValue = this.inputValue
      fetchItem(inputValue).then(result => {
        if (inputValue) {
          if (this.dynamicTags.length >= 10) {
            Message({
              // message: error.message,
              message: 'The companies should be less than 10',
              type: 'error',
              duration: 5 * 1000
            })
            return
          }
          for (var i = 0; i < this.dynamicTags.length; i++) {
            if (this.dynamicTags[i].id === result.id) {
              Message({
                // message: error.message,
                message: 'tag重复，请重新输入',
                type: 'error',
                duration: 5 * 1000
              })
              return
            }
          }
          this.dynamicTags.push({
            'id': result.id,
            'title': result.title
          })
        }
        this.inputVisible = false
        this.inputValue = ''
      }).catch(err => {
        Message({
          // message: err.message,
          message: JSON.parse(JSON.stringify(err)).response.data.detail,
          type: 'error',
          duration: 5 * 1000
        })
      })
    }
  }
}
</script>

<style scoped>
.icon-left-arrow{
  width: 40px;
  height: 40px;
  cursor: pointer;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
