"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _bridge = require("@ledgerhq/live-common/lib/bridge");

var _transaction = require("@ledgerhq/live-common/lib/transaction");

var _scan = require("../scan");

var _transaction2 = require("../transaction");

const getTransactionStatusFormatters = {
  default: ({
    status,
    transaction,
    account
  }) => "TRANSACTION " + ((0, _transaction.formatTransaction)(transaction, account) || JSON.stringify((0, _transaction.toTransactionRaw)(transaction))) + "\n" + "STATUS " + (0, _transaction.formatTransactionStatus)(transaction, status, account),
  json: ({
    status,
    transaction
  }) => "TRANSACTION " + JSON.stringify((0, _transaction.toTransactionRaw)(transaction)) + "\n" + "STATUS " + JSON.stringify((0, _transaction.toTransactionStatusRaw)(status))
};
var _default = {
  description: "Prepare a transaction and returns 'TransactionStatus' meta information",
  args: [..._scan.scanCommonOpts, ..._transaction2.inferTransactionsOpts, {
    name: "format",
    alias: "f",
    type: String,
    typeDesc: Object.keys(getTransactionStatusFormatters).join(" | "),
    desc: "how to display the data"
  }],
  job: opts => (0, _scan.scan)(opts).pipe((0, _operators.concatMap)(account => (0, _rxjs.from)((0, _transaction2.inferTransactions)(account, opts)).pipe((0, _operators.mergeMap)(inferred => inferred.reduce((acc, transaction) => (0, _rxjs.concat)(acc, (0, _rxjs.from)((0, _rxjs.defer)(() => (0, _bridge.getAccountBridge)(account).getTransactionStatus(account, transaction).then(status => ({
    transaction,
    status,
    account
  }))))), (0, _rxjs.empty)())), (0, _operators.map)(e => {
    const f = getTransactionStatusFormatters[opts.format || "default"];

    if (!f) {
      throw new Error("getTransactionStatusFormatters: no such formatter '" + opts.format + "'");
    }

    return f(e);
  }))))
};
exports.default = _default;