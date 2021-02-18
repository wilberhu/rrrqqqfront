<template>
  <div class="tab-container">
    <vue-fab
      :main-btn-color="'#2196F3'"
      :fab-animate-bezier="'ease-out'"
      :fab-auto-hide-animate-model="'alive'"
      :scroll-auto-hide="false"
      prop="open"
      style="right: 13%; bottom: 15%"
      icon="multiline_chart"
      size="big"
      fab-item-animate="alive"
      @clickMainBtn="clickMainBtn"/>
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
      @expand-change="expandChange"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column type="expand">
        <template slot-scope="props">
          <!-- <el-tabs v-model="activeName" @tab-click="handleTabClick">
            <el-tab-pane label="portfolio" name="portfolio">
              <fund-portfolio :ts_code="props.row.ts_code"></fund-portfolio>
            </el-tab-pane>
          </el-tabs> -->
          <fund-portfolio :ts_code="props.row.ts_code"></fund-portfolio>
        </template>
      </el-table-column>
      <el-table-column :reserve-selection="true" v-model="multipleSelection" type="selection" align="center" width="55"/>
      <el-table-column prop="ts_code" sortable="custom" align="center" :label="$t('table.basic_fund.ts_code')" :class-name="getSortClass('ts_code')" width="110">
        <template slot-scope="scope">
          <!--{{ scope.$index }}-->
          {{ scope.row.ts_code }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="name" :label="$t('table.basic_fund.name')" :class-name="getSortClass('name')">
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
      <el-table-column prop="nav_data" :label="$t('table.nav_data')">
        <template slot-scope="scope">
          <el-button type="info" @click="drawLine(scope.row)">{{ $t('table.nav_data') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- MultiLine弹出框 -->
    <el-dialog :visible.sync="multiLineVisible" title="compare companies" width="500px">
      <el-form label-width="100px">
        <el-form-item label="funds: ">
          <el-tag v-for="tag in multipleSelection" :key="tag.ts_code" :type="'success'" closable style="margin: 2px" @close="closeTag(tag)">{{ tag.ts_code }} - {{ tag.name }}</el-tag>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="multiLineVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="showCharts">Show Charts</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList } from '@/api/fundBasic'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination'
import { Message } from 'element-ui' // Secondary package based on el-pagination
import FundPortfolio from './portfolio'
export default {
  name: 'BasicFundSimple',
  components: {
    Pagination,
    FundPortfolio
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
  data() {
    return {
      tableKey: 'fund_basic',
      activeName: 'portfolio',
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

      multipleSelection: [],
      multiLineVisible: false
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
    clickMainBtn() {
      this.multipleSelection.sort(this.compare('ts_code'))
      this.multiLineVisible = !this.multiLineVisible
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
    showCharts() {
      const multipleSelection = []
      for (let i = 0; i < this.multipleSelection.length; i++) {
        multipleSelection.push({
          ts_code: this.multipleSelection[i].ts_code,
          name: this.multipleSelection[i].name,
          type: 'fund'
        })
      }
      if (this.multipleSelection.length <= 0 || this.multipleSelection.length > 10) {
        Message({
          // message: error.message,
          message: 'The selected items should be more than 0 and less than 10',
          type: 'error',
          duration: 5 * 1000
        })
        return
      }
      this.$router.push({
        name: 'NavChart',
        params: {
          codes: multipleSelection
        }
      })
      this.multiLineVisible = false
    },

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
    expandChange(row, expandedRows) {
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
/* fallback */
@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: url("../../icons/gstatic/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2") format('woff2');
  /*src: url(https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2) format('woff2');*/
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}
</style>
