export default {
  
  data() {
    return {

      usingPagesMixin: false,
      isLoadingPages: false,
      pagesDocument: false,
      pagesErrors: [],
      pagesSort: '-created_at',

    };
  },

  methods: {

    /**
    * Active this mixin
    */ 
    usePagesMixin(b) {

      // Signal
      this.usingPagesMixin = b ? true : false;
      if (!this.usingPagesMixin) {
        return;
      }

      // Get pages
      this._getPages();
    },

    /**
    * Get pages
    */
    async _getPages() {

      // Ignore if not using this mixing
      if (this.$route.name !== 'pages' || !this.usingPagesMixin || this.isLoadingPages) {
        return;
      }

      // State
      this.isLoadingPages = true;
      this.pagesDocument = null;
      this.pagesErrors = [];

      try {

        // Get from api
        this.pagesDocument = await this.$http.collection('pages', {
          params: {
            sort: this.pagesSort,
            page: this.page,
            limit: this.limit
          }
        });

        // Trigger event
        this.$event.$emit('view-pages', this.pagesDocument);

      } catch (e) {
        this.pagesErrors = this.$handleException(e);
      }

      // Off loading
      this.isLoadingPages = false;
    }
  },

  watch: {

    page: function() {
      this._getPages();
    },

    limit: function() {
      this._getPages();
    },

    pagesSort: function() {
      this._getPages();
    }
  }
}