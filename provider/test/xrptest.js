//import { RippleAPI } from 'ripple-lib';
import ledgerProvider from '../LedgerProvider';
import {findCryptoCurrencyByTicker} from '@ledgerhq/live-common/lib/data/cryptocurrencies';
import {apiForRipple} from '../api/Ripple';


async function main() {

  const address = 'rUXtVRaar8jWTubimFUhtuo73eRMHgdfgd';

  const currency = findCryptoCurrencyByTicker('XRP');

  let API = apiForRipple(currency);

//46139533
  let txs = await API.getTransactions(address , 'B60655A313B193E54D6535963CBA40E62EB3626C5A4858D11CA72330F737F5F8');

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
