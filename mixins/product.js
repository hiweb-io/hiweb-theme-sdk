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
      usingProductMixin: false,
      isLoadingProduct: false,
      productDocument: null,
      productErrors: [],

      // Selected product option values (for add to cart)
      productQuantity: 1,
      productOption1: null,
      productOption2: null,
      productOption3: null,
    };
  },

  methods: {

    /**
    * Active this mixin
    */
    useProductMixin(b) {

      // Use product mixin signal
      this.usingProductMixin = b ? true : false;
      if (!this.usingProductMixin) {
        return;
      }

      // Get product
      this._getProduct();

      // Listen to cart item created event
      this.$event.$on('cart-item-created', cartItemDocument => {
        this.isCreatingCartItem = false;
      });

      // Listen to create cart item failed event
      this.$event.$on('create-cart-item-failed', e => {
        this.isCreatingCartItem = false;
      });

      // Listen to cart loaded event
      this.$event.$on('cart-loaded', cartDocument => {

        if (!this.selectedVariant) {
          this.isCreatingCartItem = false;
          return;
        }

      });

      // Listen to cart load failed event
      this.$event.$on('reload-cart-failed', () => {

        // Ignore if not adding to cart
        if (!this.isCreatingCartItem) {
          return;
        }

        // Err msg
        this.createCartItemErrors = ['Failed to get cart data. If you think this is an error, please contact us'];

        // Turn signal off
        this.isCreatingCartItem = false;
      })

    },

    /**
    * Get product
    */
    async _getProduct() {

      // Ignore if not product view
      if (this.$route.name !== 'product' || !this.usingProductMixin || this.isLoadingProduct) {
        return;
      }

      // Loading state
      this.productDocument = null;
      this.isLoadingProduct = true;
      this.productErrors = [];

      // Try to get from api
      try {

        // Get
        if (typeof window.$hiwebData === 'object' 
          && typeof window.$hiwebData.documents === 'object' 
          && typeof window.$hiwebData.documents['product-' + this.handle] === 'object') {
          this.productDocument = new JsonApi(window.$hiwebData.documents['product-' + this.handle]);
        } else {
          this.productDocument = await this.$http.find('products', this.handle);
        }

        // Emit event
        this.$event.$emit('view-product', this.productDocument);

        // Set default option value
        let options = this.productDocument.getData().getAttribute('options');
        if (options && options.length) {
          options.forEach((option, index) => {
            
            // If no values
            let values = option.values;
            if (!values || !values.length) {
              return;
            }

            this['productOption' + (index + 1)] = values[0];

          });
        }

      } catch (e) {
        this.productErrors = this.$handleException(e);
      }

      // Turn off loading state
      this.isLoadingProduct = false;

    },

    /**
    * Add item to cart
    *
    * @param integer Attemps (will stop if >= 3)
    */
    async addToCart() {

      if (!this.selectedVariant) {
        this.createCartItemErrors = ['No product/variant selected.'];
        return;
      }

      // Loading state
      this.isCreatingCartItem = true;
      this.createCartItemErrors = [];

      // Try to create cart item
      this.createCartItem(this.selectedVariant.getId(), this.productQuantity);

    }

  },

  watch: {

    '$route': function() {
      this._getProduct();
    }
  },

  computed: {

    /**
    * Get selected variant
    */
    selectedVariant: function() {

      // Product document isn't ready
      if (!this.productDocument) {
        return null;
      }
      
      let variants = this.productDocument.getData().getRelationshipData('variants');
      if (!variants || !variants.length) {
        return null;
      }

      if (variants.length === 1) {
        return variants[0];
      }

      return variants.find(variant => {
        for (let i = 1; i <= 3; i++) {
          if (variant.getAttribute('option' + i) !== this['productOption' + i]) {
            return false;
          }
        }
        return true;
      });

    }
  }
}