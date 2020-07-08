import Section from './config/Section';

class Config {

  constructor() {

    // Config data
    this.data = [];

    // If theme config injected to window super object
    if (typeof window.$themeConfig !== 'undefined') {

      // Parse
      this.parse(window.$themeConfig);
    }
  }

  /**
  * Parse config from string or array
  *
  * @param mixed
  */
  parse(data) {

    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return;
      }
    }

    if (!Array.isArray(data)) {
      console.log('Failed to parse theme config. Theme config must be a valid array');
      return;
    }

    // Parse data
    this.data = data.map(s => {
      let section = new Section;
      section.parse(s);
      return section;
    });

  }

  /**
  * Get data
  *
  * @return array
  */
  getData() {
    return this.data;
  }

  /**
  * Config data to raw array
  *
  * @return array
  */
  compile() {
    return this.data.map(section => {
      return section.compile();
    });
  }

  /**
  * Compile data to json string
  *
  * @return string
  */
  toJson() {
    return JSON.stringify(this.compile());
  }

  /**
  * Build a new config section
  *
  * @param string
  * @param string
  * @param Function
  */
  section(label, page, callback) {

    // Create new section
    let section = new Section(label, page);

    // Build config
    if (typeof callback === 'function') {
      callback(section);
    }

    // Push section to data
    this.data.push(section);
  }

  /**
  * Get config by handle string
  *
  * @param string
  * @return object
  */
  getConfig(handle) {

    for (let i = 0; i < this.data.length; i++) {

      let section = this.data[i];
      let config = section.getConfig(handle);
      if (config) {
        return config;
      }

    }

    return null;
  }

  /**
  * Get config value by handle string
  *
  * @param string
  * @param mixed
  * @return mixed
  */
  getConfigValue(handle, defaultValue) {

    let config = this.getConfig(handle);
    if (!config) {
      return defaultValue;
    }

    config = config.getData();

    return config.value === null ? defaultValue : config.value;
  }
}

export default new Config;