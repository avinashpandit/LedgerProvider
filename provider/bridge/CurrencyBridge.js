// @flow
import Bridge from "../Bridge";
import {from} from "rxjs";
import send from "./send";
import sync from "./sync";
import sendSync from "../ledger-live/commands/send";
import getAddress from "../ledger-live/commands/getAddress";
import {getSeedIdentifierDerivation} from "@ledgerhq/live-common/lib/derivation";

import { switchMap } from "rxjs/operators";

class CurrencyBridge extends Bridge {

    constructor() {
        super();
    }

    isRecipientValid(currency, recipient) {
        return true;
    }

    async createTransaction(recipient: string, amount: number , source : string) {
    }

    validateTransaction(tx, account) {

    }

    serializeTransaction(t, nonce: string) {
    }

    signAndBroadcastTransaction(options) {
        if(options.doSync || !options.account)
        {
            return from(sendSync.job(options));
        }
        // get freshAddress
        /*let account = options.account;
        options.path = getSeedIdentifierDerivation(account.currency , account.derivationMode);
        options.derivationMode = account.derivationMode;
        return from(getAddress.job(options)).pipe(
            switchMap((addressDetails) => {
                account.seedIdentifier = addressDetails.publicKey;
                return from(send.job(options));
            }
        ));*/
        return from(send.job(options));
    }

    syncAccount(options) {
        return from(sync.job(options));
    }

}

let currencyBridge = new CurrencyBridge();

export default currencyBridge;
