"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Protocol_1 = require("../Protocol");
var MatchMakeError = /** @class */ (function (_super) {
    __extends(MatchMakeError, _super);
    function MatchMakeError(message, code) {
        if (code === void 0) { code = Protocol_1.Protocol.ERR_MATCHMAKE_UNHANDLED; }
        var _this = _super.call(this, message) || this;
        _this.code = code;
        return _this;
    }
    return MatchMakeError;
}(Error));
exports.MatchMakeError = MatchMakeError;
