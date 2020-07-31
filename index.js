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

// Theme block manager
import HiwebThemeBlock from './components/HiwebThemeBlock';

export default {

  install(Vue) {

    // Theme config
    Vue.prototype.$themeConfig = config;

    // Register global components
    Vue.component('hiweb-theme-block', HiwebThemeBlock);

    // Api endpoint
    const endpoint = ((typeof window.$hiweb === 'object' && window.$hiweb.apiEndpoint) || process.env.VUE_APP_API_ENDPOINT) || 'https://hiweb.io/api/';
    Vue.prototype.$apiEndpoint = endpoint;

    // JsonApi class
    Vue.prototype.$JsonApi = JsonApi;

    // Http client
    const http = new Http(endpoint);
    Vue.prototype.$http = http;

    // Route $linkTo helper
    Vue.prototype.$linkTo = this.linkTo;

    // Event instance
    Vue.prototype.$event = event;

    // Cart document is global
    const cartDocument = new JsonApi;
    const cartResource = cartDocument.makeResource();
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

    // Listen to window set-menus-document event
    this.setMenusDocument();
    window.addEventListener('message', event => {

      try {

        let data = JSON.parse(event.data);
        if (typeof data !== 'object' || data.hiwebMessageEvent !== 'set-menus-document') {
          return;
        }

        // Reset menusDocument
        store.commit('setMenusDocument', new JsonApi(data.data));
        window.dispatchEvent(new Event('force-update'));

      } catch (e) {}

    }, false);

    // Export some hiweb helpers to window
    window.$hiweb = {
      JsonApi,
      http,
      event,
      image,
      cookie,
      currency
    };
  },

  /**
  * Set menus document
  */
  setMenusDocument() {

    if (store.state.menusDocument) {
      return;
    }

    // If menusDocument injected
    if (typeof window.$hiweb === 'object' && typeof window.$hiweb.menusDocument === 'object') {
      store.commit('setMenusDocument', new JsonApi(window.$hiweb.menusDocument));
    } else {

      // Example menu if no data set
      let menusDocument = new JsonApi();
      let exampleMenu = menusDocument.makeResource();
      exampleMenu.setId('example');
      exampleMenu.setType('menus');
      exampleMenu.setAttributes({
        title: 'Example menu',
        handle: 'example',
        menu_links: [
          {
            url: '/',
            text: 'Home'
          },
          {
            url: '/pages',
            text: 'Pages'
          }
        ]
      });
      menusDocument.setData([exampleMenu]);

      store.commit('setMenusDocument', menusDocument);
    }

  }
}