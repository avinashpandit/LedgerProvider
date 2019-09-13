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
    "amount": "0.001",
    "recipient": [
      "M9eGEFa1cK79SWA12G23nQJ46jSKZSvkb1"
    ],
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
