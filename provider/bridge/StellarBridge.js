// @flow
import Bridge from '../Bridge';
import signTransactionForCurrency from '../helpers/signTransactionForCurrency';
import {findCryptoCurrencyByTicker} from '@ledgerhq/live-common/lib/data/cryptocurrencies';
import {apiForStellar} from '../api/Stellar';
var StellarSdk = require('stellar-sdk');
import {Transaction,Networks, Memo} from 'stellar-sdk';
import { BigNumber } from 'bignumber.js';

class StellarBridge extends Bridge {

  //ripple bridge needs access to api to perform certain functionality
  constructor() {
    super();
    this.currency = findCryptoCurrencyByTicker('XLM');
    this.api = apiForStellar(this.currency);
  }

  isRecipientValid(currency, recipient) {
    return true;
  }

  async createTransaction(recipient: string, amount: BigNumber, source: string , tag: string) {

    const account = await this.api.getAccount(source);
    const fee = await this.api.fetchFees();
    let memo;
    if(tag)
    {
      memo = Memo.text(tag);
    }
    else{
      memo = Memo.none();
    }


    const transaction = new StellarSdk.TransactionBuilder(account, {
      memo,
      fee
    })
    // Add a payment operation to the transaction
        .addOperation(StellarSdk.Operation.payment({
          destination: recipient,
          // The term native asset refers to lumens
          asset: StellarSdk.Asset.native(),
          // Specify 350.1234567 lumens. Lumens are divisible to seven digits past
          // the decimal. They are represented in JS Stellar SDK in string format
          // to avoid errors from the use of the JavaScript Number data structure.
          amount: amount.toFixed(),
        }))
        // Make this transaction valid for the next 30 seconds only
        .setTimeout(120)
        // Uncomment to add a memo (https://www.stellar.org/developers/learn/concepts/transactions.html)
        // .addMemo(StellarSdk.Memo.text('Hello world!'))
        .build();

    return this.serializeTransaction(transaction);
  }

  validateTransaction(tx, account) {

  }

  serializeTransaction(t, nonce: string) {
    return t.toEnvelope().toXDR().toString("base64");
  }

  async signTransaction(transport, ccy , dvPath, t , nonce) {
    const currency = findCryptoCurrencyByTicker(ccy);
    var transaction = new Transaction(t,Networks.PUBLIC);

    let response = await signTransactionForCurrency(currency.family)(transport, currency.family, dvPath, transaction);
    transaction.addSignature(transaction.source, response.signature.toString('base64'));

    return this.serializeTransaction(transaction);
  }
}

let stellarBridge = new StellarBridge();

export default stellarBridge;
