<template>
  <div class="info">
    <p>
      Maintainer:
      <b>
        <a :href="'mailto:' + meta.maintainerEmail" target="_blank">{{ meta.maintainerName }}</a>
      </b>
    </p>
    <p v-if="meta.machine">Machine: {{ meta.machine }}</p>
    <p v-if="meta.node">Node: {{ meta.node }}</p>
    <p v-if="meta.psql">PSQL: {{ meta.psql }}</p>
    <p v-if="meta.redis">Redis: {{ meta.redis }}</p>
    <p>Version: {{ meta.version }}</p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: ["meta"]
});
</script>

<style lang="stylus" scoped>
.info {
  padding: 10px 14px;

  > p {
    margin: 0;
    font-size: 12px;
    color: var(--text);
  }
}
</style>
