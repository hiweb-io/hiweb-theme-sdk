export default {

  props: {

    handle: {
      type: String,
      require: true
    }
  },

  data() {
    return {

      usingPageMixin: false,
      isLoadingPage: false,
      pageDocument: null,
      pageErrors: [],

    };
  },

  methods: {

    /**
    * Active this mixin
    */
    usePageMixin(b) {

      // Signal
      this.usingPageMixin = b ? true : false;
      if (!this.usingPageMixin) {
        return;
      }

      // Get page
      this._getPage();
    },

    /**
    * Get page
    */
    async _getPage() {

      // Ignore cases
      if (this.$route.name !== 'page' || !this.usingPageMixin || this.isLoadingPage) {
        return;
      }

      // State
      this.isLoadingPage = true;
      this.pageDocument = null;
      this.pageErrors = [];

      try {

        // Get from api
        this.pageDocument = await this.$http.find('pages', this.handle);

        // Trigger event
        this.$event.$emit('view-page', this.pageDocument);

      } catch (e) {
        this.pageErrors = this.$handleException(e);
      }

      this.isLoadingPage = false;
    }
  },

  watch: {

    '$route': function() {
      this._getPage();
    }
  }
}