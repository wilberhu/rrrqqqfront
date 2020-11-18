<template>
  <div class="dashboard-container">
<!--    <div class="dashboard-text">name: {{ name }}</div>-->
    <iframe src='http://localhost:8020' />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Jupyter',
  computed: {
    ...mapGetters([
      'name'
    ])
  }
}
</script>

<style lang="scss" scoped>
  .dashboard {
    &-container {
      margin: 0px;
      width: 100vw;
      height: 100vh;
    }
  }
</style>
