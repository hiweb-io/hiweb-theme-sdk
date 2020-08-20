import store from '../store';
import { JsonApi } from 'jsonapi-client-js';

export default {

  data() {
    return {

      // Add to cart state
      isCreatingCartItem: false,
      createCartItemErrors: [],
      
    }
  },

  methods: {

    /**
    * Apply discount to cart
    * 
    * @param string Discount code
    */
    async applyDiscount(code) {

      // No cart id in cookie - ignore
      if (!this.$cookie.get('cart-id')) {
        return;
      }

      // Cart loading
      store.commit('setIsLoadingCart', true);

      // Try to apply discount
      try {

        // Cart document
        let cartDocument = new JsonApi;
        let cartResource = cartDocument.makeResource();
        cartResource.setType('carts');
        cartResource.setId(this.$cookie.get('cart-id'));
        cartResource.setRelationship('discount', {
          type: 'discounts',
          id: code
        });
        cartDocument.setData(cartResource);

        // Send request
        let cartResponseDocument = await this.$http.save(cartDocument);

        // Trigger event
        this.$event.$emit('discount-applied', cartResponseDocument)

      } catch (e) {

        // Emit failed event
        this.$event.$emit('apply-discount-failed', e);
      }

      // Reload cart
      this.$event.$emit('reload-cart');
    },

    /**
    * Remove discount from cart
    */
    async removeDiscount() {

      // No cart id in cookie - ignore
      if (!this.$cookie.get('cart-id')) {
        return;
      }

      // Cart loading
      store.commit('setIsLoadingCart', true);

      // Try to remove discount
      try {

        // Cart document
        let cartDocument = new JsonApi;
        let cartResource = cartDocument.makeResource();
        cartResource.setType('carts');
        cartResource.setId(this.$cookie.get('cart-id'));
        cartResource.setRelationship('discount', {
          type: 'discounts',
          id: null
        });
        cartDocument.setData(cartResource);

        // Send request
        await this.$http.save(cartDocument);

        // Send request
        let cartResponseDocument = await this.$http.save(cartDocument);

        // Trigger event
        this.$event.$emit('discount-removed', cartResponseDocument)

      } catch (e) {

        // Emit failed event
        this.$event.$emit('remove-discount-failed', e);
      }

      // Reload cart
      this.$event.$emit('reload-cart');

    },

    /**
    * Create cart item
    *
    * @param string Variant ID
    * @param integer Qty
    */
    async createCartItem(variantId, quantity, note) {


      // Is loading cart state
      store.commit('setIsLoadingCart', true);

      try {

        // Reset errors
        this.createCartItemErrors = [];

        // Build cart item document
        let cartItemDocument = new JsonApi;
        let cartItemResource = cartItemDocument.makeResource();
        cartItemResource.setType('cart_items');
        cartItemResource.setAttributes({
          quantity: quantity || 1,
          note: note || ''
        });

        // Set cart relationship if present
        const cartId = this.$cookie.get('cart-id');
        if (cartId) {
          cartItemResource.setRelationship('cart', {
            type: 'carts',
            id: cartId
          });
        }
        
        cartItemResource.setRelationship('variant', {
          type: 'variants',
          id: variantId
        });
        cartItemDocument.setData(cartItemResource);

        // Send request
        let cartItemResponseDocument = await this.$http.create(cartItemDocument);

        // Set cart id
        this.$cookie.set('cart-id', cartItemResponseDocument.getData().getRelationshipData('cart').getId());

        // Cart item created - dispatch event
        this.$event.$emit('cart-item-created', cartItemResponseDocument);

      } catch (e) {

        if (e.response.status === 410) {
          this.$cookie.remove('cart-id');
        }

        this.createCartItemErrors = this.$handleException(e);

        // Dis patch event
        this.$event.$emit('create-cart-item-failed', e);
      }

      // Turn signal off
      this.isCreatingCartItem = false;

      // Reload cart
      this.$event.$emit('reload-cart');

    },

    /**
    * Delete cart item
    *
    * @param Resource
    */
    async deleteCartItem(cartItem) {

      // Is loading cart state
      store.commit('setIsLoadingCart', true);

      try {

        // Send delete request
        await this.$http.delete('cart_items', cartItem.getId());

        // Dispatch cart item deleted event
        this.$event.$emit('cart-item-deleted', cartItem);

        // Dispatch reload cart event
        this.$event.$emit('reload-cart');

      } catch (e) {

        // Dispatch delete-cart-item-failed event
        this.$event.$emit('delete-cart-item-failed', e);
      }

    }
  },
  
  computed: {

    isLoadingCart: function() {
      return store.state.isLoadingCart;
    },

    cartDocument: function() {
      return store.state.cartDocument;
    },

    cart: function() {

      if (!this.cartDocument) {
        return null;
      }

      return this.cartDocument.getData();
    },

    cartItems: function() {
      
      if (!this.cart) {
        return null;
      }

      return this.cart.getRelationshipData('cart_items') || [];

    }
  }  
}