class Router {

  /**
  * Constructor
  */
  constructor(router) {
    this.router = router;
  }

  /**
  * Register route
  */
  register(views) {

    let routes = [];

    for (let name in views) {

      // View component
      let component = views[name];
      if (typeof component !== 'object') {
        continue;
      }

      // Route path
      let path = '/';
      switch (name) {
        
        case 'cart': 
          path = '/cart'; 
          break;
        
        case 'collection': 
          path = '/collections/:handle'; 
          break;
        
        case 'collections': 
          path = '/collections'; 
          break;

        case 'page':
          path = '/pages/:handle';
          break;

        case 'pages':
          path = '/pages';
          break;

        case 'post':
          path = '/posts/:handle';
          break;

        case 'posts':
          path = '/posts';
          break;

        case 'product':
          path = '/products/:handle';
          break;

        case 'products':
          path = '/products';
          break;

        // Checkout
        case 'checkout':
          path = '/checkout/:cartId';
          break;

        // Invoice
        case 'invoice':
          path = '/checkout/invoices/:invoiceId';
          break;

        // Thank you
        case 'thankyou':
          path = '/checkout/thank-you/:invoiceId?';
          break;

        // Payment cancelled
        case 'payment-failure':
          path = '/checkout/failure/:invoiceId?';
          break;

      }

      // Build route
      let route = {
        name,
        path,
        component,
        props: true
      };

      routes.push(route);
    }

    this.router.addRoutes(routes);
    
  }

}

export default router => new Router(router);