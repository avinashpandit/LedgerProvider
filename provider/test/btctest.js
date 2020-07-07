//import { RippleAPI } from 'ripple-lib';
//import "@babel/polyfill";

import ledgerProvider from '../LedgerProvider';

import {deserializeError} from "@ledgerhq/errors";

async function main() {

  const address = 'bc1qjt5cx3gsjhtfudlyghd22vxnywdmyga7mwtrcq';

  let transport = await ledgerProvider.getBlockedTransport();

  let device = ledgerProvider.getLedgerDevice();

  let bridge = await ledgerProvider.getBridge('BTC');

  let options = {
    "currency": "BTC",
    "amount": "0.0001",
    "recipient": [
      //"3DRwtmJDSxaiGgyGNZSBtnTU4gywcz5is3",
      "14bXwFWdXb5ZLfvbdRdXBdksUBYtMvCnyd"
    ],
    device : device.path,
    'scheme' : 'segwit',
    //paginateOperations : 1,
    //'index' : 1,
    index : 2,
    "length" : 1
  };

    //'self-transaction': true,
    //'index' : 1,
    //"length" : 1
//  };


    let syncAcctoptions = {
        "currency": "BTC",
        //device : device.path,
        xpub : ['xpub6DPowdoGzTZ1XLTeteD5M7ULcooQ5ttihquU5MpvV2BRmXfmWCQYm9NFdrLuN4fnWdXd4fkbGz4oKvsUyzremKucB7PFs7dpRmqo4M2EbCD'],
        'scheme' : 'segwit',
        //paginateOperations : 1,
        //'index' : 1,
        format : 'stats',
        index : 2,
        "length" : 1
    };

//  let addresses  = await ledgerProvider.getAddressForCurrencyList('BTC');

  await ledgerProvider.closeTransport();

  /*bridge.signAndBroadcastTransaction(options).subscribe({
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
  });*/

   bridge.syncAccount(syncAcctoptions).subscribe({
        next: log => {
            if (log !== undefined) {
              options.account = log;
              /*bridge.signAndBroadcastTransaction(options).subscribe({
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
              }); */
            }
        },
        error: error => {
            const e = error instanceof Error ? error : deserializeError(error);
            if (process.env.VERBOSE) console.error(e);
            else console.error(String(e.message || e));
        },
        complete: (st) => {
            //ledgerProvider.openTransport(ledgerProvider);
        }
    });

    await ledgerProvider.closeTransport();

}
main();

process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});