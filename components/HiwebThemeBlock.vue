<template>
  <div v-if="block" class="hiweb-theme-block" :id="'hiweb-theme-block-' + block">
    <template v-if="blockInstance && Array.isArray(blockInstance.getData())">
      <template v-for="component in blockInstance.getData()">
        <component v-bind:is="component.getKey()" :component="makeComponent(component)" />
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

  methods: {

    makeComponent(component) {

      // If no config
      if (!component.getConfigData().length) {

        // Try to insert default config
        this.blockInstance.getComponents().forEach(baseComponent => {

          if (component.getKey() !== baseComponent.getKey()) {
            return;
          }

          // Share default config
          baseComponent.getConfigData().forEach(c => {
            let config = component.config(c.getHandle());
            config.setData(c.getData());
          });

        });

      }

      return component;
    }

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