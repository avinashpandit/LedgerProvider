// @flow
import type { CryptoCurrency } from '@ledgerhq/live-common/lib/types'
import { LedgerAPINotAvailable } from '@ledgerhq/errors'
import network from './network'
import { blockchainBaseURL } from './Ledger'
import {BigNumber} from 'bignumber.js';
import {getEstimatedFees} from './Fees';

export type Block = { height: number } // TODO more fields actually
export type Tx = {
  hash: string,
  received_at: string,
  nonce: string,
  value: number,
  from: string,
  to: string,
  input: string,
  index: number,
  block?: {
    hash: string,
    height: number,
    time: string,
  },
  confirmations: number,
}

export type API = {
  getTransactions: (
    address: string,
    blockHash: ?string,
  ) => Promise<{
    truncated: boolean,
    txs: Tx[],
  }>,
  getCurrentBlock: () => Promise<Block>,
  broadcastTransaction: (signedTransaction: string) => Promise<string>,
}

export const apiForBitcoin = (currency: CryptoCurrency): API => {
  const baseURL = blockchainBaseURL(currency);
  if (!baseURL) {
    throw new LedgerAPINotAvailable(`LedgerAPINotAvailable ${currency.id}`, {
      currencyName: currency.name,
    })
  }
  return {
    async getTransactions(address, blockHash) {
      const { data } = await network({
        method: 'GET',
        url: `${baseURL}/addresses/${address}/transactions`,
        params: { block_hash : blockHash, noToken: 1 },
      });

      //logic to translate bitcoin specific transaction model to generic tx model containing to , from , value
      let newTxns = [];
      if(data.txs && data.txs.length > 0)
      {
        data.txs.forEach(txn =>{
          //check inputs and outputs length > 0
          if(txn.inputs && txn.outputs)
          {
            if(txn.inputs.length > 0 && txn.outputs.length > 0)
            {
              let tos = [];
              txn.outputs.forEach(output =>{
                if(output.address === address)
                {
                  //this is deposit into address
                  let froms = [];
                  let from;
                  let value = output.value;
                  txn.inputs.forEach(input =>{
                    if(output.address === input.address){
                      value -= input.value;
                    }
                    else{
                      if(!input.address || input.address === null)
                      {
                        froms.push('UNKNOWN');
                      }
                      else {
                        froms.push(input.address);
                      }
                    }
                  });


                  if(froms.length === 1){
                    from = froms[0];
                  }
                  else if(froms.length > 1){
                    from = froms.toString();
                  }

                  if(from && value > 0)
                  {
                      //this is clear deposit from different address
                      let newTxn = {};
                      newTxn.hash = txn.hash;
                      newTxn.received_at = txn.received_at;
                      newTxn.value =  value;
                      newTxn.from = from;
                      newTxn.to = address;
                      newTxn.block = txn.block;
                      newTxn.confirmations = txn.confirmations;
                      newTxns.push(newTxn);
                  }
                }
                else
                {
                  //this is clear withdraw from different address
                  tos.push(output.address);
                }
              });

              txn.inputs.forEach(input =>{
                  if(input.address === address)
                  {
                    //this is withdraw
                    let to;
                    if(tos.length === 1){
                      to = tos[0];
                    }
                    else{
                      to = tos.toString();
                    }

                    if(to)
                    {
                      //this is clear deposit from different address
                      let newTxn = {};
                      newTxn.hash = txn.hash;
                      newTxn.received_at = txn.received_at;
                      newTxn.value = input.value;
                      newTxn.from = address;
                      newTxn.to = to;
                      newTxn.block = txn.block;
                      newTxn.confirmations = txn.confirmations;
                      newTxns.push(newTxn);
                    }
                  }
              });

            }
          }
        });
      }

      let newData = {};
      newData.truncated = data.truncated;
      newData.txs = newTxns;
      return newData;
    },
    async getCurrentBlock() {
      const { data } = await network({
        method: 'GET',
        url: `${baseURL}/blocks/current`,
      })
      return data
    },
    async broadcastTransaction(tx) {
      const { data } = await network({
        method: 'POST',
        url: `${baseURL}/transactions/send`,
        data: { tx },
      })
      return data.result
    },
    async getAccountBalance(address , blockHash) {
      const { data } = await network({
        method: 'GET',
        url: `${baseURL}/addresses/${address}/transactions`,
        params: { blockHash, noToken: 1 },
      });

      let balance = 0;
      if(data.txs && data.txs.length > 0)
      {
        data.txs.forEach(tx =>
        {

          let localBalance = 0;
          tx.outputs.forEach(output => {
            if (output.address === address) {
              localBalance += output.value;
            }
          });
          tx.inputs.forEach(input => {
            if (input.address === address) {
              localBalance -= input.value;
            }
          });
          balance += localBalance;
        });
      }
      return BigNumber(balance);
    },
    async getEstimatedFees()
    {
      let fees = await getEstimatedFees(currency);
      //100 gWei -- this is going to be max price if nothing comes from estimatedFees
      let maxFees = BigNumber(100);
      let minFees = BigNumber(1);
      if(currency.ticker === 'LTC')
      {
          maxFees = BigNumber(1000);
      }
      else if(currency.ticker === 'BCH')
      {
        maxFees = BigNumber(1000);
      }
      else if(currency.ticker === 'BTC')
      {
        maxFees = BigNumber(100);
      }

      if(fees && fees['1'])
      {
        let fastFees = BigNumber(fees['1']).dividedBy(1000).integerValue(BigNumber.ROUND_CEIL);

        if(fastFees.isGreaterThan(maxFees))
        {
          return maxFees;
        }
        else if(fastFees.isLessThan(minFees))
        {
          return minFees;
        }
        else{
          return fastFees;
        }
      }
      else{
        return maxFees;
      }
    }
  }
}
