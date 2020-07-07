"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _operators = require("rxjs/operators");

var _deviceAccess = require("@ledgerhq/live-common/lib/hw/deviceAccess");

var _scan = require("../scan");

var _stream = require("../stream");

var _default = {
  description: "Low level exchange with the device. Send APDUs from stdin.",
  args: [_scan.deviceOpt, {
    name: "file",
    alias: "f",
    type: String,
    typeDesc: "filename",
    desc: "A file can also be provided. By default stdin is used."
  }],
  job: ({
    device,
    file
  }) => (0, _deviceAccess.withDevice)(device || "")(t => (0, _stream.apdusFromFile)(file || "-").pipe((0, _operators.concatMap)(apdu => t.exchange(apdu)))).pipe((0, _operators.map)(res => res.toString("hex")))
};
exports.default = _default;