export default {
  
  data() {
    return {

      usingCollectionsMixin: false,
      isLoadingCollections: false,
      collectionsDocument: false,
      collectionsErrors: [],
      collectionsSort: '-created_at'

    };
  },

  methods: {

    /**
    * Active this mixin
    */
    useCollectionsMixin(b) {

      // Signal
      this.usingCollectionsMixin = b ? true : false;
      if (!this.usingCollectionsMixin) {
        return;
      }

      // Get collections
      this._getCollections();
    },

    /**
    * Get collections
    */
    async _getCollections() {

      // Ignore if not collections view
      if (this.$route.name !== 'collections' || !this.usingCollectionsMixin || this.isLoadingCollections) {
        return;
      }

      // State
      this.isLoadingCollections = true;
      this.collectionsDocument = null;
      this.collectionsErrors = [];

      try {

        // Get from api
        this.collectionsDocument = await this.$http.collection('collections', {
          params: {
            sort: this.collectionsSort,
            page: this.page,
            limit: this.limit
          }
        });

        // Trigger event
        this.$event.$emit('view-collections', this.collectionsDocument);

      } catch (e) {
        this.collectionsErrors = this.$handleException(e);
      }

      // Off loading state
      this.isLoadingCollections = false;
    }
  },

  watch: {

    '$route': function() {
      this._getCollections();
    }
  }
}