import Vue from 'vue';
import event from '../event';
import store from '../store';
import cookie from 'js-cookie';
import { JsonApi } from 'jsonapi-client-js';

export default () => {
  event.$on('reload-cart', async attempts => {

    // Is loading cart
    store.commit('setIsLoadingCart', true);

    // Stop if attempts >= 3
    attempts = attempts ? parseInt(attempts) : 1;
    attempts = attempts || 1;
    if (attempts >= 3) {

      // Clear cart-id in cookie
      cookie.remove('cart-id');

      // Emit reload-cart-failed event
      event.$emit('reload-cart-failed');

      // Is loading cart off
      store.commit('setIsLoadingCart', false);

      return;
    }

    // Try to reload
    try {

      // Create cart if not exists
      let cartResponseDocument = null;
      if (!cookie.get('cart-id')) {

        // Build cart document
        let cartDocument = new JsonApi;
        let cartResource = cartDocument.makeResource();
        cartResource.setType('carts');
        cartDocument.setData(cartResource);

        // Send request
        cartResponseDocument = await Vue.prototype.$http.create(cartDocument);
      
      // Get from api if id exists
      } else {
        cartResponseDocument = await Vue.prototype.$http.find('carts', cookie.get('cart-id'));
      }

      // Save cart id to cookie
      cookie.set('cart-id', cartResponseDocument.getData().getId(), {
        samesite: 'Strict'
      });

      // Update cart data
      store.commit('setCartDocument', cartResponseDocument);

      // Emit cart loaded event
      event.$emit('cart-loaded', cartResponseDocument);

      // Is loading cart off
      store.commit('setIsLoadingCart', false);

      return;

    } catch (e) {

      // Retry with attempts + 1
      event.$emit('reload-cart', attempts + 1);
      return;
    }

  });
}