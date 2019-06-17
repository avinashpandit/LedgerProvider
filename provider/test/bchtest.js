//import { RippleAPI } from 'ripple-lib';
import ledgerProvider from '../LedgerProvider';
import {findCryptoCurrencyByTicker} from '@ledgerhq/live-common/lib/data/cryptocurrencies';
import {apiForBitcoin} from '../api/Bitcoin';


async function main() {

  const address = '1B8euszhQfHc4pQzhSJCTwmkUV4GKS3BfA';

  const currency = findCryptoCurrencyByTicker('BCH');

  let API = apiForBitcoin(currency);


  let txs = await API.getTransactions(address);

  console.log(`${txs}`);
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
