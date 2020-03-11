import ledgerProvider from '../LedgerProvider';
import BigNumber from "bignumber.js";
import {findTokenByTicker} from "@ledgerhq/live-common/lib/data/tokens";
import {findCryptoCurrencyByTicker} from "@ledgerhq/live-common/lib/data/cryptocurrencies";


async function main() {

    const address = '0xc892A4Dc36ffD6244d29f0cEC1dD222eB92CFB71';
    const fromAddress = '0xB108C555ceA52D544a7C00d13e94105Ca73AA5ce';

    const currency = findTokenByTicker('BAT');

    let transport = await ledgerProvider.getBlockedTransport();

    let device = ledgerProvider.getLedgerDevice();

    let bridge = await ledgerProvider.getBridge('BAT');

    let API = await ledgerProvider.getAPI('ETH');

    let amount = 1;

    if (API) {
        //check if account balance > withdrawal amount
        //update tx with account info
        let withdrawAmount = BigNumber(amount).multipliedBy(Math.pow(10, 18));
        withdrawAmount = withdrawAmount.toNumber();

        //let balance = await API.getAccountBalance('0xB108C555ceA52D544a7C00d13e94105Ca73AA5ce');
        //console.log(`${balance}`);
        let fees = await API.getEstimatedFees();
        console.log(`Fees ${fees}`)

        let baseTX = await bridge.createTransaction(address, withdrawAmount, fromAddress, undefined , fees);

        //get nounce
        let nonce;
        if (currency && (currency.family === 'ethereum' || currency.parentCurrency.family === 'ethereum')) {
          nonce = await API.getAccountNonce(fromAddress);
        }

        console.log(baseTX);

        let signedTransaction = await bridge.signTransaction(transport, currency.ticker, "44'/60'/0'/0/0" , baseTX , nonce);

        let transactionResponse = await API.broadcastTransaction(signedTransaction);

        console.log(`Status : ${transactionResponse.status} txid : ${transactionResponse.txId}`);

    }


}
main();
