export default {
  
  data() {
    return {

      usingPostsMixin: false,
      isLoadingPosts: false,
      postsDocument: false,
      postsErrors: [],
      postsSort: '-created_at',

    };
  },

  methods: {

    /**
    * Active this mixin
    */ 
    usePostsMixin(b) {

      // Signal
      this.usingPostsMixin = b ? true : false;
      if (!this.usingPostsMixin) {
        return;
      }

      // Get posts
      this._getPosts();
    },

    /**
    * Get posts
    */
    async _getPosts() {

      // Ignore if not using this mixing
      if (this.$route.name !== 'posts' || !this.usingPostsMixin || this.isLoadingPosts) {
        return;
      }

      // State
      this.isLoadingPosts = true;
      this.postsDocument = null;
      this.postsErrors = [];

      try {

        // Get from api
        this.postsDocument = await this.$http.collection('posts', {
          params: {
            sort: this.postsSort,
            post: this.post,
            limit: this.limit
          }
        });

        // Trigger event
        this.$event.$emit('view-posts', this.postsDocument);

      } catch (e) {
        this.postsErrors = this.$handleException(e);
      }

      // Off loading
      this.isLoadingPosts = false;
    }
  },

  watch: {

    post: function() {
      this._getPosts();
    },

    limit: function() {
      this._getPosts();
    },

    postsSort: function() {
      this._getPosts();
    }
  }
}