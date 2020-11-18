<template>
  <composition-detail :is-edit="true" />
</template>

<script>
import CompositionDetail from './components/CompositionDetail'

export default {
  name: 'EditForm',
  components: { CompositionDetail }
}
</script>

