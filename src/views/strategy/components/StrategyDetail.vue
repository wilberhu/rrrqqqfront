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
        <el-button class="data-picker" size="mini" type="primary" style="margin-left: 16px;" @click="drawer = true">
          展开
        </el-button>
      </div>
      <el-drawer
        title="Config"
        :visible.sync="drawer"
        :direction="'rtl'"
        size="500px"
      >
        <div style="height:calc(100vh - 78px);width:100%;overflow:auto;">
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
        >Save</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
// language js
import 'codemirror/mode/python/python.js'
// theme css
import 'codemirror/theme/eclipse.css'

import { fetchItem, fetchItemCode, createItem, updateItem } from '@/api/strategy'
import { fetchList } from '@/api/datasets'
// import Pagination from '@/components/Pagination'

const defaultForm = {
  id: undefined,
  title: 'MyStrategy',
  code:
`import pandas as pd

param = {
}
#运行主函数
def main(startTime, endTime, allfund, commission, fold, param):
    df = pd.DataFrame()
    ret = {
        'df': df,
        'columns': df.columns,
        'path': path,
        'activities': res
    }
    return ret`
}

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
      postForm: {
        id: undefined,
        title: undefined,
        code: undefined
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
  created() {
    if (this.isEdit) {
      this.postForm.id = this.$route.params && this.$route.params.id
      this.fetchData(this.postForm.id)
    } else {
      this.postForm = Object.assign({}, defaultForm)
      this.getList()
    }
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData() {
      fetchItem(this.postForm.id)
        .then(response => {
          this.postForm.title = response.title
          this.setTagsViewTitle()
        })
        .then(
          fetchItemCode(this.postForm.id).then(code => {
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
            this.$message.success("Update successfully!")
          }).catch(error => {
            this.loading = false
          })
        } else {
          createItem(this.postForm).then(response => {
            this.loading = false
            this.postForm = Object.assign({}, response)
            this.$message.success("Update successfully!")
            this.$router.push({
              path: '/strategy/edit/' + this.postForm.id
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
  .data-picker {
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
