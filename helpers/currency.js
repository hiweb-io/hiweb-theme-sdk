class Currency {

  numberFormat(amount) {
    return Math.round(amount* 100) / 100;
  }

  priceFormat(amount) {
    return '$' + this.numberFormat(amount);
  }

}

export default new Currency();