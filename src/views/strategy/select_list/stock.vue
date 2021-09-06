<template>
  <div class="tab-container">
    <vue-fab
      :main-btn-color="'#2196F3'"
      :fab-animate-bezier="'ease-out'"
      :fab-auto-hide-animate-model="'alive'"
      :scroll-auto-hide="false"
      prop="open"
      style="right: 13%; bottom: 15%"
      icon="add"
      size="big"
      fab-item-animate="alive">
      <fab-item @clickItem="combineChart" :idx="0" title="combine" icon="stacked_bar_chart" />
      <fab-item @clickItem="compareChart" :idx="1" title="compare" icon="waterfall_chart" />
    </vue-fab>

    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane label="fund" name="fund">
        <StockFund @fund_multiple_selection="listenFundSelection" :deleteSelection="delete_selection" />
      </el-tab-pane>
      <el-tab-pane label="company" name="company">
        <StockCompany @company_multiple_selection="listenCompanySelection" :deleteSelection="delete_selection" />
      </el-tab-pane>
    </el-tabs>

    <!-- combine对话框 -->
    <el-dialog ref="combineDialog" title="Combine" width="80%" top="5vh" :fullscreen="combineFullscreen" :visible.sync="combineDialogVisible">
      <div slot="title" class="header-title">
        <i class="el-icon-full-screen" style="cursor:pointer; margin-right:30px; float: right;" @click="switchCombineFullscreen(!combineFullscreen)"></i>
      </div>
      <el-form label-width="100px">
        <el-form-item label="funds: " v-if="activeName==='fund'">
          <el-tag v-for="tag in multipleSelection['fund']" :key="tag.ts_code" :type="'success'" closable style="margin: 2px" @close="closeTag(tag)">{{ tag.ts_code }} {{ tag.name }}</el-tag>
        </el-form-item>
        <el-form-item label="companies: " v-if="activeName==='company'">
          <el-tag v-for="tag in multipleSelection['company']" :key="tag.ts_code" :type="'success'" closable style="margin: 2px" @close="closeTag(tag)">{{ tag.ts_code }} {{ tag.name }}</el-tag>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            :picker-options="datePickerOptions"
            v-model="compositionForm.timestamp"
            format="yyyyMMdd"
            value-format="yyyyMMdd"
            type="date"
            :clearable="false"
            :editable="false"
            aria-required="true"
            placeholder="选择日期"
            @blur="refreshChart()"
          >
          </el-date-picker>
          <el-input type="number" readonly placeholder="value" v-model="compositionForm.allfund" style="margin: 0 10px 10px 0; width: 240px;">
            <template slot="prepend">资金总额</template>
          </el-input>
          <el-input type="number" readonly placeholder="value" v-model="compositionForm.commission" style="margin: 0 10px 10px 0; width: 240px;">
            <template slot="prepend">手续费</template>
          </el-input>
        </el-form-item>
      </el-form>
      <stack-line-chart ref="CombineChart" :chart-data="combineForm" :height="combineChartHeight" />
    </el-dialog>

    <!-- compare对话框 -->
    <el-dialog ref="compareDialog" title="Compare" width="80%" top="5vh" :fullscreen="compareFullscreen" :visible.sync="compareDialogVisible">
      <div slot="title" class="header-title">
        <i class="el-icon-full-screen" style="cursor:pointer; margin-right:30px; float: right;" @click="switchCompareFullscreen(!compareFullscreen)"></i>
      </div>
      <el-form label-width="100px">
        <el-form-item label="funds: " v-if="activeName==='fund'">
          <el-tag v-for="tag in multipleSelection['fund']" :key="tag.ts_code" :type="'success'" closable style="margin: 2px" @close="closeTag(tag)">{{ tag.ts_code }} {{ tag.name }}</el-tag>
        </el-form-item>
        <el-form-item label="companies: " v-if="activeName==='company'">
          <el-tag v-for="tag in multipleSelection['company']" :key="tag.ts_code" :type="'success'" closable style="margin: 2px" @close="closeTag(tag)">{{ tag.ts_code }} {{ tag.name }}</el-tag>
        </el-form-item>
      </el-form>
      <CompareChart ref="CompareChart" :height="compareChartHeight"></CompareChart>
    </el-dialog>
  </div>
</template>

<script>
import StockFund from './stock_fund'
import StockCompany from './stock_company'
import CompareChart from './compare_chart'
import StackLineChart from '@/views/composition/components/StackLineChart'
import { fetchCompanyClose } from '@/api/histData'
import { fetchCombineData } from '@/api/strategy'

