"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inferTransactions = inferTransactions;
exports.inferTransactionsOpts = void 0;

require("lodash.product");

var _lodash2 = require("lodash");

var _uniqBy = _interopRequireDefault(require("lodash/uniqBy"));

var _shuffle = _interopRequireDefault(require("lodash/shuffle"));

var _flatMap = _interopRequireDefault(require("lodash/flatMap"));

var _bignumber = require("bignumber.js");

var _cliTransaction = _interopRequireDefault(require("@ledgerhq/live-common/lib/generated/cli-transaction"));

var _bridge = require("@ledgerhq/live-common/lib/bridge");

var _account = require("@ledgerhq/live-common/lib/account");

var _currencies = require("@ledgerhq/live-common/lib/currencies");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const inferAmount = (account, str) => {
  const currency = (0, _account.getAccountCurrency)(account);
  const {
    units
  } = currency;

  if (str.endsWith("%")) {
    return account.balance.times(0.01 * parseFloat(str.replace("%", "")));
  }

  const lowerCase = str.toLowerCase();

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const code = unit.code.toLowerCase();

    if (lowerCase.includes(code)) {
      return (0, _currencies.parseCurrencyUnit)(unit, lowerCase.replace(code, ""));
    }
  }

  return (0, _currencies.parseCurrencyUnit)(units[0], str);
};

const inferTransactionsOpts = (0, _uniqBy.default)([{
  name: "self-transaction",
  type: Boolean,
  desc: "Pre-fill the transaction for the account to send to itself"
}, {
  name: "use-all-amount",
  type: Boolean,
  desc: "Send MAX of the account balance"
}, {
  name: "recipient",
  type: String,
  desc: "the address to send funds to",
  multiple: true
}, {
  name: "amount",
  type: String,
  desc: "how much to send in the main currency unit"
}, {
  name: "shuffle",
  type: Boolean,
  desc: "if using multiple token or recipient, order will be randomized"
}].concat((0, _flatMap.default)(Object.values(_cliTransaction.default), m => m && m.options || [])), "name");
exports.inferTransactionsOpts = inferTransactionsOpts;

async function inferTransactions(mainAccount, opts) {
  const bridge = (0, _bridge.getAccountBridge)(mainAccount, null);
  const specific = _cliTransaction.default[mainAccount.currency.family];

  const inferAccounts = specific && specific.inferAccounts || ((account, _opts) => [account]);

  const inferTransactions = specific && specific.inferTransactions || ((transactions, _opts, _r) => transactions);

  let all = await Promise.all((0, _lodash2.product)(inferAccounts(mainAccount, opts), opts.recipient || [opts["self-transaction"] ? mainAccount.freshAddress : ""]).map(async ([account, recipient]) => {
    let transaction = bridge.createTransaction(mainAccount);
    transaction.recipient = recipient;
    transaction.useAllAmount = !!opts["use-all-amount"];
    transaction.amount = transaction.useAllAmount ? (0, _bignumber.BigNumber)(0) : inferAmount(account, opts.amount || "0.001");
    return {
      account,
      transaction,
      mainAccount
    };
  }));

  if (opts.shuffle) {
    all = (0, _shuffle.default)(all);
  }

  const transactions = await Promise.all(inferTransactions(all, opts, {
    inferAmount
  }).map(transaction => bridge.prepareTransaction(mainAccount, transaction)));
  return transactions;
}