"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsonFromFile = exports.apdusFromFile = exports.fromFile = exports.fromNodeStream = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const fromNodeStream = stream => new _rxjs.Observable(o => {
  const endHandler = () => o.complete();

  const errorHandler = e => o.error(e);

  const dataHandler = data => o.next(data);

  stream.addListener("end", endHandler);
  stream.addListener("error", errorHandler);
  stream.addListener("data", dataHandler);
  return () => {
    stream.removeListener("end", endHandler);
    stream.removeListener("error", errorHandler);
    stream.removeListener("data", dataHandler);
  };
});

exports.fromNodeStream = fromNodeStream;

const fromFile = file => fromNodeStream(file === "-" ? process.stdin : _fs.default.createReadStream(file));

exports.fromFile = fromFile;

const apdusFromFile = file => fromFile(file).pipe((0, _operators.map)(b => b.toString()), (0, _operators.concatMap)(str => str.replace(/ /g, "").split("\n") // we supports => <= recorded files but will just clear out the <= and =>
.filter(line => !line.startsWith("<=")) // we remove the responses
.map(line => line.startsWith("=>") ? line.slice(2) : line) // we just keep the sending
.filter(Boolean)), (0, _operators.map)(line => Buffer.from(line, "hex")));

exports.apdusFromFile = apdusFromFile;

const jsonFromFile = file => _rxjs.Observable.create(o => {
  let acc = "";
  let count = 0;
  return fromFile(file).subscribe({
    error: e => o.error(e),
    complete: () => o.complete(),
    next: chunk => {
      let lastIndex = 0;
      const str = chunk.toString();

      for (let i = 0; i < str.length; i++) {
        switch (str[i]) {
          case "[":
          case "{":
            count++;
            break;

          case "]":
          case "}":
            count--;

            if (count === 0) {
              acc += str.slice(lastIndex, i + 1);
              lastIndex = i + 1;

              try {
                o.next(JSON.parse(acc));
              } catch (e) {
                o.error(e);
              }

              acc = "";
            }

            break;

          default:
        }
      }

      acc += str.slice(lastIndex);
    }
  });
});

exports.jsonFromFile = jsonFromFile;