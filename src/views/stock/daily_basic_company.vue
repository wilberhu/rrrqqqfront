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
      <el-table-column fixed prop="ts_code" sortable="custom" align="center" :label="$t('table.daily_basic_company.ts_code')" :class-name="getSortClass('ts_code')" width="110">
        <template slot-scope="scope">
          <!--{{ scope.$index }}-->
          {{ scope.row.ts_code }}
        </template>
      </el-table-column>
      <el-table-column sortable fixed prop="name" :label="$t('table.daily_basic_company.name')" :class-name="getSortClass('name')">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
<!--      <el-table-column sortable prop="trade_date" :label="$t('table.trade_date')">-->
<!--        <template slot-scope="scope">-->
<!--          <span>{{ scope.row.trade_date }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column sortable prop="close" :label="$t('table.daily_basic_company.close')">
        <template slot-scope="scope">
          <span>{{ scope.row.close }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="turnover_rate" :label="$t('table.daily_basic_company.turnover_rate')">
        <template slot-scope="scope">
          <span>{{ scope.row.turnover_rate }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="turnover_rate_f" :label="$t('table.daily_basic_company.turnover_rate_f')">
        <template slot-scope="scope">
          <span>{{ scope.row.turnover_rate_f }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="volume_ratio" :label="$t('table.daily_basic_company.volume_ratio')">
        <template slot-scope="scope">
          <span>{{ scope.row.volume_ratio }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="pe" :label="$t('table.daily_basic_company.pe')">
        <template slot-scope="scope">
          <span>{{ scope.row.pe }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="pe_ttm" :label="$t('table.daily_basic_company.pe_ttm')">
        <template slot-scope="scope">
          <span>{{ scope.row.pe_ttm }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="pb" :label="$t('table.daily_basic_company.pb')">
        <template slot-scope="scope">
          <span>{{ scope.row.pb }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="ps" :label="$t('table.daily_basic_company.ps')">
        <template slot-scope="scope">
          <span>{{ scope.row.ps }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="ps_ttm" :label="$t('table.daily_basic_company.ps_ttm')">
        <template slot-scope="scope">
          <span>{{ scope.row.ps_ttm }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="total_share" :label="$t('table.daily_basic_company.total_share')">
        <template slot-scope="scope">
          <span>{{ scope.row.total_share }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="float_share" :label="$t('table.daily_basic_company.float_share')">
        <template slot-scope="scope">
          <span>{{ scope.row.float_share }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="free_share" :label="$t('table.daily_basic_company.free_share')">
        <template slot-scope="scope">
          <span>{{ scope.row.free_share }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="total_mv" :label="$t('table.daily_basic_company.total_mv')">
        <template slot-scope="scope">
          <span>{{ scope.row.total_mv }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="circ_mv" :label="$t('table.daily_basic_company.circ_mv')">
        <template slot-scope="scope">
          <span>{{ scope.row.circ_mv }}</span>
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
import { fetchAllCompanies } from '@/api/stockBasic'
import { fetchCompanyList } from '@/api/stockDailyBasic'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'DailyBasicCompany',
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
      },
      datalist: {
        company: []
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
    this.getAllCompanies()
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
      if(event==='') {
        this.handleClear()
      }
    },
    getAllCompanies() {
      this.listLoading = true
      fetchAllCompanies().then(response => {
        this.listLoading = false
        this.datalist.company = []
        for (const item of response) {
          this.datalist.company.push({
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
