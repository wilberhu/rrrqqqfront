<template>
  <div class="tab-container">

    <!--<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">-->
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

    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane label="company" name="company">
        <DailyBasicCompany @company_multiple_selection="listenCompanySelection" :deleteSelection="delete_selection" />
      </el-tab-pane>
      <el-tab-pane label="index" name="index">
        <DailyBasicIndex @index_multiple_selection="listenIndexSelection" :deleteSelection="delete_selection" />
      </el-tab-pane>
    </el-tabs>

    <!-- MultiLine弹出框 -->
    <el-dialog :visible.sync="multiLineVisible" title="compare companies" width="500px">
      <el-form label-width="100px">
        <el-form-item label="companies: ">
          <el-tag v-for="tag in multipleSelection['company']" :key="tag.ts_code" :type="'success'" closable style="margin: 2px" @close="closeTag(tag)">{{ tag.ts_code }} - {{ tag.name }}</el-tag>
        </el-form-item>
        <el-form-item label="indexes: ">
          <el-tag v-for="tag in multipleSelection['index']" :key="tag.ts_code" :type="'success'" closable style="margin: 2px" @close="closeTag(tag)">{{ tag.ts_code }} - {{ tag.name }}</el-tag>
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
import DailyBasicCompany from './daily_basic_company'
import DailyBasicIndex from './daily_basic_index'

export default {
  name: 'StockDailyBasic',
  components: {
    DailyBasicCompany,
    DailyBasicIndex
  },
  data() {
    return {
      activeName: 'company',
      multiLineVisible: false,
      multipleSelection: {
        company: [],
        index: [],
        fund: []
      },
      company_selection: [],
      index_selection: [],
      delete_selection: undefined
    }
  },
  created() {
    // init the default selected tab
    if (this.$route.query.tab && ['company', 'index'].indexOf(this.$route.query.tab) !== -1) {
      this.activeName = this.$route.query.tab
    }
  },
  methods: {
    handleTabClick(tab, event) {
      // console.log(tab, event)
    },
    listenCompanySelection(data) {
      this.company_selection = data
    },
    listenIndexSelection(data) {
      this.index_selection = data
    },
    clickMainBtn() {
      this.multipleSelection['company'] = []
      for (let i = 0; i < this.company_selection.length; i++) {
        this.multipleSelection['company'].push({
          ts_code: this.company_selection[i].ts_code,
          name: this.company_selection[i].name,
          type: 'company'
        })
      }
      this.multipleSelection['index'] = []
      for (let i = 0; i < this.index_selection.length; i++) {
        this.multipleSelection['index'].push({
          ts_code: this.index_selection[i].ts_code,
          name: this.index_selection[i].name,
          type: 'index'
        })
      }
      this.multiLineVisible = !this.multiLineVisible
    },
    closeTag(tag) {
      for (let i = 0; i < this.multipleSelection[tag.type].length; i++) {
        if (this.multipleSelection[tag.type][i].ts_code === tag.ts_code) {
          this.multipleSelection[tag.type].splice(i, 1)
          break
        }
      }
      this.delete_selection = tag.ts_code
    },
    showCharts() {
      const multipleSelectionLength = this.multipleSelection['company'].length +
        this.multipleSelection['index'].length +
        this.multipleSelection['fund'].length
      if (multipleSelectionLength <= 0 || multipleSelectionLength > 10) {
        Message({
          // message: error.message,
          message: 'The selected items should be more than 0 and less than 10',
          type: 'error',
          duration: 5 * 1000
        })
        return
      }
      this.$router.push({
        name: 'CloseChart',
        params: {
          codes: this.multipleSelection
        }
      })
      this.multiLineVisible = false
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

