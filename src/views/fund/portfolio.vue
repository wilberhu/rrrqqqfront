<template>
  <div class="tab-container">
    <div class="filter-container">
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" :disabled="total===0" @click="handleDownload">
        Export
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      ref="multipleTable"
      :key="tableKey"
      :data="list"
      max-height="300"
      style="width: 100%"
      row-key="index"
      border
      fit
      highlight-current-row
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column :reserve-selection="true" v-model="multipleSelection" type="selection" align="center" width="55"/>
      <el-table-column prop="index" align="center" :label="$t('table.basic_fund_portfolio.index')" :class-name="getSortClass('index')" width="110">
        <template slot-scope="scope">
          {{ scope.row.index }}
        </template>
      </el-table-column>
      <el-table-column prop="ts_code" :label="$t('table.basic_fund_portfolio.ts_code')" :class-name="getSortClass('ts_code')">
        <template slot-scope="scope">
          {{ scope.row.ts_code }}
        </template>
      </el-table-column>
      <el-table-column prop="ann_date" :label="$t('table.basic_fund_portfolio.ann_date')">
        <template slot-scope="scope">
          {{ scope.row.ann_date }}
        </template>
      </el-table-column>
      <el-table-column prop="end_date" :label="$t('table.basic_fund_portfolio.end_date')">
        <template slot-scope="scope">
          {{ scope.row.end_date }}
        </template>
      </el-table-column>
      <el-table-column prop="symbol" :label="$t('table.basic_fund_portfolio.symbol')">
        <template slot-scope="scope">
          {{ scope.row.symbol }}
        </template>
      </el-table-column>
      <el-table-column prop="mkv" :label="$t('table.basic_fund_portfolio.mkv')">
        <template slot-scope="scope">
          {{ scope.row.mkv }}
        </template>
      </el-table-column>
      <el-table-column prop="amount" :label="$t('table.basic_fund_portfolio.amount')">
        <template slot-scope="scope">
          {{ scope.row.amount }}
        </template>
      </el-table-column>
      <el-table-column prop="stk_mkv_ratio" :label="$t('table.basic_fund_portfolio.stk_mkv_ratio')">
        <template slot-scope="scope">
          {{ scope.row.stk_mkv_ratio }}
        </template>
      </el-table-column>
      <el-table-column prop="stk_float_ratio" :label="$t('table.basic_fund_portfolio.stk_float_ratio')">
        <template slot-scope="scope">
          {{ scope.row.stk_float_ratio }}
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import { fetchItemPortfolio, fetchItemPortfolioDownload } from '@/api/fundBasic'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'FundPortfolio',
  components: {
    Pagination
  },
  directives: { waves },
  filters: {
    numFilter(value) {
      // 截取当前数据到小数点后两位
      var realVal = parseFloat(value).toFixed(2)
      if (isNaN(realVal)) {
        return ''
      }
      // num.toFixed(2)获取的是字符串
      return parseFloat(realVal)
    }
  },
  props: {
    ts_code: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      tableKey: 'fund_portfolio' + this.ts_code,
      list: [],
      total: 0,
      listLoading: true,
      downloadLoading: false,
      page: 1,

      listQuery: {
        limit: 100,
        offset: undefined,
        ordering: undefined,
        search: undefined
      },
      orderingOptions: [{ label: 'TsCode Ascending', key: 'ts_code' },
        { label: 'TsCode Descending', key: '-ts_code' },
        { label: 'Name Ascending', key: 'name' },
        { label: 'Name Descending', key: '-name' }],

      multipleSelection: []
    }
  },
  computed: {
    offset: function() {
      return (this.page - 1) * this.listQuery.limit
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listQuery.offset = this.offset
      this.listLoading = true
      fetchItemPortfolio(this.ts_code, this.listQuery).then(response => {
        this.list = response.results
        this.total = response.count
        this.listLoading = false
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      }).catch(
        this.listLoading = false
      )
    },
    handleSearch() {
      this.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      this.sortByColumn(prop, order)
    },
    sortByColumn(prop, order) {
      if (order === 'ascending') {
        this.listQuery.ordering = prop
      } else if (order === 'descending') {
        this.listQuery.ordering = '-' + prop
      } else {
        this.listQuery.ordering = undefined
      }
      this.handleSearch()
    },
    handleSelectionChange(rows) {
      this.multipleSelection = rows
      this.$emit('company_multiple_selection', this.multipleSelection)
    },
    getSortClass: function(key) {
      const sort = this.listQuery.ordering
      return sort === `${key}`
        ? 'ascending'
        : sort === `-${key}`
          ? 'descending'
          : ''
    },
    handleDownload() {
      fetchItemPortfolioDownload(this.ts_code).then(response => {
        let fileURL = window.URL.createObjectURL(new Blob([response.data]))
        let fileLink = document.createElement('a')
        fileLink.href = fileURL
        fileLink.setAttribute('download', response.headers['content-disposition'].split('=')[1].replace(/^\"+|\"+$/g, ''));
        document.body.appendChild(fileLink)
        fileLink.click();
        document.body.removeChild(fileLink)
        // Just to simulate the time of the request
        setTimeout(() => {
        }, 1.5 * 1000)
      })
    }
  }
}
</script>
<style>
.tab-container {
  margin: 20px;
}
</style>
