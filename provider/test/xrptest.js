//import { RippleAPI } from 'ripple-lib';
import ledgerProvider from '../LedgerProvider';
import {findCryptoCurrencyByTicker} from '@ledgerhq/live-common/lib/data/cryptocurrencies';
import {apiForRipple} from '../api/Ripple';
import { BigNumber } from 'bignumber.js';

async function main() {

  const address = 'rUXtVRaar8jWTubimFUhtuo73eRMHgdfgd';

  const xrp1Address = 'ratHLp3JuHYMfKS5KS218eGttda44i6ReY';
  const xrp2Address = 'rn48Crpi9zSKLJV2MELKgLpxpVaBZNgX5Q';
  const currency = findCryptoCurrencyByTicker('XRP');

  
//46139533
  //let txs = await API.getTransactions(address , 'B60655A313B193E54D6535963CBA40E62EB3626C5A4858D11CA72330F737F5F8');

  //console.log(`${txs}`);


//  let transport = await ledgerProvider.getBlockedTransport();

  //let device = ledgerProvider.getLedgerDevice();

  let bridge = await ledgerProvider.getBridge('XRP');

  let API = await ledgerProvider.getAPI('XRP');

  let balance = await API.getAccountBalance('r4AVnAe4XUcrrUtioDHkay5tAeqnNw5XUm');
  console.log(`${balance}`);

  let balance1 = await API.getAccountBalance('rJ6tMKohy9qo3J6twwbgD3FFyrMjtWFAkd');
  console.log(`${balance1}`);
  let balance2 = await API.getAccountBalance('rh6P8SMPiFU945zmkpS8bbK6Nxepgmt5Z1');
  console.log(`${balance2}`);
  let balance3 = await API.getAccountBalance('rxwU3oDjdZicic6HRkepKKC4rwj2pqLtV');
  console.log(`${balance3}`);
  let balance4 = await API.getAccountBalance('rK3iTmJJq1wXYPYHJpFL11HSNd7hbVov6s');
  console.log(`${balance4}`);


  let baseTX = await bridge.createTransaction(xrp2Address, new BigNumber('0.123'), xrp1Address);

  console.log(baseTX);

/*  let signedTransaction = await bridge.signTransaction(transport, currency.ticker, "44'/144'/0'/0/0" , baseTX);

  let transactionResponse = await API.broadcastTransaction(signedTransaction);

  console.log(`Status : ${transactionResponse.status} txid : ${transactionResponse.txId}`);
*/
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
