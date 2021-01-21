<template>
  <div class="tab-container">
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
      <el-table-column align="center" prop="name" sortable label="Name">
        <template slot-scope="scope">
          <router-link :to="'/strategy/edit_stock_picking/'+scope.row.id" class="link-type">
            <span>{{ scope.row.name }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="startTime" sortable label="Start_Date">
        <template slot-scope="scope">
          <span>{{ scope.row.startTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="modified" sortable label="Modified">
        <template slot-scope="scope">
          <span>{{ scope.row.modified }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Owner">
        <template slot-scope="scope">
          <span>{{ scope.row.owner }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions">
        <template slot-scope="scope">
          <router-link :to="'/strategy/edit_stock_picking/'+scope.row.id">
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
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { fetchList, deleteItem } from '@/api/stockPicking'
import Pagination from '@/components/Pagination'

export default {
  name: 'StockPickingList',
  components: { Pagination },
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
    handleSearch() {
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
      this.handleSearch()
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
    }
  }
}
</script>

<style>
</style>
