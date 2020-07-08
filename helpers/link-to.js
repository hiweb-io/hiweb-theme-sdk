import Resource from 'jsonapi-client-js/src/Resource';

export default function(routeName) {

  // If unknown route
  let validRouteNames = ['checkout', 'invoice', 'thankyou', 'payment-failure', 'cart', 'collection', 'collections', 'home', 'page', 'pages', 'post', 'posts', 'product', 'products'];
  if (validRouteNames.indexOf(routeName) === -1) {
    return null;
  }

  // Linkage object
  let link = {
    name: routeName
  };

  // Add handle parameter for some routes
  if (['collection', 'page', 'post', 'product'].indexOf(routeName) > -1) {
    link.params = {
      handle: arguments[1] instanceof Resource ? arguments[1].getAttribute('handle') : arguments[1]
    };
  }

  // Add cart id to checkout route
  if (routeName === 'checkout') {
    link.params = {
      cartId: arguments[1] instanceof Resource ? arguments[1].getId() : arguments[1]
    };
  }

  // Add invoice id to invoice route
  if (['invoice', 'thankyou', 'payment-failure'].indexOf(routeName) > -1) {
    link.params = {
      invoiceId: arguments[1] instanceof Resource ? arguments[1].getId() : arguments[1]
    };
  }

  // Return
  return link;
}