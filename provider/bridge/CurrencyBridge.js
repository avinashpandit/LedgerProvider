// @flow
import Bridge from "../Bridge";
import {from} from "rxjs";
import send from "ledger-live/lib/commands/send";
import sync from "ledger-live/lib/commands/sync";

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
        return from(send.job(options));
    }

    syncAccount(options) {
        return from(sync.job(options));
    }

}

let currencyBridge = new CurrencyBridge();

export default currencyBridge;
