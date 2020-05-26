//import { RippleAPI } from 'ripple-lib';
//import "@babel/polyfill";

import ledgerProvider from '../LedgerProvider';

import {deserializeError} from "@ledgerhq/errors";

import all from "../tool/commands";

let allCommands = all;

async function main() {

  
  let transport = await ledgerProvider.getBlockedTransport();

  let device = ledgerProvider.getLedgerDevice();

  let bridge = await ledgerProvider.getBridge('XTZ');

  let options = {
    "currency": "XTZ",
    "amount": "0.1",
    "recipient": [
      "tz1dBxjgYU33vybzBmdhSfPvzdHRXv5VFR1Z"
    ],
    "xpub" : ['02028ae815081df0aa6f4b9edc9ca1b471f809834fe1a87edde661d4c0485bec05'],
    'scheme' : 'native_segwit',
    //'index' : 1,
    idx : 0,
    "length" : 1
  };

    
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
main();
