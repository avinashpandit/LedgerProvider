//import { RippleAPI } from 'ripple-lib';
import "@babel/polyfill";

import ledgerProvider from '../LedgerProvider';

import {findCryptoCurrencyByTicker} from '@ledgerhq/live-common/lib/data/cryptocurrencies';
import {from} from "rxjs";
import {deserializeError} from "@ledgerhq/errors";
import {closeAllDevices} from "../tool/live-common-setup";

import all from "../tool/commands";

let allCommands = all;

async function main() {

  const address = 'M9ZhEYupBW6k2shRMzXruiPNvd339p5Qgi';

  /*implementLibcore({
    lib: () => require("@ledgerhq/ledger-core"), // eslint-disable-line global-require
    dbPath: process.env.LIBCORE_DB_PATH || "./dbdata"
  });
*/
  const currency = findCryptoCurrencyByTicker('LTC');

  //let transport = await ledgerProvider.getBlockedTransport();

  let device = ledgerProvider.getLedgerDevice();

  //let bridge = await ledgerProvider.getBridge('LTC');
  let options = {
    "currency": "LTC",
    "amount": "0.001",
    "recipient": [
      "M9eGEFa1cK79SWA12G23nQJ46jSKZSvkb1"
    ]
  };

  from(allCommands.send.job(options)).subscribe({
    next: log => {
      if (log !== undefined) console.log(log);
    },
    error: error => {
      const e = error instanceof Error ? error : deserializeError(error);
      if (process.env.VERBOSE) console.error(e);
      else console.error(String(e.message || e));
    },
    complete: () => {

    }
  });


  /*
  setWebSocketImplementation(WebSocket)
  setNetwork(network)
  setEnv('FORCE_PROVIDER', constants.FORCE_PROVIDER)

  websocketLogs.subscribe(({ type, message, ...rest }) => {
    const obj = rest
    if (message) obj.msg = message
    logger.websocket(type, obj)
  })


  let scanSubscription = bridge
      .scanAccountsOnDevice(currency, device.path , transport);
      //.pipe(reduce<Account>((all, acc) => all.concat(acc), []))
      .subscribe({
        next: scannedAccounts => {
          let totalMigratedAccounts = 0
          accounts.forEach(a => {
            const maybeMigration = findAccountMigration(a, scannedAccounts)
            if (maybeMigration) {
              totalMigratedAccounts++
              if (starredAccountIds.includes(a.id)) {
                replaceStarAccountId({ oldId: a.id, newId: maybeMigration.id })
              }
            }
          })

          replaceAccounts(migrateAccounts({ scannedAccounts, existingAccounts: accounts }))
          setScanStatus(totalMigratedAccounts ? 'finished' : 'finished-empty')
        },
        error: err => {
          console.error(err);
        },
      });

*/
  /*
  let API = apiForBitcoin(currency);


  let txs = await API.getTransactions(address);

  console.log(`${txs}`);

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
