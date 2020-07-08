import Config from './Config';

class Section {

  constructor(label, page) {

    // Section data
    this.data = {
      label, page,
      config: []
    };
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
  * Parse data from data object
  *
  * @param object
  */
  parse(data) {

    if (!Array.isArray(data.config)) {
      console.log('Failed to parse section config. Config data must be an array');
      return;
    }

    this.data = {
      label: data.label,
      page: data.page,
      config: data.config.map(c => {

        if (!c.handle) {
          console.log('Failed to parse config. Config handle string cannot be null');
          return;
        }

        let config = new Config(c.handle);
        config.setData(c);
        return config;
      })
    };
  }

  /**
  * Get section raw data
  *
  * @return object
  */
  compile() {

    let config = this.data.config.map(c => {
      return c.getData();
    });

    return {
      label: this.data.label, 
      page: this.data.page, 
      config
    }
  }

  /**
  * Build new config
  */
  config(handle) {

    if (!Array.isArray(this.data.config)) {
      console.log('Failed to build section config.');
      return;
    }

    let config = new Config(handle);

    this.data.config.push(config);
    return config;
  }

  /**
  * Get config by handle string
  *
  * @param string
  * @return object|null
  */
  getConfig(handle) {
    return this.data.config.find(c => {
      return c.getHandle() === handle;
    });
  }

}

export default Section;