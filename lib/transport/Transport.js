"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Transport = /** @class */ (function () {
    function Transport() {
    }
    Transport.prototype.address = function () { return this.server.address(); };
    return Transport;
}());
exports.Transport = Transport;
var TCPTransport_1 = require("./TCPTransport");
exports.TCPTransport = TCPTransport_1.TCPTransport;
var WebSocketTransport_1 = require("./WebSocketTransport");
exports.WebSocketTransport = WebSocketTransport_1.WebSocketTransport;
