import Component from './Component';
import Config from './Config';

class Block {

  /**
  * Block constructor
  *
  * @param string Block key
  * @param string Label
  */
  constructor(handle, label) {

    this.handle = handle;
    this.label = label;

    // Block data
    this.data = [
      // { component: ..., config: ... }
    ];

    // Default data
    this.defaultData = [];

    // Block components
    this.components = [];
  }

  /**
  * Set block data
  *
  * @param array
  * @return void
  */
  setData(data) {
    this.data = this.parseData(data);
  }

  /**
  * Set default data
  *
  * @param array
  * @return void
  */
  setDefaultData(data) {
    this.defaultData = this.parseData(data);
  }

  /**
  * Parse data
  *
  * @param array
  * @return array
  */
  parseData(data) {

    // Data must be an array
    if (!Array.isArray(data)) {
      return;
    }

    return data.filter(componentData => {

      // No component name set
      if (typeof componentData.component !== 'string') {
        return false;
      }

      // If config data set
      if (typeof componentData.config !== 'undefined') {

        // Config must be an array
        if (Array.isArray(componentData.config)) {

          // Parse config data
          componentData.config = componentData.config.map(c => {

            // Ignore if config isn't object
            if (typeof c !== 'object') {
              return null;
            }

            // If is Config instance
            if (c instanceof Config) {
              return c;
            }

            // Raw config data
            // No handle
            if (!c.handle) {
              return null;
            }

            // Build config
            let config = new Config(c.handle);
            config.setData(c);
            return config;

          }).filter(c => c ? true : false);

        } else {

          // Otherwise ignore
          return false;
        }
      }

      return true;

    }).map(componentData => {

      // Build component object
      let component = new Component(componentData.component);

      // If config present
      if (Array.isArray(componentData.config)) {
        componentData.config.forEach(c => {
          component.pushToConfigData(c);
        });
      }

      return component;
    });
  }

  /**
  * Get block data
  *
  * @return object
  */
  getData() {
    return this.data.length ? this.data : this.defaultData;
  }

  /**
  * Compile to raw data
  *
  * @return object
  */
  compile() {

    let components = this.components.map(c => {
      return c.compile();
    });

    let data = this.data.map(d => {

      if (d instanceof Component) {
        return d.compile();
      }

      let config = [];

      if (Array.isArray(d.config)) {
        config = d.config.map(c => {
          return c.compile();
        });
      }

      return {
        component: d.component,
        config
      }
    });

    return {
      handle: this.handle,
      label: this.label,
      data,
      components
    };
  }

  /**
  * Get handle
  *
  * @param void
  * @return string
  */
  getHandle() {
    return this.handle;
  }

  /**
  * Define block component
  *
  * @param string Component name
  * @param function Config callback
  */
  register(componentName, componentLabel, callback) {

    // Create component
    let component = new Component(componentName, componentLabel);

    if (typeof callback === 'function') {
      callback(component);
    }

    this.components.push(component);

  }

  /**
  * Add a registered component to block
  *
  * @param string Component key
  * @param array Config data
  */
  addComponent(componentName, config) {
    this.data.push({
      component: componentName,
      config
    });
  }
}

export default Block;