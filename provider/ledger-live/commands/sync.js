"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _operators = require("rxjs/operators");

var _account = require("@ledgerhq/live-common/lib/account");

var _scan = require("../scan");

var _default = {
  description: "Synchronize accounts with blockchain",
  args: [..._scan.scanCommonOpts, {
    name: "format",
    alias: "f",
    type: String,
    typeDesc: Object.keys(_account.accountFormatters).join(" | "),
    desc: "how to display the data"
  }],
  job: opts => (0, _scan.scan)(opts).pipe((0, _operators.map)(account => (_account.accountFormatters[opts.format] || _account.accountFormatters.default)(account)))
};
exports.default = _default;