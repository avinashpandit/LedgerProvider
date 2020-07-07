//import { RippleAPI } from 'ripple-lib';
//import "@babel/polyfill";
import {from} from "rxjs";
import send from "../ledger-live/commands/send";
import sync from "../ledger-live/commands/sync";
import { closeAllDevices } from "../ledger-live/live-common-setup";
import { deserializeError } from "@ledgerhq/errors";

async function main() {
    console.log('Testing....');

    let options = {
        "currency": "XTZ",
        "amount": "0.1",
        "recipient": [
          "tz1dBxjgYU33vybzBmdhSfPvzdHRXv5VFR1Z"
        ],
        //'index' : 1,
        idx : 0,
        "length" : 1,
        "disable-broadcast" : true
      };    

      from(sync.job(options)).subscribe({
        next: log => {
            if (log !== undefined) console.log(log);
          },
          error: error => {
            const e = error instanceof Error ? error : deserializeError(error);
            if (process.env.VERBOSE || process.env.VERBOSE_FILE) console.error(e);
            else console.error(String(e.message || e));
            process.exit(1);
          },
          complete: () => {
            closeAllDevices();
          }
      });


    from(send.job(options)).subscribe({
        next: log => {
            if (log !== undefined) console.log(log);
          },
          error: error => {
            const e = error instanceof Error ? error : deserializeError(error);
            if (process.env.VERBOSE || process.env.VERBOSE_FILE) console.error(e);
            else console.error(String(e.message || e));
            process.exit(1);
          },
          complete: () => {
            closeAllDevices();
          }
      });;
    console.log('Testing Done....');
}
main();

process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});