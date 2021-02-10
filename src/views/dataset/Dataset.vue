<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        type="primary"
        icon="delete"
        class="handle-del mr10"
        @click="delAll"
      >Remove select
      </el-button>
      <el-input v-model="select_word" placeholder="key word (name, owner)" class="handle-input mr10"/>
      <el-button type="primary" icon="el-icon-search" @click="search">Search</el-button>
      <el-button
        type="primary"
        icon="el-icon-upload"
        @click="handleImport()"
      >Import
      </el-button>
      <!-- <el-button type="primary" icon="el-icon-plus" @click="handleAdd()">Add</el-button> -->
    </div>
    <el-table
      ref="multipleTable"
      :data="data"
      :default-sort="{prop: 'created', order: 'descending'}"
      border
      class="table"
      @selection-change="handleSelectionChange"
      @sort-change="sortChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="id" label="id" sortable />
      <el-table-column prop="name" label="name" sortable />
      <el-table-column prop="path" label="path" width="200px" sortable />
      <el-table-column prop="size" label="size" sortable />
      <el-table-column label="file">
        <template slot-scope="scope">
          <el-button type="info" size="small" plain @click="visualize(scope.row.id)">Visualize</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="created" label="time" sortable />
      <el-table-column prop="owner" label="owner" />
      <el-table-column label="action" align="center" width="200px">
        <template slot-scope="scope">
          <el-button
            type="text"
            icon="el-icon-download"
            @click="handleDownload(scope.$index, scope.row)"
          >download
          </el-button>
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="handleEdit(scope.$index, scope.row)"
          >edit
          </el-button>
          <el-button
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.$index, scope.row)"
          >remove
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 编辑弹出框 -->
    <el-dialog :visible.sync="editVisible" title="Edit" width="450px" center>
      <el-form ref="updateForm" :model="updateForm">
        <el-form-item label="Dataset Name" label-width="120px">
          <el-input v-model="updateForm.name" style="width: 240px;" placeholder="required" />
        </el-form-item>
        <el-form-item>
          <el-upload
            ref="uploadEdit"
            :http-request="editFileMethod"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-change="handleChangeEdit"
            :file-list="fileListEdit"
            :auto-upload="false"
            :limit="2"
            class="upload-demo"
            style="width: 360px"
            drag
            name="file"
            action="/api/datasets/"
            accept=".csv">
            <i class="el-icon-upload" />
            <div class="el-upload__text">Drag your file here to begin or
              <em>click to browse</em>
            </div>
            <div slot="tip" class="el-upload__tip">Please upload csv file</div>
          </el-upload>
          <span class="dialog-footer">
            <el-button style="margin-top: 10px;" size="small" type="success" @click="submitUploadEdit">Submit</el-button>
          </span>
        </el-form-item>
      </el-form>
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
    <el-dialog :visible.sync="importVisible" title="Upload" width="450px" center>
      <el-form ref="createForm" :model="createForm">
        <el-form-item label="Dataset Name" label-width="120px">
          <el-input v-model="createForm.name" style="width: 240px;" placeholder="required"/>
        </el-form-item>
        <el-form-item>
          <el-upload
            ref="upload"
            :http-request="uploadFileMethod"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-change="handleChange"
            :file-list="fileList"
            :auto-upload="false"
            :limit="2"
            class="upload-demo"
            style="width: 360px"
            drag
            name="file"
            action="/api/datasets/"
            accept=".csv">
            <i class="el-icon-upload" />
            <div class="el-upload__text">Drag your file here to begin or
              <em>click to browse</em>
            </div>
            <div slot="tip" class="el-upload__tip">Please upload csv file</div>
          </el-upload>
          <span class="dialog-footer">
            <el-button style="margin-top: 10px;" size="small" type="success" @click="submitUpload">Submit</el-button>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
