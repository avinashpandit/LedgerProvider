// @flow
import type { CryptoCurrency } from '@ledgerhq/live-common/lib/types'
import { RippleAPI } from 'ripple-lib';
import { BigNumber } from 'bignumber.js'
import network from './network';

export type Block = { height: number }
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

const api = new RippleAPI({
  server: 'wss://s2.ripple.com' // Public rippled server hosted by Ripple, Inc.
});

export type API = {
  getTransactions: (
      address: string,
      blockHash: ?string,
  ) => Promise<{
    truncated: boolean,
    txs: Tx[],
  }>,
}

export const apiForRipple = (currency: CryptoCurrency): API => {

  return {
    async getTransactions(address, blockHash) {
      if(!api.isConnected()) {
        await api.connect();
      }

      let data;
      if(blockHash){
        data = await api.getTransactions(address, {start: blockHash , earliestFirst: true , excludeFailures: true});
      }
      else{
        data = await api.getTransactions(address, {earliestFirst: true , excludeFailures: true});
      }

      //logic to translate bitcoin specific transaction model to generic tx model containing to , from , value
      let newTxns = [];
      if(data && data.length > 0)
      {
        data.forEach(txn => {
          //check inputs and outputs length > 0
          if (txn && txn.type === 'payment') {
            let outcome = txn.outcome;
            let specification = txn.specification;
            if (outcome && outcome.balanceChanges && specification && specification.source && specification.destination) {
              let amountDetails;
              if (address === specification.source.address) {
                amountDetails = outcome.balanceChanges[specification.destination.address];
              } else if (address === specification.destination.address) {
                amountDetails = outcome.balanceChanges[specification.destination.address];
              }

              if(!amountDetails){
                console.log(`Unrecognized TX : ${JSON.stringify(txn)}`);
              }

              if (amountDetails && amountDetails.length === 1 && amountDetails[0]['currency'] === 'XRP' && amountDetails[0]['value']) {
                let newTxn = {};
                newTxn.hash = txn.id;
                newTxn.received_at = outcome.timestamp;
                let amt = new BigNumber(amountDetails[0]['value']).toNumber();
                newTxn.value = amt;
                newTxn.from = specification.source.address;
                newTxn.to = specification.destination.address;
                newTxn.block = {hash: txn.id};
                newTxn.confirmations = 1;
                newTxn.memo = specification.destination.tag ? specification.destination.tag.toString() : undefined;
                newTxns.push(newTxn);
              }
            }
          }
        });
      }
      let newData = {};
      newData.truncated = false;
      newData.txs = newTxns;
      return newData;
    },
    async getAccountBalance(address) {
      if(!api.isConnected()) {
        await api.connect();
      }

      try {
        let balances = await api.getBalances(address, {currency: 'XRP'});
        if (balances && balances.length === 1) {
          return BigNumber(balances[0].value);
        } else {
          return BigNumber(0);
        }
      }
      catch(e){
        console.log(`Error getting account details for ${address}`);
      }
      return BigNumber(0);
    },
    async isValidAddress(address) {
      if(!api.isConnected()) {
        await api.connect();
      }
      return await api.isValidAddress("address");
    },
    async preparePayment(source, payment , instructions) {
      if(!api.isConnected()) {
        await api.connect();
      }
      return await api.preparePayment(source, payment , instructions);
    },
    async broadcastTransaction(tx) {
      if(!api.isConnected()) {
        await api.connect();
      }
      let resp = await api.submit(tx);
      console.log(`Response from Ripple API ${JSON.stringify(resp)}`);
      if(resp && (resp.resultCode === 'tesSUCCESS' || resp.resultCode === 'terQUEUED'))
      {
        if(resp.tx_json){
          return {status : 'OK' , txId: resp.tx_json.hash};
        }
        else{
          return {status : 'OK' , txId: '' , code: 'Unable to get TransactionID. Please verify backend Logs or account activity.'}
        }
      }
      else if(resp && resp.tx_json)
      {
        return {status : 'ERROR' , txId: resp.tx_json.hash , code : `Response code ${resp.resultMessage}. Please verify backend Logs or account activity.`};
      }
      else{
        return {status : 'ERROR' , txId: '' , code : `Unable to receive TX Details. TX unsuccessful. Response code ${resp.resultMessage}. Please verify backend Logs or account activity.`};
      }
    },
    //This is not required for Ripple
    async getEstimatedFees()
    {
    }
  }
}
