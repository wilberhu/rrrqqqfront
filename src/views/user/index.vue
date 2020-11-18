<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="select_word" placeholder="key word (username, firstname, lastname)" class="handle-input mr10" />
      <el-button type="primary" icon="el-icon-search" @click="search">Search</el-button>
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="handleImport()"
      >Create</el-button>
    </div>
    <el-table
      ref="multipleTable"
      :data="data"
      :default-sort="{prop: 'created', order: 'descending'}"
      border
      class="table"
      @selection-change="handleSelectionChange"
      @sort-change="sortChange"
    >
      <el-table-column prop="id" label="id" width="70" sortable="custom" />
      <el-table-column prop="username" label="username" sortable="custom" />
      <el-table-column prop="email" label="email" sortable="custom" />
      <el-table-column prop="first_name" label="first_name" sortable="custom" />
      <el-table-column prop="last_name" label="last_name" sortable="custom" />
      <el-table-column label="token" width="100">
        <template slot-scope="scope">
          <el-button
            plain
            type="primary"
            size="mini"
            icon="el-icon-view"
            @click="handleToken(scope.$index, scope.row)"
          >view</el-button>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" width="180" class-name="status-col">
        <template slot-scope="scope">
          <template v-if="scope.row.is_superuser">
            <el-tag>superuser</el-tag>
          </template>
          <template v-if="scope.row.is_staff">
            <el-tag :type="'success'">staff</el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="action" width="180" align="center">
        <template slot-scope="scope">
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="handleEdit(scope.$index, scope.row)"
          >edit</el-button>
          <el-button
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.$index, scope.row)"
          >remove</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- Token弹出框 -->
    <el-dialog :visible.sync="tokenVisible" title="Token" width="450px">
      <span>{{ tokenForm.token }}</span><br><br>
      <el-button type="primary" round @click="changeToken">Change Token</el-button>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="tokenVisible = false">OK</el-button>
      </span>
    </el-dialog>

    <!-- 编辑弹出框 -->
    <el-dialog :visible.sync="editVisible" title="Edit" width="450px">

      <el-form ref="createForm" :model="updateForm" label-width="100px">
        <el-form-item label="username">
          <el-input v-model="updateForm.username" />
        </el-form-item>
        <el-form-item label="password">
          <el-input v-model="updateForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="email">
          <el-input v-model="updateForm.email" />
        </el-form-item>
        <el-form-item label="first name">
          <el-input v-model="updateForm.first_name" />
        </el-form-item>
        <el-form-item label="last name">
          <el-input v-model="updateForm.last_name" />
        </el-form-item>
        <el-form-item>
          <el-switch
            v-model="updateForm.is_staff"
            active-text="管理员"
            inactive-text="普通用户"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">Cancle</el-button>
        <el-button type="primary" @click="saveEdit">OK</el-button>
      </span>
    </el-dialog>

    <!-- 删除提示框 -->
    <el-dialog :visible.sync="delVisible" title="Warning" width="300px" center>
      <div class="del-dialog-cnt">Are you confirm to remove the data?</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delVisible = false">Cancle</el-button>
        <el-button type="primary" @click="deleteRow">OK</el-button>
      </span>
    </el-dialog>

    <!-- 上传框 -->
    <el-dialog :visible.sync="createVisible" title="Create" width="500px" center>
      <el-form ref="createForm" :model="createForm" label-width="100px">
        <el-form-item label="username">
          <el-input v-model="createForm.username" />
        </el-form-item>
        <el-form-item label="password">
          <el-input v-model="createForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="email">
          <el-input v-model="createForm.email" />
        </el-form-item>
        <el-form-item label="first name">
          <el-input v-model="createForm.first_name" />
        </el-form-item>
        <el-form-item label="last name">
          <el-input v-model="createForm.last_name" />
        </el-form-item>
        <el-form-item>
          <el-switch
            v-model="createForm.is_staff"
            active-text="管理员"
            inactive-text="普通用户"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createVisible = false">Cancle</el-button>
        <el-button type="primary" @click="submitCreate">OK</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
import { fetchItemList, createItem, updateItem, deleteItem, updateToken } from '@/api/user'
import Pagination from '@/components/Pagination'

