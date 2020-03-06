// @flow
import { BigNumber } from "bignumber.js";
import { LedgerAPINotAvailable } from "@ledgerhq/errors";
import type { CryptoCurrency } from '@ledgerhq/live-common/lib/types'
import network from "./network";
import { blockchainBaseURL, getCurrencyExplorer } from "@ledgerhq/live-common/lib/api/Ledger";
import { getEstimatedFees } from "@ledgerhq/live-common/lib/api/Fees";
import {contractUtils} from "./ContractUtils";

export type Block = { height: number }; // TODO more fields actually

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

export type API = {
    getTransactions: (
        address: string,
        blockHash: ?string
    ) => Promise<{
        truncated: boolean,
        txs: Tx[]
    }>,
    getCurrentBlock: () => Promise<Block>,
    getAccountNonce: (address: string) => Promise<number>,
    broadcastTransaction: (signedTransaction: string) => Promise<string>,
    getAccountBalance: (address: string) => Promise<BigNumber>,
    estimateGasLimitForERC20: (address: string) => Promise<number>
};

export const apiForEther = (currency: CryptoCurrency): API => {
    const baseURL = blockchainBaseURL(currency);
    if (!baseURL) {
        throw new LedgerAPINotAvailable(`LedgerAPINotAvailable ${currency.id}`, {
            currencyName: currency.name
        });
    }
    return {
        async getTransactions(address, blockHash) {
            let self = this;
            console.log(`Getting txs for ${address} ${getCurrencyExplorer(currency).version}`);
            let { data } = await network({
                method: "GET",
                url: `${baseURL}/addresses/${address}/transactions`,
                params:
                    getCurrencyExplorer(currency).version === "v2"
                        ? {
                            blockHash,
                            noToken: 1
                        }
                        : {
                            batch_size: 2000,
                            no_token: true,
                            block_hash: blockHash,
                            partial: false
                        }
            });
            // v3 have a bug that still includes the tx of the paginated block_hash, we're cleaning it up
            if (getCurrencyExplorer(currency).version === "v3") {

                if(blockHash) {
                    data = {
                        ...data,
                        txs: data.txs.filter(tx => !tx.block || tx.block.hash !== blockHash)
                    };
                }

                //make sure get current block and compute confirmations as it's not available as part of v3
                let currentBlock = await self.getCurrentBlock();

                if(currentBlock && currentBlock.height){
                    data.txs.forEach(txn => {
                        if(txn && txn.block && txn.block.height){
                            txn.confirmations = currentBlock.height - txn.block.height;
                            txn.confirmations = txn.confirmations > 0 ?  txn.confirmations : 0;
                        }
                    });
                }
            }
            return data;
        },

        async getCurrentBlock() {
            const { data } = await network({
                method: "GET",
                url: `${baseURL}/blocks/current`
            });
            return data;
        },

        async getAccountNonce(address) {
            const { data } = await network({
                method: "GET",
                url: `${baseURL}/addresses/${address}/nonce`
            });
            return data[0].nonce;
        },

        async estimateGasLimitForERC20(address) {
            if (getCurrencyExplorer(currency).version === "v2") return 21000;

            const { data } = await network({
                method: "GET",
                url: `${baseURL}/addresses/${address}/estimate-gas-limit`
            });
            return data.estimated_gas_limit;
        },

        async broadcastTransaction(tx) {
            const { data } = await network({
                method: "POST",
                url: `${baseURL}/transactions/send`,
                data: { tx }
            });
            return {status : 'OK' , txId: data.result};
        },

        async getAccountBalance(address) {
            const { data } = await network({
                method: "GET",
                url: `${baseURL}/addresses/${address}/balance`
            });
            // FIXME precision lost here. nothing we can do easily
            return BigNumber(data[0].balance);
        },

        async getEstimatedFees()
        {
            let fees = await getEstimatedFees(currency);
            //100 gWei -- this is going to be max price if nothing comes from estimatedFees
            let maxFees = BigNumber(100000000000);
            //10 gWei -- this is going to be min price
            let minFees = BigNumber(10000000000);
            if(fees && fees.gas_price)
            {
                if(BigNumber(fees.gas_price).isGreaterThan(maxFees))
                {
                    return maxFees;
                }
                else if(BigNumber(fees.gas_price).isLessThan(minFees))
                {
                    return minFees;
                }
                else{
                    return BigNumber(fees.gas_price);
                }
            }
            else{
                return maxFees;
            }
        }

        getContractUtils(){
            return contractUtils;
        }
    };
};
