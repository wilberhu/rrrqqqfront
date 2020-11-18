<template>
  <div class="code-container">
    <!-- <link href="https://cdn.jsdelivr.net/npm/animate.css@3.5.1" rel="stylesheet" type="text/css">-->
    <el-form ref="postForm" :model="postForm">
      <div class="code-title-container">
        title
        <el-input
          v-model="postForm.title"
          :maxlength="30"
          class="code-title-item"
          size="mini"
          placeholder="title"
        />
        stock￥
        <el-input
          v-model="postForm.stock"
          :maxlength="15"
          type="number"
          class="code-title-item"
          size="mini"
          placeholder="stock"
        />
        <el-button class="date-picker" size="mini" type="primary" style="margin-left: 16px;" @click="drawer = true">
          展开
        </el-button>
        <el-date-picker
          v-model="period"
          type="daterange"
          align="right"
          class="date-picker"
          size="mini"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions"
        />
      </div>
      <el-drawer
        title="Config"
        :visible.sync="drawer"
        :direction="'rtl'"
        size="500px"
      >
        <div style="height:calc(100vh - 78px);width:100%;overflow:auto;">
          <el-form ref="configForm" :model="postForm" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
            <el-form-item label="Benchmark" prop="benchmark">
              <el-select v-model="postForm.benchmark" style="width: 300px" filterable allow-create placeholder="请选择">
                <el-option
                  v-for="item in benchmark_options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  :disabled="item.disabled"
                />
              </el-select>
            </el-form-item>
          </el-form>

          <el-table
            ref="multipleTable"
            :data="list"
            :default-sort="{prop: 'created', order: 'descending'}"
            border
            class="table"
            style="width: 480px; margin: 10px;"
            @sort-change="sortChange"
          >
            <el-table-column prop="name" label="name" sortable />
            <el-table-column prop="path" label="path" sortable />
            <el-table-column prop="size" label="size" sortable />
            <el-table-column prop="created" label="time" sortable />
            <el-table-column prop="owner" label="owner" />
          </el-table>
          <el-pagination
            layout="prev, pager, next"
            :total="total"
          />
          <!-- <pagination v-show="total>0" :total="total" :page.sync="page" :limit.sync="listQuery.limit" @pagination="getList" />-->
        </div>

      </el-drawer>
      <codemirror
        ref="myCm"
        v-model="postForm.code"
        :loading="'true'"
        :options="cmOptions"
        @ready="onCmReady"
        @focus="onCmFocus"
        @input="onCmCodeChange"
      />
      <div class="code-button-container">
        <el-button
          :loading="loading"
          class="code-button-item"
          size="mini"
          type="primary"
          @click.native.prevent="submit"
        >submit</el-button>
        <!-- <el-button class="code-button-item" size="mini">run</el-button> -->
      </div>
    </el-form>
  </div>
</template>

<script>
// language js
import 'codemirror/mode/python/python.js'
// theme css
import 'codemirror/theme/eclipse.css'

import { fetchItem, fetchHighlight, createItem, updateItem } from '@/api/strategy'
import { fetchList } from '@/api/datasets'
// import Pagination from '@/components/Pagination'

