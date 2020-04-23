// @flow
import { BigNumber } from 'bignumber.js';
import Bridge from '../Bridge';
import {contractUtils} from "../api/ContractUtils";
import {findTokenByTicker} from "@ledgerhq/live-common/lib/data/tokens";
import Eth from '@ledgerhq/hw-app-eth';
const Tx = require('ethereumjs-tx').Transaction;
import { byContractAddress } from "@ledgerhq/hw-app-eth/erc20"

class ERC20EthereumBridge extends Bridge {

  constructor(_token) {
    super();
    this.token = _token;
    this.ccyDetails = contractUtils.getContractDetails(this.token);
    this.tokenContract = contractUtils.getContractInstance(this.ccyDetails);
    this.web3 = contractUtils.getWeb3();
  }

  isRecipientValid(currency, recipient) {
    if (!recipient.match(/^0x[0-9a-fA-F]{40}$/)) return false;

    // To handle non-eip55 addresses we stop validation here if we detect
    // address is either full upper or full lower.
    // see https://github.com/LedgerHQ/ledger-live-desktop/issues/1397
    const slice = recipient.substr(2);
    const isFullUpper = slice === slice.toUpperCase();
    const isFullLower = slice === slice.toLowerCase();
    if (isFullUpper || isFullLower) return true;

    try {
      return eip55.verify(recipient);
    } catch (error) {
      return false;
    }
  }

  async createTransaction(recipient: string, amount: BigNumber , source : string , tag: string, fees : BigNumber ) {
    var gasLimit = 300000;
    var chainId = 1;

    var rawTransaction = {
      'from': source,
      'gasPrice': `0x${fees.toString(16)}`,
      'gasLimit': `0x${gasLimit.toString(16)}`,
      'to': this.ccyDetails.address.toLowerCase(),
      'value': '0x0',
      'data': this.tokenContract.methods.transfer(recipient, amount.toFixed()).encodeABI(),
      chainId
    };

    return rawTransaction;
  }

  validateTransaction(tx, account) {

  }

  serializeTransaction(t, nonce: string) {
    let chainId = 1;
    const tx = new Tx({nonce,...t});
    return tx.serialize();
  }

  async signTransaction(transport, ccy , dvPath, t , nonce) {
    const tx = new Tx({nonce,...t});
    let chainId = 1;
    const eth = new Eth(transport);
    const token = findTokenByTicker(ccy);

    tx.raw[6] = Buffer.from([chainId]) // v
    tx.raw[7] = Buffer.from([]) // r
    tx.raw[8] = Buffer.from([]) // s

    const tokenInfo = byContractAddress(token.contractAddress);
    if(tokenInfo){
      await eth.provideERC20TokenInformation(tokenInfo);
    }
    const result = await eth.signTransaction(dvPath, tx.serialize().toString('hex'));

    tx.v = Buffer.from(result.v, 'hex');
    tx.r = Buffer.from(result.r, 'hex');
    tx.s = Buffer.from(result.s, 'hex');

    // Finally, we can send the transaction string to broadcast
    let signedTx = `0x${tx.serialize().toString('hex')}`;

    console.log(`Signed TX for ccy ${ccy} - ${signedTx}`);

    //const receipt = await this.web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'));
    //console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);

    return signedTx;
  }

}

export default ERC20EthereumBridge;
