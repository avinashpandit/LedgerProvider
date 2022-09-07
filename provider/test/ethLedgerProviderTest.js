import ledgerProvider from '../LedgerProvider';
import {findCryptoCurrencyByTicker} from '@ledgerhq/live-common/lib/data/cryptocurrencies';
import BigNumber from "bignumber.js";


async function main() {

  const address = '0xc892A4Dc36ffD6244d29f0cEC1dD222eB92CFB71';

  const currency = findCryptoCurrencyByTicker('ETH');

  /*let transport = await ledgerProvider.getBlockedTransport();

  let device = ledgerProvider.getLedgerDevice();

  let bridge = await ledgerProvider.getBridge('ETH');
*/
  let API = await ledgerProvider.getAPI('ETH');

  let amount = 0.1;

  if (API) {
    //check if account balance > withdrawal amount
    //update tx with account info
    let withdrawAmount = BigNumber(amount).multipliedBy(Math.pow(10, 18));
    withdrawAmount = withdrawAmount.toNumber();

    //let balance = await API.getAccountBalance('0xc892a4dc36ffd6244d29f0cec1dd222eb92cfb71');


    //console.log(`${balance}`);
    let currentNonce = await API.getAccountNonce('0xc892a4dc36ffd6244d29f0cec1dd222eb92cfb71');

    console.log(`Getting current nonce: ${currentNonce}`);

    let transactions = await API.getTransactions(address);
    //console.log(transactions);

    for(let txn of transactions.txs) {
      let toAddress = txn.to;
      let fromAddress = txn.from;
      let transfer_events = txn.transfer_events;
      let tokenCcy = 'ETH';
      let amount = txn.value;

      if (transfer_events && transfer_events.list && transfer_events.list.length > 0 && amount === 0) {
        //this is token transfer , lets replace all values with token
        //lets see if currency configured
        let transfer_event = transfer_events.list[0];
        if (transfer_event && transfer_event.symbol) {
          toAddress = transfer_event.to;
          fromAddress = transfer_event.from;
          amount = transfer_event.count;
          tokenCcy = transfer_event.symbol;
        }
      }

      if (toAddress && toAddress.toLowerCase() === address.toLowerCase()) {
        console.log(`${txn.hash} ${tokenCcy} ${amount} ${txn.received_at}`);
      }

      if(txn.hash === '0x98857d66ab36492e827ba0f8932094fe1d9930425d444601970387819f2cefdf'){
        console.log(`${txn.hash} ${tokenCcy} ${amount} ${txn.received_at}`);
      }
    }
    /*let baseTX = await bridge.createTransaction(address, withdrawAmount, '0xB108C555ceA52D544a7C00d13e94105Ca73AA5ce', undefined , new BigNumber(5));

    //get nounce
    let nonce;
    if (currency === 'ETH') {
      nonce = await API.getAccountNonce(address);
    }

    console.log(baseTX);

    let signedTransaction = await bridge.signTransaction(transport, currency.ticker, "44'/60'/0'/0/0" , baseTX , nonce);

    let transactionResponse = await API.broadcastTransaction(signedTransaction);

    console.log(`Status : ${transactionResponse.status} txid : ${transactionResponse.txId}`);*/

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
