//import { RippleAPI } from 'ripple-lib';
import "@babel/polyfill";

import ledgerProvider from '../LedgerProvider';

import {deserializeError} from "@ledgerhq/errors";

import all from "../tool/commands";

let allCommands = all;

async function main() {

  const address = 'M9ZhEYupBW6k2shRMzXruiPNvd339p5Qgi';

  /*implementLibcore({
    lib: () => require("@ledgerhq/ledger-core"), // eslint-disable-line global-require
    dbPath: process.env.LIBCORE_DB_PATH || "./dbdata"
  });
*/
  //const currency = findCryptoCurrencyByTicker('LTC');

  let transport = await ledgerProvider.getBlockedTransport();

  let device = ledgerProvider.getLedgerDevice();

  let bridge = await ledgerProvider.getBridge('LTC');

  let options = {
    "currency": "LTC",
    "amount": "0.01",
    "recipient": [
      "M9eGEFa1cK79SWA12G23nQJ46jSKZSvkb1"
    ],
    //"xpub" : ['Ltub2Z8LKgDDug19ABzEdm9cJQjZFfWtCUBEBumQqsdd24bXcCBETriw1SKat2FrGCN9PAcZTaFn6NCkQQTpbs4zfjWWqz3e8sLu1qDZfbSFoGo'],
    "xpub" : ['Ltub2Z8LKgDDug196j5VBL1fiqPcH6GQXJft6FQfxwp4of5RdM54JhwWAGRQ1MJoChbSMYBG984ou5L9EZftZQRP11fWr5WKLiuzRbr5sv7nS6g'],
    'scheme' : 'segwit',
    //'index' : 1,
    idx : 0,
    "length" : 1
  };

    //'self-transaction': true,
    //'index' : 1,
    //"length" : 1
//  };


    let syncAcctoptions = {
        "currency": "LTC",
        "xpub" : ['Ltub2Z8LKgDDug196j5VBL1fiqPcH6GQXJft6FQfxwp4of5RdM54JhwWAGRQ1MJoChbSMYBG984ou5L9EZftZQRP11fWr5WKLiuzRbr5sv7nS6g'],
        'scheme' : 'segwit',
        'format' : 'stats',
        //'index' : 1,
        idx : 0,
        "length" : 1
    };

  let addresses  = await ledgerProvider.getAddressForCurrencyList('LTC');

  await ledgerProvider.closeTransport();

    bridge.syncAccount(syncAcctoptions).subscribe({
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
main();
