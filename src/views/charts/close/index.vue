<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form">
      <el-form-item v-if="show">
        <div @click="prev">
          <svg-icon icon-class="left-arrow" class="icon-left-arrow" />
        </div>
      </el-form-item>
      <el-form-item label="">
        <!--<el-select
          v-model="select_codes"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="Select Companies">
          <el-option
            v-for="item in codes_option"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>-->
        <el-tag
          v-for="tag in dynamicTags"
          :key="tag.ts_code"
          :disable-transitions="false"
          closable
          @close="handleClose(tag)"
        >
          {{ tag.ts_code }} {{ tag.name }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="saveTagInput"
          v-model="inputValue"
          class="input-new-tag"
          size="small"
          @keyup.enter.native="handleInputConfirm"
          @blur="handleInputConfirm"
        />
        <el-button v-else size="mini" @click="showInput">+ New Tag</el-button>

        <el-button type="primary" size="mini" @click="drawCharts">submit</el-button>
      </el-form-item>
    </el-form>
    <Chart ref="Chart" :form="form" height="calc(100vh - 184px)" width="100%" />
  </div>
</template>

<script>
import Chart from '@/components/Charts/closeMarker'
import { fetchCompanyClose } from '@/api/histData'
import { fetchItemDetail } from '@/api/basic'
import { Message } from 'element-ui'

export default {
  name: 'CloseChart',
  components: { Chart },
  data() {
    return {
      show: false,
      form: {
        companyCode: [],
        companyName: [],
        type: [],
        timeLine: [],
        closeData: []
      },
      // select_codes: [],
      // codes_option: []
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
          'ts_code': this.$route.params.codes[i].ts_code,
          'name': this.$route.params.codes[i].name
        })
      }
      this.drawCharts()
    } else {
      this.show = false
    }
    // this.getCompaniesMarkets()
  },
  methods: {
    drawCharts() {
      var ts_code = ''
      for (var i = 0; i < this.dynamicTags.length; i++) {
        ts_code += this.dynamicTags[i].ts_code + ' '
      }
      fetchCompanyClose(ts_code).then(response => {
        this.form.companyCode = response.company_code
        this.form.companyName = response.company_name
        this.form.type = response.type
        this.form.timeLine = response.time_line
        this.form.closeData = response.close_data
        this.$refs.Chart.draw()
      })
    },
    prev() {
      this.$router.go(-1)
    },
    /*
    getCompaniesMarkets() {
      this.listLoading = true
      fetchAllCompaniesMarkets().then(response => {
        this.listLoading = false
        this.codes_option = []
        for (var i = 0; i < response.results.length; i++) {
          this.codes_option.push({
            key: response.results[i].code,
            value: response.results[i].code + ' ' + response.results[i].name
          })
        }

        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    */
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
      this.listLoading = true
      fetchItemDetail({ pk: inputValue }).then(result => {
        this.listLoading = false
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
            if (this.dynamicTags[i].ts_code === result.ts_code) {
              Message({
                // message: error.message,
                message: 'tag重复，请重新输入',
                type: 'error',
                duration: 5 * 1000
              })
              return
            }
          }
          console.log(result)
          this.dynamicTags.push({
            'ts_code': result.ts_code,
            'name': result.name
          })
        }
        this.inputVisible = false
        this.inputValue = ''
      }).catch(err => {
        Message({
          message: err.message,
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
