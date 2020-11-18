<template>
  <div class="dashboard-editor-container">
    <div style="background:#fff;padding:16px;margin-bottom:16px;">
      <el-row :gutter="32">
        <el-col :xs="12" :sm="12" :lg="6">
          <b style="color:red">Total_Returns:</b> {{ result.Total_Returns }}
        </el-col>
        <el-col :xs="12" :sm="12" :lg="6">
          <b style="color:red">Annual_Returns:</b> {{ result.Annual_Returns }}
        </el-col>
        <el-col :xs="12" :sm="12" :lg="6">
          <b style="color:blue">Benchmark_Returns:</b> {{ result.Benchmark_Returns }}
        </el-col>
        <el-col :xs="12" :sm="12" :lg="6">
          <b style="color:blue">Benchmark_Annual:</b> {{ result.Benchmark_Annual }}
        </el-col>
      </el-row>
      <el-row :gutter="32">
        <el-col :xs="12" :sm="12" :lg="6">
          <b style="color:saddlebrown">Alpha:</b> {{ result.Alpha }}
        </el-col>
        <el-col :xs="12" :sm="12" :lg="6">
          <b style="color:saddlebrown">Beta:</b> {{ result.Beta }}
        </el-col>
        <el-col :xs="12" :sm="12" :lg="6">
          <b style="color:saddlebrown">Sharpe:</b> {{ result.Sharpe }}
        </el-col>
        <el-col :xs="12" :sm="12" :lg="6">
          <b style="color:saddlebrown">Sortino:</b> {{ result.Sortino }}
        </el-col>
      </el-row>
      <el-row :gutter="32">
        <el-col :xs="12" :sm="12" :lg="6">
          <b style="color:saddlebrown">Information_Ratio:</b> {{ result.Information_Ratio }}
        </el-col>
        <el-col :xs="12" :sm="12" :lg="6">
          <b style="color:saddlebrown">Volatility:</b> {{ result.Volatility }}
        </el-col>
        <el-col :xs="12" :sm="12" :lg="6">
          <b style="color:saddlebrown">MaxDrawdown:</b> {{ result.MaxDrawdown }}
        </el-col>
        <el-col :xs="12" :sm="12" :lg="6">
          <b style="color:saddlebrown">Tracking_Error:</b> {{ result.Tracking_Error }}
        </el-col>
      </el-row>
      <el-row :gutter="32">
        <el-col :xs="12" :sm="12" :lg="6">
          <b style="color:saddlebrown">Downside_Risk:</b> {{ result.Downside_Risk }}
        </el-col>
      </el-row>
    </div>
    <!--    <el-row>-->
    <!--      <img :src="result.image" style="width: 100%">-->
    <!--    </el-row>-->
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:16px;">
      <line-chart :chart-data="result.lineChartData" />
    </el-row>

    <el-row v-if="result.console_output" style="background:#fff;padding:16px;height:200px;overflow:auto;">
      <pre>{{ result.console_output }}</pre>
    </el-row>

  </div>
</template>

<script>
// import CountTo from 'vue-count-to'
import LineChart from './components/LineChart'

export default {
  name: 'StrategyResult',
  components: {
    // CountTo
    LineChart
  },
  data() {
    return {
      result: {
        Total_Returns: '',
        Annual_Returns: '',
        Benchmark_Returns: '',
        Benchmark_Annual: '',
        Alpha: '',
        Beta: '',
        Sharpe: '',
        Sortino: '',
        Information_Ratio: '',
        Volatility: '',
        MaxDrawdown: '',
        Tracking_Error: '',
        Downside_Risk: '',
        // image: '',
        lineChartData: {},
        console_output: ''
      }
    }
  },
  activated() {
    if ('strategy_result' in this.$route.params) {
      this.result.Total_Returns = this.$route.params.strategy_result.Total_Returns
      this.result.Annual_Returns = this.$route.params.strategy_result.Annual_Returns
      this.result.Benchmark_Returns = this.$route.params.strategy_result.Benchmark_Returns
      this.result.Benchmark_Annual = this.$route.params.strategy_result.Benchmark_Annual
      this.result.Alpha = this.$route.params.strategy_result.Alpha
      this.result.Beta = this.$route.params.strategy_result.Beta
      this.result.Sharpe = this.$route.params.strategy_result.Sharpe
      this.result.Sortino = this.$route.params.strategy_result.Sortino
      this.result.Information_Ratio = this.$route.params.strategy_result.Information_Ratio
      this.result.Volatility = this.$route.params.strategy_result.Volatility
      this.result.MaxDrawdown = this.$route.params.strategy_result.MaxDrawdown
      this.result.Tracking_Error = this.$route.params.strategy_result.Tracking_Error
      this.result.Downside_Risk = this.$route.params.strategy_result.Downside_Risk
      this.result.lineChartData = this.$route.params.strategy_result.result
      console.log(this.$route.params.strategy_result.console_output)
      this.result.console_output = this.$route.params.strategy_result.console_output
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-editor-container {
  padding: 16px;
  background-color: rgb(240, 242, 245);
  .chart-wrapper {
    background: #fff;
    margin: 0;
  }
}

.chart-container{
  position: relative;
  width: 100%;
  height: calc(100vh - 72px);
}
</style>
