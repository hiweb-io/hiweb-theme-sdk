import { JsonApi } from 'jsonapi-client-js';

export default {

  props: ['cartId'],

  data() {
    return {

      // Active signal
      usingCheckoutMixin: false,
  
      // Using same address
      checkoutSameAddress: true,

      // Addresses
      isSavingAddresses: false,
      shippingAddressErrors: [],
      shippingAddressAttributes: {
        email: '',
        phone: '',
        first_name: '',
        last_name: '',
        address1: '',
        address2: '',
        country_code: 'US',
        province: '',
        city: '',
        postal_code: ''
      },
      billingAddressErrors: [],
      billingAddressAttributes: {
        email: '',
        phone: '',
        first_name: '',
        last_name: '',
        address1: '',
        address2: '',
        country_code: 'US',
        province: '',
        city: '',
        postal_code: ''
      },

      // Invoice
      isSavingInvoice: false,
      invoiceErrors: [],

    };
  },

  created() {

    // If cart present
    if (this.cart && this.cart.getRelationshipData('invoice')) {
      this.presetAddresses(this.cart.getRelationshipData('invoice'));
    }

  },

  methods: {

    /**
    * Active this mixin
    */
    async useCheckoutMixin(b) {

      this.usingCheckoutMixin = b ? true : false;
      if (!this.usingCheckoutMixin) {
        return;
      }

      // If no cart id set
      if (!this.$cookie.get('cart-id')) {
        this.$event.$emit('set-cart-id', this.cartId);
      }

      // Pre-filled addresses
      this.$event.$on('cart-loaded', cartDocument => {

        // Trigger view -checkout event
        this.$event.$emit('view-checkout', cartDocument);

        let invoice = cartDocument.getData().getRelationshipData('invoice');
        if (!invoice) {
          return;
        }

        // Set addresses
        this.presetAddresses(invoice);

      });

    },

    /**
    * Make address
    */
    async makeAddress(attributes) {

      // Build address document
      let addressDocument = new JsonApi;
      let addressResource = addressDocument.makeResource();
      addressResource.setType('addresses');
      addressResource.setAttributes(attributes);
      addressDocument.setData(addressResource);

      // State
      this.isSavingAddresses = true;

      return new Promise(async (resolve, reject) => {

        // Try to create
        try {
          
          // Save
          let addressResponseDocument = await this.$http.save(addressDocument);

          // Trigger event
          this.$event.$emit('address-saved', addressResponseDocument);

          // Off loading state
          this.isSavingAddresses = false;
          
          return resolve(addressResponseDocument);

        } catch (e) {

          // Trigger failed event
          this.$event.$emit('save-address-failed', e);

          // Loading state
          this.isSavingAddresses = false;

          return reject(e);
        }

      });
    },

    /**
    * Make invoice
    */
    async makeInvoice() {

      // If no cart
      if (!this.cart) {
        return false;
      }

      // Address ids
      let shippingAddressId = null;
      let billingAddressId = null;

      // Create address
      this.shippingAddressErrors = [];
      let shippingAddressDocument = await this.makeAddress(this.shippingAddressAttributes).catch(e => this.shippingAddressErrors = this.$handleException(e));
      if (this.shippingAddressErrors.length) {
        return;
      }
      shippingAddressId = shippingAddressDocument.getData().getId();

      // Create billing address
      this.billingAddressErrors = [];
      if (!this.checkoutSameAddress) {
        let billingAddressDocument = await this.makeAddress(this.billingAddressAttributes).catch(e => this.billingAddressErrors = this.$handleException(e));
        if (this.billingAddressErrors.length) {
          return;
        }
        billingAddressId = billingAddressDocument.getData().getId();
      } else {
        billingAddressId = shippingAddressId;
      }


      // Build invoice document
      let invoiceDocument = new JsonApi;
      let invoiceResource = invoiceDocument.makeResource();
      invoiceResource.setType('invoices');

      // If cart has invoice
      let invoice = this.cart.getRelationshipData('invoice');
      if (invoice) {
        invoiceResource.setId(invoice.getId());
      }

      // Set shipping address relationship
      invoiceResource.setRelationship('shipping_address', {
        type: 'addresses',
        id: shippingAddressId
      });

      // Set billing address relationship
      invoiceResource.setRelationship('billing_address', {
        type: 'addresses',
        id: billingAddressId
      });

      // Set cart relationship
      invoiceResource.setRelationship('cart', this.cart);

      // Save invoice document data
      invoiceDocument.setData(invoiceResource);

      // Try to save invoice
      this.isSavingInvoice = true;
      try {

        let invoiceResponseDocument = await this.$http.save(invoiceDocument);

        // Emit event
        this.$event.$emit('invoice-saved', invoiceResponseDocument);

      } catch (e) {console.log(e);
        this.invoiceErrors = this.$handleException(e);

        // Emit event
        this.$event.$emit('save-invoice-failed', e);
      }

      this.isSavingInvoice = false;
    },

    /**
    * Preset addresses
    */
    presetAddresses(invoice) {

      // Shipping & billing address
      let shippingAddress = invoice.getRelationshipData('shipping_address');
      let billingAddress = invoice.getRelationshipData('billing_address');
      if (shippingAddress && billingAddress) {

        if (shippingAddress.getId() === billingAddress.getId()) {
          this.checkoutSameAddress = true;
        } else {
          this.checkoutSameAddress = false;
        }
        
      }

      // Map shipping address attributes
      if (shippingAddress) {
        for (let key in this.shippingAddressAttributes) {
          this.shippingAddressAttributes[key] = shippingAddress.getAttribute(key);
        }
      }

      // Map billing address attribute
      if (billingAddress) {
        for (let key in this.billingAddressAttributes) {
          this.billingAddressAttributes[key] = billingAddress.getAttribute(key);
        }
      }

    }
  },

  watch: {

    checkoutSameAddress: function(is) {

      if (!is) {
        this.billingAddressAttributes = {
          email: '',
          phone: '',
          first_name: '',
          last_name: '',
          address1: '',
          address2: '',
          country_code: 'US',
          province: '',
          city: '',
          postal_code: ''
        };
        return;
      }

      this.billingAddressAttributes = this.shippingAddressAttributes;
    }
  }
}