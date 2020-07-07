"use strict";

var _winston = _interopRequireDefault(require("winston"));

var _env = require("@ledgerhq/live-common/lib/env");

var _countervalues = require("@ledgerhq/live-common/lib/countervalues");

var _logs = require("@ledgerhq/logs");

var _nodejs = _interopRequireDefault(require("@ledgerhq/live-common/lib/libcore/platforms/nodejs"));

require("@ledgerhq/live-common/lib/load/tokens/ethereum/erc20");

require("@ledgerhq/live-common/lib/load/tokens/tron/trc10");

require("@ledgerhq/live-common/lib/load/tokens/tron/trc20");

var _cryptocurrencies = require("@ledgerhq/live-common/lib/data/cryptocurrencies");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-console */
(0, _countervalues.implementCountervalues)({
  getAPIBaseURL: () => window.LEDGER_CV_API,
  storeSelector: state => state.countervalues,
  pairsSelector: () => [],
  setExchangePairsAction: () => {}
});
(0, _cryptocurrencies.setSupportedCurrencies)(["bitcoin", "ethereum", "ripple", "bitcoin_cash", "litecoin", "dash", "ethereum_classic", "tezos", "qtum", "zcash", "bitcoin_gold", "stratis", "dogecoin", "digibyte", "komodo", "pivx", "zencash", "vertcoin", "peercoin", "viacoin", "stakenet", "stealthcoin", "decred", "bitcoin_testnet", "ethereum_ropsten", "tron", "stellar", "cosmos"]);

for (const k in process.env) (0, _env.setEnvUnsafe)(k, process.env[k]);

const {
  VERBOSE,
  VERBOSE_FILE
} = process.env;

const logger = _winston.default.createLogger({
  level: "debug",
  transports: []
});

const {
  format
} = _winston.default;
const {
  combine,
  json
} = format;
const winstonFormatJSON = json();
const winstonFormatConsole = combine( // eslint-disable-next-line no-unused-vars
format(({
  type,
  id,
  date,
  ...rest
}) => rest)(), format.colorize(), format.simple());
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};
const level = VERBOSE && VERBOSE in levels ? VERBOSE : "debug";

if (VERBOSE_FILE) {
  logger.add(new _winston.default.transports.File({
    format: winstonFormatJSON,
    filename: VERBOSE_FILE,
    level
  }));
}

if (VERBOSE && VERBOSE !== "json") {
  logger.add(new _winston.default.transports.Console({
    format: winstonFormatConsole,
    colorize: true,
    level
  }));
} else {
  logger.add(new _winston.default.transports.Console({
    format: winstonFormatJSON,
    silent: !VERBOSE,
    level
  }));
}

(0, _logs.listen)(log => {
  const {
    type
  } = log;
  let level = "info";

  if (type === "libcore-call" || type === "libcore-result") {
    level = "silly";
  } else if (type === "apdu" || type === "hw" || type === "speculos" || type.includes("debug") || type.startsWith("libcore")) {
    level = "debug";
  } else if (type.includes("warn")) {
    level = "warn";
  } else if (type.startsWith("network") || type.startsWith("socket")) {
    level = "http";
  } else if (type.includes("error")) {
    level = "error";
  }

  logger.log(level, log);
});
(0, _nodejs.default)({
  lib: () => require("@ledgerhq/ledger-core"),
  // eslint-disable-line global-require
  dbPath: process.env.LIBCORE_DB_PATH || "./dbdata"
});