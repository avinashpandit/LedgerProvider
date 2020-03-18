import {contractUtils} from "./ContractUtils";

class ERC20EthereumAPI {

  constructor(_token) {
    this.token = _token;
    this.ccyDetails = contractUtils.getContractDetails(this.token);
    this.tokenContract = contractUtils.getContractInstance(this.ccyDetails);
    this.web3 = contractUtils.getWeb3();
  }

  async getCurrentBlock() {
    return await this.web3.getCurrentBlock();
  }

  async getAccountNonce(address) {
    let count = await this.web3.eth.getTransactionCount(address);
    //count = count + 1;
    console.log(`num transactions so far: ${count}`);
    return '0x' + count.toString(16);
  }

  async broadcastTransaction(tx) {
    const receipt = await this.web3.eth.sendSignedTransaction(tx);
    console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);

    return {status : 'OK' , txId: receipt.transactionHash};
  }

  async getAccountBalance(address) {
    let balanceWei = await this.tokenContract.methods.balanceOf(address).call();
    return balanceWei;
  }

  async getEstimatedFees()
  {
    //this gas price is in gwei , we need to pass price back in wei
    let gasPrice = await contractUtils.getGasPrice();
    return contractUtils.getBalanceToUNIT(gasPrice , 9);
  }

  getContractUtils(){
    return contractUtils;
  }

}

export default ERC20EthereumAPI;
