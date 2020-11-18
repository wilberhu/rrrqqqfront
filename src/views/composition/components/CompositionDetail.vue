<template>
  <div class="app-container">
    <el-form ref="compositionForm" :model="compositionForm">
      <el-row :gutter="8">
        <el-col :xs="{span: 24}" :sm="{span: 6}" :md="{span: 6}" :lg="{span: 6}" :xl="{span: 6}" style="padding-right:8px;margin-bottom:30px;">
          <el-form-item label="资金总额" label-width="120px">
            <el-input v-model="compositionForm.stock" placeholder="请输入内容"></el-input>
          </el-form-item>
          <el-timeline :reverse="false">
            <el-timeline-item
              v-for="(activity, activity_index) in compositionForm.activities"
              :key="activity_index"
              :timestamp="activity.timestamp">
              <span v-for="(company, company_index) in activity.companies.slice(0,3)" :key="company_index">
                {{company.name}}: {{company.share}}
              </span>
              <span v-if="activity.companies.length>3">
                ......
              </span>
              <div class="edit" @click="edit( activity_index )" >
                <i class="el-icon-edit-outline" />
              </div>
              <div class="destroy" @click="destroy( activity_index )" >
                <i class="el-icon-close" />
              </div>
            </el-timeline-item>
          </el-timeline>
          <div class="add" @click="add()" >
            <i class="el-icon-circle-plus" />
          </div>
          <el-button
            style="margin-top:40px;"
            :loading="loading"
            class="code-button-item"
            type="primary"
            @click.native.prevent="submit"
          >save</el-button>
        </el-col>
        <el-col :xs="{span: 24}" :sm="{span: 18}" :md="{span: 18}" :lg="{span: 18}" :xl="{span: 18}" style="margin-bottom:30px;">
          <el-row>
            <bar-chart />
          </el-row>
          <el-row>
            <line-chart :chart-data="lineChartData" />
          </el-row>
        </el-col>
      </el-row>
    </el-form>
    <!-- 编辑弹出框 -->
    <el-dialog :visible.sync="editVisible" title="Edit" width="80vw" center>
      <el-form ref="compositionForm" :model="updateForm">
        <el-form-item label="资金总额" label-width="120px">
          <el-input :readonly="'readonly'" v-model="compositionForm.stock" placeholder="请输入内容" style="width: 220px;"></el-input>
        </el-form-item>
        <el-form-item label="日期" label-width="120px">
          <el-date-picker
            v-model="updateForm.timestamp"
            type="date"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="股票份额" label-width="120px">
        </el-form-item>
        <el-form-item label="" label-width="120px" style="margin: 0" v-for="(company, company_index) in updateForm.companies" :key="company_index">
          <el-input :readonly="'readonly'" v-model="company.name" placeholder="请输入内容" style="width: 220px;"></el-input>
          <el-button style="margin-top: 10px;" type="primary" plain @click="">Browser</el-button>
          <el-input :readonly="false" v-model="company.share" placeholder="请输入内容" style="width: 220px;"></el-input>
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="editCompany()"
          >edit
          </el-button>
          <el-button
            type="text"
            icon="el-icon-delete"
            @click="deleteCompany()"
          >remove
          </el-button>
        </el-form-item>
        <el-form-item label="空闲资金" label-width="120px" style="margin: 10px 0 0 0;">
          <el-input :readonly="'readonly'" v-model="idleFunds" placeholder="请输入内容" style="width: 220px;"></el-input>
        </el-form-item>
        <el-form-item label="" label-width="120px" style="margin: 0px">
          <el-button style="margin-top: 10px;" type="primary" plain @click="">Add</el-button>
        </el-form-item>
        <el-form-item label-width="120px">
          <span class="dialog-footer">
            <el-button style="margin-top: 10px;" size="small" type="primary" @click="submit">Submit</el-button>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 删除提示框 -->
    <el-dialog :visible.sync="delVisible" title="Delete" width="300px" center>
      <div class="del-dialog-cnt">Are you confirm to remove the data?</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delVisible = false">Cancle</el-button>
        <el-button type="primary" @click="deleteRow">OK</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchItem, fetchHighlight, createItem, updateItem } from '@/api/strategy'
