"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  closeAllDevices: true
};
exports.closeAllDevices = closeAllDevices;

var _liveCommonSetupBase = require("./live-common-setup-base");

Object.keys(_liveCommonSetupBase).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _liveCommonSetupBase[key];
    }
  });
});

var _react = _interopRequireDefault(require("react"));

var _reactRedux = require("react-redux");

var _hwTransport = _interopRequireDefault(require("@ledgerhq/hw-transport"));

var _errors = require("@ledgerhq/errors");

var _logs = require("@ledgerhq/logs");

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _hwTransportHttp = _interopRequireDefault(require("@ledgerhq/hw-transport-http"));

var _hw = require("@ledgerhq/live-common/lib/hw");

var _promise = require("@ledgerhq/live-common/lib/promise");

var _sanityChecks = require("@ledgerhq/live-common/lib/sanityChecks");

var _nodejs = _interopRequireDefault(require("@ledgerhq/live-common/lib/libcore/platforms/nodejs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _sanityChecks.checkLibs)({
  NotEnoughBalance: _errors.NotEnoughBalance,
  React: _react.default,
  log: _logs.log,
  Transport: _hwTransport.default,
  connect: _reactRedux.connect
});
(0, _nodejs.default)({
  lib: () => require("@ledgerhq/ledger-core"),
  // eslint-disable-line global-require
  dbPath: process.env.LIBCORE_DB_PATH || "./dbdata"
});

if (process.env.DEVICE_PROXY_URL) {
  const Tr = (0, _hwTransportHttp.default)(process.env.DEVICE_PROXY_URL.split("|"));
  (0, _hw.registerTransportModule)({
    id: "http",
    open: () => (0, _promise.retry)(() => Tr.create(3000, 5000), {
      context: "open-http-proxy"
    }),
    disconnect: () => Promise.resolve()
  });
}


const cacheBle = {};

if (!process.env.CI) {
  
  const {
    default: TransportNodeHid // eslint-disable-next-line global-require

  } = require("@ledgerhq/hw-transport-node-hid");

  (0, _hw.registerTransportModule)({
    id: "hid",
    open: devicePath => (0, _promise.retry)(() => TransportNodeHid.open(devicePath), {
      context: "open-hid"
    }),
    discovery: _rxjs.Observable.create(TransportNodeHid.listen).pipe((0, _operators.map)(e => ({
      type: e.type,
      id: e.device.path,
      name: e.device.deviceName || ""
    }))),
    disconnect: () => Promise.resolve()
  });
}

function closeAllDevices() {
  Object.keys(cacheBle).forEach(_hw.disconnect);
}