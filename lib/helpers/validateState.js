'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = validateState;
function validateState(state) {
  if (state && (typeof state === 'undefined' ? 'undefined' : _typeof(state)) === 'object') return state;
  return {};
}
module.exports = exports['default'];