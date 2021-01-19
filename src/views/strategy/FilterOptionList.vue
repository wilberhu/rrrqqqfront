<template>
  <div class="tab-container">
    <div class="filter-container">
      <el-button type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
    </div>
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
      <el-table-column align="center" prop="title" sortable label="Key">
        <template slot-scope="scope">
          <router-link :to="'/strategy/edit/'+scope.row.id" class="link-type">
            <span>{{ scope.row.key }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created" sortable label="Label">
        <template slot-scope="scope">
          <span>{{ scope.row.label }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="modified" sortable label="Table">
        <template slot-scope="scope">
          <span>{{ scope.row.table }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="method" sortable label="Method">
        <template slot-scope="scope">
          <span>{{ scope.row.method }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="owner" label="Owner">
        <template slot-scope="scope">
          <span>{{ scope.row.owner }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions">
        <template slot-scope="scope">
          <el-button type="text" size="small" icon="el-icon-edit" @click="handleUpdate(scope.row)">Edit</el-button>
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

    <!-- 编辑提示框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="filterOption" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="Key" prop="key">
          <el-input v-model="filterOption.key" />
        </el-form-item>
        <el-form-item label="Label" prop="label">
          <el-input v-model="filterOption.label" />
        </el-form-item>
        <el-form-item label="Table" prop="table">
          <el-select v-model="filterOption.table" class="filter-item" placeholder="Please select">
            <el-option v-for="item in tableOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="Method" prop="method">
          <el-select v-model="filterOption.method" class="filter-item" placeholder="Please select">
            <el-option v-for="item in methodOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, createItem, updateItem, deleteItem } from '@/api/filterOption'
import Pagination from '@/components/Pagination'

export default {
  name: 'FilterOptionList',
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
      multipleSelection: [],
      filterOption: {
        id: undefined,
        key: '',
        label: '',
        method: '',
        table: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      tableOptions: [
        {
          key: 'fina_indicators',
          label: 'fina_indicators'
        }
      ],
      methodOptions: [
        {
          key: 'query',
          label: 'query'
        }
      ],
      rules: {
        key: [{ required: true, message: 'key is required', trigger: 'change' }],
        label: [{ required: true, message: 'label is required', trigger: 'change' }],
        table: [{ required: true, message: 'table is required', trigger: 'blur' }],
        method: [{ required: true, message: 'method is required', trigger: 'blur' }]
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
    resetTemp() {
      this.filterOption = {
        id: undefined,
        key: '',
        label: '',
        method: '',
        table: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createItem(this.filterOption).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.filterOption = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.filterOption)
          updateItem(tempData.id, tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
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
    }
  }
}
</script>

<style>
  .tab-container {
    margin: 20px;
  }
</style>
