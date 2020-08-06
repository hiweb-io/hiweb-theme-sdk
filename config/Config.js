import { JsonApi } from 'jsonapi-client-js';
import store from '../store';

class Config {

  constructor(handle) {

    if (!handle) {
      console.log('Config handle string cannot be null');
      return;
    }

    // Config data
    this.data = {
      handle,
      label: '',
      driver: '',
      value: null
    };

    // Config default value
    this.defaultValue = null;
  }

  /**
  * Parse from config data object
  */
  setData(data) {
    this.data = data;
  }

  /**
  * Get config data
  */
  getData() {

    let data = JSON.parse(JSON.stringify(this.data));
    if (data.value === null) {
      data.value = this.defaultValue;
    }

    // Default value for menu-selector
    if (data.driver === 'menu-selector') {

      // No id set
      if (!data.value) {
        data.value = 'example';
      }

      // Value (id) is set
      let menusDocument = store.state.menusDocument;
      if (data.value && menusDocument) {
        let menu = menusDocument.findResource('menus', data.value);
        if (menu) {
          data.value = menu.getAttribute('menu_links');
        }
      }
      
    }

    return data;
  }

  /**
  * Get config handle
  * 
  * @return string
  */
  getHandle() {
    return this.data.handle;
  }

  /**
  * Set config label
  *
  * @param string
  * @return this
  */
  setLabel(label) {
    this.data.label = label;
    return this;
  }

  /**
  * Set config driver
  *
  * @param string
  * @return this
  */
  setDriver(driver) {

    // Check driver
    let validDrivers = ['text-input', 'textarea-input', 'wysiwyg-input', 'select-input', 'multi-select-input', 'color-input', 'datetime-input', 'menu-selector', 'image-selector', 'product-selector', 'collection-selector'];
    if (validDrivers.indexOf(driver) === -1) {
      console.log('Invalid config driver value. Valid values are: ' + JSON.stringify(validDrivers));
      return;
    }

    this.data.driver = driver;
    return this;
  }

  /**
  * Set config value limit
  *
  * @param integer
  * @return this
  */
  setLimit(limit) {

    limit = parseInt(limit);
    if (limit < 0) {
      console.log('Limit should be unsigned');
      return;
    }

    this.data.limit = limit;
    return this;
  }

  /**
  * Set options (for select/multi-select input)
  *
  * @param object
  * @return this
  */
  setOptions(options) {

    if (['select-input', 'multi-select-input'].indexOf(this.data.driver) === -1) {
      console.log('Only select/multi-select input driver supports "options"');
      return;
    }

    if (typeof options !== 'object') {
      console.log('Config options must be a valid object');
      return;
    }

    this.data.options = options;
    return this;
  }

  /**
  * Set default value
  *
  * @param mixed
  * @return this
  */
  default(value) {
    this.defaultValue = value;
    return this;
  }
}

export default Config;