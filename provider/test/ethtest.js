import BigNumber from "bignumber.js";
import {contractUtils} from '../api/ContractUtils';
import type from "@ledgerhq/live-common/lib/types/index";
import {Observable} from 'rxjs/Rx';


let filter = {  'to': ['0xc892A4Dc36ffD6244d29f0cEC1dD222eB92CFB71' ]};

let web3 = contractUtils.getWeb3();

async function main() {

  const address = '0xc892A4Dc36ffD6244d29f0cEC1dD222eB92CFB71';

    let balance = await contractUtils.getContractBalance({symbol : 'ETH' , address , decimals : 18} , address);

  let batBalance = await contractUtils.getContractBalance(contractUtils.getContractDetails('BAT') , address);

  let contractInstance = contractUtils.getContractInstance(contractUtils.getContractDetails('KNC'));

  const START_BLOCK = 9507282;
  const END_BLOCK = 9607283;
    /*
    export type Tx = {
        hash: string,
        received_at: string,
        nonce: string,
        value: number,
        gas: number,
        gas_price: number,
        cumulative_gas_used: number,
        gas_used: number,
        from: string,
        to: string,
        input: string,
        index: number,
        block?: {
            hash: string,
            height: number,
            time: string
        },
        confirmations: number,
        status: number,
        transfer_events? : {
            list: [
                {
                    contract: string,
                    count: number,
                    decimal: number,
                    from: string,
                    symbol: string,
                    to: string
                }
            ],
            truncated: boolean
        }
    };
*/


    let ethbalance = await web3.eth.getBalance('0xc892A4Dc36ffD6244d29f0cEC1dD222eB92CFB71');

    console.log(`ETHbalance : - ${ethbalance}`);

    console.log("Searching for transactions to/from account \"" + address + "\" within blocks "  + START_BLOCK + " and " + 9477232);

    //getTransactionsFromBlock();

    subscribeEthTransactions();

    subscribeTokenTransfers('KNC' ,filter, START_BLOCK , printTransactions );

    subscribeTokenTransfers('MLN' ,filter, START_BLOCK , printTransactions);

    subscribeTokenTransfers('BAT' ,filter, START_BLOCK , printTransactions);

    subscribeTokenTransfers('GNO' ,filter, START_BLOCK , printTransactions);

    /*
        web3.eth.getPastLogs({
            address: address.toLowerCase(),
            fromBlock : START_BLOCK,
            toBlock : END_BLOCK
        })
        .then(function (data) {
            console.log(data);
        });
    */

    //web3.eth.clearSubscriptions();
/*
*/
// unsubscribes the subscription
  /*  subscription.unsubscribe(function(error, success){
        if(success)
            console.log('Successfully unsubscribed!');
    });
*/



 /* contractInstance.getPastEvents("Transfer",
      { filter,
        fromBlock: START_BLOCK
      })
      .then(events => console.log(events))
      .catch((err) => console.error(err));

*/

    console.log(`Ether balance for address ${address} - ${batBalance}`);
}

function printTransactions(tx)
{
    console.log(`Tx : ${JSON.stringify(tx)}`); // same results as the optional callback above
}

process.stdin.resume();//so the program will not close instantly

function subscribeEthTransactions() {
    let subscription = web3.eth.subscribe('newBlockHeaders', function (error, result) {
        if (!error) {
            //console.log(result);
        }
    })
        .on("data", function (blockData) {
            if(blockData && blockData.number)
            {
                Observable.defer(() => {
                    console.log(`Calling getBlock ${blockData.number}`);
                    return blockData.number;
                })
                    .delay(10000)
                    .takeWhile((blockNumber) => {
                        //check if position updated
                        web3.eth.getBlock(blockNumber, true).then(block => {
                            if (block != null ) {
                                if(block.transactions && block.transactions.length > 0) {
                                    console.log(`Block ${block.number} txs ${block.transactions.length}`);
                                    block.transactions.forEach(function (e) {
                                        if (address == "*" || address == e.from || address == e.to) {
                                            console.log("  tx hash          : " + e.hash + "\n"
                                                + "   nonce           : " + e.nonce + "\n"
                                                + "   blockHash       : " + e.blockHash + "\n"
                                                + "   blockNumber     : " + e.blockNumber + "\n"
                                                + "   transactionIndex: " + e.transactionIndex + "\n"
                                                + "   from            : " + e.from + "\n"
                                                + "   to              : " + e.to + "\n"
                                                + "   value           : " + e.value + "\n"
                                                + "   gasPrice        : " + e.gasPrice + "\n"
                                                + "   gas             : " + e.gas + "\n"
                                                + "   input           : " + e.input);
                                        }
                                    });
                                }
                                return false;
                            }
                            else
                            {
                                return true;
                            }
                        });
                    }).subscribe(
                    result => {
                        console.log(`Fetching result ${result}`);
                    }, error => {
                    }, async () => {
                        //completed
                    }
                );
            }
        })
        .on("changed", function (log) {
            console.log(log);
        });
}

function subscribeTokenTransfers(ccy ,filter, START_BLOCK , callback){
    contractUtils.subscribeTokenTransfers(ccy, filter, START_BLOCK , callback);
}

async function getTransactionsFromBlock() {
    for (var i = START_BLOCK; i <= END_BLOCK; i++) {
        var block = await web3.eth.getBlock(i, true);

        if (block != null && block.transactions != null) {
            console.log(`Block ${block.hash} txs ${block.transactions.length}`);
            block.transactions.forEach( function(e) {
                if (address == "*" || address == e.from || address == e.to) {
                    console.log("  tx hash          : " + e.hash + "\n"
                        + "   nonce           : " + e.nonce + "\n"
                        + "   blockHash       : " + e.blockHash + "\n"
                        + "   blockNumber     : " + e.blockNumber + "\n"
                        + "   transactionIndex: " + e.transactionIndex + "\n"
                        + "   from            : " + e.from + "\n"
                        + "   to              : " + e.to + "\n"
                        + "   value           : " + e.value + "\n"
                        + "   gasPrice        : " + e.gasPrice + "\n"
                        + "   gas             : " + e.gas + "\n"
                        + "   input           : " + e.input);
                }
            })
        }
    }
}


function exitHandler(options, exitCode) {
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

main();
