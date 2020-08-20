class Hook {

  constructor() {

    // Define hooks
    this.hooks = {
      'add-to-cart': {}
    };
  }

  /**
  * Register hook
  *
  * @param {string}
  * @param {string}
  * @param {Function}
  */
  register(hook, callbackName, callback) {

    if (!this.hooks.hasOwnProperty(hook)) {
      return console.log('Hook ' + hook + ' does not exist.');
    }

    if (typeof callbackName !== 'string') {
      return console.log('Hook callback name must be a valid string');
    }

    if (typeof callback !== 'function') {
      return console.log('Callback must be a valid function');
    }

    this.hooks[hook][callbackName] = callback;
  }

  /**
  * Run hooks
  *
  * @param {string}
  * @param {mixed}
  */
  run(hook, data) {

    if (!this.hooks.hasOwnProperty(hook)) {
      console.log('Hook ' + hook + ' does not exist.');
      return data;
    }

    for (let callbackName in this.hooks[hook]) {
      let callback = this.hooks[hook][callbackName];
      data = callback(data);
    }

    return data;
  }
}

export default new Hook;