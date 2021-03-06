import ledgerProvider from '../LedgerProvider';
import {BigNumber} from "bignumber.js";
import {findCryptoCurrencyByTicker} from '@ledgerhq/live-common/lib/data/cryptocurrencies';

async function main() {


    const address = '0x7aefEB86cADbe43a972eE7C96113ff72BfCF080b';
    const fromAddress = '0xB108C555ceA52D544a7C00d13e94105Ca73AA5ce';

    const currency = findCryptoCurrencyByTicker('ETH');

    let transport = await ledgerProvider.getBlockedTransport();

    let device = ledgerProvider.getLedgerDevice();

    let bridge = await ledgerProvider.getBridge('ETH');

    let API = await ledgerProvider.getAPI('ETH');

    let amount = 0.01;

    if (API) {
        //check if account balance > withdrawal amount
        //update tx with account info

        let withdrawAmount = new BigNumber(amount).multipliedBy(Math.pow(10, 18));
        
        //let balance = await API.getAccountBalance('0xB108C555ceA52D544a7C00d13e94105Ca73AA5ce');
        //console.log(`${balance}`);
        let fees = await API.getEstimatedFees();
        fees = fees.toString();
        console.log(`Fees ${fees} ${typeof fees}`);


        let baseTX = await bridge.createTransaction(address, withdrawAmount, fromAddress, undefined , new BigNumber(fees));

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
