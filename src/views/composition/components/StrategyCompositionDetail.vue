<template>
  <div class="app-container">
    <el-form ref="compositionForm" label-position="left" :model="compositionForm" style="padding: 0 20px;">
      <el-row :gutter="8">
        <el-col :xs="{span: 24}" :sm="{span: 6}" :md="{span: 6}" :lg="{span: 6}" :xl="{span: 6}">
          <el-form-item label="组合名称" label-width="120px" v-if="isEdit">
            <el-tooltip class="item" :content="compositionForm.description" :disabled="!compositionForm.description" placement="bottom">
              <span>{{compositionForm.name}}</span>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="资金总额" label-width="120px">
            <el-input type="number" v-model="compositionForm.allfund" placeholder="请输入内容"></el-input>
          </el-form-item>
          <el-form-item label="手续费" label-width="120px">
            <el-input type="number" :step="0.0001" min="0" max="0.1" v-model="compositionForm.commission" placeholder="eg: 0.0005"></el-input>
          </el-form-item>
          <div style="height: 540px; overflow: auto; border:1px solid #cccccc; border-radius:10px; padding-top: 10px;" >
            <el-timeline :reverse="false">
              <el-timeline-item
                v-for="(activity, activity_index) in compositionForm.activities"
                :key="activity_index"
                :timestamp="activity.timestamp">
                <div v-for="(company, company_index) in activity.companies.slice(0,2)" :key="company_index">
                  {{ companyDict[company.ts_code] }}: {{ company.share }}
                </div>
                <span v-if="activity.companies.length>2">
                  ......
                </span>
                <span v-if="activity.freecash < 0" style="color: red; margin-left: 5px;">
                  !
                </span>
                <div class="edit" @click="editTimestamp( activity_index )" >
                  <i class="el-icon-edit-outline" />
                </div>
                <div class="destroy" @click="destroyTimestamp( activity_index )" >
                  <i class="el-icon-close" />
                </div>
              </el-timeline-item>
            </el-timeline>
            <div class="add" @click="addTimestamp()" >
              <i class="el-icon-circle-plus" />
            </div>
          </div>
          <el-button
            style="margin:20px 0;"
            class="code-button-item"
            type="primary"
            @click.native.prevent="saveCompositionVisible=true"
          >Save Composition</el-button>
        </el-col>
        <el-col :xs="{span: 24}" :sm="{span: 18}" :md="{span: 18}" :lg="{span: 18}" :xl="{span: 18}" style="margin-bottom:30px;">
          <el-row v-show="lineChartData.time_line.length>0">
            <el-form-item label="Benchmark" label-width="120px" style="margin-left: 20px;">
              <el-autocomplete
                v-model="benchmarkForm.ts_code"
                :fetch-suggestions="querySearchAsyncBenchmark"
                placeholder="请输入内容"
                style="width: 220px;"
                clearable
                @select="handleSelectBenchmark($event)"
                @input="handleInputBenchmark($event)"
              >
                <template slot="suffix">{{ benchmarkForm.name }}</template>
              </el-autocomplete>
            </el-form-item>
          </el-row>
          <el-row v-show="lineChartData.time_line.length>0">
            <el-form-item label="Company" label-width="120px" style="margin-left: 20px;">
              <el-cascader
                placeholder="Search"
                :options="companyOptions"
                :props="{ checkStrictly: false }"
                clearable
                @change="handleSelectCompany($event)"
                @clear="handleClearCompany($event)"
                filterable></el-cascader>
            </el-form-item>
          </el-row>
          <el-row>
            <line-chart ref="lineChart"/>
          </el-row>
        </el-col>
      </el-row>
      <el-row>
        <strategy-portfolio :portfolio="portfolio"/>
      </el-row>
    </el-form>

    <!-- 编辑弹出框 -->
    <el-dialog :visible.sync="editVisible" :title="isTimestampEdit ? 'Edit' : 'Add'" width="80vw" center>
      <el-form ref="compositionForm" :model="activityForm" class="edit_dialog">
        <el-form-item label="资金总额" label-width="120px">
          <el-input type="number" readonly="readonly" v-model="activityForm.allfund" placeholder="请输入内容" style="width: 220px;"></el-input>
        </el-form-item>
        <el-form-item label="日期" label-width="120px">
          <el-date-picker
            :picker-options="datePickerOptions"
            :readonly="isTimestampEdit?'readonly':false"
            v-model="activityForm.timestamp"
            format="yyyyMMdd"
            value-format="yyyyMMdd"
            type="date"
            aria-required="true"
            placeholder="选择日期"
            @blur="computeActivity($event, activityForm, null)"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="股票份额" label-width="120px">
          <el-form-item style="margin: 5px 0" v-for="(company, company_index) in activityForm.companies" :key="company_index">
            <el-autocomplete
              v-model="activityForm.companies[company_index].ts_code"
              :fetch-suggestions="querySearchAsync"
              placeholder="请输入内容"
              style="width: 220px;"
              @select="handleSelect($event, company_index)"
            >
              <template slot="suffix">{{ companyDict[activityForm.companies[company_index].ts_code] }}</template>
            </el-autocomplete>
            <span style="margin-left: 20px;">股数：</span>
            <el-input type="number" min="0" :readonly="false" v-model="company.share" placeholder="请输入内容" style="width: 100px;" @input="computeActivity($event, activityForm, company_index)"></el-input>
            <span style="margin-left: 20px;">股价：{{ activityForm.companies[company_index].open || '' }}</span>
            <span style="margin-left: 20px;">资金：{{ activityForm.companies[company_index].allfund || '' }}</span>
            <el-button
              type="text"
              icon="el-icon-delete"
              style="margin-left: 20px;"
              @click="deleteCompany($event, company_index)"
            >remove
            </el-button>
          </el-form-item>
          <el-button style="margin-top: 10px;" type="primary" plain @click="addCompany()">Add</el-button>

          <el-button v-if="activityForm.timestamp && compositionForm.activities.length > 1 && activityForm.timestamp > compositionForm.activities[0].timestamp" style="margin-left: 30px; margin-top: 10px;" type="info" plain @click="importPreviousPosition">Import previous position</el-button>
        </el-form-item>
        <el-form-item label="空闲资金" label-width="120px" style="margin: 10px 0 0 0;">
          <el-input v-model="activityForm.freecash" :readonly="'readonly'" style="width: 220px;" />
        </el-form-item>
        <el-form-item label-width="120px">
          <span class="dialog-footer">
            <el-button style="margin-top: 10px;" size="small" type="primary" @click="submitTimestamp">Submit</el-button>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 删除提示框 -->
    <el-dialog :visible.sync="delVisible" title="Delete" width="300px" center>
      <div class="del-dialog-cnt">Are you confirm to remove the data?</div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmDestroyTimestamp">OK</el-button>
        <el-button @click="delVisible = false">Cancel</el-button>
      </span>
    </el-dialog>

    <!-- 保存弹出框 -->
    <el-dialog :visible.sync="saveCompositionVisible" :title="isEdit ? 'Edit' : 'Add'" width="80vw" center>
      <el-form ref="compositionForm" :model="compositionForm" :rules="rules">
        <el-form-item label="组合名称" label-width="120px" prop="name">
          <el-input v-model="compositionForm.name" placeholder="请输入名称" style="width: 220px;" />
        </el-form-item>
        <el-form-item label="组合介绍" label-width="120px">
          <el-input v-model="compositionForm.description" type="textarea" placeholder="请输入介绍" style="width: 220px;" />
        </el-form-item>
        <el-form-item label-width="120px">
          <span class="dialog-footer">
            <el-button style="margin-top: 10px;" size="small" type="primary" @click="saveComposition('compositionForm')">Submit</el-button>
            <el-button size="small" @click="saveCompositionVisible=false">Cancel</el-button>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { fetchAllCompanies, fetchAllIndexes } from '@/api/stockBasic'
