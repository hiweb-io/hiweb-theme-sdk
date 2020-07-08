export default {

  /**
  * Get image url
  *
  * @param Resource Instance of jsonapi-client-js/src/Resource
  * @return string
  */
  url(imageResource) {

    if (!imageResource) {
      return require('../assets/img/default.png');
    }

    return imageResource.getAttribute('url') + imageResource.getAttribute('path');
  },

  /**
  * Resize image
  */
  resize(imageResource, width, crop) {
    return this.url(imageResource);
  }

}