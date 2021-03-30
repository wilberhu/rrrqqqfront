<template>
  <div class="app-container">
    <el-tabs v-model="stockPickingForm.method" @tab-click="handleTabClick">
      <el-tab-pane label="factor" name="factor">
        <el-form ref="filterForm" label-position="left" label-width="160px" :model="factorForm" style="padding: 0 20px;">
          <el-row :gutter="8">
            <el-col :xs="{span: 24}" :sm="{span: 6}" :md="{span: 6}" :lg="{span: 6}" :xl="{span: 6}" style="padding-right:8px;margin-bottom:30px;">
              <el-button
                :loading="loading"
                class="code-button-item"
                type="primary"
                @click.native.prevent="editFactorVisible=true; makeFilterListChecked()"
              >Pick Filter</el-button>
              <el-form-item label="开始日期">
                <el-date-picker
                  :picker-options="datePickerOptions"
                  v-model="factorForm.startTime"
                  format="yyyyMMdd"
                  value-format="yyyyMMdd"
                  type="date"
                  aria-required="true"
                  placeholder="选择日期"
                >
                </el-date-picker>
              </el-form-item>
              <el-form-item label="结束日期">
                <el-date-picker
                  :picker-options="datePickerOptions"
                  v-model="factorForm.endTime"
                  format="yyyyMMdd"
                  value-format="yyyyMMdd"
                  type="date"
                  aria-required="true"
                  placeholder="选择日期"
                >
                </el-date-picker>
              </el-form-item>
              <el-form-item v-for="(filter, filter_index) in factorForm.filterList" :key="filter_index + '_filter'" style="white-space: nowrap">
                <span slot="label">
                  <span style="display:inline-block; width:120px;">{{filter.label}}</span>
                  <el-popover
                    placement="bottom"
                    width="200"
                    v-model="filter.visible">
                    <el-switch
                      v-model="filter.match"
                      active-text="or"
                      inactive-text="and"
                      active-value="or"
                      inactive-value="and">
                    </el-switch>
                    <el-checkbox v-for="(match_option, match_option_index) in matchOptions" :label="match_option.key" :key="filter_index + '_' + match_option_index" v-model="filter.filterConditionListString">{{match_option.label}}</el-checkbox>
                    <div style="text-align: right; margin: 0">
                      <el-button size="mini" type="text" @click="filter.visible = false">取消</el-button>
                      <el-button type="primary" size="mini" @click="filter.visible = false; submitMatchOption(filter_index, filter.filterConditionListString)">确定</el-button>
                    </div>
                    <div class="edit" slot="reference" style="display:inline-block" @click="makeMatchOptionChecked(filter_index)" >
                      <i class="el-icon-edit" />
                    </div>
                  </el-popover>
                </span>
                <template v-for="(filter_condition, filter_condition_index) in filter.filterConditionList" style="white-space: nowrap;">
                  <el-input placeholder="value" v-model="filter_condition.value" :key="filter_index + '_' + filter_condition_index" style="margin-right: 10px; width: 140px;">
                    <template slot="prepend">{{filter_condition.symbol}}</template>
                  </el-input>
                  <span :key="filter_condition_index + '_symbol'" v-if="filter_condition_index!==filter.filterConditionList.length-1" style="margin-right: 10px;">{{filter.match}}</span>
                </template>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="strategy" name="strategy">
        <el-form ref="strategyForm" label-position="left" label-width="160px" :model="strategyForm" style="padding: 0 40px;">
          <!-- <el-form-item label-width="0">
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
              size="mini"
              style="width: 180px;"
              @select="handleSelect($event)"
            ></el-autocomplete>
            <el-button v-else size="mini" @click="showInput">+ New Tag</el-button>
          </el-form-item> -->
          <el-form-item label="开始日期">
            <el-date-picker
              :picker-options="datePickerOptions"
              v-model="strategyForm.startTime"
              format="yyyyMMdd"
              value-format="yyyyMMdd"
              type="date"
              aria-required="true"
              placeholder="选择日期"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker
              :picker-options="datePickerOptions"
              v-model="strategyForm.endTime"
              format="yyyyMMdd"
              value-format="yyyyMMdd"
              type="date"
              aria-required="true"
              placeholder="选择日期"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="策略">
            <el-select v-model="strategyForm.strategy" placeholder="请选择">
              <el-option
                v-for="item in strategyOptions"
                :key="item.id"
                :label="item.id + ' - ' + item.title"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <div style="padding: 0 20px;">
      <el-button
        :disabled="calculateDisabled"
        class="code-button-item"
        type="primary"
        @click.native.prevent="calculateFilter()"
      >Calculate</el-button>

      <el-button
        :loading="loading"
        class="code-button-item"
        type="primary"
        @click.native.prevent="saveStockPickingVisible=true"
      >Save StockPicking</el-button>
    </div>

    <hr>

    <strategy-composition-detail ref="compositionDetail" :is-edit="false" :portfolio="portfolio" style="padding:0;" @getAllCompaniesDone="getAllCompaniesDone" />

    <!-- 编辑因子弹出框 -->
    <el-dialog :visible.sync="editFactorVisible" title="Select filters">
      <el-form ref="filterForm" :model="factorForm">
        <el-transfer
          v-model="factorForm.filterListString"
          filterable
          :filter-method="filterMethod"
          filter-placeholder=""
          :titles="['Unselected Filters', 'Selected Filters']"
          :data="filterOptions"
        />
        <el-form-item>
          <span class="dialog-footer">
            <el-button style="margin-top: 10px;" size="small" type="primary" @click="editFactorVisible=false; submitFilterList(factorForm.filterListString)">Submit</el-button>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 保存弹出框 -->
    <el-dialog :visible.sync="saveStockPickingVisible" :title="isEdit ? 'Edit' : 'Add'" width="80vw" center>
      <el-form ref="stockPickingForm" :model="stockPickingForm" :rules="rules">
        <el-form-item label="组合名称" label-width="120px" prop="name">
          <el-input v-model="stockPickingForm.name" placeholder="请输入名称" style="width: 220px;" />
        </el-form-item>
        <el-form-item label="组合介绍" label-width="120px">
          <el-input v-model="stockPickingForm.description" type="textarea" placeholder="请输入介绍" style="width: 220px;" />
        </el-form-item>
        <el-form-item label-width="120px">
          <span class="dialog-footer">
            <el-button style="margin-top: 10px;" size="small" type="primary" @click="saveStockPicking('stockPickingForm')">Submit</el-button>
            <el-button size="small" @click="saveStockPickingVisible=false">Cancel</el-button>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { fetchItem, createItem, updateItem } from '@/api/stockPicking'
