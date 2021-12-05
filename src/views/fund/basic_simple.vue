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
    <el-form ref="form" :inline="true" :model="form">
      <el-form-item>
        <el-autocomplete
          v-model="form.ts_code"
          :fetch-suggestions="querySearchAsync"
          placeholder="请输入内容"
          style="width: 300px;"
          clearable
          @select="handleSelect($event)"
          @clear="handleClear($event)"
          @input="handleInput($event)"
        >
          <template slot="suffix">{{ form.name }}</template>
        </el-autocomplete>
      </el-form-item>
    </el-form>
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
          <fund-portfolio :ts_code="props.row.ts_code" />
        </template>
      </el-table-column>
      <el-table-column :reserve-selection="true" v-model="fund_selection" type="selection" align="center" width="55"/>
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
          <el-tag v-for="tag in multipleSelection['fund']" :key="tag.ts_code" :type="'success'" closable style="margin: 2px" @close="closeTag(tag)">{{ tag.ts_code }} - {{ tag.name }}</el-tag>
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
import { fetchList, queryFundsBasic } from '@/api/fundBasic'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination'
import { Message } from 'element-ui' // Secondary package based on el-pagination
import FundPortfolio from './portfolio'

export default {
  name: 'FundPortfolioComponent',
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
        ts_code: undefined
      },
      multipleSelection: {
        company: [],
        index: [],
        fund: []
      },
      fund_selection: [],
      multiLineVisible: false,
      form: {
        ts_code: undefined,
        name: undefined,
        type: 'fund'
      }
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
    clickMainBtn() {
      this.multipleSelection['fund'] = []
      for (let i = 0; i < this.fund_selection.length; i++) {
        this.multipleSelection['fund'].push({
          ts_code: this.fund_selection[i].ts_code,
          name: this.fund_selection[i].name,
          type: 'fund'
        })
      }
      this.multiLineVisible = !this.multiLineVisible
    },
    closeTag(tag) {
      for (let i = 0; i < this.multipleSelection[tag.type].length; i++) {
        if (this.multipleSelection[tag.type][i].ts_code === tag.ts_code) {
          this.multipleSelection[tag.type].splice(i, 1)
          break
        }
      }
      for (let i = 0; i < this.fund_selection.length; i++) {
        if (this.fund_selection[i].ts_code === tag.ts_code) {
          this.$refs.multipleTable.toggleRowSelection(this.fund_selection[i])
          break
        }
      }
    },
    showCharts() {
      const multipleSelectionLength = this.multipleSelection['company'].length +
        this.multipleSelection['index'].length +
        this.multipleSelection['fund'].length
      if (multipleSelectionLength <= 0 || multipleSelectionLength > 10) {
        Message({
          // message: error.message,
          message: 'The selected items should be more than 0 and less than 10',
          type: 'error',
          duration: 5 * 1000
        })
        return
      }
      this.$router.push({
        name: 'CloseChart',
        params: {
          codes: this.multipleSelection
        }
      })
      this.multiLineVisible = false
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
    getList() {
      this.listQuery.offset = this.offset
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.results
        this.total = response.count
        this.listLoading = false
      })
    },
    querySearchAsync(queryString, cb) {
      queryFundsBasic({ q: queryString }).then(response => {
        var list = []
        for (const item of response.results) {
          list.push({
            value: item.ts_code + ' - ' + item.name,
            ts_code: item.ts_code,
            name: item.name
          })
        }
        cb(list)
      })
    },
    handleSelect(event) {
      this.form.ts_code = event.ts_code
      this.form.name = event.name
      this.listQuery.ts_code = this.form.ts_code
      this.getList()
    },
    handleClear(event) {
      this.form.ts_code = undefined
      this.form.name = undefined
      this.listQuery.ts_code = this.form.ts_code
      this.getList()
    },
    handleInput(event) {
      if (event === '') {
        this.handleClear()
      }
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
      this.page = 1
      this.getList()
    },
    handleSelectionChange(rows) {
      this.fund_selection = rows
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
