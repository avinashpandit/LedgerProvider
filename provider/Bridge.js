// @flow
export default class Bridge {

  constructor() {
  }

  isRecipientValid(currency, recipient) {
  }

  async createTransaction(recipient: string, amount: number, source : string) {
  }

  serializeTransaction(t: Transaction, nonce: string) {
  }

  async signTransaction(transport, ccy , dvPath, t, nonce) {
  }
}
export let bridge = new Bridge()
