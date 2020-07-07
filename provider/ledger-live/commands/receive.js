"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _deviceAccess = require("@ledgerhq/live-common/lib/hw/deviceAccess");

var _getAddress = _interopRequireDefault(require("@ledgerhq/live-common/lib/hw/getAddress"));

var _scan = require("../scan");

var _qr = require("../qr");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  description: "Receive crypto-assets (verify on device)",
  args: [..._scan.scanCommonOpts, {
    name: "qr",
    type: Boolean,
    desc: "also display a QR Code"
  }],
  job: opts => (0, _scan.scan)(opts).pipe((0, _operators.concatMap)(account => (0, _rxjs.concat)((0, _rxjs.of)(account.freshAddress), opts.qr ? (0, _qr.asQR)(account.freshAddress) : (0, _rxjs.empty)(), (0, _deviceAccess.withDevice)(opts.device || "")(t => (0, _rxjs.from)((0, _getAddress.default)(t, {
    currency: account.currency,
    derivationMode: account.derivationMode,
    path: account.freshAddressPath,
    verify: true
  }))).pipe((0, _operators.ignoreElements)()))))
};
exports.default = _default;