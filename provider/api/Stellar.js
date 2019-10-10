// @flow
import type { CryptoCurrency } from '@ledgerhq/live-common/lib/types'
import { BigNumber } from 'bignumber.js'
var StellarSdk = require('stellar-sdk');

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

var server = new StellarSdk.Server('https://horizon.stellar.org');

export type API = {
  getTransactions: (
    address: string,
    blockHash: ?string,
  ) => Promise<{
    truncated: boolean,
    txs: Tx[],
  }>,
}

export const apiForStellar = (currency: CryptoCurrency): API => {

  return {

  async getTransactions(address, blockHash) {
      let data;
      if(blockHash){
        data = await server.payments().forAccount(address).cursor(blockHash).call();
      }
      else{
        data = await server.payments().forAccount(address).cursor(0).call();
      }

      //logic to translate bitcoin specific transaction model to generic tx model containing to , from , value
      let newTxns = [];
      if(data && data.records && data.records.length > 0)
      {
        data.records.forEach(txn => {
          //check inputs and outputs length > 0
          if (txn && txn.type === 'payment' && txn.asset_type === 'native' && txn.transaction_successful) {
            let newTxn = {};
            newTxn.hash = txn.transaction_hash;
            newTxn.received_at = txn.created_at;
            let amt = new BigNumber(txn.amount).toNumber();
            newTxn.value = amt;
            newTxn.from = txn.from;
            newTxn.to = txn.to;
            newTxn.block = {hash: txn.id};
            newTxn.confirmations = 1;
            newTxns.push(newTxn);
          }
          else if(txn && txn.type === 'create_account' && txn.transaction_successful){
            let newTxn = {};
            newTxn.hash = txn.transaction_hash;
            newTxn.received_at = txn.created_at;
            let amt = new BigNumber(txn.starting_balance).toNumber();
            newTxn.value = amt;
            newTxn.from = txn.funder;
            newTxn.to = txn.account;
            newTxn.block = {hash: txn.id};
            newTxn.confirmations = 1;
            newTxns.push(newTxn);
          }
        });
      }
      let newData = {};
      newData.truncated = false;
      newData.txs = newTxns;
      return newData;
    },
    async getAccountBalance(address) {
      try {
        let account = await server.loadAccount(address);
        let balance = 0;
        if (account && account.balances && account.balances.length > 0) {
          account.balances.forEach(balanceData => {
            if(balanceData.asset_type === 'native')
            {
              balance = balanceData.balance;
            }
          });
        }
        return BigNumber(balance);
      }
      catch(e){
        console.log(`Error getting account details for ${address}`);
      }
      return BigNumber(0);
    },
    async fetchFees() {
      return await server.fetchBaseFee();
    },
    getServer() {
      return server
    },
    async getAccount(address) {
      return await server.loadAccount(address);
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
