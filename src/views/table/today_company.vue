<template>
  <div>
    <div class="filter-container">
      <el-input :placeholder="$t('table.title')" v-model="listQuery.title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
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
      <el-table-column fixed prop="ts_code" sortable="custom" align="center" :label="$t('table.today_company.ts_code')" :class-name="getSortClass('ts_code')" width="110">
        <template slot-scope="scope">
          <!--{{ scope.$index }}-->
          {{ scope.row.ts_code }}
        </template>
      </el-table-column>
      <el-table-column sortable fixed prop="name" :label="$t('table.today_company.name')" :class-name="getSortClass('name')">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
<!--      <el-table-column sortable prop="trade_date" :label="$t('table.trade_date')">-->
<!--        <template slot-scope="scope">-->
<!--          <span>{{ scope.row.trade_date }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column sortable prop="close" :label="$t('table.today_company.close')">
        <template slot-scope="scope">
          <span>{{ scope.row.close }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="open" :label="$t('table.today_company.open')">
        <template slot-scope="scope">
          <span>{{ scope.row.open }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="high" :label="$t('table.today_company.high')">
        <template slot-scope="scope">
          <span>{{ scope.row.high }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="low" :label="$t('table.today_company.low')">
        <template slot-scope="scope">
          <span>{{ scope.row.low }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="pre_close" :label="$t('table.today_company.pre_close')">
        <template slot-scope="scope">
          <span>{{ scope.row.pre_close }}</span>
        </template>
      </el-table-column>

      <el-table-column sortable prop="change" :label="$t('table.today_company.change')">
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

      <el-table-column sortable prop="pct_chg" :label="$t('table.today_company.pct_chg')">
        <template slot-scope="scope">
          <template v-if="scope.row.pct_chg > 0">
            <span style="color: red">{{ scope.row.pct_chg | numFilter }} ↑</span>
          </template>
          <template v-else-if="scope.row.pct_chg < 0">
            <span style="color: green">{{ scope.row.pct_chg | numFilter }} ↓</span>
          </template>
          <template v-else>
            <span>{{ scope.row.change | numFilter }}</span>
          </template>
        </template>
      </el-table-column>

      <el-table-column sortable prop="vol" :label="$t('table.today_company.vol')">
        <template slot-scope="scope">
          <span>{{ scope.row.vol }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="amount" :label="$t('table.today_company.amount')">
        <template slot-scope="scope">
          <span>{{ scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="hist_data" :label="$t('table.hist_data')">
        <template slot-scope="scope">
          <el-button type="info" @click="drawLine(scope.row.ts_code)">{{ $t('table.hist_data') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import { fetchCompanyList } from '@/api/today'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'TodayCompany',
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
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: 'ts_code'
      },
      sortOptions: [{ label: 'TsCode Ascending', key: 'ts_code' },
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
    drawLine(code) {
      this.$router.push({
        name: 'LineChart',
        params: {
          // code: parseInt(code)
          code: code
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
    handleFilter() {
      this.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      this.sortByColumn(prop, order)
    },
    sortByColumn(prop, order) {
      if (order === 'ascending') {
        this.listQuery.sort = prop
      } else if (order === 'descending') {
        this.listQuery.sort = '-' + prop
      } else {
        this.listQuery.sort = undefined
      }
      this.handleFilter()
    },
    handleSelectionChange(rows) {
      this.multipleSelection = rows
      this.$emit('company_multiple_selection', this.multipleSelection)
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `${key}`
        ? 'ascending'
        : sort === `-${key}`
          ? 'descending'
          : ''
    }
  }
}
</script>
