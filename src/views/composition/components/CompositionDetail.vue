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
                {{company.ts_code}}: {{company.share}}
              </span>
              <span v-if="activity.companies.length>3">
                ......
              </span>
              <div class="edit" @click="editTimestamp( activity_index )" >
                <i class="el-icon-edit-outline" />
              </div>
              <div class="destroy" @click="destroyTimestamp( activity_index )" >
                <i class="el-icon-close" />
              </div>
            </el-timeline-item>
          </el-timeline>
          <div class="add" @click="addTimestamp()" >
            <i class="el-icon-circle-plus" />
          </div>
          <el-button
            style="margin-top:40px;"
            :loading="loading"
            class="code-button-item"
            type="primary"
            @click.native.prevent="submit"
          >Submit</el-button>
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
    <el-dialog :visible.sync="editVisible" :title="isTimestampEdit ? 'Edit' : 'Add'" width="80vw" center>
      <el-form ref="compositionForm" :model="updateForm">
        <el-form-item label="资金总额" label-width="120px">
          <el-input :readonly="'readonly'" v-model="updateForm.stock" placeholder="请输入内容" style="width: 220px;"></el-input>
        </el-form-item>
        <el-form-item label="日期" label-width="120px">
          <el-date-picker
            :picker-options="datePickerOptions"
            :readonly="isTimestampEdit?'readonly':false"
            v-model="updateForm.timestamp"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择日期"
            @blur="computeFund"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="股票份额" label-width="120px">
          <el-form-item style="margin: 5px 0" v-for="(company, company_index) in updateForm.companies" :key="company_index">
            <el-autocomplete
              v-model="updateForm.companies[company_index].ts_code_name"
              :fetch-suggestions="querySearchAsync"
              placeholder="请输入内容"
              style="width: 220px;"
              @select="handleSelect($event, company_index)"
            ></el-autocomplete>
            <span style="margin-left: 20px;">股数：</span>
            <el-input type="number" min="0" :readonly="false" v-model="company.share" placeholder="请输入内容" style="width: 100px;" @input="computeFund($event, company_index)"></el-input>
            <span style="margin-left: 20px;">股价：{{ updateForm.companies[company_index].close || '' }}</span>
            <span style="margin-left: 20px;">资金：{{ updateForm.companies[company_index].fund || '' }}</span>
            <el-button
              type="text"
              icon="el-icon-delete"
              style="margin-left: 20px;"
              @click="deleteCompany(($event, company_index))"
            >remove
            </el-button>
          </el-form-item>
          <el-button style="margin-top: 10px;" type="primary" plain @click="addCompany()">Add</el-button>
        </el-form-item>
        <el-form-item label="空闲资金" label-width="120px" style="margin: 10px 0 0 0;">
          <el-input :readonly="'readonly'" v-model="updateForm.free_stock" style="width: 220px;"></el-input>
        </el-form-item>
        <el-form-item label-width="120px">
          <span class="dialog-footer">
            <el-button style="margin-top: 10px;" size="small" type="primary" @click="submitTimestamp">Submit</el-button>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 删除提示框 -->
    <el-dialog :visible.sync="delVisible" title="Delete" width="300px" center>
      <div class="del-dialog-cnt">Are you confirm to remove the data?</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delVisible = false">Cancle</el-button>
        <el-button type="primary" @click="confirmDestroyTimestamp">OK</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import { fetchItem, fetchHighlight, createItem, updateItem } from '@/api/strategy'
