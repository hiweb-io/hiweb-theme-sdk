import event from '../event';
import cookie from 'js-cookie';

export default () => {

  event.$on('set-cart-id', id => {
    
    cookie.set('cart-id', id, {
      samesite: 'Strict'
    });

    // Reload cart
    event.$emit('reload-cart');

  });

};