import { fetchTradeCalender } from '@/api/composition'
import { fetchAllList as fetchFilterOptionList } from '@/api/filterOption'
import { fetchAllList as fetchStrategyList, factorFilter, strategyFilter } from '@/api/strategy'
import { Message } from 'element-ui'
import StrategyCompositionDetail from '../../composition/components/StrategyCompositionDetail'

const end = new Date()
const start = new Date(end.getTime() - 3600 * 1000 * 24 * 365)
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
  name: 'StockPickingDetail',
  components: { StrategyCompositionDetail },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      filterOptions: [],
      strategyOptions: [],
      matchOptions: [
        {
          key: 'gt',
          label: 'greater than',
          symbol: '>',
          value: 0
        },
        {
          key: 'lt',
          label: 'less than',
          symbol: '<',
          value: 0
        },
        {
          key: 'gte',
          label: 'greater than or equal',
          symbol: '≥',
          value: 0
        },
        {
          key: 'lte',
          label: 'less than or equal',
          symbol: '≤',
          value: 0
        },
        {
          key: 'eq',
          label: 'equal',
          symbol: '=',
          value: 0
        }
      ],
      factorForm: {
        allfund: undefined,
        commission: undefined,
        startTime: formatDate(start, 'yyyyMMdd'),
        endTime: formatDate(end, 'yyyyMMdd'),
        filterListString: [],
        filterList: []
      },
      editFactorVisible: false,
      loading: false,
      calculateDisabled: true,
      datePickerOptions: {
        disabledDate(date) {
          return tradeCalender.indexOf(formatDate(date, 'yyyyMMdd')) === -1
        }
      },
      filterMethod(query, item) {
        return item.label.indexOf(query) > -1
      },

      strategyForm: {
        allfund: undefined,
        commission: undefined,
        startTime: formatDate(start, 'yyyyMMdd'),
        endTime: formatDate(end, 'yyyyMMdd'),
        strategy: undefined,
        ts_code_list: [],
        name_list: []
      },
      dynamicTags: [],
      inputVisible: false,
      inputValue: '',

      saveStockPickingVisible: false,
      stockPickingForm: {
        id: undefined,
        name: undefined,
        description: undefined,
        start_time: undefined,
        method: 'factor',
        filter: {}
      },
      rules: {
        name: [
          { required: true, message: '请输入组合名称', trigger: 'blur' },
          { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
        ]
      },
      tempRoute: {},
      portfolio: {
        df: {},
        columns: [],
        path: undefined
      }
    }
  },
  mounted() {
  },
  created() {
    if (this.isEdit) {
      this.stockPickingForm.id = this.$route.params && this.$route.params.id
      this.fetchData(this.stockPickingForm.id)
    } else {
      this.updateState()
    }

    this.getTradeCalender()
    this.getFilterOptions()
    this.getStrategyOptions()

    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    handleTabClick(tab, event) {
      // console.log(tab, event)
    },
    getTradeCalender() {
      fetchTradeCalender().then(response => {
        tradeCalender = response.results
        setTimeout(() => {
        }, 1.5 * 1000)
      })
    },
    getFilterOptions() {
      fetchFilterOptionList().then(response => {
        this.filterOptions = response
        for (const filterOption of this.filterOptions) {
          filterOption['match'] = 'and'
          filterOption['filterConditionListString'] = []
          filterOption['filterConditionList'] = []
        }
        setTimeout(() => {
        }, 1.5 * 1000)
      })
    },
    getStrategyOptions() {
      fetchStrategyList().then(response => {
        this.strategyOptions = response
        setTimeout(() => {
        }, 1.5 * 1000)
      })
    },
    fetchData(id) {
      fetchItem(id).then(response => {
        // set tagsview title
        this.setTagsViewTitle()
        // set page title
        this.setPageTitle()
        this.stockPickingForm = Object.assign({}, response)
        if (this.stockPickingForm.method === 'factor') {
          this.factorForm = Object.assign({}, this.stockPickingForm.filter)
        } else if (this.stockPickingForm.method === 'strategy') {
          this.strategyForm = Object.assign({}, this.stockPickingForm.filter)
          for (var i = 0; i < this.strategyForm.ts_code_list.length; i++) {
            this.dynamicTags.push({
              'ts_code': this.strategyForm.ts_code_list[i],
              'name': this.strategyForm.name_list[i]
            })
          }
        }
        this.updateState()
      })
    },
    async calculateFilter() {
      if (this.stockPickingForm.method === 'factor') {
        this.calculateDisabled = true
        this.factorForm.allfund = this.$refs.compositionDetail.compositionForm.allfund
        this.factorForm.commission = this.$refs.compositionDetail.compositionForm.commission
        const msg = this.$message({
          duration: 0,
          showClose: false,
          message: 'Processing'
        })
        factorFilter(this.factorForm)
          .then(async response => {
            msg.close()
            this.portfolio = {
              df: {},
              columns: [],
              path: undefined
            }
            this.$refs.compositionDetail.compositionForm.activities = Object.assign([], response.activities)
            await this.$refs.compositionDetail.updateState()
            this.calculateDisabled = false
          })
          .catch(error => {
            msg.close()
            this.$message({
              showClose: true,
              message: error,
              type: 'Error'
            })
            this.calculateDisabled = false
          })
      } else if (this.stockPickingForm.method === 'strategy') {
        this.calculateDisabled = true
        this.strategyForm.allfund = this.$refs.compositionDetail.compositionForm.allfund
        this.strategyForm.commission = this.$refs.compositionDetail.compositionForm.commission
        const msg = this.$message({
          duration: 0,
          showClose: false,
          message: 'Processing'
        })
        strategyFilter(this.strategyForm)
          .then(async response => {
            msg.close()
            this.portfolio = Object.assign({}, response)
            this.$refs.compositionDetail.compositionForm.activities = Object.assign([], response.activities)
            await this.$refs.compositionDetail.updateState()
            this.calculateDisabled = false
          })
          .catch(error => {
            msg.close()
            this.$message({
              showClose: true,
              message: error,
              type: 'Error'
            })
            this.calculateDisabled = false
          })
      }
    },
    makeFilterListChecked() {
      this.factorForm.filterListString = []
      for (const filter of this.factorForm.filterList) {
        this.factorForm.filterListString.push(filter.key)
      }
    },
    submitFilterList(filterListString) {
      const temp = Object.assign([], this.factorForm.filterList)
      this.factorForm.filterList = []
      for (const filter of filterListString) {
        const filterOptionIndex1 = this.indexOf(temp, filter)
        const filterOptionIndex2 = this.indexOf(this.filterOptions, filter)
        if (filterOptionIndex1 > -1) {
          this.factorForm.filterList.push(Object.assign({}, temp[filterOptionIndex1]))
        } else if (filterOptionIndex2 > -1) {
          this.factorForm.filterList.push(Object.assign({}, this.filterOptions[filterOptionIndex2]))
        }
      }
    },
    makeMatchOptionChecked(filter_index) {
      this.factorForm.filterList[filter_index].filterConditionListString = []
      for (const filterCondition of this.factorForm.filterList[filter_index].filterConditionList) {
        this.factorForm.filterList[filter_index].filterConditionListString.push(filterCondition.key)
      }
    },
    submitMatchOption(filter_index, filterConditionListString) {
      const temp = Object.assign([], this.factorForm.filterList[filter_index].filterConditionList)
      this.factorForm.filterList[filter_index].filterConditionList = []
      for (const filterCondition of filterConditionListString) {
        const matchOptionIndex1 = this.indexOf(temp, filterCondition)
        const matchOptionIndex2 = this.indexOf(this.matchOptions, filterCondition)
        if (matchOptionIndex1 > -1) {
          this.factorForm.filterList[filter_index].filterConditionList.push(Object.assign({}, temp[matchOptionIndex1]))
        } else if (matchOptionIndex2 > -1) {
          this.factorForm.filterList[filter_index].filterConditionList.push(Object.assign({}, this.matchOptions[matchOptionIndex2]))
        }
      }
    },
    indexOf(list, key) {
      for (let i = 0; i < list.length; i++) {
        if (list[i].key === key) {
          return i
        }
      }
      return -1
    },
    updateState() {
    },
    setTagsViewTitle() {
      const title = 'Edit Stock Picking'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.stockPickingForm.id}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Edit Stock Picking'
      document.title = `${title} - ${this.stockPickingForm.id}`
    },
    saveStockPicking(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.stockPickingForm.method === 'factor') {
            this.stockPickingForm.filter = Object.assign({}, this.factorForm)
            this.stockPickingForm.start_time = this.factorForm.startTime
            this.stockPickingForm.end_time = this.factorForm.endTime
          } else if (this.stockPickingForm.method === 'strategy') {
            this.stockPickingForm.filter = Object.assign({}, this.strategyForm)
            this.stockPickingForm.start_time = this.strategyForm.startTime
            this.stockPickingForm.end_time = this.strategyForm.endTime
          }
          if (this.isEdit) {
            updateItem(this.stockPickingForm.id, this.stockPickingForm)
              .then(
                response => {
                  this.stockPickingForm = Object.assign({}, response)
                  this.$message({
                    message: 'Successful saved stock picking',
                    type: 'Success'
                  })
                  this.saveStockPickingVisible = false
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
            createItem(this.stockPickingForm)
              .then(
                response => {
                  this.stockPickingForm = Object.assign({}, response)
                  this.$message({
                    message: 'Successful saved stock picking',
                    type: 'Success'
                  })
                  this.saveStockPickingVisible = false
                  this.$router.push({
                    path: '/strategy/edit_stock_picking/' + this.stockPickingForm.id
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
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
      this.strategyForm.ts_code_list.splice(this.dynamicTags.indexOf(tag), 1)
      this.strategyForm.name_list.splice(this.dynamicTags.indexOf(tag), 1)
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
        this.strategyForm.ts_code_list.push(item.ts_code)
        this.strategyForm.name_list.push(item.name)
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
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    getAllCompaniesDone(data) {
      this.calculateDisabled = false
    }
  }
}
</script>

<style scoped>
  .edit {
    display: block;
    font-size: 25px;
    color: #4CAF50;
    transition: color 0.2s ease-out;
    cursor: pointer;
  }
  .edit:hover {
    color: #388E3C;
  }
  .edit:after {
    content: '';
  }
</style>
