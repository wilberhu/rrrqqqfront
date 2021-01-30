<template>
  <div class="app-container">
    <el-form ref="form" :model="form">
      <el-form-item v-if="show">
        <div @click="prev">
          <svg-icon icon-class="left-arrow" class="icon-left-arrow" />
        </div>
      </el-form-item>
      <el-form-item v-show="false">
        <el-checkbox-group
          v-model="typeList"
          :min="1"
          :max="2">
          <el-checkbox v-for="item in typeOptions" :label="item" :key="item">{{item}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item v-if="typeList.indexOf('fund')>-1" :inline="true" label="fund" label-width="80px">
        <el-tag
          v-for="tag in dynamicTags.fund"
          :key="tag.ts_code"
          :disable-transitions="false"
          closable
          @close="handleClose(tag, 'fund')"
        >
          {{ tag.ts_code }} {{ tag.name }}
        </el-tag>
        <el-autocomplete
          v-if="inputVisible.fund"
          ref="saveTagInputFund"
          v-model="inputValue.fund"
          :fetch-suggestions="((queryString,cb)=>{querySearchAsync(queryString,cb,'fund')})"
          placeholder="请输入内容"
          size="mini"
          style="width: 300px;"
          @select="handleSelect($event, 'fund')"
        ></el-autocomplete>
        <el-button v-else size="mini" @click="showInput('fund')">+ New Tag</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="drawCharts">submit</el-button>
      </el-form-item>
    </el-form>
    <Chart ref="Chart" :form="form" height="calc(100vh - 184px)" width="100%" />
  </div>
</template>

<script>
import Chart from '@/components/Charts/closeMarker'
import { fetchFundNav } from '@/api/histData'
import { fetchAllCompanies, fetchAllIndexes } from '@/api/stockBasic'
import { fetchAllList as fetchAllFunds } from '@/api/fundBasic'
import { Message } from 'element-ui'

export default {
  name: 'NavChart',
  components: { Chart },
  data() {
    return {
      listLoading: true,
      typeOptions: ['fund'],
      typeList: ['fund'],
      datalist: {
        company: [],
        index: [],
        fund: []
      },
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
      dynamicTags: {
        company: [],
        index: [],
        fund: []
      },
      inputVisible: {
        company: false,
        index: false,
        fund: false
      },
      inputValue: {
        company: '',
        index: '',
        fund: ''
      }
    }
  },
  mounted() {
    this.getAllFunds()
  },
  activated() {
    if (this.$route.params.codes) {
      this.show = true
      this.dynamicTags = {
        company: [],
        index: [],
        fund: []
      }
      var typeSet = new Set()
      for (var i = 0; i < this.$route.params.codes.length; i++) {
        typeSet.add(this.$route.params.codes[i].type)
        this.dynamicTags[this.$route.params.codes[i].type].push({
          'ts_code': this.$route.params.codes[i].ts_code,
          'name': this.$route.params.codes[i].name,
          'type': this.$route.params.codes[i].type
        })
      }
      this.typeList = Array.from(typeSet)
      this.drawCharts()
    } else {
      this.show = false
    }
  },
  methods: {
    drawCharts() {
      const data = {
        ts_code_list: [],
        type_list: []
      }
      for (const key of this.typeList) {
        for (let i = 0; i < this.dynamicTags[key].length; i++) {
          data.ts_code_list.push(this.dynamicTags[key][i].ts_code)
          data.type_list.push(key)
        }
      }
      fetchFundNav(data).then(response => {
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
    querySearchAsync(queryString, cb, key) {
      var results = queryString ? this.datalist[key].filter(this.createContainsFilter(queryString)) : this.datalist[key]
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
    getAllCompanies() {
      this.listLoading = true
      fetchAllCompanies().then(response => {
        this.listLoading = false
        this.datalist.company = []
        for (const item of response) {
          this.datalist.company.push({
            value: item.ts_code + ' - ' + item.name,
            ts_code: item.ts_code,
            name: item.name
          })
        }
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },

    getAllIndexes() {
      this.listLoading = true
      fetchAllIndexes().then(response => {
        this.listLoading = false
        this.datalist.index = []
        for (const item of response) {
          this.datalist.index.push({
            value: item.ts_code + ' - ' + item.name,
            ts_code: item.ts_code,
            name: item.name
          })
        }
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    getAllFunds() {
      this.listLoading = true
      fetchAllFunds().then(response => {
        this.listLoading = false
        this.datalist.fund = []
        for (const item of response) {
          this.datalist.fund.push({
            value: item.ts_code + ' - ' + item.name,
            ts_code: item.ts_code,
            name: item.name
          })
        }
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleClose(tag, key) {
      this.dynamicTags[key].splice(this.dynamicTags[key].indexOf(tag), 1)
      this.form.ts_code_list.splice(this.dynamicTags[key].indexOf(tag), 1)
      this.form.name_list.splice(this.dynamicTags[key].indexOf(tag), 1)
      this.form.type_list.splice(this.dynamicTags[key].indexOf(tag), 1)
    },
    handleSelect(item, key) {
      this.listLoading = true
      if (this.inputValue[key]) {
        for (var i = 0; i < this.dynamicTags[key].length; i++) {
          if (this.dynamicTags[key][i].ts_code === item.ts_code) {
            Message({
              // message: error.message,
              message: 'tag重复，请重新输入',
              type: 'error',
              duration: 5 * 1000
            })
            return
          }
        }
        this.dynamicTags[key].push({
          'ts_code': item.ts_code,
          'name': item.name
        })
        this.form.ts_code_list.push(item.ts_code)
        this.form.name_list.push(item.name)
        this.inputVisible[key] = false
        this.inputValue[key] = ''
      }
    },
    showInput(key) {
      this.inputVisible[key] = true
      this.$nextTick(_ => {
        if (key === 'company') {
          this.$refs.saveTagInputCompany.$refs.input.focus()
        } else if (key === 'index') {
          this.$refs.saveTagInputIndex.$refs.input.focus()
        } else if (key === 'fund') {
          this.$refs.saveTagInputFund.$refs.input.focus()
        }
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
