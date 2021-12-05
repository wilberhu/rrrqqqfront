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
      <el-table-column prop="hist_data" :label="$t('table.hist_data')">
        <template slot-scope="scope">
          <el-button type="info" @click="drawLine(scope.row)">{{ $t('table.hist_data') }}</el-button>
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
        <el-button @click="runStrategy()" :disabled="listLoading">
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

import { fetchCompanyList } from '@/api/stockBasic'
import { fetchAllList as fetchStockFilterList, createItem, updateItem, deleteItem, fetchItemCode, fetchItemData } from '@/api/stockFilter'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination'

const defaultForm = {
  id: undefined,
  title: 'CompanyFilter',
  type: 'company',
  code:
    `'''
@description: 描述
@name_cn: 名字
'''
import pandas as pd

company_nav_path = "tushare_data/data/tush_company/"

def main():
    df = pd.read_csv(company_nav_path + "company.csv").fillna('')
    return df
`
}

export default {
  name: 'StockCompany',
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
      columns: [],
      multipleSelection: [],

      stockFilterOptions: [],
      stockFilterStrategy: {
        id: undefined,
        title: '',
        code: '',
        type: 'company'
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
      }
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
  },
  methods: {
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
        company: [
          {
            ts_code: item.ts_code,
            name: item.name,
            type: 'company'
          }
        ]
      }
      this.$router.push({
        name: 'LineChart',
        params: multipleSelection.company[0]
      })
    },
    getStockFilterOptions() {
      var param = { type: 'company' }
      fetchStockFilterList(param).then(response => {
        this.stockFilterOptions = response
        setTimeout(() => {
        }, 1.5 * 1000)
      })
    },
    initColumns() {
      this.columns = [
        { field: 'ts_code', label: this.$t('table.company.ts_code'), width: '110' },
        { field: 'name', label: this.$t('table.company.name') },
        { field: 'area', label: this.$t('table.company.area') },
        { field: 'industry', label: this.$t('table.company.area') },
        { field: 'market', label: this.$t('table.company.market') },
        { field: 'list_status', label: this.$t('table.company.list_status') },
        { field: 'list_date', label: this.$t('table.company.list_date') },
        { field: 'is_hs', label: this.$t('table.company.is_hs') }
      ]
    },
    getList() {
      if (this.stockFilterStrategy.id) {
        this.listQuery.offset = this.offset
        this.listLoading = true
        var msg = this.$message({
          duration: 0,
          showClose: false,
          message: 'Processing'
        })
        fetchItemData(this.stockFilterStrategy.id, this.listQuery).then(response => {
          this.list = response.results
          this.total = response.count
          this.columns = []
          for (const column of response.columns) {
            this.columns.push({ field: column, label: column })
          }
          this.listLoading = false
          msg.close()
          this.$message({
            message: 'Running successfully!',
            type: 'Success'
          })
        }).catch(() => {
          this.listLoading = false
          msg.close()
        })
      } else {
        this.listQuery.offset = this.offset
        this.listLoading = true
        fetchCompanyList(this.listQuery).then(response => {
          this.initColumns()
          this.list = response.results
          this.total = response.count
          this.listLoading = false
        })
      }
    },
    handleSelect(event) {
      this.stockFilterStrategy = Object.assign({}, event)
      this.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
      this.$emit('company_multiple_selection', this.multipleSelection)
      this.getList()
    },
    handleClear(event) {
      this.stockFilterStrategy = Object.assign({}, defaultForm)
      this.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
      this.$emit('company_multiple_selection', this.multipleSelection)
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
      console.log(this.stockFilterStrategy)
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
      this.listLoading = true
      var msg = this.$message({
        duration: 0,
        showClose: false,
        message: 'Processing'
      })
      this.listQuery.force_update = 'yes'
      fetchItemData(this.stockFilterStrategy.id, this.listQuery).then(response => {
        this.listQuery.force_update = undefined
        this.listLoading = false
        this.dialogFormVisible = false
        msg.close()
        this.$message({
          message: 'Running successfully!',
          type: 'Success'
        })
      }).catch(() => {
        this.listLoading = false
        msg.close()
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
      this.$emit('company_multiple_selection', this.multipleSelection)
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
