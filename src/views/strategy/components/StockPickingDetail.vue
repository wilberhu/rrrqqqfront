<template>
  <div class="app-container">
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
                <el-checkbox v-for="(match_option, match_option_index) in matchOptions" :label="match_option.key" :key="filter_index + '_' + match_option_index" v-model="filter.filterConditionsTemp">{{match_option.label}}</el-checkbox>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="filter.visible = false">取消</el-button>
                  <el-button type="primary" size="mini" @click="filter.visible = false; submitMatchOption(filter_index, filter.filterConditionsTemp)">确定</el-button>
                </div>
                <div class="edit" slot="reference" style="display:inline-block" @click="makeMatchOptionChecked(filter_index)" >
                  <i class="el-icon-edit" />
                </div>
              </el-popover>
            </span>
            <template v-for="(filter_condition, filter_condition_index) in filter.filterConditions" style="white-space: nowrap;">
              <el-input placeholder="value" v-model="filter_condition.value" :key="filter_index + '_' + filter_condition_index" style="margin-right: 10px; width: 140px;">
                <template slot="prepend">{{filter_condition.symbol}}</template>
              </el-input>
              <span :key="filter_condition_index + '_symbol'" v-if="filter_condition_index!==filter.filterConditions.length-1" style="margin-right: 10px;">{{filter.match}}</span>
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
    <hr>

    <composition-detail :is-edit="false" style="padding:0;" />

    <!-- 编辑弹出框 -->
    <el-dialog :visible.sync="editVisible" title="Select filters">
      <el-form ref="filterForm" :model="filterForm">
        <el-transfer
          filterable
          :filter-method="filterMethod"
          filter-placeholder=""
          :titles="['Unselected Filters', 'Selected Filters']"
          v-model="filterForm.filterListTemp"
          :data="filterOptions">
        </el-transfer>
        <el-form-item>
          <span class="dialog-footer">
            <el-button style="margin-top: 10px;" size="small" type="primary" @click="editVisible=false; submitFilterList(filterForm.filterListTemp)">Submit</el-button>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { dailyTrader, fetchItem, createItem, updateItem, fetchTradeCalender } from '@/api/composition'
import CompositionDetail from '../../composition/components/CompositionDetail'

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
      filterOptions: [
        {
          key: 'roe',
          label: '净资产收益率'
        },
        {
          key: 'ocfps',
          label: '经营性现金流（每股）'
        },
        {
          key: 'q_profit_yoy',
          label: '净利润同比增长率'
        },
        {
          key: 'q_profit_qoq',
          label: '净利润环比增长率'
        },
        {
          key: 'q_gr_yoy',
          label: '同比营收增长率'
        },
        {
          key: 'q_gr_qoq',
          label: '环比营收增长率'
        }
      ],
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
        startTime: formatDate(start, 'yyyy-MM-dd'),
        filterListTemp: [],
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
    for (const filterOption of this.filterOptions) {
      filterOption['match'] = 'and'
      filterOption['visible'] = false
      filterOption['filterConditionsTemp'] = []
      filterOption['filterConditions'] = []
    }
  },
  methods: {
    getTradeCalender() {
      fetchTradeCalender().then(response => {
        tradeCalender = response.results
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

    },
    makeFilterListChecked() {
      this.filterForm.filterListTemp = []
      for (const filter of this.filterForm.filterList) {
        this.filterForm.filterListTemp.push(filter.key)
      }
    },
    submitFilterList(filterListTemp) {
      this.filterForm.filterList = []
      for (const filter of filterListTemp) {
        const filterOptionIndex = this.indexOf(this.filterOptions, filter)
        if (filterOptionIndex > -1) {
          this.filterForm.filterList.push(Object.assign({}, this.filterOptions[filterOptionIndex]))
        }
      }
    },
    makeMatchOptionChecked(filter_index) {
      this.filterForm.filterList[filter_index].filterConditionsTemp = []
      for (const filterCondition of this.filterForm.filterList[filter_index].filterConditions) {
        this.filterForm.filterList[filter_index].filterConditionsTemp.push(filterCondition.key)
      }
    },
    submitMatchOption(filter_index, filterConditionsTemp) {
      this.filterForm.filterList[filter_index].filterConditions = []
      for (const filterCondition of filterConditionsTemp) {
        const matchOptionIndex = this.indexOf(this.matchOptions, filterCondition)
        if (matchOptionIndex > -1) {
          this.filterForm.filterList[filter_index].filterConditions.push(Object.assign({}, this.matchOptions[matchOptionIndex]))
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
