<template>
  <div>
    <div class="filter-container">
      <el-select
        v-model="stockFilterStrategy"
        placeholder="请选择"
        value-key="id"
        clearable
        style="width: 500px;"
        @change="handleSelect"
        @clear="handleClear($event)">
        <el-option
          v-for="item in stockFilterOptions"
          :key="item.id"
          :label="item.id + '  ' + item.title + '  ' + item.name_cn + '  ' + item.submit_time + '  ' + item.description"
          :value="item">
        </el-option>
      </el-select>
      <el-button v-waves class="filter-item" :disabled="!stockFilterStrategy.id" type="primary" icon="el-icon-search" @click="handleUpdate(stockFilterStrategy)">
        Detail
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      ref="multipleTable"
      :key="tableKey"
      :data="list"
      row-key="ts_code"
      border
      fit
      highlight-current-row
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column fixed :reserve-selection="true" v-model="multipleSelection" type="selection" align="center" width="55"/>
      <el-table-column v-for="(item, index) in columns" :key="index" sortable :class-name="getSortClass(item.field)" :prop="item.field" :label="item.label">
        <template slot-scope="scope">
          {{ scope.row[item.field] }}
        </template>
      </el-table-column>
      <el-table-column prop="nav_data" :label="$t('table.nav_data')">
        <template slot-scope="scope">
          <el-button type="info" @click="drawLine(scope.row)">{{ $t('table.nav_data') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 删除提示框 -->
    <el-dialog :visible.sync="delVisible" title="Warning" width="300px" center>
      <div class="del-dialog-cnt">Are you confirm to remove the data?</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delVisible=false">Cancel</el-button>
        <el-button type="primary" @click="deleteData">OK</el-button>
      </span>
    </el-dialog>

    <!-- 编辑提示框 -->
    <el-dialog ref="elDialog" :title="textMap[dialogStatus]" width="80%" top="5vh" :fullscreen="fullscreen" :visible.sync="dialogFormVisible">
      <div slot="title" class="header-title">
        <el-input size="small" v-model="stockFilterStrategy.title" style="width: 240px;"/>
        <i class="el-icon-full-screen" style="cursor:pointer; margin-right:30px; float: right;" @click="switchFullscreen"></i>
      </div>
      <el-form ref="dataForm" :model="stockFilterStrategy" style="border: 1px solid #cccccc;">
        <codemirror
          ref="myCm"
          v-model="stockFilterStrategy.code"
          :loading="'true'"
          :options="cmOptions"
          @ready="onCmReady"
          @focus="onCmFocus"
          @input="onCmCodeChange"
        />
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="runStrategy()">
          Run
        </el-button>
        <el-button type="danger" v-if="dialogStatus==='update'" @click="handleDelete">
          Delete
        </el-button>
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Save
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// language js
import 'codemirror/mode/python/python.js'
// theme css
import 'codemirror/theme/eclipse.css'

import { fetchList } from '@/api/fundBasic'
import { fetchAllList as fetchStockFilterList, createItem, updateItem, deleteItem, fetchItemCode, fetchItemData } from '@/api/stockFilter'
import { fetchAllList as fetchAllFunds } from '@/api/fundBasic'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination'

const defaultForm = {
  id: undefined,
  title: 'FundFilter',
  code:
    `'''
@description: 描述
@name_cn: 名字
'''
import pandas as pd

fund_nav_path = "tushare_data/data/tush_fund_nav/"

def main():
    df = pd.read_csv(fund_nav_path + "fund_nav_O.csv").fillna('')
    return df
`
}

export default {
  name: 'StockFund',
  components: {
    Pagination
  },
  directives: { waves },
  props: {
    deleteSelection: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      datalist: {
        company: [],
        index: [],
        fund: []
      },
      total: 0,
      listLoading: true,
      page: 1,

      listQuery: {
        limit: 20,
        offset: undefined,
        ordering: undefined,
        search: undefined,
        force_update: undefined
      },
      orderingOptions: [{ label: 'TsCode Ascending', key: 'ts_code' },
        { label: 'TsCode Descending', key: '-ts_code' },
        { label: 'Name Ascending', key: 'name' },
        { label: 'Name Descending', key: '-name' }],
      columns: [],
      multipleSelection: [],

      stockFilterOptions: [],
      stockFilterStrategy: {
        id: undefined,
        title: '',
        code: '',
        type: ''
      },

      fullscreen: false,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },

      row: null,
      delVisible: false,

      cm: undefined,
      cmOptions: {
        // codemirror options
        tabSize: 4,
        indentWithTabs: false,
        indentUnit: 4,
        mode: 'text/x-python',
        theme: 'eclipse',
        lineNumbers: true,
        line: true,
        extraKeys: { Tab: this.betterTab }
      },

      fundDict: {}
    }
  },
  computed: {
    offset: function() {
      return (this.page - 1) * this.listQuery.limit
    },
    codemirror() {
      return this.$refs.myCm.codemirror
    },
    lang() {
      return this.$store.getters.language
    }
  },
  watch: {
    deleteSelection() {
      for (let i = 0; i < this.multipleSelection.length; i++) {
        if (this.multipleSelection[i].ts_code === this.deleteSelection) {
          this.$refs.multipleTable.toggleRowSelection(this.multipleSelection[i])
          break
        }
      }
    }
  },
  mounted() {
    this.getStockFilterOptions()
    this.getList()
    this.getAllFunds()
  },
  methods: {
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
          this.fundDict[item.ts_code] = item.name
        }
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleTabClick(tab, event) {
      // console.log(tab, event)
    },
    // 定义排序规则
    compare(pro) {
      return function(obj1, obj2) {
        var val1 = obj1[pro]
        var val2 = obj2[pro]
        if (val1 < val2) { // 升序
          return -1
        } else if (val1 > val2) {
          return 1
        } else {
          return 0
        }
      }
    },
    listenSelection(data) {
      this.company_selection = data
    },
    closeTag(tag) {
      for (let i = 0; i < this.multipleSelection.length; i++) {
        if (this.multipleSelection[i].ts_code === tag.ts_code) {
          this.$refs.multipleTable.toggleRowSelection(this.multipleSelection[i])
          break
        }
      }
      this.multipleSelection.sort(this.compare('ts_code'))
    },
    drawLine(item) {
      const multipleSelection = {
        'fund': [
          {
            ts_code: item.ts_code,
            name: item.name,
            type: 'fund'
          }
        ]
      }
      this.$router.push({
        name: 'CloseChart',
        params: {
          codes: multipleSelection
        }
      })
    },
    getStockFilterOptions() {
      fetchStockFilterList().then(response => {
        this.stockFilterOptions = response
        setTimeout(() => {
        }, 1.5 * 1000)
      })
    },
    initColumns() {
      this.columns = [
        { field: 'ts_code', label: this.$t('table.basic_fund.ts_code'), width: '110' },
        { field: 'name', label: this.$t('table.basic_fund.name') },
        { field: 'management', label: this.$t('table.basic_fund.management') },
        { field: 'custodian', label: this.$t('table.basic_fund.custodian') },
        { field: 'fund_type', label: this.$t('table.basic_fund.fund_type') },
        { field: 'found_date', label: this.$t('table.basic_fund.found_date') },
        { field: 'due_date', label: this.$t('table.basic_fund.due_date') },
        { field: 'list_date', label: this.$t('table.basic_fund.list_date') },
        { field: 'issue_date', label: this.$t('table.basic_fund.issue_date') },
        { field: 'delist_date', label: this.$t('table.basic_fund.delist_date') },
        { field: 'issue_amount', label: this.$t('table.basic_fund.issue_amount') },
        { field: 'm_fee', label: this.$t('table.basic_fund.m_fee') },
        { field: 'c_fee', label: this.$t('table.basic_fund.c_fee') },
        { field: 'duration_year', label: this.$t('table.basic_fund.duration_year') },
        { field: 'p_value', label: this.$t('table.basic_fund.p_value') },
        { field: 'min_amount', label: this.$t('table.basic_fund.min_amount') },
        { field: 'exp_return', label: this.$t('table.basic_fund.exp_return') },
        { field: 'status', label: this.$t('table.basic_fund.status') },
        { field: 'invest_type', label: this.$t('table.basic_fund.invest_type') },
        { field: 'type', label: this.$t('table.basic_fund.type') },
        { field: 'trustee', label: this.$t('table.basic_fund.trustee') },
        { field: 'purc_startdate', label: this.$t('table.basic_fund.purc_startdate') },
        { field: 'redm_startdate', label: this.$t('table.basic_fund.redm_startdate') },
        { field: 'market', label: this.$t('table.basic_fund.market') }
      ]
    },
    getList() {
      if (this.stockFilterStrategy.id) {
        this.listQuery.offset = this.offset
        this.listLoading = true
        fetchItemData(this.stockFilterStrategy.id, this.listQuery).then(response => {
          this.list = response.results
          this.total = response.count
          this.columns = []
          for (const column of response.columns) {
            this.columns.push({ field: column, label: column })
            if (column === 'ts_code' && response.columns.indexOf('name') === -1) {
              this.columns.push({ field: 'name', label: 'name' })
            }
          }
          if (response.columns.indexOf('name') === -1) {
            for (const item of this.list) {
              item.name = this.fundDict[item.ts_code]
            }
          }
          this.listLoading = false

          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      } else {
        this.listQuery.offset = this.offset
        this.listLoading = true
        fetchList(this.listQuery).then(response => {
          this.initColumns()
          this.list = response.results
          this.total = response.count
          this.listLoading = false

          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      }
    },
    handleSelect(event) {
      this.stockFilterStrategy = Object.assign({}, event)
      this.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
      this.$emit('fund_multiple_selection', this.multipleSelection)
      this.getList()
    },
    handleClear(event) {
      this.stockFilterStrategy = Object.assign({}, defaultForm)
      this.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
      this.$emit('fund_multiple_selection', this.multipleSelection)
      this.getList()
    },
    switchFullscreen() {
      if (this.fullscreen) {
        this.$refs.elDialog.$el.firstChild.style.height = '90vh'
        this.cm.setSize('100%', 'calc(90vh - 200px)')
        this.fullscreen = false
      } else {
        this.$refs.elDialog.$el.firstChild.style.height = '100vh'
        this.cm.setSize('100%', 'calc(100vh - 200px)')
        this.fullscreen = true
      }
    },
    handleCreate() {
      this.stockFilterStrategy = Object.assign({}, defaultForm)
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
        if (this.fullscreen) {
          this.$refs.elDialog.$el.firstChild.style.height = '100vh'
          this.cm.setSize('100%', 'calc(100vh - 200px)')
        } else {
          this.$refs.elDialog.$el.firstChild.style.height = '90vh'
          this.cm.setSize('100%', 'calc(90vh - 200px)')
        }
      })
    },
    createData() {
      createItem(this.stockFilterStrategy).then(() => {
        this.dialogFormVisible = false
        this.$notify({
          title: 'Success',
          message: 'Created Successfully',
          type: 'success',
          duration: 2000
        })
        this.getStockFilterOptions()
      })
    },
    handleUpdate(row) {
      this.stockFilterStrategy = Object.assign({}, row) // copy obj

      fetchItemCode(this.stockFilterStrategy.id).then(code => {
        this.stockFilterStrategy.code = code
      })

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
        if (this.fullscreen) {
          this.$refs.elDialog.$el.firstChild.style.height = '100vh'
          this.cm.setSize('100%', 'calc(100vh - 200px)')
        } else {
          this.$refs.elDialog.$el.firstChild.style.height = '90vh'
          this.cm.setSize('100%', 'calc(90vh - 200px)')
        }
      })
    },
    updateData() {
      const tempData = Object.assign({}, this.stockFilterStrategy)
      updateItem(tempData.id, tempData).then(() => {
        this.dialogFormVisible = false
        this.$notify({
          title: 'Success',
          message: 'Update Successfully',
          type: 'success',
          duration: 2000
        })
        this.getStockFilterOptions()
        this.getList()
      })
    },
    runStrategy() {
      this.listQuery.force_update = 'yes'
      fetchItemData(this.stockFilterStrategy.id, this.listQuery).then(response => {
        this.listQuery.force_update = undefined
        this.$message({
          message: 'Running successfully!',
          type: 'Success'
        })
        setTimeout(() => {
          this.listQuery.force_update = undefined
        }, 1.5 * 1000)
      })
    },
    handleDelete() {
      this.delVisible = true
    },
    deleteData() {
      deleteItem(this.stockFilterStrategy.id).then(() => {
        this.delVisible = false
        this.dialogFormVisible = false
        this.$notify({
          title: 'Success',
          message: 'Update Successfully',
          type: 'success',
          duration: 2000
        })
        this.getStockFilterOptions()
        this.handleClear(null)
      })
    },
    sortChange(data) {
      const { prop, order } = data
      this.sortByColumn(prop, order)
    },
    getSortClass: function(key) {
      const sort = this.listQuery.ordering
      return sort === `${key}`
        ? 'ascending'
        : sort === `-${key}`
          ? 'descending'
          : ''
    },
    sortByColumn(prop, order) {
      if (order === 'ascending') {
        this.listQuery.ordering = prop
      } else if (order === 'descending') {
        this.listQuery.ordering = '-' + prop
      } else {
        this.listQuery.ordering = undefined
      }
      this.page = 1
      this.getList()
    },
    handleSelectionChange(rows) {
      this.multipleSelection = rows
      this.$emit('fund_multiple_selection', this.multipleSelection)
    },

    onCmReady(cm) {
      this.cm = cm
      cm.setSize('100%', 'calc(90vh - 180px)')
    },
    onCmFocus(cm) {},
    onCmCodeChange(newCode) {
      // this.code = newCode.replace('\t', '    ')
    }
  }
}
</script>
