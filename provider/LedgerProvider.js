// @flow

import Provider from './Provider';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import CommNodeHid from '@ledgerhq/hw-transport-node-hid';
import {findCryptoCurrencyByTicker} from '@ledgerhq/live-common/lib/data/cryptocurrencies';
import getAddress from '@ledgerhq/live-common/lib/hw/getAddress';
import {
  getDerivationModesForCurrency,
  getDerivationScheme,
  runDerivationScheme,
  isIterableDerivationMode,
  getMandatoryEmptyAccountSkip,
} from '@ledgerhq/live-common/lib/derivation';

import {apiForEther} from './api/Ethereum';
import {apiForBitcoin} from './api/Bitcoin';

import ethereumBridge from './bridge/EthereumBridge';
import {apiForRipple} from './api/Ripple';
import rippleBridge from './bridge/RippleBridge';
import currencyBridge from './bridge/CurrencyBridge'
import {closeAllDevices} from "./tool/live-common-setup";
import {apiForStellar} from './api/Stellar';
import stellarBridge from './bridge/StellarBridge';
import ERC20EthereumBridge from "./bridge/ERC20EthereumBridge";
import {findTokenByTicker} from "@ledgerhq/live-common/lib/data/tokens";

const pino = require('pino');
const log = pino({
  prettyPrint: true
});

class LedgerProvider extends Provider{


  constructor() {
    super();
    //TransportNodeHid.setListenDevicesDebug(true);
    TransportNodeHid.listen(this);
    this.transport;
    this.device;
  }

  getDevice() {
    return new Promise((resolve, reject) => {
      const sub = CommNodeHid.listen({
        error: err => {
          sub.unsubscribe();
          reject(err);
        },
        next: async e => {
          if (!e.device) {
            return;
          }
          if (e.type === 'add') {
            sub.unsubscribe();
            resolve(e.device);
          }
        },
      });
    });
  }

  getLedgerDevice(){
    return this.device;
  }

  async getTransport()
  {
    return this.transport;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getBlockedTransport()
  {

    for(let i=0; i< 5; i++)
    {
      log.info('Trying to connect to Ledger Device ...');
      if(this.transport)
      {
        return this.transport;
      }

      await this.sleep(3000);
    }
    return this.transport;
  }

  onAdd(device){
    log.info(`Added device : ${JSON.stringify(device.descriptor)}` );
    this.device = device.device;
    if(!this.transport)
    {
      this.openTransport();
    }
  }

  onRemove(device)
  {
    log.info(`Removed device : ${JSON.stringify(device.descriptor)}` );
    this.transport = undefined;
  }

  next(device){
    log.info(`OnNext device : Descriptor : ${JSON.stringify(device.descriptor)} Device :  ${JSON.stringify(device)}` );
      let self = this;
      if(device && device.type && device.type === 'add') {
        this.openTransport();
        self.device = device.device;
      }
      else if(device && device.type && device.type === 'remove')
      {
        self.transport = undefined;
      }
  }

  openTransport() {
    let self = this;
    try {

      console.log('Opening Transport ....');

      TransportNodeHid.create(undefined, true, 5000).then(transport => {
        self.transport = transport;
        self.transport.setDebugMode(true);
        console.log('Transport Opened !!!');
      });
      /*
          open(device.device.path).then(transport => {
            self.device = device.device;
            self.transport = transport;
            self.transport.setDebugMode(true);
          });

       */
    } catch (e) {
      self.transport = undefined;
    }
  }

  async closeTransport()
  {
    if(this.transport) {
      await this.transport
          .close()
          .catch(() => {
          });
      console.log('Transport Closed !!!');
      this.transport = undefined;
    }
  }

  closeAllLibcoreTransports()
  {
    closeAllDevices();
  }

  async getAddressForCurrency(derivationPath : string , ccy : string) {
    const currency = findCryptoCurrencyByTicker(ccy);
    let transport = await this.getTransport();
    return await getAddress(transport , currency , derivationPath);
  }

  async getAddressForCurrencyList(ccy : string) {
    const currency = findCryptoCurrencyByTicker(ccy);
    log.info(JSON.stringify(currency));
    let addresses = [];

    try {
      const derivationModes = getDerivationModesForCurrency(currency);
      for (const derivationMode of derivationModes) {
          let emptyCount = 0;
          const mandatoryEmptyAccountSkip = getMandatoryEmptyAccountSkip(derivationMode);
          const derivationScheme = getDerivationScheme({derivationMode, currency});
        const stopAt = isIterableDerivationMode(derivationMode) ? 20 : 1;
          for (let index = 0; index < stopAt; index++) {
            const freshAddressPath = runDerivationScheme(derivationScheme, currency, {
            account: index,
            });

            let address = await this.getAddressForCurrency(freshAddressPath, ccy);
            log.info('Address : ' + JSON.stringify(address));
            addresses.push({dvPath: address.path, currency: ccy, pubKey: address.publicKey, address: address.address});
        }
      }

    } catch (err) {
      log.info('[ERROR]', err);
    }

    return addresses;
  }

  async getAPI(ccy : string)
  {
    const currency = findCryptoCurrencyByTicker(ccy);
    if(currency)
    {
      if(currency.family === 'ethereum')
      {
        return apiForEther(currency);
      }
      else if(currency.family === 'bitcoin')
      {
        return apiForBitcoin(currency);
      }
      else if(currency.family === 'ripple')
      {
        return apiForRipple(currency);
      }
      else if(currency.family === 'stellar')
      {
        return apiForStellar(currency);
      }
    }
  }

  async getBridge(ccy : string)
  {
    log.info('Calling getBridge');
    const currency = findCryptoCurrencyByTicker(ccy);
    if(currency)
    {
      log.info(`${currency.family}`);
      if(currency.family === 'ethereum')
      {
          return ethereumBridge;
      }
      else if(currency.family === 'ripple')
      {
        return rippleBridge;
      }
      else if(currency.family === 'bitcoin'){
          return currencyBridge;
      }
      else if(currency.family === 'stellar')
      {
        return stellarBridge;
      }
    }
    else{
      let tokenCcy = findTokenByTicker(ccy);
      if(tokenCcy){
        log.info(`Geeting ERC20EthereumBridge for currency ${tokenCcy}`);
        let tokenBridge = new ERC20EthereumBridge(ccy);
        return tokenBridge;
      }
    }
  }
}

let ledgerProvider = new LedgerProvider();

export default ledgerProvider;
