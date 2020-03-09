const Tx = require('ethereumjs-tx').Transaction;

const BN = require('bignumber.js');
const fs = require('fs');
const path = require('path');

const Web3 = require('web3');
const web3 = new Web3( new Web3.providers.WebsocketProvider(process.env.WSProvider));

//WSProvider=wss://mainnet.infura.io/ws/v3/db2ee91f04bc44a281aae437e28d5b6b
//const web3 = new Web3( new Web3.providers.WebsocketProvider('ws://192.168.1.68:8546'));

const ERC20ABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, './ERC20-abi.json'), 'utf8'));

//const USER_WALLET_ADDRESS = '0xc892A4Dc36ffD6244d29f0cEC1dD222eB92CFB71';

class ContractUtils {

  constructor() {
    this.tokenContracts = new Map();
  }

  async initialize() {
    this.web3 = web3;
    const contractDetails = [
        {symbol : 'BAT' , address : '0x0D8775F648430679A709E98d2b0Cb6250d2887EF' , decimals : 18},
        {symbol : 'MLN' , address : '0xec67005c4e498ec7f55e092bd1d35cbc47c91892' , decimals : 18},
        {symbol : 'KNC' , address : '0xdd974d5c2e2928dea5f71b9825b8b646686bd200' , decimals : 18},
        {symbol : 'GNO' , address : '0x6810e776880C02933D47DB1b9fc05908e5386b96' , decimals : 18},
        {symbol : 'USDT' , address : '0xdAC17F958D2ee523a2206206994597C13D831ec7' , decimals : 6},
        {symbol : 'USDC' , address : '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' , decimals : 6}
    ];

    //adding tokens
    contractDetails.forEach(ccyDetails =>
    {
      this.tokenContracts.set(ccyDetails.symbol, ccyDetails);
    });
  }

  getContractDetails(ccy)
  {
    return this.tokenContracts.get(ccy);
  }

  getContractInstance(ccyDetails)
  {
    if(ccyDetails.address) {
      let tokenContract = new this.web3.eth.Contract(ERC20ABI, ccyDetails.address);
      return tokenContract;
    }
  }

  async signTransactionAndBroadcast(rawTransaction) {
    console.log(`Raw of Transaction: \n${JSON.stringify(rawTransaction, null, '\t')}\n------------------------`);

    const aPvtKi = Buffer.from(data['PVT'].apiKey, 'hex');
    const tx = new Tx(rawTransaction);
    console.log('Signing transaction....');

    tx.sign(aPvtKi);
    const serializedTx = tx.serialize();

    console.log(serializedTx);
    const receipt = await this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
    return receipt;
  }

  async getContractBalance(ccyDetails , address) {
    try {
      if(ccyDetails && ccyDetails.symbol === 'ETH')
      {
        let balance = await this.web3.eth.getBalance(address);
        balance = this.web3.utils.fromWei(balance, 'ether');
        return balance;
      }
      else if(ccyDetails.address) {
        let srcTokenContract = new this.web3.eth.Contract(ERC20ABI, ccyDetails.address);
        let balanceWei = await srcTokenContract.methods.balanceOf(address).call();
        if(balanceWei > 0) {
          const balance = this.getBalanceFromUNIT(balanceWei, ccyDetails.decimals).toFixed(ccyDetails.decimals);
          return balance;
        }
      }
      return 0;
    }
    catch (e) {
      console.error(e);
    }
  }

  getBalanceToUNIT(amount , decimals)
  {
    return  new BN(amount).multipliedBy( new BN(10).pow(decimals));
  }

  getBalanceFromUNIT(amountUNIT , decimals)
  {
    return  new BN(amountUNIT).dividedBy( new BN(10).pow(decimals));
  }

  async getETHRawTransaction(fromAddress, amount, destAddress)
  {
    var count = await this.web3.eth.getTransactionCount(fromAddress);
    console.log(`num transactions so far: ${count}`);
    var gasPriceGwei = 5.5;
    var gasLimit = 250000;
    // Chain ID of Ropsten Test Net is 3, replace it to 1 for Main Net
    var chainId = 1;
    var rawTransaction = {
      'from': USER_WALLET_ADDRESS,
      'nonce': '0x' + count.toString(16),
      'gasPrice': this.web3.utils.toHex(gasPriceGwei * 1e9),
      'gasLimit': this.web3.utils.toHex(gasLimit),
      'to': destAddress,
      'value': this.web3.utils.toHex(this.getBalanceToUNIT(amount , 18).toFixed()),
      'chainId': chainId,
    };
    console.log(`Raw of Transaction: \n${JSON.stringify(rawTransaction, null, '\t')}\n------------------------`);
    return rawTransaction;
  }

  async getContractRawTransaction(fromAddress, ccyDetails , amount , destAddress)
  {
    let srcTokenContract = new this.web3.eth.Contract(ERC20ABI, ccyDetails.address);
    let finalAmt = this.getBalanceToUNIT(amount , ccyDetails.decimals);

    // Determine the nonce
    var count = await this.web3.eth.getTransactionCount(fromAddress);
    //count = count + 1;
    console.log(`num transactions so far: ${count}`);
    var gasPriceGwei = 5.5;
    var gasLimit = 250000;
    // Chain ID of Ropsten Test Net is 3, replace it to 1 for Main Net
    var chainId = 1;
    var rawTransaction = {
      'from': fromAddress,
      'nonce': '0x' + count.toString(16),
      'gasPrice': this.web3.utils.toHex(gasPriceGwei * 1e9),
      'gasLimit': this.web3.utils.toHex(gasLimit),
      'to': ccyDetails.address.toLowerCase(),
      'value': '0x0',
      'data': srcTokenContract.methods.transfer(destAddress, finalAmt.toFixed()).encodeABI(),
      'chainId': chainId,
    };
    console.log(`Raw of Transaction: \n${JSON.stringify(rawTransaction, null, '\t')}\n------------------------`);
    return rawTransaction;
  }

  getWeb3()
  {
    return this.web3;
  }

  //subscribe token events with filter
  subscribeTokenTransfers(ccy,filter,START_BLOCK,callback)
  {
    let contractDetails = this.getContractDetails(ccy);
    let contractInstance = this.getContractInstance(contractDetails);
    if(!contractInstance)
    {
      return false;
    }

    let self = this;
    contractInstance.events.Transfer({
      filter,
      fromBlock: START_BLOCK
    })
        .on('data', async function(event){
          let tx = {
            block : {hash : event.blockHash , height : event.blockNumber},
            from : event.returnValues.from,
            to : event.returnValues.to,
            hash : event.transactionHash,
            value : event.returnValues.value,
            valueInCcy : self.getBalanceFromUNIT(event.returnValues.value , contractDetails.decimals ),
            ccy : ccy
          };

          // Add number of confirmations
          let currentBlock = await self.getWeb3().eth.getBlockNumber();
          if(event.blockNumber && currentBlock){
            tx.confirmations = currentBlock - event.blockNumber;
          }

          let block = await self.getWeb3().eth.getBlock(event.blockNumber);
          if(block)
          {
            tx.received_at = block.timestamp * 1000;
          }
          else
          {
            tx.received_at = new Date().getTime();
          }
          //console.log(`Contract Tx : ${JSON.stringify(tx)}`); // same results as the optional callback above
          await callback(tx);
        })
        .on('changed', function(event){
          // remove event from local database
        })
        .on('error', console.error);

    return true;
  }

}

export let contractUtils = new ContractUtils();
contractUtils.initialize();
