// @flow
import Bridge from "../Bridge";
import {findCryptoCurrencyByTicker} from "@ledgerhq/live-common/lib/data/cryptocurrencies";
import signTransactionForCurrency from "../helpers/signTransactionForCurrency";
import {from} from "rxjs";
import allCommands from "../tool/commands";

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

    async signTransaction(transport, ccy , dvPath, t , nonce) {
        const currency = findCryptoCurrencyByTicker(ccy);
        var serializedTx = this.serializeTransaction(t , nonce);

        let result = await signTransactionForCurrency(currency.family)(transport, currency.family, dvPath, serializedTx);

        return result;
    }

    signAndBroadcastTransaction(options) {
        return from(allCommands.send.job(options));
    }

    syncAccount(options) {
        return from(allCommands.sync.job(options));
    }

}

let currencyBridge = new CurrencyBridge();

export default currencyBridge;
