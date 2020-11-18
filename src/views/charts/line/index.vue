<template>
  <div class="app-container">
    <el-form ref="form" :inline="true" :model="form">
      <el-form-item v-if="show">
        <div @click="prev">
          <svg-icon icon-class="left-arrow" class="icon-left-arrow"/>
        </div>
      </el-form-item>
      <el-form-item label="Code">
        <el-input v-model="form.companyCode" @keyup.enter.native="drawCharts"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="drawCharts">submit</el-button>
      </el-form-item>
    </el-form>
    <Chart ref="Chart" :form="form" height="calc(100vh - 184px)" width="100%"/>
  </div>
</template>

<script>
import Chart from '@/components/Charts/lineMarker'
import { getHistData } from '@/api/histData'

export default {
  name: 'LineChart',
  components: { Chart },
  data() {
    return {
      show: false,
      form: {
        companyCode: undefined,
        companyName: null,
        histData: null,
        maData: null
      }
    }
  },
  activated() {
    if (this.$route.params.code) {
      this.show = true
      this.form.companyCode = this.$route.params.code
      this.drawCharts()
    } else {
      this.show = false
    }
  },
  methods: {
    drawCharts() {
      getHistData({ pk: this.form.companyCode }).then(response => {
        this.form.companyCode = response.item_code
        this.form.companyName = response.item_name
        this.form.histData = response.hist_data
        this.form.maData = response.ma_data
        this.$refs.Chart.draw()
      })
    },
    prev() {
      this.$router.go(-1)
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
