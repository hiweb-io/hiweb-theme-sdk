export default {
  
  data() {
    return {

      usingProductsMixin: false,
      isLoadingProducts: false,
      productsDocument: null,
      productsErrors: [],
      productsFilter: [],
      productsSort: '-created_at'

    };
  },

  methods: {

    /**
    * Active this mixin
    */
    useProductsMixin(b) {

      // Signal
      this.usingProductsMixin = b ? true : false;
      if (!this.usingProductsMixin) {
        return;
      }

      // Get products
      this._getProducts();
    },

    /**
    * Get products
    */
    async _getProducts() {

      // Ignore if not using this mixing
      if (this.$route.name !== 'products' || !this.usingProductsMixin || this.isLoadingProducts) {
        return;
      }

      // State
      this.isLoadingProducts = true;
      this.productsDocument = null;
      this.productsErrors = [];

      try {

        // Get from api
        this.productsDocument = await this.$http.collection('products', {
          params: {
            _query: JSON.stringify(this.productsFilter),
            sort: this.productsSort,
            page: this.page,
            limit: this.limit
          }
        });

        // Trigger event
        this.$event.$emit('view-products', this.productsDocument);

      } catch (e) {
        this.productsErrors = this.$handleException(e);
      }

      // Off loading
      this.isLoadingProducts = false;
    }

  },

  watch: {

    page: function() {
      this._getProducts();
    },

    limit: function() {
      this._getProducts();
    },

    productsSort: function() {
      this._getProducts();
    }
  }
}