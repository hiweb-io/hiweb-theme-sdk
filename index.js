import config from './config';
import { JsonApi, Http } from 'jsonapi-client-js';

// Event instance
import event from './event';

// Store
import store from './store';

// Mixins
import cartMixin from './mixins/cart';
import collectionMixin from './mixins/collection';
import collectionsMixin from './mixins/collections';
import pageMixin from './mixins/page';
import pagesMixin from './mixins/pages';
import postMixin from './mixins/post';
import postsMixin from './mixins/posts';
import productMixin from './mixins/product';
import productsMixin from './mixins/products';
import checkoutMixin from './mixins/checkout';
import invoiceMixin from './mixins/invoice';
import ThankyouMixin from './mixins/thankyou';

// Helpers
import linkTo from './helpers/link-to';
import handleException from './helpers/handle-exception';
import getNestedAttribute from './helpers/get-nested-attribute';
import image from './helpers/image';
import cookie from 'js-cookie';
import currency from './helpers/currency';
import time from './helpers/time';
import str from './helpers/str';

// Event listeners
import reloadCartListener from './listeners/reload-cart-listener';
import setCartIdListener from './listeners/set-cart-id-listener';

export default {

  install(Vue) {

    // Theme config
    Vue.prototype.$themeConfig = config;

    // Api endpoint
    let endpoint = window.$hiwebApiEndpoint || process.env.VUE_APP_API_ENDPOINT;
    Vue.prototype.$apiEndpoint = endpoint;

    // JsonApi class
    Vue.prototype.$JsonApi = JsonApi;

    // Http client
    Vue.prototype.$http = new Http(endpoint);

    // Route $linkTo helper
    Vue.prototype.$linkTo = this.linkTo;

    // Event instance
    Vue.prototype.$event = event;

    // Cart document is global
    let cartDocument = new JsonApi;
    let cartResource = cartDocument.makeResource();
    cartResource.setType('carts');
    cartResource.setAttributes({
      item_count: 0
    });
    cartDocument.setData(cartResource);

    // Store cart document
    store.commit('setCartDocument', cartDocument);

    // Inject mixins
    Vue.mixin(cartMixin);
    Vue.mixin(collectionMixin);
    Vue.mixin(collectionsMixin);
    Vue.mixin(pageMixin);
    Vue.mixin(pagesMixin);
    Vue.mixin(postMixin);
    Vue.mixin(postsMixin);
    Vue.mixin(productMixin);
    Vue.mixin(productsMixin);
    Vue.mixin(checkoutMixin);
    Vue.mixin(invoiceMixin);
    Vue.mixin(ThankyouMixin);

    // Global mixin
    Vue.mixin({
      mounted() {

        // Global force update event
        window.addEventListener('force-update', () => {
          this.$forceUpdate();
        });

      },
      computed: {

        page: function() {
          return this.$route.query.page || 1;
        },

        limit: function() {
          return this.$route.query.limit || 20;
        }
      }
    });

    // Inject helpers
    Vue.prototype.$linkTo = linkTo;
    Vue.prototype.$handleException = handleException;
    Vue.prototype.$getNestedAttribute = getNestedAttribute;
    Vue.prototype.$image = image;
    Vue.prototype.$cookie = cookie;
    Vue.prototype.$currency = currency;
    Vue.prototype.$time = time;
    Vue.prototype.$string = str;

    // Event listeners
    reloadCartListener();
    setCartIdListener();

    // If cookie cart-id set
    if (cookie.get('cart-id')) {
      store.commit('setIsLoadingCart', true);
      setTimeout(() => {
        event.$emit('reload-cart');
      }, 1000);
    }

    // Listen to window set-theme-config event
    window.addEventListener('message', event => {
      try {

        let data = JSON.parse(event.data);
        if (typeof data !== 'object' || data.hiwebMessageEvent !== 'set-theme-config') {
          return;
        }

        // Parse config data
        config.parse(data.data);
        window.dispatchEvent(new Event('force-update'));

      } catch (e) {}

    }, false);

  },

  linkTo() {

  }
}