export default {
  name: 'SelectList',
  components: {
    StockFund,
    StockCompany,
    CompareChart,
    StackLineChart
  },
  data() {
    return {
      multiLineVisible: false,
      multipleSelection: {
        company: [],
        index: [],
        fund: []
      },
      activeName: 'fund',
      company_selection: [],
      index_selection: [],
      fund_selection: [],
      delete_selection: undefined,
      combineFullscreen: false,
      combineDialogVisible: false,
      compareFullscreen: false,
      compareDialogVisible: false,
      combineForm: {
        time_line: [],
        ts_code_list: [],
        name_list: [],
        close_data: []
      },
      compareForm: {
        ts_code_list: [],
        name_list: [],
        type_list: [],
        time_line: [],
        close_data: []
      },
      compareChartHeight: 'calc(90vh - 160px)',
      combineChartHeight: 'calc(90vh - 240px)',
      typeList: ['fund'],
      compositionForm: {
        timestamp: '20200701',
        allfund: 100000000,
        commission: 0.0001
      },
      datePickerOptions: {
        disabledDate(date) {
          return date > new Date()
        }
      }
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
    listenFundSelection(data) {
      this.fund_selection = data
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
      this.multipleSelection['fund'] = []
      for (let i = 0; i < this.fund_selection.length; i++) {
        this.multipleSelection['fund'].push({
          ts_code: this.fund_selection[i].ts_code,
          name: this.fund_selection[i].name,
          type: 'fund'
        })
      }
      // this.multiLineVisible = !this.multiLineVisible
    },
    async closeTag(tag) {
      for (let i = 0; i < this.multipleSelection[tag.type].length; i++) {
        if (this.multipleSelection[tag.type][i].ts_code === tag.ts_code) {
          this.multipleSelection[tag.type].splice(i, 1)
          break
        }
      }
      this.delete_selection = tag.ts_code
      await this.refreshChart()
    },
    async refreshChart() {
      if (this.compareDialogVisible) {
        this.compareForm = Object.assign({}, await this.getCompanyCloseData())
        this.switchCompareFullscreen(this.compareFullscreen)
      } else if (this.combineDialogVisible) {
        this.combineForm = Object.assign({}, await this.getCombineData())
        this.switchCombineFullscreen(this.combineFullscreen)
      }
    },
    async combineChart(item) {
      this.compareDialogVisible = false
      this.combineDialogVisible = true
      this.compositionForm.timestamp = '20200701'
      this.clickMainBtn()
      this.combineForm = Object.assign({}, await this.getCombineData())
      this.switchCombineFullscreen(this.combineFullscreen)
    },
    async compareChart(item) {
      this.combineDialogVisible = false
      this.compareDialogVisible = true
      this.clickMainBtn()
      this.compareForm = Object.assign({}, await this.getCompanyCloseData())
      this.switchCompareFullscreen(this.compareFullscreen)
    },
    switchCombineFullscreen(fullscreen) {
      this.combineFullscreen = fullscreen
      if (this.combineFullscreen) {
        this.combineChartHeight = 'calc(100vh - 240px)'
      } else {
        this.combineChartHeight = 'calc(90vh - 240px)'
      }
      var _this = this
      setTimeout(function() {
        _this.$refs.CombineChart.draw()
      }, 0)
    },
    switchCompareFullscreen(fullscreen) {
      this.compareFullscreen = fullscreen
      if (this.compareFullscreen) {
        this.campareChartHeight = 'calc(100vh - 160px)'
      } else {
        this.campareChartHeight = 'calc(90vh - 160px)'
      }
      var _this = this
      setTimeout(function() {
        _this.$refs.CompareChart.draw(_this.compareForm)
      }, 0)
    },
    getCompanyCloseData() {
      return new Promise(resolve => {
        const data = {
          ts_code_list: [],
          type_list: []
        }

        for (let i = 0; i < this.multipleSelection[this.activeName].length; i++) {
          data.ts_code_list.push(this.multipleSelection[this.activeName][i].ts_code)
          data.type_list.push(this.activeName)
        }

        fetchCompanyClose(data, this.activeName === 'fund' ? 'unit_nav' : 'close').then(response => {
          resolve(response)
          setTimeout(() => {
          }, 1.5 * 1000)
        })
      })
    },
    getCombineData() {
      return new Promise(resolve => {
        const data = {
          ts_code_list: [],
          type_list: [],
          timestamp: this.compositionForm.timestamp,
          allfund: this.compositionForm.allfund,
          commission: this.compositionForm.commission
        }

        for (let i = 0; i < this.multipleSelection[this.activeName].length; i++) {
          data.ts_code_list.push(this.multipleSelection[this.activeName][i].ts_code)
          data.type_list.push(this.activeName)
        }

        fetchCombineData(data, this.activeName === 'fund' ? 'unit_nav' : 'close').then(response => {
          resolve(response)
          setTimeout(() => {
          }, 1.5 * 1000)
        })
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
    src: url("../../../icons/gstatic/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2") format('woff2');
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