import { getIndexHistData, getCompanyHistData } from '@/api/histData'
import { calculateComposition, calculateActivity, fetchItem, createItem, updateItem, fetchTradeCalender } from '@/api/composition'
import LineChart from './LineChart'
import StrategyPortfolio from './StrategyPortfolio'

let tradeCalender = []
// const formatDate = function(timestamp, format = 'yyyy-MM-dd hh:mm:ss') {
const formatDate = function(timestamp, format = 'yyyyMMdd') {
  const date = new Date(timestamp)
  const o = {
    'y+': date.getFullYear(),
    'M+': date.getMonth() + 1, // 月份 "d+": value.getDate(), // 日
    'd+': date.getDate(),
    'h+': date.getHours(), // 小时 "m+": value.getMinutes(), // 分 "s+": value.getSeconds(), // 秒
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return format
}

export default {
  name: 'StrategyCompositionDetail',
  components: {
    StrategyPortfolio,
    LineChart
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    portfolio: {
      type: Object,
      default: undefined
    }
  },
  data() {
    return {
      companies: [],
      companyDict: {},
      compositionForm: {
        id: undefined,
        name: 'composition',
        description: undefined,
        allfund: 100000000,
        commission: 0.0001,
        activities: []
      },
      activityForm: {
        companies: [],
        timestamp: undefined,
        freecash: undefined,
        allfund: undefined
      },
      deleteTimestampForm: {
        index: undefined
      },
      benchmarkForm: {
        ts_code: undefined,
        name: undefined,
        type: 'index',
        histData: null,
        maData: null
      },
      benchmarkData: {
        ts_code: null,
        name: null,
        histData: null
      },
      benchmarkDatalist: {
        company: [],
        index: [],
        fund: []
      },
      reverse: true,
      lineChartData: {
        time_line: [],
        ts_code_list: [],
        close_data: []
      },
      downloadLoading: false,
      editVisible: false,
      isTimestampEdit: false,
      delVisible: false,
      saveCompositionVisible: false,
      datePickerOptions: {
        disabledDate(date) {
          return tradeCalender.indexOf(formatDate(date, 'yyyyMMdd')) === -1
        }
      },
      rules: {
        name: [
          { required: true, message: '请输入组合名称', trigger: 'blur' },
          { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
        ]
      },
      tempRoute: {},
      companyOptions: []
    }
  },
  mounted() {
    this.getAllIndexes()
  },
  async created() {
    await this.getAllCompanies()
    this.$emit('getAllCompaniesDone', true)
    this.getTradeCalender()

    if (this.isEdit) {
      this.compositionForm.id = this.$route.params && this.$route.params.id
      this.compositionForm = Object.assign({}, await this.fetchData(this.compositionForm.id))
    }
    this.updateCompanyOptions()
    await this.updateState()

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      return new Promise(resolve => {
        fetchItem(id).then(response => {
          // set tagsview title
          this.setTagsViewTitle()
          // set page title
          this.setPageTitle()

          resolve(response)
          setTimeout(() => {
          }, 1.5 * 1000)
        })
      })
    },
    async submit() {
      await this.updateState()
    },
    addTimestamp() {
      this.activityForm = {
        companies: [],
        timestamp: undefined,
        freecash: undefined,
        allfund: undefined
      }
      this.editVisible = true
      this.isTimestampEdit = false
    },
    importPreviousPosition() {
      for (var activity of this.compositionForm.activities) {
        if (this.activityForm.timestamp >= activity.timestamp) {
          this.activityForm.companies = Object.assign([], activity.companies)
        }
      }
    },
    editTimestamp(index) {
      this.activityForm = Object.assign({}, this.compositionForm.activities[index])
      this.editVisible = true
      this.isTimestampEdit = true
      this.computeActivity(null, this.activityForm, null)
    },
    async submitTimestamp() {
      if (this.activityForm.timestamp == null || this.activityForm.timestamp === '') {
        this.$message({
          showClose: true,
          message: 'Timestamp cannot be null',
          type: 'Error'
        })
        return
      }
      if (isNaN(this.activityForm.freecash) || this.activityForm.freecash < 0) {
        this.$message({
          showClose: true,
          message: 'Free cash less than 0',
          type: 'Error'
        })
        return
      }
      const companyList = []
      for (const item of this.activityForm.companies) {
        if (!item.ts_code || item.ts_code === '') {
          this.$message({
            showClose: true,
            message: 'Company name cannot be null',
            type: 'Error'
          })
          return
        }
        if (item.share === '' || item.share <= 0) {
          this.$message({
            showClose: true,
            message: 'Company share cannot be less than 0',
            type: 'Error'
          })
          return
        }
        if (companyList.indexOf(item.ts_code) !== -1) {
          this.$message({
            showClose: true,
            message: 'Companies duplicated',
            type: 'Error'
          })
          return
        } else {
          companyList.push(item.ts_code)
        }
      }
      if (this.isTimestampEdit) {
        // ///////////////////
        // edit an activity //
        // ///////////////////
        for (let i = 0; i < this.compositionForm.activities.length; i++) {
          if (this.activityForm.timestamp === this.compositionForm.activities[i].timestamp) {
            this.compositionForm.activities.splice(i, 1, this.activityForm)
            this.editVisible = false
            await this.updateState()
            return
          }
        }
      } else {
        for (let i = 0; i < this.compositionForm.activities.length; i++) {
          if (this.activityForm.timestamp > this.compositionForm.activities[i].timestamp) {
            continue
          } else if (this.activityForm.timestamp === this.compositionForm.activities[i].timestamp) {
            this.$message({
              showClose: true,
              message: 'Timestamp duplicated',
              type: 'Error'
            })
            await this.updateState()
            return
          } else {
            // //////////////////
            // add an activity //
            // //////////////////
            this.compositionForm.activities.splice(i, 0, this.activityForm)
            this.editVisible = false

            // check the later date freecash >= 0
            for (let j = i; j < this.compositionForm.activities.length; j++) {
              this.computeActivity(null, this.compositionForm.activities[j], null)
              if (this.compositionForm.activities[j].freecash < 0) {
                this.$message({
                  showClose: true,
                  message: 'the later date freecash less than 0',
                  type: 'Error'
                })
                return
              }
            }
            // check end
            await this.updateState()
            return
          }
        }
        // //////////////////
        // add an activity //
        // //////////////////
        this.compositionForm.activities.splice(this.compositionForm.activities.length, 0, this.activityForm)
        this.editVisible = false
        await this.updateState()
      }
    },
    destroyTimestamp(index) {
      this.deleteTimestampForm.index = index
      this.delVisible = true
    },
    async confirmDestroyTimestamp() {
      this.compositionForm.activities.splice(this.deleteTimestampForm.index, 1)
      this.delVisible = false
      await this.updateState()
    },
    addCompany(item) {
      this.activityForm.companies.push({
        name: '',
        ts_code: '',
        share: 0
      })
    },
    deleteCompany(item, company_index) {
      this.activityForm.companies.splice(company_index, 1)
      this.activityForm.freecash = this.activityForm.allfund - this.activityForm.companies.reduce((total, item) => total + Number(item.allfund || 0), 0)
    },
    querySearchAsync(queryString, cb) {
      const companies = this.companies
      const results = queryString ? companies.filter(this.createContainsFilter(queryString)) : companies
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
    handleSelect(event, company_index) {
      this.activityForm.companies[company_index].ts_code = event.ts_code
      this.activityForm.companies[company_index].name = event.name
      this.computeActivity(null, this.activityForm, company_index)
    },
    computeActivity(event, activityForm, company_index) {
      if (activityForm.timestamp == null || activityForm.timestamp === '') {
        return
      }
      const data = {
        composition: this.compositionForm,
        activity: activityForm,
        index: company_index
      }
      calculateActivity(data).then(response => {
        this.activityForm = Object.assign({}, response)
      })
    },
    async getAllCompanies() {
      return new Promise(resolve => {
        fetchAllCompanies().then(response => {
          this.companies = []
          for (const item of response) {
            this.companies.push({
              value: item.ts_code + ' - ' + item.name,
              ts_code: item.ts_code,
              name: item.name
            })
            this.companyDict[item.ts_code] = item.name
          }
          resolve(response)
          setTimeout(() => {
          }, 1.5 * 1000)
        })
      })
    },
    getTradeCalender() {
      fetchTradeCalender().then(response => {
        tradeCalender = response.results
        setTimeout(() => {
        }, 1.5 * 1000)
      })
    },
    async updateState() {
      return new Promise(resolve => {
        let msg = this.$message({
          duration: 0,
          showClose: false,
          message: 'Update charts'
        })
        calculateComposition(this.compositionForm).then(response => {
          this.lineChartData = Object.assign({}, response)
          this.$refs.lineChart.updateData(this.lineChartData, this.benchmarkData)
          msg.close()
          resolve(response)
          setTimeout(() => {
          }, 1.5 * 1000)
        }).catch(
          error => {
            msg.close()
            msg = this.$message({
              showClose: true,
              message: error,
              type: 'Error'
            })
          }
        )
      })
    },
    setTagsViewTitle() {
      const title = 'Edit Composition'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.compositionForm.id}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Edit Composition'
      document.title = `${title} - ${this.compositionForm.id}`
    },
    saveComposition(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.isEdit) {
            updateItem(this.compositionForm.id, this.compositionForm)
              .then(
                response => {
                  this.compositionForm = Object.assign({}, response)
                  this.$message({
                    message: 'Successful saved composition',
                    type: 'Success'
                  })
                  this.saveCompositionVisible = false
                }
              )
              .catch(
                error => {
                  this.$message({
                    showClose: true,
                    message: error,
                    type: 'Error'
                  })
                }
              )
          } else {
            createItem(this.compositionForm)
              .then(
                response => {
                  this.compositionForm = Object.assign({}, response)
                  this.$message({
                    message: 'Successful saved composition',
                    type: 'Success'
                  })
                  this.saveCompositionVisible = false
                  this.$router.push({
                    path: '/composition/edit/' + this.compositionForm.id
                  })
                }
              )
              .catch(
                error => {
                  this.$message({
                    showClose: true,
                    message: error,
                    type: 'Error'
                  })
                }
              )
          }
        }
      })
    },
    getAllIndexes() {
      this.listLoading = true
      fetchAllIndexes().then(response => {
        this.listLoading = false
        this.benchmarkDatalist.index = []
        for (const item of response) {
          this.benchmarkDatalist.index.push({
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
    querySearchAsyncBenchmark(queryString, cb) {
      var results = queryString ? this.benchmarkDatalist['index'].filter(this.createContainsFilter(queryString)) : this.benchmarkDatalist['index']
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        cb(results)
      }, 0)
    },
    handleSelectBenchmark(event) {
      this.benchmarkForm.ts_code = event.ts_code
      this.benchmarkForm.name = event.name
      this.benchmarkForm.type = 'index'
      this.drawCharts()
    },
    handleClearBenchmark(event) {
      this.benchmarkForm.ts_code = undefined
      this.benchmarkForm.name = undefined
      this.benchmarkForm.type = 'index'
      this.benchmarkData = {
        ts_code: undefined,
        name: undefined,
        histData: undefined
      }
      this.$refs.lineChart.updateData(this.lineChartData, this.benchmarkData, true)
    },
    handleInputBenchmark(event) {
      if (event === '') {
        this.handleClearBenchmark()
      }
    },
    drawCharts() {
      if (this.benchmarkForm.ts_code) {
        if (this.benchmarkForm.type === 'index') {
          getIndexHistData(this.benchmarkForm.ts_code).then(response => {
            this.benchmarkForm.name = response.name
            this.benchmarkForm.histData = response.hist_data
            this.benchmarkForm.maData = response.ma_data

            const indexDate = []
            const indexCloseData = []
            for (const item of this.benchmarkForm.histData) {
              indexDate.push(item[0])
              indexCloseData.push(item[2])
            }

            var histData = []
            for (const item of this.lineChartData.time_line) {
              const tmpIndex = indexDate.indexOf(item)
              if (tmpIndex !== -1) {
                histData.push(indexCloseData[tmpIndex])
              } else {
                histData.push('')
              }
            }
            this.benchmarkData = {
              ts_code: this.benchmarkForm.ts_code,
              name: this.benchmarkForm.name,
              histData: histData
            }
            this.$refs.lineChart.updateData(this.lineChartData, this.benchmarkData)
          })
        } else if (this.benchmarkForm.type === 'company') {
          getCompanyHistData(this.benchmarkForm.ts_code).then(response => {
            this.benchmarkForm.name = response.name
            this.benchmarkForm.histData = response.hist_data
            this.benchmarkForm.maData = response.ma_data

            const companyDate = []
            const companyCloseData = []
            for (const item of this.benchmarkForm.histData) {
              companyDate.push(item[0])
              companyCloseData.push(item[2])
            }

            var histData = []
            for (const item of this.lineChartData.time_line) {
              const tmpIndex = companyDate.indexOf(item)
              if (tmpIndex !== -1) {
                histData.push(companyCloseData[tmpIndex])
              } else {
                histData.push('')
              }
            }
            this.benchmarkData = {
              ts_code: this.benchmarkForm.ts_code,
              name: this.benchmarkForm.name,
              histData: histData
            }
            this.$refs.lineChart.updateData(this.lineChartData, this.benchmarkData)
          })
        }
      }
    },
    updateCompanyOptions() {
      this.companyOptions = []
      for (const item of this.compositionForm.activities) {
        const children = []
        for (const company of item.companies) {
          children.push({
            value: company.ts_code,
            label: company.ts_code + ' - ' + this.companyDict[company.ts_code]
          })
        }
        this.companyOptions.push({
          value: item.timestamp,
          label: item.timestamp,
          children: children
        })
      }
    },
    handleSelectCompany(event) {
      this.benchmarkForm.ts_code = event[1]
      this.benchmarkForm.name = this.companyDict[event[1]]
      this.benchmarkForm.type = 'company'
      this.drawCharts()
    },
    handleClearCompany(event) {
      this.benchmarkForm.ts_code = undefined
      this.benchmarkForm.name = undefined
      this.benchmarkForm.type = 'company'
      this.benchmarkData = {
        ts_code: undefined,
        name: undefined,
        histData: undefined
      }
      this.$refs.lineChart.updateData(this.lineChartData, this.benchmarkData, true)
    }
  }
}
</script>

<style scoped>
  .el-timeline-item .destroy {
    display: none;
    position: absolute;
    right: 20px;
    bottom: -5px;
    margin: auto 0;
    font-size: 25px;
    color: #F44336;
    transition: color 0.2s ease-out;
    cursor: pointer;
  }
  .el-timeline-item .destroy:hover {
    color: #FFFFFF;
    background-color: #F44336;
  }
  .el-timeline-item .destroy:after {
    content: '';
  }
  .el-timeline-item:hover .destroy {
    display: block;
  }
  .el-timeline-item .edit {
    display: none;
    position: absolute;
    right: 50px;
    bottom: -5px;
    margin: auto 0;
    font-size: 25px;
    color: #2196F3;
    transition: color 0.2s ease-out;
    cursor: pointer;
  }
  .el-timeline-item .edit:hover {
    color: #FFFFFF;
    background-color: #2196F3;
  }
  .el-timeline-item .edit:after {
    content: '';
  }
  .el-timeline-item:hover .edit {
    display: block;
  }
  .add {
    display: block;
    margin-left: 35px;
    /*margin: auto 0;*/
    font-size: 25px;
    color: #4CAF50;
    transition: color 0.2s ease-out;
    cursor: pointer;
  }
  .add:hover {
    color: #388E3C;
  }
  .add:after {
    content: '';
  }
  .edit_dialog {
    height: 60vh;
    overflow: auto;
  }
</style>
