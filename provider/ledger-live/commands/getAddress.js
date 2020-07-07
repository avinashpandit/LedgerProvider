"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _derivation = require("@ledgerhq/live-common/lib/derivation");

var _deviceAccess = require("@ledgerhq/live-common/lib/hw/deviceAccess");

var _getAddress = _interopRequireDefault(require("@ledgerhq/live-common/lib/hw/getAddress"));

var _scan = require("../scan");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  description: "Get an address with the device on specific derivations (advanced)",
  args: [_scan.currencyOpt, _scan.deviceOpt, {
    name: "path",
    type: String,
    desc: "HDD derivation path"
  }, {
    name: "derivationMode",
    type: String,
    desc: "derivationMode to use"
  }, {
    name: "verify",
    alias: "v",
    type: Boolean,
    desc: "also ask verification on device"
  }],
  job: arg => (0, _scan.inferCurrency)(arg).pipe((0, _operators.mergeMap)(currency => {
    if (!currency) {
      throw new Error("no currency provided");
    }

    if (!arg.path) {
      throw new Error("--path is required");
    }

    (0, _derivation.asDerivationMode)(arg.derivationMode);
    return (0, _deviceAccess.withDevice)(arg.device || "")(t => (0, _rxjs.from)((0, _getAddress.default)(t, {
      currency,
      path: arg.path,
      derivationMode: (0, _derivation.asDerivationMode)(arg.derivationMode || "")
    })));
  }))
};
exports.default = _default;