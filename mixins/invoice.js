import { JsonApi } from 'jsonapi-client-js';

export default {

  props: ['invoiceId'],

  data() {
    return {

      // Active signal
      usingInvoiceMixin: false,

      // Invoice
      isLoadingInvoice: false,
      invoiceDocument: null,
      invoiceErrors: [],

      // Invoice saving state
      isSavingInvoice: false,

      // Shippings
      isLoadingShippings: false,
      shippingsDocument: null,
      shippingsErrors: [],

      // Payment gateways
      isLoadingPaymentGateways: false,
      paymentGatewaysDocument: null,
      paymentGatewaysErrors: []

    };
  },

  methods: {

    /**
    * Active this mixin
    */
    useInvoiceMixin(b) {

      this.usingInvoiceMixin = b ? true : false;
      if (!this.usingInvoiceMixin) {
        return;
      }

      // Get invoice
      this.getInvoice();

      // Get shippings
      this.getShippings();

      // Get payment gateways
      this.getPaymentGateways();

      // Listen to discount-applied/discount-removed - reload invoice in silence
      this.$event.$on('discount-applied', cartDocument => {
        this.getInvoice(true);
      });
      this.$event.$on('discount-removed', cartDocument => {
        this.getInvoice(true);
      });

    },

    /**
    * Get invoice
    */
    async getInvoice(silence) {

      if (!silence) {
        this.isLoadingInvoice = true;
      }

      try {

        this.invoiceDocument = await this.$http.find('invoices', this.invoiceId);

        // Emit event
        this.$event.$emit('invoice-loaded', this.invoiceDocument);

        // If no cart id or different cart id
        let cartId = this.invoiceDocument.getData().getRelationshipData('cart').getId();
        if (this.$cookie.get('cart-id') !== cartId) {
          this.$event.$emit('set-cart-id', cartId);
        }

      } catch(e) {
        this.invoiceErrors = this.$handleException(e);
      }

      this.isLoadingInvoice = false;
    },

    /**
    * Get shippings
    */
    async getShippings() {

      this.isLoadingShippings = true;

      try {
        this.shippingsDocument = await this.$http.collection('shippings');

        // Emit event
        this.$event.$emit('shippings-loaded', this.shippingsDocument);

      } catch (e) {
        this.shippingsErrors = this.$handleException(e);
      }

      this.isLoadingShippings = false;
    },

    /**
    * Get payment gateways
    */
    async getPaymentGateways() {

      this.isLoadingPaymentGateways = true;

      try {
        this.paymentGatewaysDocument = await this.$http.collection('payment_gateways');

        // Emit event
        this.$event.$emit('payment-gateways-loaded', this.paymentGatewaysDocument);

      } catch (e) {
        this.paymentGatewaysErrors = this.$handleException(e);
      }

      this.isLoadingPaymentGateways = false;
    },

    /**
    * Set shipping method
    */
    async setInvoiceShipping(shipping) {

      this.isSavingInvoice = true;

      try {

        // Invoice update document
        let invoiceDocument = new JsonApi;
        let invoiceResource = invoiceDocument.makeResource();
        invoiceResource.setType('invoices');
        invoiceResource.setId(this.invoiceDocument.getData().getId());
        invoiceResource.setRelationship('shipping', shipping);
        invoiceDocument.setData(invoiceResource);

        let invoiceResponseDocument = await this.$http.save(invoiceDocument);

        // Sync attributes
        this.invoiceDocument.getData().setAttributes(invoiceResponseDocument.getData().getAttributes());

        // Sync shipping relationship
        let responseShippingResource = invoiceResponseDocument.getData().getRelationshipData('shipping');
        let newShippingResource = this.invoiceDocument.makeResource(responseShippingResource.compile());
        this.invoiceDocument.pushToResourceContainer(newShippingResource);
        this.invoiceDocument.getData().setRelationship('shipping', newShippingResource);

      } catch (e) {console.log(e);
        this.invoiceErrors = this.$handleException(e);
      }

      this.isSavingInvoice = false;
    },

    /**
    * Init invoice payment
    */
    async initInvoicePayment(paymentGateway) {

      // No invoice
      if (!this.invoiceDocument) {
        return;
      }

      // Loading state
      this.isSavingInvoice = true;
      this.invoiceErrors = [];

      try {

        let options = {
          params: {
            invoice_id: this.invoiceDocument.getData().getId()
          }
        };
        let paymentGatewayResponse = await this.$http.request('payment_gateways/' + paymentGateway.getId() + '/init/' + options.params.invoice_id);
        let meta = paymentGatewayResponse.getMeta();

        // Emit event
        this.$event.$emit('init-invoice-payment', paymentGateway);

        // If paid already
        if (meta.status === 'paid') {
          window.location = '/thankyou';
          return;
        }

        // If paypal
        if (paymentGateway.getAttribute('gateway') === 'paypal') {
          
          if (meta.status === 'success') {

            // Redirect to paypal
            window.location = meta.redirect_url;
          
          } else {
            this.invoiceErrors = ['Failed to validate your request with PayPal. Please try again.'];
          }
        }

      } catch (e) {
        this.invoiceErrors = this.$handleException(e);
      }

      this.isSavingInvoice = false;

    }
  }
}