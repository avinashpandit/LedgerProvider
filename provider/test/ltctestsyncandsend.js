//import { RippleAPI } from 'ripple-lib';
import "@babel/polyfill";

import ledgerProvider from '../LedgerProvider';

import {deserializeError} from "@ledgerhq/errors";

async function main() {

  let transport = await ledgerProvider.getBlockedTransport();

  let device = ledgerProvider.getLedgerDevice();

  let bridge = await ledgerProvider.getBridge('LTC');

  //let pubKey = 'Ltub2Z8LKgDDug196j5VBL1fiqPcH6GQXJft6FQfxwp4of5RdM54JhwWAGRQ1MJoChbSMYBG984ou5L9EZftZQRP11fWr5WKLiuzRbr5sv7nS6g';
  let pubKey = 'Ltub2Z8LKgDDug19ABzEdm9cJQjZFfWtCUBEBumQqsdd24bXcCBETriw1SKat2FrGCN9PAcZTaFn6NCkQQTpbs4zfjWWqz3e8sLu1qDZfbSFoGo';
  let recipientAddress = 'MD7Wh6KJDZfNeCsD7be59ahKdLpN1Nrk5Y';
  //let recipientAddress = 'M8kSYqJdjotrx3evScoHxwfGxa261fy2WV';
  let index = 1;

  let options = {
    "currency": "LTC",
    "amount": "0.1",
    "recipient": [
      recipientAddress
    ],
    "xpub" : [pubKey],
    'scheme' : 'segwit',
    'index' : index,
    "length" : 1,
    'feePerByte': '10',
    //"disable-broadcast" : true
  };

  let addresses  = await ledgerProvider.getAddressForCurrencyList('LTC');

  await ledgerProvider.closeTransport();

    bridge.syncAccount(options).subscribe({
        next: log => {
            if (log !== undefined){
              console.log(log);
              let account = log;
              options.account = account;
            } 
        },
        error: error => {
            const e = error instanceof Error ? error : deserializeError(error);
            if (process.env.VERBOSE) console.error(e);
            else console.error(String(e.message || e));
        },
        complete: () => {
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
            });
        }
    });

    
}

process.on('uncaughtException', function (err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
})

main();