/* eslint-disable */
  import {fetchList, uploadDataset, editDataset, deleteDataset, deleteMutipleDataset, getDatasetHighlight} from '@/api/datasets'
  import Pagination from '@/components/Pagination'

  export default {
    name: 'Dataset',
    components: { Pagination },
    data() {
      return {
        list: [],
        total: 0,
        multipleSelection: [],
        select_word: '',
        del_list: [],
        is_search: false,
        editVisible: false,
        delVisible: false,
        importVisible: false,

        listLoading: true,
        page: 1,
        listQuery: {
          limit: 20,
          offset: undefined,
          sort: undefined
        },
        createForm: {
          name: '',
          file: undefined
        },
        updateForm: {
          id: '',
          name: '',
          file: ''
        },
        idx: -1,
        fileList: [],
        fileListEdit: [],
      }
    },
    computed: {
      data() {
        return this.list.filter(d => {
          let is_del = false
          for (let i = 0; i < this.del_list.length; i++) {
            if (d.name === this.del_list[i].name) {
              is_del = true
              break
            }
          }
          if (!is_del) {
            if (
              d.name.indexOf(this.select_word) > -1 ||
              d.owner.indexOf(this.select_word) > -1
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
      search() {
        this.is_search = true
      },
      visualize(id) {
        console.log('to do')
      },
      handleImport() {
        this.importVisible = true
      },
      handleDownload(index, row) {
        getDatasetHighlight(row.id).then(response => {
          let fileURL = window.URL.createObjectURL(new Blob([response.data]))
          let fileLink = document.createElement('a')
          fileLink.href = fileURL
          fileLink.setAttribute('download', response.headers['content-disposition'].split('=')[1].replace(/^\"+|\"+$/g, ''));
          document.body.appendChild(fileLink)
          fileLink.click();
          document.body.removeChild(fileLink)
          // Just to simulate the time of the request
          setTimeout(() => {
          }, 1.5 * 1000)
        })
      },
      handleEdit(index, row) {
        this.idx = index
        const item = row
        this.updateForm = {
          id: item.id,
          name: item.name,
          file: item.file
        }
        this.editVisible = true
      },
      handleDelete(index, row) {
        this.idx = index
        this.row = row
        this.delVisible = true
      },
      delAll() {
        const length = this.multipleSelection.length
        var str = ''
        // this.del_list = this.del_list.concat(this.multipleSelection)
        this.del_id_list = []
        for (let i = 0; i < length; i++) {
          str += this.multipleSelection[i].name + ', '
          // this.list.splice(this.multipleSelection[i].idx, 1)
          this.del_id_list.push(this.multipleSelection[i].id)
        }
        const formData = new FormData()
        formData.append('ids', this.del_id_list)
        deleteMutipleDataset(formData).then(response => {
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
          if (response) {
            this.$message({
              showClose: true,
              // message: 'deleted' + str.substring(0, str.length - 2),
              message: response.message,
              type: 'success'
            })
          }
          this.multipleSelection = []
          this.getList()
        }).catch(message => {
          console.log('message======================', message)
          this.$message.error('delete error')
        })
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
      },
      // 确定删除
      deleteRow() {
        deleteDataset(this.row.id).then(response => {
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
          if (response) {
            this.$message({
              showClose: true,
              // message: 'delete seccessfully',
              message: response.message,
              type: 'success'
            })
          }
          // this.list.splice(this.idx, 1)
          this.delVisible = false
          this.getList()
        }).catch(message => {
          console.log('message======================', message)
          this.$message.error('delete error')
        })
      },
      handleChange(file)
      {
        this.fileList.splice(0,this.fileList.length)
        this.createForm.name = file.name
        this.fileList.push(file)
      },

      handleChangeEdit(file)
      {
        this.fileListEdit.splice(0,this.fileListEdit.length)
        this.updateForm.name = file.name
        this.fileListEdit.push(file)
      },
      handleRemove(file, fileList) {
        console.log(file, fileList)
      },
      handlePreview(file) {
        console.log(file)
      },
      submitUpload(param) {
        this.$refs.upload.submit()
      },
      submitUploadEdit(param) {
        this.$refs.uploadEdit.submit()
      },
      uploadFileMethod(param) {
        let fileObject = param.file
        let formData = new FormData()
        formData.append('name', this.createForm.name)
        formData.append('file', fileObject)
        uploadDataset(formData).then(response => {
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
          if (response) {
            this.$message({
              showClose: true,
              message: 'upload seccessfully',
              type: 'success'
            })
          }
          this.$refs.upload.clearFiles()
          this.importVisible = false
          this.createForm.name = ''
          this.getList()
        }).catch(message => {
          console.log('message======================', message)
          this.$message.error('upload error')
        })
      },
      editFileMethod(param) {
        let fileObject = param.file
        let formData = new FormData()
        formData.append('name', this.updateForm.name)
        formData.append('file', fileObject)
        editDataset(this.updateForm.id, formData).then(response => {
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
          if (response) {
            this.$message({
              showClose: true,
              message: 'upload seccessfully',
              type: 'success'
            })
          }
          this.$refs.uploadEdit.clearFiles()
          this.editVisible = false
          this.updateForm.name = ''
          this.getList()
        }).catch(message => {
          console.log('message======================', message)
          this.$message.error('upload error')
        })
      },
      handleSearch() {
        this.page = 1
        this.getList()
      },
      sortChange(data) {
        const {prop, order} = data
        this.sortByColumn(prop, order)
      },
      sortByColumn(prop, order) {
        if (order === 'ascending') {
          this.listQuery.sort = prop
        } else {
          this.listQuery.sort = '-' + prop
        }
        this.handleSearch()
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
