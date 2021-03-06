<template>
  <div class="tab-container">
    <div class="filter-container">
      <el-input placeholder="ts_code" v-model="listQuery.search" style="width: 200px;" class="filter-item" @keyup.enter.native="handleSearch"/>
      <!-- <el-select v-model="listQuery.ordering" style="width: 140px" class="filter-item" @change="handleSearch">
        <el-option v-for="item in orderingOptions" :key="item.key" :label="item.label" :value="item.key"/>
      </el-select> -->
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleSearch">{{ $t('table.search') }}</el-button>
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
      <el-table-column fixed prop="ts_code" sortable="custom" align="center" :label="$t('table.nav_fund.ts_code')" :class-name="getSortClass('ts_code')" width="110">
        <template slot-scope="scope">
          <!--{{ scope.$index }}-->
          {{ scope.row.ts_code }}
        </template>
      </el-table-column>
      <el-table-column sortable fixed prop="name" :label="$t('table.nav_fund.name')" :class-name="getSortClass('name')">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="ann_date" :label="$t('table.nav_fund.ann_date')">
        <template slot-scope="scope">
          <span>{{ scope.row.ann_date }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="end_date" :label="$t('table.nav_fund.end_date')">
        <template slot-scope="scope">
          <span>{{ scope.row.end_date }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="unit_nav" :label="$t('table.nav_fund.unit_nav')">
        <template slot-scope="scope">
          <span>{{ scope.row.unit_nav }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="accum_nav" :label="$t('table.nav_fund.accum_nav')">
        <template slot-scope="scope">
          <span>{{ scope.row.accum_nav }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="accum_div" :label="$t('table.nav_fund.accum_div')">
        <template slot-scope="scope">
          <span>{{ scope.row.accum_div }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="net_asset" :label="$t('table.nav_fund.net_asset')">
        <template slot-scope="scope">
          <span>{{ scope.row.net_asset }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="total_netasset" :label="$t('table.nav_fund.total_netasset')">
        <template slot-scope="scope">
          <span>{{ scope.row.total_netasset }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="adj_nav" :label="$t('table.nav_fund.adj_nav')">
        <template slot-scope="scope">
          <span>{{ scope.row.adj_nav }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="nav_data" :label="$t('table.nav_data')">
        <template slot-scope="scope">
          <el-button type="info" @click="drawLine(scope.row)">{{ $t('table.nav_data') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import { fetchList } from '@/api/fundNav'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'NavFund',
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
    drawLine(item) {
      const multipleSelection = []
      multipleSelection.push({
        ts_code: item.ts_code,
        name: item.name,
        type: 'fund'
      })
      this.$router.push({
        name: 'NavChart',
        params: {
          codes: multipleSelection
        }
      })
    },
    getList() {
      this.listQuery.offset = this.offset
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.results
        this.total = response.count
        this.listLoading = false

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
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
    }
  }
}
</script>

<style>
  .tab-container {
    margin: 20px;
  }
</style>
