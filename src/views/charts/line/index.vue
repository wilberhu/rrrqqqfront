<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form">
      <el-form-item v-if="show">
        <div @click="prev">
          <svg-icon icon-class="left-arrow" class="icon-left-arrow"/>
        </div>
      </el-form-item>
      <el-form-item label="Code">
        <el-autocomplete
          v-model="form.ts_code_name"
          :fetch-suggestions="querySearchAsync"
          placeholder="请输入内容"
          style="width: 220px;"
          @select="handleSelect($event)"
        ></el-autocomplete>
      </el-form-item>
    </el-form>
    <Chart ref="Chart" :form="form" height="calc(100vh - 184px)" width="100%"/>
  </div>
</template>

<script>
import Chart from '@/components/Charts/lineMarker'
import { getHistData } from '@/api/histData'
import { fetchAllCompanies } from '@/api/basic'

export default {
  name: 'LineChart',
  components: { Chart },
  data() {
    return {
      show: false,
      form: {
        ts_code: undefined,
        name: undefined,
        ts_code_name: undefined,
        histData: null,
        maData: null
      }
    }
  },
  mounted() {
    this.getAllCompanies()
  },
  activated() {
    this.getAllCompanies()
    if (this.$route.params.ts_code) {
      this.show = true
      this.form.ts_code_name = this.$route.params.ts_code + ' - ' + this.$route.params.name
      this.form.ts_code = this.$route.params.ts_code
      this.form.name = this.$route.params.name
      this.drawCharts()
    } else {
      this.show = false
    }
  },
  methods: {
    drawCharts() {
      if(this.form.ts_code) {
        getHistData( this.form.ts_code ).then(response => {
          this.form.histData = response.hist_data
          this.form.maData = response.ma_data
          this.$refs.Chart.draw()
        })
      }
    },
    prev() {
      this.$router.go(-1)
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
    handleSelect(event) {
      this.form.ts_code = event.ts_code
      this.form.name = event.name
      this.form.ts_code_name = event.value
      this.drawCharts()
    },

    handleBlur(event) {
      const inputValue = this.form.ts_code_name
      var companies = this.companies
      if(inputValue) {
        var results = inputValue ? companies.filter(this.createContainsFilter(inputValue)) : companies
        if(results.length === 1) {
          this.handleSelect(results[0])
        } else {
          this.form.ts_code = ''
          this.form.name = ''
          this.form.ts_code_name = ''
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
