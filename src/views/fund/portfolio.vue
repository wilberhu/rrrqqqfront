<template>
  <div class="tab-container">
    <div class="filter-container">
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" :disabled="PortfolioListLoading" @click="handleDownload">
        Export
      </el-button>
    </div>
    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane :label="date" :name="date" v-for="(portfolio, date) in data" :key="date">
        <el-table
          v-loading="PortfolioListLoading"
          :ref="'portfolioTable'+date"
          :key="paging[date].tableKey"
          :data="tmpList"
          max-height="500"
          style="width: 100%"
          row-key="index"
          border
          fit
          highlight-current-row
          @selection-change="handleSelectionChange">
          <el-table-column :reserve-selection="true" v-model="multipleSelection" type="selection" align="center" width="55"/>
          <el-table-column prop="index" align="center" :label="$t('table.basic_fund_portfolio.index')" width="110">
            <template slot-scope="scope">
              {{ scope.row.index }}
            </template>
          </el-table-column>
          <el-table-column prop="ts_code" :label="$t('table.basic_fund_portfolio.ts_code')">
            <template slot-scope="scope">
              {{ scope.row.ts_code }}
            </template>
          </el-table-column>
          <el-table-column prop="ann_date" :label="$t('table.basic_fund_portfolio.ann_date')">
            <template slot-scope="scope">
              {{ scope.row.ann_date }}
            </template>
          </el-table-column>
          <el-table-column prop="end_date" :label="$t('table.basic_fund_portfolio.end_date')">
            <template slot-scope="scope">
              {{ scope.row.end_date }}
            </template>
          </el-table-column>
          <el-table-column prop="symbol" :label="$t('table.basic_fund_portfolio.symbol')">
            <template slot-scope="scope">
              {{ scope.row.symbol }}
            </template>
          </el-table-column>
          <el-table-column prop="mkv" :label="$t('table.basic_fund_portfolio.mkv')">
            <template slot-scope="scope">
              {{ scope.row.mkv }}
            </template>
          </el-table-column>
          <el-table-column prop="amount" :label="$t('table.basic_fund_portfolio.amount')">
            <template slot-scope="scope">
              {{ scope.row.amount }}
            </template>
          </el-table-column>
          <el-table-column prop="stk_mkv_ratio" :label="$t('table.basic_fund_portfolio.stk_mkv_ratio')">
            <template slot-scope="scope">
              {{ scope.row.stk_mkv_ratio }}
            </template>
          </el-table-column>
          <el-table-column prop="stk_float_ratio" :label="$t('table.basic_fund_portfolio.stk_float_ratio')">
            <template slot-scope="scope">
              {{ scope.row.stk_float_ratio }}
            </template>
          </el-table-column>
          <el-table-column prop="hist_data" :label="$t('table.hist_data')">
            <template slot-scope="scope">
              <el-button type="info" @click="drawLine(scope.row)">{{ $t('table.hist_data') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="paging[date].total>0" :total="paging[date].total" :page.sync="paging[date].page" :limit.sync="limit" @pagination="handleTabChange(date)"/>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import { fetchItemPortfolio, fetchItemPortfolioDownload } from '@/api/fundBasic'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'FundPortfolio',
  components: {
    Pagination
  },
  directives: { waves },
  filters: {
    numFilter(value) {
      // 截取当前数据到小数点后两位
      var realVal = parseFloat(value).toFixed(2)
      if (isNaN(realVal)) {
        return ''
      }
      // num.toFixed(2)获取的是字符串
      return parseFloat(realVal)
    }
  },
  props: {
    ts_code: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      activeName: '0',
      data: {},
      PortfolioListLoading: true,
      downloadLoading: false,
      limit: 40,
      paging: {},
      tmpList: [],

      orderingOptions: [{ label: 'TsCode Ascending', key: 'ts_code' },
        { label: 'TsCode Descending', key: '-ts_code' },
        { label: 'Name Ascending', key: 'name' },
        { label: 'Name Descending', key: '-name' }],

      multipleSelection: []
    }
  },
  created() {
    this.activeName = '0'
    this.getList()
  },
  methods: {
    drawLine(item) {
      this.$router.push({
        name: 'LineChart',
        params: {
          ts_code: item.symbol,
          name: item.name,
          type: 'company'
        }
      })
    },
    handleTabClick(tab, event) {
      this.handleTabChange(tab.name)
      this.getList()
    },
    getList() {
      this.PortfolioListLoading = true
      fetchItemPortfolio(this.ts_code, { end_date: this.activeName }).then(response => {
        this.PortfolioListLoading = false
        const dateList = Object.keys(response)
        this.data = Object.assign({}, response)
        if (this.activeName === '0') {
          this.activeName = dateList[dateList.length - 1]
        }

        // this.PortfolioListLoading = false
        for (const date of dateList) {
          this.paging[date] = {
            total: this.data[date].count,
            page: 1,
            tableKey: Number(date) * 100
          }
        }
        this.handleTabChange(this.activeName)
      }).catch(
        // this.PortfolioListLoading = false
      )
    },
    handleTabChange(date) {
      this.tmpList = this.data[date] ? this.data[date].results.slice((this.paging[date].page - 1) * this.limit, this.paging[date].page * this.limit) : []
    },
    handleSelectionChange(rows) {
      this.multipleSelection = rows
      this.$emit('company_multiple_selection', this.multipleSelection)
    },
    handleDownload() {
      fetchItemPortfolioDownload(this.ts_code).then(response => {
        const fileURL = window.URL.createObjectURL(new Blob([response.data]))
        const fileLink = document.createElement('a')
        fileLink.href = fileURL
        fileLink.setAttribute('download', response.headers['content-disposition'].split('=')[1].replace(/^\"+|\"+$/g, ''))
        document.body.appendChild(fileLink)
        fileLink.click()
        document.body.removeChild(fileLink)
      })
    }
  }
}
</script>
<style>
.tab-container {
  /*margin: 20px;*/
}
</style>
