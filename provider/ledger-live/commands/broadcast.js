"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _bridge = require("@ledgerhq/live-common/lib/bridge");

var _account = require("@ledgerhq/live-common/lib/account");

var _scan = require("../scan");

var _signedOperation = require("../signedOperation");

var _default = {
  description: "Broadcast signed operation(s)",
  args: [..._scan.scanCommonOpts, ..._signedOperation.inferSignedOperationsOpts],
  job: opts => (0, _scan.scan)(opts).pipe((0, _operators.concatMap)(account => (0, _signedOperation.inferSignedOperations)(account, opts).pipe((0, _operators.concatMap)(signedOperation => (0, _rxjs.from)((0, _bridge.getAccountBridge)(account).broadcast({
    account,
    signedOperation
  }))))), (0, _operators.map)(obj => JSON.stringify((0, _account.toOperationRaw)(obj))))
};
exports.default = _default;