import { fetchList } from '@/api/datasets'
// import Pagination from '@/components/Pagination'
import LineChart from './LineChart'
import BarChart from './BarChart'

const lineChartData = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  }
}

export default {
  name: 'CompositionDetail',
  components: {
    LineChart,
    BarChart
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      compositionForm: {
        stock: 100000,
        activities: [{
          companies: [
            { name: 'SH.000001', share: 50 },
            { name: 'SH.000003', share: 50 }
          ],
          timestamp: '2018-04-11'
        }, {
          companies: [
            { name: 'SH.000001', share: 50 },
            { name: 'SH.000002', share: 50 },
            { name: 'SH.000003', share: 50 }
          ],
          timestamp: '2018-04-13'
        }, {
          companies: [
            { name: 'SH.000001', share: 50 },
            { name: 'SH.000002', share: 50 },
            { name: 'SH.000003', share: 50 },
            { name: 'SH.000004', share: 50 }
          ],
          timestamp: '2018-04-15'
        }]
      },
      updateForm: {
        companies: [],
        timestamp: undefined
      },
      loading: false,
      reverse: true,
      lineChartData: lineChartData.newVisitis,
      editVisible: false,
      delVisible: false
    }
  },
  created() {
  },
  computed: {
    idleFunds() {
      return 0
    }
  },
  methods: {
    submit() {
    },
    onCmReady(cm) {
      cm.setSize('100%', 'calc(100vh - 84px - 34px - 34px)')
    },
    onCmFocus(cm) {},
    onCmCodeChange(newCode) {
      // this.code = newCode.replace('\t', '    ')
    },
    betterTab(cm) {
      if (cm.somethingSelected()) {
        cm.indentSelection('add')
      } else {
        var spaces = Array(cm.getOption('indentUnit') + 1).join(' ')
        cm.replaceSelection(spaces)
      }
    },

    getList() {
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
    },
    edit(index) {
      this.updateForm = Object.assign({}, this.compositionForm.activities[index])
      this.editVisible = true
    },
    destroy(index) {
      this.delVisible = true
    },
    add() {
      this.updateForm.timestamp = undefined
      this.updateForm.companies = []
      this.editVisible = true
    },
    editCompany() {
    },
    deleteCompany() {
    },
    // 确定删除
    deleteRow() {
      // deleteAjustment(this.row.id).then(response => {
      //   setTimeout(() => {
      //     this.listLoading = false
      //   }, 1.5 * 1000)
      //   if (response) {
      //     this.$message({
      //       showClose: true,
      //       // message: 'delete seccessfully',
      //       message: response.message,
      //       type: 'success'
      //     })
      //   }
      //   // this.list.splice(this.idx, 1)
      //   this.delVisible = false
      //   this.getList()
      // }).catch(message => {
      //   console.log('message======================', message)
      //   this.$message.error('delete error')
      // })
    }
  }
}
</script>

<style scoped>
  .el-timeline-item .destroy {
    display: none;
    position: absolute;
    right: 20px;
    bottom: -5px;
    margin: auto 0;
    font-size: 25px;
    color: #F44336;
    transition: color 0.2s ease-out;
    cursor: pointer;
  }
  .el-timeline-item .destroy:hover {
    color: #FFFFFF;
    background-color: #F44336;
  }
  .el-timeline-item .destroy:after {
    content: '';
  }
  .el-timeline-item:hover .destroy {
    display: block;
  }
  .el-timeline-item .edit {
    display: none;
    position: absolute;
    right: 50px;
    bottom: -5px;
    margin: auto 0;
    font-size: 25px;
    color: #2196F3;
    transition: color 0.2s ease-out;
    cursor: pointer;
  }
  .el-timeline-item .edit:hover {
    color: #FFFFFF;
    background-color: #2196F3;
  }
  .el-timeline-item .edit:after {
    content: '';
  }
  .el-timeline-item:hover .edit {
    display: block;
  }
  .add {
    display: block;
    margin-left: 35px;
    /*margin: auto 0;*/
    font-size: 25px;
    color: #4CAF50;
    transition: color 0.2s ease-out;
    cursor: pointer;
  }
  .add:hover {
    color: #388E3C;
  }
  .add:after {
    content: '';
  }
</style>
