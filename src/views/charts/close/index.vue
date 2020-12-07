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
          :key="tag.ts_code"
          :disable-transitions="false"
          closable
          @close="handleClose(tag)"
        >
          {{ tag.ts_code }} {{ tag.name }}
        </el-tag>
        <el-autocomplete
          v-if="inputVisible"
          ref="saveTagInput"
          v-model="inputValue"
          :fetch-suggestions="querySearchAsync"
          placeholder="请输入内容"
          size="small"
          style="width: 180px;"
          @select="handleSelect($event)"
        ></el-autocomplete>
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
import { fetchAllCompanies } from '@/api/basic'
import { Message } from 'element-ui'

export default {
  name: 'CloseChart',
  components: { Chart },
  data() {
    return {
      listLoading: true,
      companies: [],
      show: false,
      form: {
        ts_code_list: [],
        name_list: [],
        type_list: [],
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
  mounted() {
    this.getAllCompanies()
  },
  activated() {
    this.getAllCompanies()
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
  },
  methods: {
    drawCharts() {
      var ts_code = ''
      for (var i = 0; i < this.dynamicTags.length; i++) {
        ts_code += this.dynamicTags[i].ts_code + ' '
      }
      fetchCompanyClose(ts_code).then(response => {
        this.form.ts_code_list = response.ts_code_list
        this.form.name_list = response.name_list
        this.form.type_list = response.type_list
        this.form.timeLine = response.time_line
        this.form.closeData = response.close_data
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
    querySearchAsync(queryString, cb) {
      var companies = this.companies
      var results = queryString ? companies.filter(this.createContainsFilter(queryString)) : companies
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        cb(results)
      }, 0)
    },
    createContainsFilter(queryString) {
      return (company) => {
        return (company.value.toLowerCase().indexOf(queryString.toLowerCase()) >= 0)
      }
    },
    handleSelect(item) {
      const inputValue = this.inputValue
      this.listLoading = true
      if (inputValue) {
        for (var i = 0; i < this.dynamicTags.length; i++) {
          if (this.dynamicTags[i].ts_code === item.ts_code) {
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
          'ts_code': item.ts_code,
          'name': item.name
        })
        this.form.ts_code_list.push(item.ts_code)
        this.form.name_list.push(item.name)
        this.inputVisible = false
        this.inputValue = ''
      }
    },
    handleBlur() {
      const inputValue = this.inputValue
      var companies = this.companies
      if (inputValue) {
        var results = inputValue ? companies.filter(this.createContainsFilter(inputValue)) : companies
        if (results.length === 1) {
          this.handleSelect(results[0])
        } else {
          this.inputValue = ''
        }
      }
    },
    getAllCompanies() {
      this.listLoading = true
      fetchAllCompanies().then(response => {
        this.listLoading = false
        this.companies = []
        for (const item of response) {
          this.companies.push({
            value: item.ts_code + ' - ' + item.name,
            ts_code: item.ts_code,
            name: item.name
          })
        }
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
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
