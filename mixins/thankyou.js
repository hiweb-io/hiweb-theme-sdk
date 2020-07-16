import { JsonApi } from 'jsonapi-client-js';

export default {

  props: ['invoiceId'],

  data() {
    return {

      // Active signal
      usingThankyouMixin: false,

    };
  },

  methods: {

    /**
    * Active this mixin
    */
    async useThankyouMixin(b) {

      this.usingThankyouMixin = b ? true : false;
      if (!this.usingThankyouMixin) {
        return;
      }

      // If had invoice
      if (this.invoiceId) {
        this.getInvoice();
      }

      // Invoice loaded
      this.$event.$on('invoice-loaded', async invoiceDocument => {

        // Trigger payment successful event
        this.$event.$emit('payment-successful', invoiceDocument);

        // If is paypal
        let invoice = invoiceDocument.getData();
        if (invoice.getAttribute('gateway') === 'paypal' && invoice.getAttribute('status') === 'pending') {
          
          // Capture
          let token = this.$route.query.token;
          let payerid = this.$route.query.PayerID;
          if (token && payerid) {

            try {

              let updateDocument = new JsonApi;
              let updateInvoice = updateDocument.makeResource();
              updateInvoice.setId(invoice.getId());
              updateInvoice.setType('invoices');
              updateInvoice.setAttributes({
                captured_data: {
                  token,
                  payerid
                }
              });
              updateDocument.setData(updateInvoice);

              // Capture
              await this.$http.save(updateDocument);
              return;

            } catch (e) {}

          } else { // No token provided?
            return;
          }

          // Failed to capture data - redirect to failure page
          this.$router.push(this.$linkTo('payment-failure'));
          return;
        }

      });

    }
  }
}