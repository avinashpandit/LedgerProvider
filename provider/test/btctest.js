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
      "3DRwtmJDSxaiGgyGNZSBtnTU4gywcz5is3"
    ],
    "xpub" : ['xpub6CXBDtdJci8j17SZqaTeJbM246G61gBaLH3TRPvjdXi9CudBMjxMy1aRtPu5UnSq3bR2DKFtrjqK2nWVjQRmPpB56Rs8AuJy3Wktf6jp9YM'],
    'scheme' : 'native_segwit',
    //'index' : 1,
    idx : 0,
    "length" : 1
  };

    //'self-transaction': true,
    //'index' : 1,
    //"length" : 1
//  };


    let syncAcctoptions = {
        "currency": "BTC",
        "xpub" : ['xpub6CXBDtdJci8j17SZqaTeJbM246G61gBaLH3TRPvjdXi9CudBMjxMy1aRtPu5UnSq3bR2DKFtrjqK2nWVjQRmPpB56Rs8AuJy3Wktf6jp9YM'],
        'scheme' : 'native_segwit',
        'format' : 'stats',
        //'index' : 1,
        idx : 0,
        "length" : 1
    };

//  let addresses  = await ledgerProvider.getAddressForCurrencyList('BTC');

  await ledgerProvider.closeTransport();

   /* bridge.syncAccount(syncAcctoptions).subscribe({
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
main();

process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});