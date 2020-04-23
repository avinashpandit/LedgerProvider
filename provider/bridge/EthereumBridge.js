// @flow
import { BigNumber } from 'bignumber.js';
import Bridge from '../Bridge';
import signTransactionForCurrency from '../helpers/signTransactionForCurrency'
import {findCryptoCurrencyByTicker} from '@ledgerhq/live-common/lib/data/cryptocurrencies';


class EthereumBridge extends Bridge {

  constructor() {
    super();
  }

  isRecipientValid(currency, recipient) {
    if (!recipient.match(/^0x[0-9a-fA-F]{40}$/)) return false;

    // To handle non-eip55 addresses we stop validation here if we detect
    // address is either full upper or full lower.
    // see https://github.com/LedgerHQ/ledger-live-desktop/issues/1397
    const slice = recipient.substr(2);
    const isFullUpper = slice === slice.toUpperCase();
    const isFullLower = slice === slice.toLowerCase();
    if (isFullUpper || isFullLower) return true;

    try {
      return eip55.verify(recipient);
    } catch (error) {
      return false;
    }
  }

  async createTransaction(recipient: string, amount: BigNumber , source : string , tag: string, fees : BigNumber ) {
    return {amount: amount, recipient: recipient, gasPrice: fees, gasLimit: BigNumber(0xC350)};
  }

  validateTransaction(tx, account) {

  }

  serializeTransaction(t, nonce: string) {
    var tx = {
      recipient: t.recipient,
      amount: `0x${BigNumber(t.amount).toString(16)}`,
      gasPrice: !t.gasPrice ? '0x00' : `0x${BigNumber(t.gasPrice).toString(16)}`,
      gasLimit: `0x${BigNumber(t.gasLimit).toString(16)}`, nonce
    };


    return tx;
  }

  async signTransaction(transport, ccy , dvPath, t , nonce) {
    const currency = findCryptoCurrencyByTicker(ccy);
    var serializedTx = this.serializeTransaction(t , nonce);

    let result = await signTransactionForCurrency(currency.family)(transport, currency.family, dvPath, serializedTx);

    return result;
  }


}

let ethereumBridge = new EthereumBridge();

export default ethereumBridge;
