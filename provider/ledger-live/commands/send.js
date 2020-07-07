"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _env = require("@ledgerhq/live-common/lib/env");

var _bridge = require("@ledgerhq/live-common/lib/bridge");

var _transaction = require("@ledgerhq/live-common/lib/transaction");

var _scan = require("../scan");

var _transaction2 = require("../transaction");

var _default = {
  description: "Send crypto-assets",
  args: [..._scan.scanCommonOpts, ..._transaction2.inferTransactionsOpts, {
    name: "ignore-errors",
    type: Boolean,
    desc: "when using multiple transactions, an error won't stop the flow"
  }, {
    name: "disable-broadcast",
    type: Boolean,
    desc: "do not broadcast the transaction"
  }],
  job: opts => (0, _scan.scan)(opts).pipe((0, _operators.switchMap)(account => (0, _rxjs.from)((0, _transaction2.inferTransactions)(account, opts)).pipe((0, _operators.concatMap)(inferred => inferred.reduce((acc, t) => (0, _rxjs.concat)(acc, (0, _rxjs.from)((0, _rxjs.defer)(() => {
    const bridge = (0, _bridge.getAccountBridge)(account);
    return bridge.signOperation({
      account,
      transaction: t,
      deviceId: opts.device || ""
    }).pipe((0, _operators.map)(_transaction.toSignOperationEventRaw), ...(opts["disable-broadcast"] || (0, _env.getEnv)("DISABLE_TRANSACTION_BROADCAST") ? [] : [(0, _operators.concatMap)(e => {
      if (e.type === "signed") {
        return (0, _rxjs.from)(bridge.broadcast({
          account,
          signedOperation: e.signedOperation
        }));
      }

      return (0, _rxjs.of)(e);
    })]), ...(opts["ignore-errors"] ? [(0, _operators.catchError)(e => {
      return (0, _rxjs.of)({
        type: "error",
        error: e,
        transaction: t
      });
    })] : []));
  }))), (0, _rxjs.empty)())), (0, _operators.map)(obj => JSON.stringify(obj)))))
};
exports.default = _default;