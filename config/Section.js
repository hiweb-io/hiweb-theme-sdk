import Config from './Config';
import Block from './Block';

class Section {

  constructor(label, page) {

    // Section data
    this.data = {
      label, page,
      config: [],
      blocks: []
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

    this.data.label = data.label;
    this.data.page = data.page;
    this.data.config = data.config.map(c => {

      if (!c.handle) {
        console.log('Failed to parse config. Config handle string cannot be null');
        return;
      }

      let config = new Config(c.handle);
      config.setData(c);
      return config;
    });

    let blockData = (typeof data.blocks !== 'undefined' && Array.isArray(data.blocks)) ? data.blocks : [];
    this.data.blocks = blockData.map(b => {

      let block = new Block(b.handle, b.label);
      block.setData(b.data);
      return block;

    });
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

    let blocks = this.data.blocks.map(b => {
      return b.compile();
    });

    return {
      label: this.data.label, 
      page: this.data.page, 
      config, blocks
    }
  }

  /**
  * Build new block
  *
  * @param string Block key
  * @param string Block label
  * @param string Block handle string
  */
  block(handle, label, callback) {
    
    let block = new Block(handle, label);

    if (typeof callback === 'function') {
      callback(block);
    }

    this.data.blocks.push(block);
  }

  /**
  * Get block
  *
  * @param string
  * @return object|null
  */
  getBlock(handle) {
    return this.data.blocks.find(b => {
      return b.getHandle() === handle;
    });
  }

  /**
  * Build new config
  *
  * @param string
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