import { fetchAllCompanies } from '@/api/basic'
import { getHistData, fetchCompanyClose } from '@/api/histData'
import { dailyTrader } from '@/api/composition'
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
      companies: [],
      tmpCompany: '',
      compositionForm: {
        stock: 100000,
        activities: []
      },
      updateForm: {
        companies: [],
        timestamp: undefined,
        stock: undefined,
        free_stock: undefined,
        fund: undefined
      },
      deleteForm: {
        index: undefined
      },
      loading: false,
      listLoading: false,
      reverse: true,
      lineChartData: lineChartData.newVisitis,
      editVisible: false,
      isTimestampEdit: false,
      delVisible: false,
      datePickerOptions: {
        disabledDate(date) {
          return date > new Date() || date < Date.parse('2000-01-01') || date.getDay() === 0 || date.getDay() === 6
        }
      }
    }
  },
  mounted() {
    this.getAllCompanies()
    this.updateState()
  },
  methods: {
    submit() {
      console.log(this.compositionForm)
    },
    addTimestamp() {
      this.updateForm = {
        companies: [],
        timestamp: undefined,
        stock: 100000,
        free_stock: undefined,
        fund: undefined
      }
      this.editVisible = true
      this.isTimestampEdit = false
    },
    editTimestamp(index) {
      this.updateForm = Object.assign({}, this.compositionForm.activities[index])
      this.editVisible = true
      this.isTimestampEdit = true
      this.computeFund()
    },
    submitTimestamp() {
      if (isNaN(this.updateForm.free_stock) || this.updateForm.free_stock < 0) {
        this.$message({
          showClose: true,
          message: 'Free stock less than 0',
          type: 'Error'
        })
        return
      }
      const companyList = []
      for (const item of this.updateForm.companies) {
        if (!item.ts_code || item.ts_code === '') {
          this.$message({
            showClose: true,
            message: 'Company name cannot be null',
            type: 'Error'
          })
          return
        }
        if (companyList.indexOf(item.ts_code) !== -1) {
          this.$message({
            showClose: true,
            message: 'Companies duplicated',
            type: 'Error'
          })
          return
        } else {
          companyList.push(item.ts_code)
        }
      }
      if (this.isTimestampEdit) {
        for (let i = 0; i < this.compositionForm.activities.length; i++) {
          if (this.updateForm.timestamp === this.compositionForm.activities[i].timestamp) {
            this.compositionForm.activities.splice(i, 1, this.updateForm)
            this.editVisible = false
            this.updateState()
            return
          }
        }
      } else {
        for (let i = 0; i < this.compositionForm.activities.length; i++) {
          if (this.updateForm.timestamp > this.compositionForm.activities[i].timestamp) {
            continue
          } else if (this.updateForm.timestamp === this.compositionForm.activities[i].timestamp) {
            this.$message({
              showClose: true,
              message: 'Timestamp duplicated',
              type: 'Error'
            })
            this.updateState()
            return
          } else {
            this.compositionForm.activities.splice(i, 0, this.updateForm)
            this.editVisible = false
            this.updateState()
            return
          }
        }
        this.compositionForm.activities.splice(this.compositionForm.activities.length, 0, this.updateForm)
        this.editVisible = false
        this.updateState()
      }
    },
    destroyTimestamp(index) {
      this.deleteForm.index = index
      this.delVisible = true
    },
    confirmDestroyTimestamp() {
      this.compositionForm.activities.splice(this.deleteForm.index, 1)
      this.delVisible = false
      this.updateState()
    },
    addCompany(item) {
      this.updateForm.companies.push({
        ts_code_name: '',
        name: '',
        ts_code: '',
        share: 0
      })
    },
    deleteCompany(item, company_index) {
      this.updateForm.companies.splice(company_index, 1)
    },
    querySearchAsync(queryString, cb) {
      var companies = this.companies
      var results = queryString ? companies.filter(this.createContainsFilter(queryString)) : companies
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        cb(results)
      }, 0)
    },
    createContainsFilter(queryString) {
      return (company) => {
        return (company.value.toLowerCase().indexOf(queryString.toLowerCase()) >= 0)
      }
    },
    handleSelect(event, company_index) {
      this.updateForm.companies[company_index].ts_code = event.ts_code
      this.updateForm.companies[company_index].name = event.name
      this.updateForm.companies[company_index].ts_code_name = event.value
      const queryParams = {
        date__lte: this.updateForm.timestamp,
        date__gte: this.updateForm.timestamp
      }
      getHistData(this.updateForm.companies[company_index].ts_code, queryParams).then(response => {
        if (response.hist_data[0]) {
          // ['trade_date', 'open', 'close', 'low', 'high'], 3 means close
          this.updateForm.companies[company_index].close = response.hist_data[0][3]
          this.computeFund(null, company_index)
        } else {
          this.updateForm.companies[company_index].close = 0
          this.computeFund(null, company_index)
        }
      })
    },
    handleBlur(event, company_index) {
      const inputValue = this.updateForm.companies[company_index].ts_code_name
      var companies = this.companies
      if (inputValue) {
        var results = inputValue ? companies.filter(this.createContainsFilter(inputValue)) : companies
        if (results.length === 1) {
          this.handleSelect(results[0], company_index)
        } else {
          this.updateForm.companies[company_index].ts_code = ''
          this.updateForm.companies[company_index].name = ''
          this.updateForm.companies[company_index].ts_code_name = ''
        }
      }
    },
    computeFund(event, company_index) {
      if (company_index != null && company_index !== '') {
        this.updateForm.companies[company_index].fund = this.updateForm.companies[company_index].close * this.updateForm.companies[company_index].share
        this.updateForm.companies = Object.assign([], this.updateForm.companies)
        this.updateForm.free_stock = this.updateForm.stock - this.updateForm.companies.reduce((total, item) => total + Number(item.fund || 0), 0)
      } else {
        const queryParams = {
          date__lte: this.updateForm.timestamp,
          date__gte: this.updateForm.timestamp
        }
        let ts_code_list_string = ''
        for (const item of this.updateForm.companies) {
          if (item.ts_code) {
            ts_code_list_string += item.ts_code + ','
          }
        }
        if (ts_code_list_string !== '') {
          fetchCompanyClose(ts_code_list_string, queryParams).then(response => {
            if (response.close_data[0]) {
              for (let i = 0; i < this.updateForm.companies.length; i++) {
                for (let j = 0; j < response.ts_code_list.length; j++) {
                  if (this.updateForm.companies[i].ts_code === response.ts_code_list[j]) {
                    this.updateForm.companies[i].name = response.name_list[j]
                    this.updateForm.companies[i].close = response.close_data[j][0]
                    this.updateForm.companies[i].fund = this.updateForm.companies[i].close * this.updateForm.companies[i].share
                  }
                }
              }
              this.updateForm.companies = Object.assign([], this.updateForm.companies)
              this.updateForm.free_stock = this.updateForm.stock - this.updateForm.companies.reduce((total, item) => total + Number(item.fund || 0), 0)
            }
          })
        }
      }
    },
    getAllCompanies() {
      this.listLoading = true
      fetchAllCompanies().then(response => {
        this.listLoading = false
        this.companies = []
        for (const item of response) {
          this.companies.push({
            value: item.ts_code + ' - ' + item.name,
            ts_code: item.ts_code,
            name: item.name
          })
        }
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    updateState() {
      dailyTrader(this.compositionForm).then(response => {
        console.log(response)
      })
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
