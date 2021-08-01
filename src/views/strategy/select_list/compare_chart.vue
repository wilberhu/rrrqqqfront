<template>
  <div class="app-container">
    <Chart ref="Chart" :form="form" :id="'compare_chart'" :height="height" width="100%" />
  </div>
</template>

<script>
import Chart from '@/components/Charts/closeMarker'

export default {
  name: 'CompareChart',
  components: { Chart },
  props: {
    form: {
      type: Object,
      default: undefined
    },
    height: {
      type: String,
      default: 'calc(90vh - 160px)'
    }
  }
}
</script>
