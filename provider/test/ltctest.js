//import { RippleAPI } from 'ripple-lib';
import "@babel/polyfill";

import ledgerProvider from '../LedgerProvider';

import {deserializeError} from "@ledgerhq/errors";

async function main() {

  let transport = await ledgerProvider.getBlockedTransport();

  let device = ledgerProvider.getLedgerDevice();

  let bridge = await ledgerProvider.getBridge('LTC');

  let recipientAddress = 'MD7Wh6KJDZfNeCsD7be59ahKdLpN1Nrk5Y';
  //let recipientAddress = 'M8kSYqJdjotrx3evScoHxwfGxa261fy2WV';
  let index = 1;

  let options = {
    "currency": "LTC",
    "amount": "0.19",
    "recipient": [
      recipientAddress
    ],
    "device" : device.path,
    'scheme' : 'segwit',
    'index' : 1,
     //idx : index,
    "length" : 1,
    "disable-broadcast" : true
  };

    //'self-transaction': true,
    //'index' : 1,
    //"length" : 1
//  };

  let addresses  = await ledgerProvider.getAddressForCurrencyList('LTC');

  await ledgerProvider.closeTransport();
  bridge.signAndBroadcastTransaction(options).subscribe({
    next: log => {
      if (log !== undefined) console.log(log);
    },
    error: error => {
      const e = error instanceof Error ? error : deserializeError(error);
      if (process.env.VERBOSE) console.error(e);
      else console.error(String(e.message || e));
    },
    complete: () => {
      ledgerProvider.openTransport(ledgerProvider);
    }
  });

    
}

process.on('uncaughtException', function (err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
})

main();
