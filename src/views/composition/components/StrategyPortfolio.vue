<template>
  <div>
    <div class="filter-container" v-if="Object.keys(this.portfolio.group_data).length > 0">
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        Export
      </el-button>
    </div>
    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane :label="date" :name="date" v-for="(portfolio, date) in portfolio.group_data" :key="date">
        <el-table
          :ref="'portfolioTable'+date"
          :key="paging[date]?paging[date].tableKey:0"
          :data="tmpList"
          max-height="500"
          style="width: 100%"
          row-key="index"
          border
          fit
          highlight-current-row>
          <el-table-column v-for="(column, column_index) in columns" :key="column_index" :prop="column" :label="column">
            <template slot-scope="scope">
              {{ scope.row[column] }}
            </template>
          </el-table-column>
        </el-table>
        <pagination v-if="paging[date].total>0" :total="paging[date] ? paging[date].total : 0" :page.sync="paging[date].page" :limit.sync="limit" @pagination="handleSizeChange(date)"/>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { fetchStrategyPortfolioDownload } from '@/api/strategy'

export default {
  name: 'StrategyPortfolio',
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
    portfolio: {
      type: Object,
      default: {
        group_data: {},
        columns: [],
        path: undefined
      }
    }
  },
  data() {
    return {
      activeName: '',
      downloadLoading: false,
      limit: 40,
      paging: {},
      tmpList: [],

      multipleSelection: [],
      columns: []
    }
  },
  watch: {
    portfolio: {
      deep: true,
      handler(val) {
        this.columns = Object.assign([], val.columns)
        this.getList(val)
      }
    }
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
      console.log(tab, event)
      this.handleSizeChange(tab.name)
    },
    getList(val) {
      const dateList = Object.keys(val.group_data)
      this.activeName = dateList[dateList.length - 1]

      for (const date of dateList) {
        this.paging[date] = {
          total: this.portfolio.group_data[date].count,
          page: 1,
          tableKey: Number(date) * 100
        }
      }

      this.handleSizeChange(this.activeName)
    },
    handleSizeChange(date) {
      if (this.portfolio.group_data.hasOwnProperty(date)) {
        this.tmpList = this.portfolio.group_data[date].results.slice((this.paging[date].page - 1) * this.limit, this.paging[date].page * this.limit)
      } else {
        this.tmpList = []
      }
    },
    handleSearch() {
      this.page = 1
      this.getList()
    },
    handleSelectionChange(rows) {
      this.multipleSelection = rows
      this.$emit('company_multiple_selection', this.multipleSelection)
    },
    handleDownload() {
      fetchStrategyPortfolioDownload(this.portfolio.path).then(response => {
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
