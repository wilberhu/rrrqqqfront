<template>
  <div class="tab-container">
    <div class="filter-container">
      <el-input placeholder="ts_code, name" v-model="listQuery.search" style="width: 200px;" class="filter-item" @keyup.enter.native="handleSearch"/>
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
      <el-table-column fixed prop="ts_code" sortable="custom" align="center" :label="$t('table.basic_fund.ts_code')" :class-name="getSortClass('ts_code')" width="110">
        <template slot-scope="scope">
          <!--{{ scope.$index }}-->
          {{ scope.row.ts_code }}
        </template>
      </el-table-column>
      <el-table-column fixed sortable prop="name" :label="$t('table.basic_fund.name')" :class-name="getSortClass('name')">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="management" :label="$t('table.basic_fund.management')" :class-name="getSortClass('management')">
        <template slot-scope="scope">
          {{ scope.row.management }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="custodian" :label="$t('table.basic_fund.custodian')" :class-name="getSortClass('custodian')">
        <template slot-scope="scope">
          {{ scope.row.custodian }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="name" :label="$t('table.basic_fund.name')" :class-name="getSortClass('name')">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="fund_type" :label="$t('table.basic_fund.fund_type')" :class-name="getSortClass('fund_type')">
        <template slot-scope="scope">
          {{ scope.row.fund_type }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="found_date" :label="$t('table.basic_fund.found_date')" :class-name="getSortClass('found_date')">
        <template slot-scope="scope">
          {{ scope.row.found_date }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="due_date" :label="$t('table.basic_fund.due_date')" :class-name="getSortClass('due_date')">
        <template slot-scope="scope">
          {{ scope.row.due_date }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="list_date" :label="$t('table.basic_fund.list_date')" :class-name="getSortClass('list_date')">
        <template slot-scope="scope">
          {{ scope.row.list_date }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="issue_date" :label="$t('table.basic_fund.issue_date')" :class-name="getSortClass('issue_date')">
        <template slot-scope="scope">
          {{ scope.row.issue_date }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="delist_date" :label="$t('table.basic_fund.delist_date')" :class-name="getSortClass('delist_date')">
        <template slot-scope="scope">
          {{ scope.row.delist_date }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="issue_amount" :label="$t('table.basic_fund.issue_amount')" :class-name="getSortClass('issue_amount')">
        <template slot-scope="scope">
          {{ scope.row.issue_amount }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="m_fee" :label="$t('table.basic_fund.m_fee')" :class-name="getSortClass('m_fee')">
        <template slot-scope="scope">
          {{ scope.row.m_fee }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="c_fee" :label="$t('table.basic_fund.c_fee')" :class-name="getSortClass('c_fee')">
        <template slot-scope="scope">
          {{ scope.row.c_fee }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="duration_year" :label="$t('table.basic_fund.duration_year')" :class-name="getSortClass('duration_year')">
        <template slot-scope="scope">
          {{ scope.row.duration_year }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="p_value" :label="$t('table.basic_fund.p_value')" :class-name="getSortClass('p_value')">
        <template slot-scope="scope">
          {{ scope.row.p_value }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="min_amount" :label="$t('table.basic_fund.min_amount')" :class-name="getSortClass('min_amount')">
        <template slot-scope="scope">
          {{ scope.row.min_amount }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="exp_return" :label="$t('table.basic_fund.exp_return')" :class-name="getSortClass('exp_return')">
        <template slot-scope="scope">
          {{ scope.row.exp_return }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="benchmark" :label="$t('table.basic_fund.benchmark')" :class-name="getSortClass('benchmark')">
        <template slot-scope="scope">
          {{ scope.row.benchmark }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="status" :label="$t('table.basic_fund.status')" :class-name="getSortClass('status')">
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="invest_type" :label="$t('table.basic_fund.invest_type')" :class-name="getSortClass('invest_type')">
        <template slot-scope="scope">
          {{ scope.row.invest_type }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="type" :label="$t('table.basic_fund.type')" :class-name="getSortClass('type')">
        <template slot-scope="scope">
          {{ scope.row.type }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="trustee" :label="$t('table.basic_fund.trustee')" :class-name="getSortClass('trustee')">
        <template slot-scope="scope">
          {{ scope.row.trustee }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="purc_startdate" :label="$t('table.basic_fund.purc_startdate')" :class-name="getSortClass('purc_startdate')">
        <template slot-scope="scope">
          {{ scope.row.purc_startdate }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="redm_startdate" :label="$t('table.basic_fund.redm_startdate')" :class-name="getSortClass('redm_startdate')">
        <template slot-scope="scope">
          {{ scope.row.redm_startdate }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="market" :label="$t('table.basic_fund.market')" :class-name="getSortClass('market')">
        <template slot-scope="scope">
          {{ scope.row.market }}
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
import { fetchList } from '@/api/fundBasic'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'BasicFund',
  components: {
    Pagination
  },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        L: 'success',
        P: 'warning',
        D: 'danger'
      }
      return statusMap[status]
    },
    isHsFilter(status) {
      const statusMap = {
        H: 'H（沪股通）',
        S: 'S（深股通）',
        N: 'N（否）'
      }
      return statusMap[status]
    }
  },
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
  created() {
    this.getList()
  },
  methods: {
    drawLine(item) {
      this.$router.push({
        name: 'NavChart',
        params: {
          ts_code: item.ts_code,
          name: item.name
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
