//import { RippleAPI } from 'ripple-lib';
import ledgerProvider from '../LedgerProvider';
import {findCryptoCurrencyByTicker} from '@ledgerhq/live-common/lib/data/cryptocurrencies';
import { reduce } from 'rxjs/operators'
import { Account } from '@ledgerhq/live-common/lib/types/account'
import { findAccountMigration, migrateAccounts } from '@ledgerhq/live-common/lib/account'

async function main() {

  const address = 'M9ZhEYupBW6k2shRMzXruiPNvd339p5Qgi';

  const currency = findCryptoCurrencyByTicker('LTC');

  await ledgerProvider.getBlockedTransport();

  let device = ledgerProvider.getLedgerDevice();

  let bridge = await ledgerProvider.getBridge('LTC');


  let scanSubscription = bridge
      .scanAccountsOnDevice(currency, device.path)
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
