import { JsonApi } from 'jsonapi-client-js';

export default {

  props: {

    handle: {
      type: String,
      required: false
    }
  },

  data() {
    return {
      
      usingCollectionMixin: false,
      isLoadingCollection: false,
      collectionDocument: null,
      collectionErrors: [],

      // Collection products
      collectionProductsDocument: null,
      isLoadingCollectionProducts: false,
      collectionProductsErrors: [],
      collectionProductsFilter: [],
      collectionProductsSort: '-created_at'
    };
  },

  methods: {

    /**
    * Active this mixin
    */
    useCollectionMixin(b) {

      // Signal
      this.usingCollectionMixin = b ? true : false;
      if (!this.usingCollectionMixin) {
        return;
      }

      // Get collection
      this._getCollection();

    },

    /**
    * Get collection
    */
    async _getCollection() {

      // Ignore if not collection view
      if (this.$route.name !== 'collection' || !this.usingCollectionMixin || this.isLoadingCollection) {
        return;
      }

      // Loading state
      this.isLoadingCollection = true;
      this.collectionDocument = null;
      this.collectionErrors = [];

      // Try to get from api
      try {

        // Get
        this.collectionDocument = await this.$http.find('collections', this.handle);

        // Trigger event
        this.$event.$emit('view-collection', this.collectionDocument);

        // Get products
        this._getCollectionProducts();

      } catch (e) {
        this.collectionErrors = this.$handleException(e);
      }

      // Loading state
      this.isLoadingCollection = false;

    },

    /**
    * Get collection products
    */
    async _getCollectionProducts() {

      // Ignore if collection isn't loaded
      if (!this.collectionDocument) {
        return;
      }

      // State
      this.isLoadingCollectionProducts = true;
      this.collectionProductsDocument = null;
      this.collectionProductsErrors = [];

      try {

        // Get from api
        this.collectionProductsDocument = await this.$http.collection('products', {
          params: {
            _query: JSON.stringify(this.collectionProductsFilter.concat([{
              field: 'collection_id',
              value: this.collectionDocument.getData().getId()
            }])),
            page: this.page,
            limit: this.limit,
            sort: this.collectionProductsSort
          }
        });

        // Trigger event
        this.$event.$emit('view-collection-products', this.collectionProductsDocument);

      } catch (e) {
        this.collectionProductsErrors = this.$handleException(e);
      }

      // Off loading state
      this.isLoadingCollectionProducts = false;
    }
  },

  watch: {

    '$route': function() {
      this._getCollection();
    }
  }
  
}