function getToday() {
  var date = new Date()
  var seperator1 = '-'
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var strDate = date.getDate()
  if (month >= 1 && month <= 9) {
    month = '0' + month
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = '0' + strDate
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate
  return currentdate
}
function getAYearagotoday() {
  var date = new Date()
  var seperator1 = '-'
  var year = date.getFullYear() - 1
  var month = date.getMonth() + 1
  var strDate = date.getDate()
  if (month >= 1 && month <= 9) {
    month = '0' + month
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = '0' + strDate
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate
  return currentdate
}

const defaultForm = {
  id: undefined,
  title: 'myStrategy',
  code:
    '# 在这个方法中编写任何的初始化逻辑。context对象将会在你的算法策略的任何方法之间做传递。\ndef init(context):\n    #todo\n\n\n' +
    '# 你选择的证券的数据更新将会触发此段逻辑，例如日或分钟历史数据切片或者是实时数据切片更新。\ndef handle_bar(context, bar_dict):\n    # 开始编写你的主要的算法逻辑\n\n',
  stock: 100000,
  benchmark: '000300.XSHG'
}
const period = [getAYearagotoday(), getToday()]

export default {
  name: 'StrategyDetail',
  // components: { Pagination },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      drawer: false,
      period: undefined,
      postForm: {
        id: undefined,
        title: undefined,
        code: undefined,
        stock: undefined,
        start_date: undefined,
        end_date: undefined,
        benchmark: undefined
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一年',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近半年',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30 * 6)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      loading: false,
      cmOptions: {
        // codemirror options
        tabSize: 4,
        indentWithTabs: false,
        indentUnit: 4,
        mode: 'text/x-python',
        theme: 'eclipse',
        lineNumbers: true,
        line: true,
        extraKeys: { Tab: this.betterTab }
      },
      message: '',
      tempRoute: {},
      benchmark_options: [{
        value: '000300.XSHG',
        label: '000300.XSHG'
      }],

      page: 1,
      listQuery: {
        limit: 10,
        offset: undefined,
        sort: undefined
      },
      list: [],
      total: 0
    }
  },
  computed: {
    codemirror() {
      return this.$refs.myCm.codemirror
    },
    lang() {
      return this.$store.getters.language
    }
  },
  watch: {
    period() {
      if (this.period && this.period.length === 2) {
        this.postForm.start_date = this.period[0]
        this.postForm.end_date = this.period[1]
      }
    }
  },
  created() {
    if (this.isEdit) {
      this.postForm.id = this.$route.params && this.$route.params.id
      this.fetchData(this.postForm.id)
    } else {
      this.postForm = Object.assign({}, defaultForm)
      this.period = period
      this.getList()
    }
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData() {
      fetchItem(this.postForm.id)
        .then(response => {
          this.postForm.title = response.title
          this.postForm.stock = response.stock
          this.postForm.benchmark = response.benchmark
          this.period = [response.start_date, response.end_date]
          this.setTagsViewTitle()
        })
        .then(
          fetchHighlight(this.postForm.id).then(code => {
            this.postForm.code = code
          }))
        .then(
          this.getList()
        )
    },
    setTagsViewTitle() {
      const title = this.lang === 'zh' ? '编辑策略' : 'Edit Strategy'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.id}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    submit() {
      this.loading = true
      if (this.postForm.title !== '' && this.postForm.code !== '') {
        if (this.isEdit) {
          updateItem(this.postForm.id, this.postForm).then(response => {
            this.loading = false
            this.$router.push({
              name: 'StrategyResult',
              params: {
                strategy_result: response
              }
            })
          }).catch(() => {
            this.loading = false
          })
        } else {
          createItem(this.postForm).then(response => {
            this.loading = false
            this.$router.push({
              name: 'StrategyResult',
              params: {
                strategy_result: response
              }
            })
          }).catch(() => {
            this.loading = false
          })
        }
      } else {
        if (this.postForm.title === '') {
          this.message += 'title '
        }
        if (this.postForm.code === '') {
          this.message += 'code '
        }
        this.message += 'cannot be null'
        this.$message.error(this.message)
        this.message = ''
        return false
      }
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
.code-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 84px);
}
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
.code-title-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  padding-left: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
  .code-title-item {
    position: relative;
    width: 180px;
    padding: 0;
    font-size: 14px;
    margin-left: 5px;
    margin-top: 3px;
  }
  .date-picker {
    float: right;
    position: relative;
    margin-right: 15px;
    margin-top: 3px;
  }
}
.code-button-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-top: 1px solid #d8dce5;
  border-bottom: 1px solid #d8dce5;
  padding-left: 15px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
  .code-button-item {
    position: relative;
    height: 25px;
    width: 100px;
    line-height: 25px;
    padding: 0 8px;
    font-size: 14px;
    margin-right: 15px;
    margin-top: 4px;
    float: right;
  }
}
</style>