export default {
  name: 'User',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      multipleSelection: [],
      select_word: '',
      del_list: [],
      is_search: false,
      tokenVisible: false,
      createVisible: false,
      editVisible: false,
      delVisible: false,
      token: undefined,

      listLoading: true,
      page: 1,
      listQuery: {
        limit: 20,
        offset: undefined,
        sort: undefined
      },
      createForm: {
        username: undefined,
        password: undefined,
        email: undefined,
        first_name: '',
        last_name: '',
        is_superuser: false,
        is_staff: false
      },
      updateForm: {
        id: undefined,
        username: undefined,
        password: undefined,
        email: undefined,
        first_name: '',
        last_name: '',
        is_superuser: false,
        is_staff: false
      },
      idx: -1,
      tokenForm: {
        token: '',
        username: ''
      }
    }
  },
  computed: {
    data() {
      return this.list.filter(d => {
        let is_del = false
        for (let i = 0; i < this.del_list.length; i++) {
          if (d.username === this.del_list[i].username) {
            is_del = true
            break
          }
        }
        if (!is_del) {
          if (
            d.username.indexOf(this.select_word) > -1 ||
            d.first_name.indexOf(this.select_word) > -1 ||
            d.last_name.indexOf(this.select_word) > -1
          ) {
            return d
          }
        }
      })
    },
    offset: function() {
      return (this.page - 1) * this.listQuery.limit
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList() {
      this.listQuery.offset = this.offset
      this.listLoading = true
      fetchItemList(this.listQuery).then(response => {
        this.list = response.results
        this.total = response.count
        this.listLoading = false

        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    search() {
      this.is_search = true
    },

    handleToken(index, row) {
      this.idx = index
      this.tokenForm.token = row.token
      this.tokenForm.username = row.username
      this.tokenVisible = true
    },
    changeToken(tmp_token) {
      updateToken(this.tokenForm).then(response => {
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
        this.tokenForm.token = response.token
        this.$message({
          showClose: true,
          message: 'Token successfully updated',
          type: 'success'
        })
        this.multipleSelection = []
      }).catch(message => {
        this.$message.error('change error')
      }).then(response => {
        this.getList()
      })
    },
    handleImport() {
      this.createVisible = true
    },
    handleEdit(index, row) {
      this.idx = index
      this.updateForm = {
        id: row.id,
        username: row.username,
        password: row.password,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        is_superuser: !!row.is_superuser,
        is_staff: row.is_staff
      }
      this.editVisible = true
    },
    handleDelete(index, row) {
      this.idx = index
      this.row = row
      this.delVisible = true
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 保存编辑
    saveEdit() {
      updateItem(this.updateForm.id, this.updateForm).then(response => {
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
        if (response) {
          this.$message({
            showClose: true,
            message: 'Update successfully',
            type: 'success'
          })
        }
        this.$set(this.list, this.idx, this.updateForm)
        this.editVisible = false
        this.$message.success(`successfully edit row ${this.idx + 1}`)
      }).catch(message => {
        console.log('message======================', message)
        this.$message.error('Update error')
      })
    },
    // 确定删除
    deleteRow() {
      deleteItem(this.row.id).then(response => {
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
        if (response) {
          this.$message({
            showClose: true,
            message: 'delete successfully',
            type: 'success'
          })
        }
        // this.list.splice(this.idx, 1)
        this.$message.success('deleted successfully')
        this.delVisible = false
        this.getList()
      }).catch(message => {
        console.log('message======================', message)
        this.$message.error('delete error')
      })
    },
    submitCreate(param) {
      createItem(this.createForm).then(response => {
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
        if (response) {
          this.$message({
            showClose: true,
            message: 'Create seccessfully',
            type: 'success'
          })
        }
        this.createVisible = false
        this.createForm.username = ''
        this.createForm.password = ''
        this.createForm.email = ''
        this.createForm.first_name = ''
        this.createForm.last_name = ''
        this.createForm.is_staff = false
        this.createForm.is_superuser = false
        this.getList()
      }).catch(message => {
        console.log('message======================', message)
        this.$message.error('Create error')
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
      } else {
        this.listQuery.sort = '-' + prop
      }
      this.handleFilter()
    }
  }
}
</script>

<style scoped>
.handle-input {
  width: 300px;
  display: inline-block;
}
.del-dialog-cnt {
  font-size: 16px;
  text-align: center;
}
</style>
