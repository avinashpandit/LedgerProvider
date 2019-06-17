// @flow
import Bridge from '../Bridge';
import signTransactionForCurrency from '../helpers/signTransactionForCurrency';
import {findCryptoCurrencyByTicker} from '@ledgerhq/live-common/lib/data/cryptocurrencies';
import {apiForRipple} from '../api/Ripple';

class RippleBridge extends Bridge {

  //ripple bridge needs access to api to perform certain functionality
  constructor() {
    super();
    this.currency = findCryptoCurrencyByTicker('XRP');
    this.api = apiForRipple(this.currency);
  }

  isRecipientValid(currency, recipient) {
    return this.api.isValidAddress(recipient);
  }

  async createTransaction(recipient: string, amount: number, source: string) {
    const payment = {
      'source': {
        'address': source,
        'maxAmount': {
          'value': amount.toString(),
          'currency': 'XRP'
        }
      },
      'destination': {
        'address': recipient,
        'amount': {
          'value': amount.toString(),
          'currency': 'XRP'
        }
      }
    };
    return await this.api.preparePayment(source, payment);
  }

  validateTransaction(tx, account) {

  }

  serializeTransaction(t, nonce: string) {
    return JSON.parse(t.txJSON);
  }

  async signTransaction(transport, ccy , dvPath, t , nonce) {
    const currency = findCryptoCurrencyByTicker(ccy);
    var serializedTx = this.serializeTransaction(t , nonce);

    let result = await signTransactionForCurrency(currency.family)(transport, currency.family, dvPath, serializedTx);

    return result;
  }


}

let rippleBridge = new RippleBridge();

export default rippleBridge;
