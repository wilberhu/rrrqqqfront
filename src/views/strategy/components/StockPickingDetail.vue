<template>
  <div class="app-container">
    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane label="factor" name="factor">
        <el-form ref="filterForm" label-position="left" label-width="160px" :model="filterForm" style="padding: 0 40px;">
          <el-row :gutter="8">
            <el-col :xs="{span: 24}" :sm="{span: 6}" :md="{span: 6}" :lg="{span: 6}" :xl="{span: 6}" style="padding-right:8px;margin-bottom:30px;">
              <el-button
                :loading="loading"
                class="code-button-item"
                type="primary"
                @click.native.prevent="editVisible=true; makeFilterListChecked()"
              >Pick Filter</el-button>
              <el-form-item label="开始日期">
                <el-date-picker
                  :picker-options="datePickerOptions"
                  v-model="filterForm.startTime"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  type="date"
                  aria-required="true"
                  placeholder="选择日期"
                >
                </el-date-picker>
              </el-form-item>
              <el-form-item v-for="(filter, filter_index) in filterForm.filterList" :key="filter_index + '_filter'" style="white-space: nowrap">
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
              <el-button
                :loading="loading"
                class="code-button-item"
                type="primary"
                @click.native.prevent="submit()"
              >Submit</el-button>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="backtrader" name="backtrader">

      </el-tab-pane>
    </el-tabs>

    <hr>

    <composition-detail ref="compositionDetail" :is-edit="false" style="padding:0;" />

    <!-- 编辑弹出框 -->
    <el-dialog :visible.sync="editVisible" title="Select filters">
      <el-form ref="filterForm" :model="filterForm">
        <el-transfer
          filterable
          :filter-method="filterMethod"
          filter-placeholder=""
          :titles="['Unselected Filters', 'Selected Filters']"
          v-model="filterForm.filterListString"
          :data="filterOptions">
        </el-transfer>
        <el-form-item>
          <span class="dialog-footer">
            <el-button style="margin-top: 10px;" size="small" type="primary" @click="editVisible=false; submitFilterList(filterForm.filterListString)">Submit</el-button>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { fetchItem, fetchTradeCalender } from '@/api/composition'
import { fetchList as fetchFilterOptionList } from '@/api/filterOption'
import CompositionDetail from '../../composition/components/CompositionDetail'
import { strategyFilter } from '@/api/strategy'

const start = new Date(new Date().getTime() - 3600 * 1000 * 24 * 365)
let tradeCalender = []
const formatDate = function(timestamp, format = 'yyyy-MM-dd hh:mm:ss') {
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
  components: { CompositionDetail },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeName: 'factor',
      filterOptions: [],
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
      filterForm: {
        allfund: undefined,
        comission: undefined,
        startTime: formatDate(start, 'yyyy-MM-dd'),
        filterListString: [],
        filterList: []
      },
      editVisible: false,
      loading: false,
      datePickerOptions: {
        disabledDate(date) {
          return tradeCalender.indexOf(formatDate(date, 'yyyy-MM-dd')) === -1
        }
      },
      filterMethod(query, item) {
        return item.label.indexOf(query) > -1
      }
    }
  },
  mounted() {
  },
  created() {
    this.getTradeCalender()
    this.getFilterOptions()
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
        this.filterOptions = response.results
        for (const filterOption of this.filterOptions) {
          filterOption['match'] = 'and'
          filterOption['filterConditionListString'] = []
          filterOption['filterConditionList'] = []
        }
        setTimeout(() => {
        }, 1.5 * 1000)
      })
    },
    fetchData(id) {
      fetchItem(id)
        .then(response => {
          // set tagsview title
          this.setTagsViewTitle()
          // set page title
          this.setPageTitle()
          this.compositionForm = Object.assign({}, response)
          this.updateState()
        })
    },
    submit() {
      this.filterForm.allfund = this.$refs.compositionDetail.compositionForm.allfund
      this.filterForm.comission = this.$refs.compositionDetail.compositionForm.comission
      console.log(this.filterForm)
      strategyFilter(this.filterForm)
        .then(response => {
          this.$message.success('Filtered successfully!')
          this.$refs.compositionDetail.compositionForm.activities = Object.assign([], response.activities)
          this.$refs.compositionDetail.updateState()
        })
    },
    makeFilterListChecked() {
      this.filterForm.filterListString = []
      for (const filter of this.filterForm.filterList) {
        this.filterForm.filterListString.push(filter.key)
      }
    },
    submitFilterList(filterListString) {
      const temp = Object.assign([], this.filterForm.filterList)
      this.filterForm.filterList = []
      for (const filter of filterListString) {
        const filterOptionIndex1 = this.indexOf(temp, filter)
        const filterOptionIndex2 = this.indexOf(this.filterOptions, filter)
        if (filterOptionIndex1 > -1) {
          this.filterForm.filterList.push(Object.assign({}, temp[filterOptionIndex1]))
        } else if (filterOptionIndex2 > -1) {
          this.filterForm.filterList.push(Object.assign({}, this.filterOptions[filterOptionIndex2]))
        }
      }
    },
    makeMatchOptionChecked(filter_index) {
      this.filterForm.filterList[filter_index].filterConditionListString = []
      for (const filterCondition of this.filterForm.filterList[filter_index].filterConditionList) {
        this.filterForm.filterList[filter_index].filterConditionListString.push(filterCondition.key)
      }
    },
    submitMatchOption(filter_index, filterConditionListString) {
      const temp = Object.assign([], this.filterForm.filterList[filter_index].filterConditionList)
      this.filterForm.filterList[filter_index].filterConditionList = []
      for (const filterCondition of filterConditionListString) {
        const matchOptionIndex1 = this.indexOf(temp, filterCondition)
        const matchOptionIndex2 = this.indexOf(this.matchOptions, filterCondition)
        if (matchOptionIndex1 > -1) {
          this.filterForm.filterList[filter_index].filterConditionList.push(Object.assign({}, temp[matchOptionIndex1]))
        } else if (matchOptionIndex2 > -1) {
          this.filterForm.filterList[filter_index].filterConditionList.push(Object.assign({}, this.matchOptions[matchOptionIndex2]))
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
