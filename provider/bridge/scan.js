"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scan = scan;
exports.inferCurrency = exports.inferManagerApp = exports.getCurrencyByKeyword = exports.scanCommonOpts = exports.currencyOpt = exports.deviceOpt = void 0;

var _bignumber = require("bignumber.js");

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _env = require("@ledgerhq/live-common/lib/env");

var _account = require("@ledgerhq/live-common/lib/account");

var _derivation = require("@ledgerhq/live-common/lib/derivation");

var _bridge = require("@ledgerhq/live-common/lib/bridge");

var _currencies = require("@ledgerhq/live-common/lib/currencies");

var _getAppAndVersion = _interopRequireDefault(require("@ledgerhq/live-common/lib/hw/getAppAndVersion"));

var _deviceAccess = require("@ledgerhq/live-common/lib/hw/deviceAccess");

var _promise = require("@ledgerhq/live-common/lib/promise");

var _stream = require("ledger-live/lib/stream");

var _helpers = require("@ledgerhq/live-common/lib/account/helpers");

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const deviceOpt = {
  name: "device",
  type: String,
  descOpt: "usb path",
  desc: "provide a specific HID path of a device"
};
exports.deviceOpt = deviceOpt;
const currencyOpt = {
  name: "currency",
  alias: "c",
  type: String,
  desc: "Currency name or ticker. If not provided, it will be inferred from the device."
};
exports.currencyOpt = currencyOpt;
const scanCommonOpts = [deviceOpt, {
  name: "xpub",
  type: String,
  desc: "use an xpub (alternatively to --device)",
  multiple: true
}, {
  name: "file",
  type: String,
  typeDesc: "filename",
  desc: "use a JSON account file or '-' for stdin (alternatively to --device)"
}, {
  name: "appjsonFile",
  type: String,
  typeDesc: "filename",
  desc: "use a desktop app.json (alternatively to --device)"
}, currencyOpt, {
  name: "scheme",
  alias: "s",
  type: String,
  desc: "if provided, filter the derivation path that are scanned by a given sceme. Providing '' empty string will only use the default standard derivation scheme."
}, {
  name: "index",
  alias: "i",
  type: Number,
  desc: "select the account by index"
}, {
  name: "length",
  alias: "l",
  type: Number,
  desc: "set the number of accounts after the index. Defaults to 1 if index was provided, Infinity otherwise."
}, {
  name: "paginateOperations",
  type: Number,
  desc: "if defined, will paginate operations"
}];
exports.scanCommonOpts = scanCommonOpts;

const getCurrencyByKeyword = keyword => {
  const r = (0, _currencies.findCryptoCurrency)(c => {
    const search = keyword.replace(/ /, "").toLowerCase();
    return c.id === search || c.name.replace(/ /, "").toLowerCase() === search || c.managerAppName && c.managerAppName.replace(/ /, "").toLowerCase() === search || c.ticker.toLowerCase() === search;
  });

  if (!r) {
    throw new Error("currency '" + keyword + "' not found");
  }

  return r;
};

exports.getCurrencyByKeyword = getCurrencyByKeyword;

const inferManagerApp = keyword => {
  try {
    const currency = getCurrencyByKeyword(keyword);
    if (!currency || !currency.managerAppName) return keyword;
    return currency.managerAppName;
  } catch (e) {
    return keyword;
  }
};

exports.inferManagerApp = inferManagerApp;
const implTypePerFamily = {
  tron: "js"
};

const inferCurrency = ({
  device,
  currency,
  file,
  xpub
}) => {
  if (currency) {
    return (0, _rxjs.defer)(() => (0, _rxjs.of)(getCurrencyByKeyword(currency)));
  }

  if (file || xpub) {
    return (0, _rxjs.of)(undefined);
  }

  return (0, _deviceAccess.withDevice)(device || "")(t => (0, _rxjs.from)((0, _getAppAndVersion.default)(t).then(r => getCurrencyByKeyword(r.name), () => undefined).then(r => (0, _promise.delay)(500).then(() => r))));
};

exports.inferCurrency = inferCurrency;

function scan(arg) {
  const {
    device,
    xpub: xpubArray,
    file,
    appjsonFile,
    scheme,
    index,
    length,
    paginateOperations
  } = arg;
  const syncConfig = {
    paginationConfig: {}
  };

  if (typeof paginateOperations === "number") {
    syncConfig.paginationConfig.operations = paginateOperations;
  }

  if (typeof appjsonFile === "string") {
    const appjsondata = appjsonFile ? JSON.parse(_fs.default.readFileSync(appjsonFile, "utf-8")) : {
      data: {
        accounts: []
      }
    };

    if (typeof appjsondata.data.accounts === "string") {
      return (0, _rxjs.throwError)(new Error("encrypted ledger live data is not supported"));
    }

    return (0, _rxjs.from)(appjsondata.data.accounts.map(a => (0, _account.fromAccountRaw)(a.data))).pipe((0, _operators.skip)(index || 0), (0, _operators.take)(length === undefined ? index !== undefined ? 1 : Infinity : length));
  }

  if (typeof file === "string") {
    return (0, _stream.jsonFromFile)(file).pipe((0, _operators.map)(_account.fromAccountRaw), (0, _operators.concatMap)(account => (0, _bridge.getAccountBridge)(account, null).sync(account, syncConfig).pipe((0, _operators.reduce)((a, f) => f(a), account))));
  }

  return inferCurrency(arg).pipe((0, _operators.mergeMap)(cur => {
    if (!cur) throw new Error("--currency is required");

    if (xpubArray) {
      const derivationMode = scheme || "";
      return (0, _rxjs.from)(xpubArray.map(xpub => {
        const account = {
          type: "Account",
          name: cur.name + " " + (derivationMode || "legacy") + " " + (0, _helpers.shortAddressPreview)(xpub),
          xpub,
          seedIdentifier: xpub,
          starred: true,
          id: (0, _account.encodeAccountId)({
            type: (0, _env.getEnv)("BRIDGE_FORCE_IMPLEMENTATION") || implTypePerFamily[cur.family] || "libcore",
            version: "1",
            currencyId: cur.id,
            xpubOrAddress: xpub,
            derivationMode: (0, _derivation.asDerivationMode)(derivationMode || "")
          }),
          derivationMode: (0, _derivation.asDerivationMode)(derivationMode),
          currency: cur,
          unit: cur.units[0],
          index: index,
          freshAddress: xpub,
          // HACK for JS impl force mode that would only support address version
          freshAddressPath: "",
          freshAddresses: [],
          lastSyncDate: new Date(0),
          blockHeight: 0,
          balance: new _bignumber.BigNumber(0),
          spendableBalance: new _bignumber.BigNumber(0),
          operationsCount: 0,
          operations: [],
          pendingOperations: []
        };
        return account;
      })).pipe((0, _operators.concatMap)(account => (0, _bridge.getAccountBridge)(account, null).sync(account, syncConfig).pipe((0, _operators.reduce)((a, f) => f(a), account))));
    }

    return (0, _bridge.getCurrencyBridge)(cur).scanAccounts({
      currency: cur,
      deviceId: device || "",
      scheme: scheme && (0, _derivation.asDerivationMode)(scheme),
      syncConfig
    }).pipe((0, _operators.filter)(e => e.type === "discovered"), (0, _operators.map)(e => e.account));
  }), (0, _operators.skip)(0), (0, _operators.take)(length === undefined ? index !== undefined ? 1 : Infinity : length));
}