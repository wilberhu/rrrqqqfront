<template>
  <composition-detail :is-edit="false" />
</template>

<script>
import CompositionDetail from './components/CompositionDetail'

export default {
  name: 'CreateForm',
  components: { CompositionDetail }
}
</script>

