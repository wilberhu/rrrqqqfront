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
          style="width: 220px;"
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
import { fetchAllList as fetchAllFunds } from '@/api/fundBasic'
import { fetchList } from '@/api/fundNav'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { Message } from 'element-ui' // Secondary package based on el-pagination

export default {
  name: 'FundNav',
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
        ts_code: undefined
      },
      orderingOptions: [{ label: 'TsCode Ascending', key: 'ts_code' },
        { label: 'TsCode Descending', key: '-ts_code' },
        { label: 'Name Ascending', key: 'name' },
        { label: 'Name Descending', key: '-name' }],

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
      },
      datalist: {
        index: []
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
    this.getAllFunds()
  },
  methods: {
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

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    querySearchAsync(queryString, cb) {
      var results = queryString ? this.datalist[this.form.type].filter(this.createContainsFilter(queryString)) : this.datalist[this.form.type]
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
    handleSelect(event) {
      this.listQuery.ts_code = event.ts_code
      this.getList()
    },
    handleClear(event) {
      this.listQuery.ts_code = undefined
      this.getList()
    },
    handleInput(event) {
      if (event === '') {
        this.handleClear()
      }
    },
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
        }
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
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
