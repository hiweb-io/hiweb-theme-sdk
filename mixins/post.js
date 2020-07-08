export default {

  props: {

    handle: {
      type: String,
      require: true
    }
  },

  data() {
    return {

      usingPostMixin: false,
      isLoadingPost: false,
      postDocument: null,
      postErrors: [],

    };
  },

  methods: {

    /**
    * Active this mixin
    */
    usePostMixin(b) {

      // Signal
      this.usingPostMixin = b ? true : false;
      if (!this.usingPostMixin) {
        return;
      }

      // Get post
      this._getPost();
    },

    /**
    * Get post
    */
    async _getPost() {

      // Ignore cases
      if (this.$route.name !== 'post' || !this.usingPostMixin || this.isLoadingPost) {
        return;
      }

      // State
      this.isLoadingPost = true;
      this.postDocument = null;
      this.postErrors = [];

      try {

        // Get from api
        this.postDocument = await this.$http.find('posts', this.handle);

        // Trigger event
        this.$event.$emit('view-post', this.postDocument);

      } catch (e) {
        this.postErrors = this.$handleException(e);
      }

      this.isLoadingPost = false;
    }
  },

  watch: {

    '$route': function() {
      this._getPost();
    }
  }
}