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
      class="table"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column :reserve-selection="true" v-model="multipleSelection" type="selection" align="center" width="55"/>
      <el-table-column prop="ts_code" sortable="custom" align="center" :label="$t('table.daily_basic_index.ts_code')" :class-name="getSortClass('ts_code')" width="110">
        <template slot-scope="scope">
          <!--{{ scope.$index }}-->
          {{ scope.row.ts_code }}
        </template>
      </el-table-column>
      <el-table-column prop="name" :label="$t('table.daily_basic_index.name')" :class-name="getSortClass('name')">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="trade_date" :label="$t('table.daily_basic_index.trade_date')">
        <template slot-scope="scope">
          <span>{{ scope.row.trade_date }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="total_mv" :label="$t('table.daily_basic_index.total_mv')">
        <template slot-scope="scope">
          <span>{{ scope.row.total_mv }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="float_mv" :label="$t('table.daily_basic_index.float_mv')">
        <template slot-scope="scope">
          <span>{{ scope.row.float_mv }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="total_share" :label="$t('table.daily_basic_index.total_share')">
        <template slot-scope="scope">
          <span>{{ scope.row.total_share }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="float_share" :label="$t('table.daily_basic_index.float_share')">
        <template slot-scope="scope">
          <span>{{ scope.row.float_share }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="free_share" :label="$t('table.daily_basic_index.free_share')">
        <template slot-scope="scope">
          <span>{{ scope.row.free_share }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="turnover_rate" :label="$t('table.daily_basic_index.turnover_rate')">
        <template slot-scope="scope">
          <span>{{ scope.row.turnover_rate }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="turnover_rate_f" :label="$t('table.daily_basic_index.turnover_rate_f')">
        <template slot-scope="scope">
          <span>{{ scope.row.turnover_rate_f }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="pe" :label="$t('table.daily_basic_index.pe')">
        <template slot-scope="scope">
          <span>{{ scope.row.pe }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="pe_ttm" :label="$t('table.daily_basic_index.pe_ttm')">
        <template slot-scope="scope">
          <span>{{ scope.row.pe_ttm }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="pb" :label="$t('table.daily_basic_index.pb')">
        <template slot-scope="scope">
          <span>{{ scope.row.pb }}</span>
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
import { queryIndexes } from '@/api/stockBasic'
import { fetchIndexList } from '@/api/stockDailyBasic'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'StockDailyBasicIndex',
  components: { Pagination },
  directives: { waves },
  props: {
    deleteSelection: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      tableKey: 1,
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
        type: 'index'
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
          type: 'index'
        }
      })
    },
    getList() {
      this.listQuery.offset = this.offset
      this.listLoading = true
      fetchIndexList(this.listQuery).then(response => {
        this.list = response.results
        this.total = response.count
        this.listLoading = false
      })
    },
    querySearchAsync(queryString, cb) {
      queryIndexes({ q: queryString }).then(response => {
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
      this.$emit('index_multiple_selection', this.multipleSelection)
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
