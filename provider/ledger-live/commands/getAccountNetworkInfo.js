"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _getAccountNetworkInfo = require("@ledgerhq/live-common/lib/libcore/getAccountNetworkInfo");

var _scan = require("../scan");

const getAccountNetworkInfoFormatters = {
  json: e => JSON.stringify(e)
};
var _default = {
  description: "Get the currency network info for accounts",
  args: [..._scan.scanCommonOpts, {
    name: "format",
    alias: "f",
    type: String,
    typeDesc: Object.keys(getAccountNetworkInfoFormatters).join(" | "),
    desc: "how to display the data"
  }],
  job: opts => (0, _scan.scan)(opts).pipe((0, _operators.mergeMap)(account => (0, _rxjs.from)((0, _getAccountNetworkInfo.getAccountNetworkInfo)(account))), (0, _operators.map)(e => {
    const f = getAccountNetworkInfoFormatters[opts.format || "json"];

    if (!f) {
      throw new Error("getAccountNetworkInfo: no such formatter '" + opts.format + "'");
    }

    return f(e);
  }))
};
exports.default = _default;