'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.lazily = exports.default = exports.compose = void 0;
var alnico_1 = require('./alnico');
Object.defineProperty(exports, 'compose', {
  enumerable: true,
  get: function () {
    return alnico_1.compose;
  },
});
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return __importDefault(alnico_1).default;
  },
});
Object.defineProperty(exports, 'lazily', {
  enumerable: true,
  get: function () {
    return alnico_1.lazily;
  },
});
//# sourceMappingURL=index.js.map
