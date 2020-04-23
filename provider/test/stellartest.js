//import { RippleAPI } from 'ripple-lib';
import ledgerProvider from '../LedgerProvider';
import {findCryptoCurrencyByTicker} from '@ledgerhq/live-common/lib/data/cryptocurrencies';
import {BigNumber} from 'bignumber.js';

async function main() {

  const xlmAddress1 = 'GC55N52EX7UPQ72LR76QIJX6TXY7WJTSARXRJXLZ7FXKIWFCFOU5PTCL';
  const xlmAddress2 = 'GBJVOJGTPARPQWCEXGPPMKHM3I2RLGX4RPZLPZYYSBDECET5Q4CE24ZA';

  const currency = findCryptoCurrencyByTicker('XLM');

  let transport = await ledgerProvider.getBlockedTransport();

  let device = ledgerProvider.getLedgerDevice();

  let bridge = await ledgerProvider.getBridge('XLM');

  let API = await ledgerProvider.getAPI('XLM');

  let baseTX = await bridge.createTransaction(xlmAddress1, new BigNumber(1000.1), xlmAddress2);

  console.log(baseTX);

  let signedTransaction = await bridge.signTransaction(transport, currency.ticker, "44'/148'/0'" , baseTX);

  let transactionResponse = await API.broadcastTransaction(signedTransaction);

  console.log(`Status : ${transactionResponse.status} txid : ${transactionResponse.txId}`);

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
