import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {

    // Cart document
    cartDocument: null,
    isLoadingCart: false,

    // Menus document
    menusDocument: null
  },
  mutations: {

    setCartDocument(state, cartDocument) {
      state.cartDocument = cartDocument;
    },

    setIsLoadingCart(state, is) {
      state.isLoadingCart = is ? true : false;
    },

    setMenusDocument(state, d) {
      state.menusDocument = d;
    }

  }
});