<template>
  <stock-picking-detail :is-edit="false"/>
</template>

<script>
import StockPickingDetail from './components/StockPickingDetail'

export default {
  name: 'CreateStockPicking',
  components: { StockPickingDetail }
}
</script>

