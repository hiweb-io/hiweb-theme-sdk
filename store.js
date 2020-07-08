import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    cartDocument: null,
    isLoadingCart: false,
  },
  mutations: {

    setCartDocument(state, cartDocument) {
      state.cartDocument = cartDocument;
    },

    setIsLoadingCart(state, is) {
      state.isLoadingCart = is ? true : false;
    }

  }
});