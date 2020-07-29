<template>
  <div v-if="block" class="hiweb-theme-block" :id="'hiweb-theme-block-' + block">
    <template v-if="blockInstance && Array.isArray(blockInstance.getData())">
      <template v-for="component in blockInstance.getData()">
        <component v-bind:is="component.getKey()" :component="component" />
      </template>
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

    // Global force update event
    window.addEventListener('force-update', () => {

      let blockInstance = this.$themeConfig.getBlock(this.block);
      if (!blockInstance) {
        return;
      }

      this.blockInstance = blockInstance;

    });
  }
}
</script>