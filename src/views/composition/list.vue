<template>
  <div class="tab-container">
    <el-table
      ref="multipleTable"
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      row-key="id"
      border
      fit
      highlight-current-row
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-model="multipleSelection" fixed :reserve-selection="true" type="selection" align="center" width="55" />
      <el-table-column align="center" prop="id" sortable label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="name" sortable label="Name">
        <template slot-scope="scope">
          <router-link :to="'/composition/edit/'+scope.row.id" class="link-type">
            <span>{{ scope.row.name }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="allfund" sortable label="Allfund">
        <template slot-scope="scope">
          <span>{{ scope.row.allfund }}</span>
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
          <router-link :to="'/composition/edit/'+scope.row.id">
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
import { fetchList, deleteItem } from '@/api/composition'
import Pagination from '@/components/Pagination'

export default {
  name: 'CompositionList',
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
        this.$refs.multipleTable.clearSelection()
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
