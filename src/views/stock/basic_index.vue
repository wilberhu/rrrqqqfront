<template>
  <div>
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
      class="table"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column :reserve-selection="true" v-model="multipleSelection" type="selection" align="center" width="55"/>
      <el-table-column prop="ts_code" sortable="custom" align="center" :label="$t('table.index.ts_code')" :class-name="getSortClass('ts_code')" width="110">
        <template slot-scope="scope">
          <!--{{ scope.$index }}-->
          {{ scope.row.ts_code }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="name" :label="$t('table.index.name')" :class-name="getSortClass('name')">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="market" :label="$t('table.index.market')">
        <template slot-scope="scope">
          {{ scope.row.market }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="category" :label="$t('table.index.category')">
        <template slot-scope="scope">
          {{ scope.row.category }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="base_date" :label="$t('table.index.base_date')">
        <template slot-scope="scope">
          {{ scope.row.base_date }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="base_point" :label="$t('table.index.base_point')">
        <template slot-scope="scope">
          {{ scope.row.base_point }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="list_date" :label="$t('table.index.list_date')">
        <template slot-scope="scope">
          {{ scope.row.list_date }}
        </template>
      </el-table-column>
      <el-table-column prop="hist_data" :label="$t('table.hist_data')">
        <template v-if="scope.row.has_hist_data" slot-scope="scope">
          <el-button type="info" @click="drawLine(scope.row)">{{ $t('table.hist_data') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { fetchIndexList } from '@/api/stockBasic'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'StockBasicIndex',
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
