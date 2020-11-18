<template>
  <strategy-detail :is-edit="false"/>
</template>

<script>
import StrategyDetail from './components/StrategyDetail'

export default {
  name: 'CreateForm',
  components: { StrategyDetail }
}
</script>

