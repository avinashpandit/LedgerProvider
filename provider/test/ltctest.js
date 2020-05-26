//import { RippleAPI } from 'ripple-lib';
import "@babel/polyfill";

import ledgerProvider from '../LedgerProvider';

import {deserializeError} from "@ledgerhq/errors";

async function main() {

  let transport = await ledgerProvider.getBlockedTransport();

  let device = ledgerProvider.getLedgerDevice();

  let bridge = await ledgerProvider.getBridge('LTC');

  let pubKey = 'Ltub2YAM5iqnxy8bYmLbZvhhwE483h1Ja44wGv1RPKijkHCSLa2X6W9jtyVL6FQqwL3gehw4cjzYovdkajDtuAJccHGw5wBrWU3Lik3QooMnejr';
  let recipientAddress = 'MLHTQetS99hP5FsiVoKGSn34WgGyR6gVn5';
  let options = {
    "currency": "LTC",
    "amount": "0.01",
    "recipient": [
      recipientAddress
    ],
    "xpub" : [pubKey],
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
        "xpub" : [pubKey],
        'scheme' : 'segwit',
        'format' : 'stats',
        //'index' : 1,
        idx : 0,
        "length" : 1
    };

  let addresses  = await ledgerProvider.getAddressForCurrencyList('LTC');

  await ledgerProvider.closeTransport();

    /*bridge.syncAccount(syncAcctoptions).subscribe({
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
*/
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
