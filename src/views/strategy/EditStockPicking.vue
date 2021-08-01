<template>
  <stock-picking-detail :is-edit="true"/>
</template>

<script>
import StockPickingDetail from './components/StockPickingDetail'

export default {
  name: 'EditStockPicking',
  components: { StockPickingDetail }
}
</script>

