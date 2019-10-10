// @flow
import Xrp from '@ledgerhq/hw-app-xrp'
import type Transport from '@ledgerhq/hw-transport'
const Api = require("@ledgerhq/hw-app-str").default;

export default async (transport: Transport<*>, currencyId: string, path: string, tx: Object) => {
  const api = new Api(transport);
  let response = await api.signTransaction(path, tx.signatureBase());
  return response;
}
