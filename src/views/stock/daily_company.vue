<template>
  <div>
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
      <el-table-column fixed prop="ts_code" sortable="custom" align="center" :label="$t('table.daily_company.ts_code')" :class-name="getSortClass('ts_code')" width="110">
        <template slot-scope="scope">
          <!--{{ scope.$index }}-->
          {{ scope.row.ts_code }}
        </template>
      </el-table-column>
      <el-table-column fixed prop="name" :label="$t('table.daily_company.name')" :class-name="getSortClass('name')">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="trade_date" :label="$t('table.daily_company.trade_date')">
        <template slot-scope="scope">
          <span>{{ scope.row.trade_date }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="close" :label="$t('table.daily_company.close')">
        <template slot-scope="scope">
          <span>{{ scope.row.close }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="open" :label="$t('table.daily_company.open')">
        <template slot-scope="scope">
          <span>{{ scope.row.open }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="high" :label="$t('table.daily_company.high')">
        <template slot-scope="scope">
          <span>{{ scope.row.high }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="low" :label="$t('table.daily_company.low')">
        <template slot-scope="scope">
          <span>{{ scope.row.low }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="pre_close" :label="$t('table.daily_company.pre_close')">
        <template slot-scope="scope">
          <span>{{ scope.row.pre_close }}</span>
        </template>
      </el-table-column>

      <el-table-column sortable prop="change" :label="$t('table.daily_company.change')">
        <template slot-scope="scope">
          <template v-if="scope.row.change > 0">
            <span style="color: red">{{ scope.row.change | numFilter }} ↑</span>
          </template>
          <template v-else-if="scope.row.change < 0">
            <span style="color: green">{{ scope.row.change | numFilter }} ↓</span>
          </template>
          <template v-else>
            <span>{{ scope.row.change | numFilter }}</span>
          </template>
        </template>
      </el-table-column>

      <el-table-column sortable prop="pct_chg" :label="$t('table.daily_company.pct_chg')">
        <template slot-scope="scope">
          <template v-if="scope.row.pct_chg > 0">
            <span style="color: red">{{ scope.row.pct_chg | numFilter }}% ↑</span>
          </template>
          <template v-else-if="scope.row.pct_chg < 0">
            <span style="color: green">{{ scope.row.pct_chg | numFilter }}% ↓</span>
          </template>
          <template v-else>
            <span>{{ scope.row.change | numFilter }}</span>
          </template>
        </template>
      </el-table-column>

      <el-table-column sortable prop="vol" :label="$t('table.daily_company.vol')">
        <template slot-scope="scope">
          <span>{{ scope.row.vol }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="amount" :label="$t('table.daily_company.amount')">
        <template slot-scope="scope">
          <span>{{ scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="hist_data" :label="$t('table.hist_data')">
        <template slot-scope="scope">
          <el-button type="info" @click="drawLine(scope.row)">{{ $t('table.hist_data') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import { queryCompanies } from '@/api/stockBasic'
import { fetchCompanyList } from '@/api/stockDaily'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'StockDailyCompany',
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
        ts_code: undefined
      },
      orderingOptions: [{ label: 'TsCode Ascending', key: 'ts_code' },
        { label: 'TsCode Descending', key: '-ts_code' },
        { label: 'Name Ascending', key: 'name' },
        { label: 'Name Descending', key: '-name' }],

      multipleSelection: [],
      form: {
        ts_code: undefined,
        name: undefined,
        type: 'company'
      }
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
        name: 'LineChart',
        params: {
          ts_code: item.ts_code,
          name: item.name,
          type: 'company'
        }
      })
    },
    getList() {
      this.listQuery.offset = this.offset
      this.listLoading = true
      fetchCompanyList(this.listQuery).then(response => {
        this.list = response.results
        this.total = response.count
        this.listLoading = false
      })
    },
    querySearchAsync(queryString, cb) {
      queryCompanies({ q: queryString }).then(response => {
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
