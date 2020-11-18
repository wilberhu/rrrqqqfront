<template>
  <div class="tab-container">
<!--    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">-->
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
    <el-table
      v-loading="listLoading"
      ref="multipleTable"
      :key="tableKey"
      :data="list"
      row-key="id"
      border
      fit
      highlight-current-row
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column fixed :reserve-selection="true" v-model="multipleSelection" type="selection" align="center" width="55"/>
      <el-table-column align="center" prop="id" sortable label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="title" sortable label="Title">
        <template slot-scope="scope">
          <router-link :to="'/strategy/edit/'+scope.row.id" class="link-type">
            <span>{{ scope.row.title }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="start_date" sortable label="Start_Date">
        <template slot-scope="scope">
          <span>{{ scope.row.start_date }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="start_date" sortable label="Start_Date">
        <template slot-scope="scope">
          <span>{{ scope.row.start_date }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="Total_Returns" sortable label="Total_Returns">
        <template slot-scope="scope">
          {{ scope.row.Total_Returns }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="Annual_Returns" sortable label="Annual_Returns">
        <template slot-scope="scope">
          {{ scope.row.Annual_Returns }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created" sortable label="Date">
        <template slot-scope="scope">
          <span>{{ scope.row.created | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Result">
        <template slot-scope="scope">
          <el-button type="primary" size="small" icon="el-icon-view" @click="viewResult(scope.$index, scope.row)">Result</el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Owner">
        <template slot-scope="scope">
          <span>{{ scope.row.owner }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions">
        <template slot-scope="scope">
          <router-link :to="'/strategy/edit/'+scope.row.id">
            <el-button type="text" size="small" icon="el-icon-edit">Edit</el-button>
          </router-link>
          <el-button type="text" size="small" icon="el-icon-delete" @click="handleDelete(scope.$index, scope.row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 删除提示框 -->
    <el-dialog :visible.sync="delVisible" title="Warning" width="300px" center>
      <div class="del-dialog-cnt">Are you confirm to remove the data?</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delVisible = false">Cancle</el-button>
        <el-button type="primary" @click="deleteRow">OK</el-button>
      </span>
    </el-dialog>

    <!-- MultiLine弹出框 -->
    <el-dialog :visible.sync="multiLineVisible" title="compare companies" width="500px">
      <el-form label-width="100px">
        <el-form-item label="companies: ">
          <el-tag v-for="tag in multipleSelection" :key="tag.id" :type="'success'" closable style="margin: 2px" @close="closeTag(tag)">{{ tag.id }} - {{ tag.title }}</el-tag>
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
import { Message } from 'element-ui'
import { fetchList, deleteItem, fetchResult } from '@/api/strategy'
import Pagination from '@/components/Pagination'

export default {
  name: 'CompositionList',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
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
        sort: undefined
      },
      index: null,
      row: null,
      delVisible: false,
      multiLineVisible: false,
      multipleSelection: []
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
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleFilter() {
      this.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      this.sortByColumn(prop, order)
    },
    handleSelectionChange(rows) {
      this.multipleSelection = rows
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
    handleDelete(index, row) {
      this.index = index
      this.row = row
      this.delVisible = true
    },
    // 确定删除
    deleteRow() {
      deleteItem(this.row.id).then(response => {
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
        this.$message({
          showClose: true,
          message: 'delete seccessfully',
          type: 'success'
        })
        // this.list.splice(this.idx, 1)
        this.delVisible = false
        this.getList()
      }).catch(message => {
        console.log('message======================', message)
        this.$message.error('delete error')
      })
    },
    // 查看结果
    viewResult(index, row) {
      fetchResult(row.id).then(response => {
        this.listLoading = false
        this.$router.push({
          name: 'StrategyResult',
          params: {
            strategy_result: response
          }
        })
      })
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
    clickMainBtn() {
      this.multipleSelection.sort(this.compare('id'))
      this.multiLineVisible = !this.multiLineVisible
    },
    closeTag(tag) {
      for (let i = 0; i < this.multipleSelection.length; i++) {
        if (this.multipleSelection[i].id === tag.id) {
          this.$refs.multipleTable.toggleRowSelection(this.multipleSelection[i])
          break
        }
      }
      this.multipleSelection.sort(this.compare('id'))
    },
    showCharts() {
      if (this.multipleSelection.length <= 0 || this.multipleSelection.length > 10) {
        Message({
          // message: error.message,
          message: 'The companies should be more than 0 and less than 10',
          type: 'error',
          duration: 5 * 1000
        })
        return
      }
      this.$router.push({
        name: 'StrategyCompareChart',
        params: {
          codes: this.multipleSelection
        }
      })
      this.multiLineVisible = false
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
