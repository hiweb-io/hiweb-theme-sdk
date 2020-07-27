<template>
  <div v-if="block" class="hiweb-theme-block" :id="'hiweb-theme-block-' + block">
    <template v-if="blockInstance && Array.isArray(blockInstance.getData())" v-for="component in blockInstance.getData()">
      <component v-bind:is="component.getKey()" :component="component" />
    </template>
  </div>
</template>

<script type="text/javascript">
export default {

  props: ['block'],

  data() {
    return {
      blockInstance: null,
    };
  },

  created() {

    if (!this.block) {
      return;
    }

    this.blockInstance = this.$themeConfig.getBlock(this.block);

  }
}
</script>