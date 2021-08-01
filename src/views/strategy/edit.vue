<template>
  <strategy-detail :is-edit="true"/>
</template>

<script>
import StrategyDetail from './components/StrategyDetail'

export default {
  name: 'EditStrategy',
  components: { StrategyDetail }
}
</script>

