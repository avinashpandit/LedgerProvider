//import { RippleAPI } from 'ripple-lib';
import ledgerProvider from '../LedgerProvider';
import {findCryptoCurrencyByTicker} from '@ledgerhq/live-common/lib/data/cryptocurrencies';
import {apiForRipple} from '../api/Ripple';
import BigNumber from "bignumber.js";


async function main() {

  const address = '0xc892A4Dc36ffD6244d29f0cEC1dD222eB92CFB71';

  const currency = findCryptoCurrencyByTicker('ETH');

  let transport = await ledgerProvider.getBlockedTransport();

  let device = ledgerProvider.getLedgerDevice();

  let bridge = await ledgerProvider.getBridge('ETH');

  let API = await ledgerProvider.getAPI('ETH');

  let amount = 0.1;

  if (bridge && API) {
    //check if account balance > withdrawal amount
    //update tx with account info
    let withdrawAmount = BigNumber(amount).multipliedBy(Math.pow(10, 18));
    withdrawAmount = withdrawAmount.toNumber();

    let balance = await API.getAccountBalance('0xB108C555ceA52D544a7C00d13e94105Ca73AA5ce');
    console.log(`${balance}`);
    let baseTX = await bridge.createTransaction(address, withdrawAmount, '0xB108C555ceA52D544a7C00d13e94105Ca73AA5ce');

    //get nounce
    let nonce;
    if (currency === 'ETH') {
      nonce = await API.getAccountNonce(address);
    }

    console.log(baseTX);

    let signedTransaction = await bridge.signTransaction(transport, currency.ticker, "44'/60'/0'/0/0" , baseTX , nonce);

    let transactionResponse = await API.broadcastTransaction(signedTransaction);

    console.log(`Status : ${transactionResponse.status} txid : ${transactionResponse.txId}`);

  }



  /*
  const api = new RippleAPI({
    server: 'wss://s2.ripple.com' // Public rippled server hosted by Ripple, Inc.
  });

  api.connect().then(() => {
    api.getTransactions( address, {start: '0BAE93BFEC325C424619204798762C1400E922BC97C4008DC3B2D37FC3406E5D'}).then(transaction => {
      console.log(`TX : ${transaction}`);
    });
  });

  */
}
main();
