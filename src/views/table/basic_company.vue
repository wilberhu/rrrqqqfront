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
      <el-table-column :reserve-selection="true" v-model="multipleSelection" type="selection" align="center" width="55"/>
      <el-table-column prop="ts_code" sortable="custom" align="center" :label="$t('table.company.ts_code')" :class-name="getSortClass('ts_code')" width="110">
        <template slot-scope="scope">
          <!--{{ scope.$index }}-->
          {{ scope.row.ts_code }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="name" :label="$t('table.company.name')" :class-name="getSortClass('name')">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="area" :label="$t('table.company.area')">
        <template slot-scope="scope">
          <span>{{ scope.row.area }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="industry" :label="$t('table.company.industry')">
        <template slot-scope="scope">
          <span>{{ scope.row.industry }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="market" :label="$t('table.company.market')">
        <template slot-scope="scope">
          <span>{{ scope.row.market }}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="list_status" :label="$t('table.company.list_status')">
        <template slot-scope="scope">
          <el-tag :type="scope.row.list_status | statusFilter">
            {{ scope.row.list_status }}
          </el-tag>

          <template v-if="scope.row.list_status === 'D'">
            <el-tag :type="scope.row.list_status | statusFilter">
              {{ scope.row.delist_date }}
            </el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column sortable prop="list_date" :label="$t('table.company.list_date')">
        <template slot-scope="scope">
          {{ scope.row.list_date }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="is_hs" :label="$t('table.company.is_hs')">
        <template slot-scope="scope">
          {{ scope.row.is_hs | isHsFilter}}
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
import { fetchCompanyList } from '@/api/basic'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'BasicCompany',
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
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '-null'
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
