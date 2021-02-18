<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form">
      <el-form-item v-if="show">
        <div @click="prev">
          <svg-icon icon-class="left-arrow" class="icon-left-arrow"/>
        </div>
      </el-form-item>
      <el-form-item>
        <el-radio-group v-model="form.type" size="medium">
          <el-radio-button v-for="item in typeOptions" :label="item" :key="item"></el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-autocomplete
          v-model="form.ts_code"
          :fetch-suggestions="querySearchAsync"
          placeholder="请输入内容"
          style="width: 220px;"
          @select="handleSelect($event)"
        >
          <template slot="suffix">{{ form.name }}</template>
        </el-autocomplete>
      </el-form-item>
    </el-form>
    <Chart ref="Chart" :form="form" height="calc(100vh - 184px)" width="100%" />
  </div>
</template>

<script>
import Chart from '@/components/Charts/lineMarker'
import { getCompanyHistData, getIndexHistData, getFundHistData } from '@/api/histData'
import { fetchAllCompanies, fetchAllIndexes } from '@/api/stockBasic'
import { fetchAllList as fetchAllFunds } from '@/api/fundBasic'

export default {
  name: 'LineChart',
  components: { Chart },
  data() {
    return {
      show: false,
      typeOptions: ['company', 'index', 'fund'],
      form: {
        ts_code: undefined,
        name: undefined,
        type: 'company',
        histData: null,
        maData: null
      },
      datalist: {
        company: [],
        index: [],
        fund: []
      }
    }
  },
  mounted() {
    this.getAllCompanies()
    this.getAllIndexes()
    this.getAllFunds()
  },
  activated() {
    if (this.$route.params.ts_code) {
      this.show = true
      this.form.ts_code = this.$route.params.ts_code
      this.form.type = this.$route.params.type
      this.form.name = this.$route.params.name
      this.drawCharts()
    } else {
      this.show = false
    }
  },
  methods: {
    drawCharts() {
      if (this.form.ts_code) {
        if (this.form.type === 'company') {
          getCompanyHistData(this.form.ts_code).then(response => {
            this.form.name = response.name
            this.form.histData = response.hist_data
            this.form.maData = response.ma_data
            this.$refs.Chart.draw()
          })
        } else if (this.form.type === 'index') {
          getIndexHistData(this.form.ts_code).then(response => {
            this.form.name = response.name
            this.form.histData = response.hist_data
            this.form.maData = response.ma_data
            this.$refs.Chart.draw()
          })
        } else if (this.form.type === 'fund') {
          getFundHistData(this.form.ts_code).then(response => {
            this.form.name = response.name
            this.form.histData = response.hist_data
            this.form.maData = response.ma_data
            this.$refs.Chart.draw()
          })
        }
      }
    },
    prev() {
      this.$router.go(-1)
    },
    querySearchAsync(queryString, cb) {
      var results = queryString ? this.datalist[this.form.type].filter(this.createContainsFilter(queryString)) : this.datalist[this.form.type]
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
    handleSelect(event) {
      this.form.ts_code = event.ts_code
      this.form.name = event.name
      this.drawCharts()
    },

    getAllCompanies() {
      this.listLoading = true
      fetchAllCompanies().then(response => {
        this.listLoading = false
        this.datalist.company = []
        for (const item of response) {
          this.datalist.company.push({
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

    getAllIndexes() {
      this.listLoading = true
      fetchAllIndexes().then(response => {
        this.listLoading = false
        this.datalist.index = []
        for (const item of response) {
          this.datalist.index.push({
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
    getAllFunds() {
      this.listLoading = true
      fetchAllFunds({ market: 'E' }).then(response => {
        this.listLoading = false
        this.datalist.fund = []
        for (const item of response) {
          this.datalist.fund.push({
            value: item.ts_code + ' - ' + item.name,
            ts_code: item.ts_code,
            name: item.name
          })
        }
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    }
  }
}
</script>

<style scoped>
.icon-left-arrow{
  width: 40px;
  height: 40px;
  cursor: pointer;
}
</style>
