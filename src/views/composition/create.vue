<template>
  <composition-detail :is-edit="false" />
</template>

<script>
import CompositionDetail from './components/CompositionDetail'

export default {
  name: 'CreateComposition',
  components: { CompositionDetail }
}
</script>

