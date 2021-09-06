<template>
  <composition-detail :is-edit="true" />
</template>

<script>
import CompositionDetail from './components/CompositionDetail'

export default {
  name: 'EditComposition',
  components: { CompositionDetail }
}
</script>

