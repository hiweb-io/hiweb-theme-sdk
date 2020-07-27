import Config from './Config';

class Component {

  /**
  * Component constructor
  *
  * @param string Vue component name
  */
  constructor(componentName) {

    this.data = {
      component: componentName,
      config: []
    };
  }

  /**
  * Get component key
  *
  * @return string
  */
  getKey() {
    return this.data.component;
  }

  /**
  * Compile to raw data
  *
  * @return object
  */
  compile() {

    let config = this.data.config.map(c => {
      return c.getData();
    });

    return {
      component: this.data.component,
      config
    }
  }

  /**
  * Push to config data
  */
  pushToConfigData(config) {

    if (!config instanceof Config) {
      return;
    }

    this.data.config.push(config);
  }

  /**
  * Component config
  *
  * @param string Handle
  */
  config(handle) {
    let config = new Config(handle);
    this.data.config.push(config);
    return config;
  }

  /**
  * Get config
  *
  * @param string Handle
  * @return Config
  */
  getConfig(handle) {
    return this.data.config.find(c => {
      return c.getHandle() === handle;
    });
  }

  /**
  * Get config value
  *
  * @param string Handle
  * @return mixed
  */
  getConfigValue(handle) {

    let config = this.getConfig(handle);
    if (!config) {
      return null;
    }

    return config.getData().value;
  }

}

export default Component;