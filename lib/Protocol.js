"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var notepack_io_1 = __importDefault(require("notepack.io"));
var ws_1 = __importDefault(require("ws"));
var Debug_1 = require("./Debug");
// Colyseus protocol codes range between 0~100
var Protocol;
(function (Protocol) {
    // Room-related (10~19)
    Protocol[Protocol["JOIN_ROOM"] = 10] = "JOIN_ROOM";
    Protocol[Protocol["JOIN_ERROR"] = 11] = "JOIN_ERROR";
    Protocol[Protocol["LEAVE_ROOM"] = 12] = "LEAVE_ROOM";
    Protocol[Protocol["ROOM_DATA"] = 13] = "ROOM_DATA";
    Protocol[Protocol["ROOM_STATE"] = 14] = "ROOM_STATE";
    Protocol[Protocol["ROOM_STATE_PATCH"] = 15] = "ROOM_STATE_PATCH";
    Protocol[Protocol["ROOM_DATA_SCHEMA"] = 16] = "ROOM_DATA_SCHEMA";
    // WebSocket close codes (https://github.com/Luka967/websocket-close-codes)
    Protocol[Protocol["WS_CLOSE_NORMAL"] = 1000] = "WS_CLOSE_NORMAL";
    // WebSocket error codes
    Protocol[Protocol["WS_CLOSE_CONSENTED"] = 4000] = "WS_CLOSE_CONSENTED";
    Protocol[Protocol["WS_CLOSE_WITH_ERROR"] = 4002] = "WS_CLOSE_WITH_ERROR";
    Protocol[Protocol["WS_SERVER_DISCONNECT"] = 4201] = "WS_SERVER_DISCONNECT";
    Protocol[Protocol["WS_TOO_MANY_CLIENTS"] = 4202] = "WS_TOO_MANY_CLIENTS";
    // MatchMaking Error Codes
    Protocol[Protocol["ERR_MATCHMAKE_NO_HANDLER"] = 4210] = "ERR_MATCHMAKE_NO_HANDLER";
    Protocol[Protocol["ERR_MATCHMAKE_INVALID_CRITERIA"] = 4211] = "ERR_MATCHMAKE_INVALID_CRITERIA";
    Protocol[Protocol["ERR_MATCHMAKE_INVALID_ROOM_ID"] = 4212] = "ERR_MATCHMAKE_INVALID_ROOM_ID";
    Protocol[Protocol["ERR_MATCHMAKE_UNHANDLED"] = 4213] = "ERR_MATCHMAKE_UNHANDLED";
    Protocol[Protocol["ERR_MATCHMAKE_EXPIRED"] = 4214] = "ERR_MATCHMAKE_EXPIRED";
})(Protocol = exports.Protocol || (exports.Protocol = {}));
// Inter-process communication protocol
var IpcProtocol;
(function (IpcProtocol) {
    IpcProtocol[IpcProtocol["SUCCESS"] = 0] = "SUCCESS";
    IpcProtocol[IpcProtocol["ERROR"] = 1] = "ERROR";
    IpcProtocol[IpcProtocol["TIMEOUT"] = 2] = "TIMEOUT";
})(IpcProtocol = exports.IpcProtocol || (exports.IpcProtocol = {}));
var ClientState;
(function (ClientState) {
    ClientState[ClientState["JOINING"] = 0] = "JOINING";
    ClientState[ClientState["JOINED"] = 1] = "JOINED";
    ClientState[ClientState["RECONNECTED"] = 2] = "RECONNECTED";
})(ClientState = exports.ClientState || (exports.ClientState = {}));
function decode(message) {
    try {
        message = notepack_io_1.default.decode(Buffer.from(message));
    }
    catch (e) {
        Debug_1.debugAndPrintError("message couldn't be decoded: " + message + "\n" + e.stack);
        return;
    }
    return message;
}
exports.decode = decode;
exports.send = (_a = {
        raw: function (client, bytes) {
            if (client.readyState !== ws_1.default.OPEN) {
                return;
            }
            if (client.state === ClientState.JOINING) {
                // sending messages during `onJoin`.
                // - the client-side cannot register "onMessage" callbacks at this point.
                // - enqueue the messages to be send after JOIN_ROOM message has been sent
                client._enqueuedMessages.push(bytes);
                return;
            }
            client.send(bytes, { binary: true });
        }
    },
    _a[Protocol.JOIN_ERROR] = function (client, message) {
        if (client.readyState !== ws_1.default.OPEN) {
            return;
        }
        var buff = Buffer.allocUnsafe(1 + utf8Length(message));
        buff.writeUInt8(Protocol.JOIN_ERROR, 0);
        utf8Write(buff, 1, message);
        client.send(buff, { binary: true });
    },
    _a[Protocol.JOIN_ROOM] = function (client, serializerId, handshake) { return __awaiter(void 0, void 0, void 0, function () {
        var offset, serializerIdLength, handshakeLength, buff, i, l;
        return __generator(this, function (_a) {
            if (client.readyState !== ws_1.default.OPEN) {
                return [2 /*return*/];
            }
            offset = 0;
            serializerIdLength = utf8Length(serializerId);
            handshakeLength = (handshake) ? handshake.length : 0;
            buff = Buffer.allocUnsafe(1 + serializerIdLength + handshakeLength);
            buff.writeUInt8(Protocol.JOIN_ROOM, offset++);
            utf8Write(buff, offset, serializerId);
            offset += serializerIdLength;
            if (handshake) {
                for (i = 0, l = handshake.length; i < l; i++) {
                    buff.writeUInt8(handshake[i], offset++);
                }
            }
            client.send(buff, { binary: true });
            return [2 /*return*/];
        });
    }); },
    _a[Protocol.ROOM_STATE] = function (client, bytes) {
        exports.send.raw(client, __spreadArrays([Protocol.ROOM_STATE], bytes));
    },
    // [Protocol.ROOM_STATE_PATCH]: (client: Client, bytes: number[]) => {
    //   if (
    //     client.state === ClientState.JOINING &&
    //     client.readyState !== WebSocket.OPEN
    //   ) {
    //     return;
    //   }
    //   console.log({ bytes });
    //   client.send(Buffer.alloc(1, Protocol.ROOM_STATE_PATCH), { binary: true });
    //   client.send(bytes, { binary: true });
    // },
    /**
     * TODO: refactor me. Move this to `SchemaSerializer` / `FossilDeltaSerializer`
     */
    _a[Protocol.ROOM_DATA] = function (client, message, encode) {
        if (encode === void 0) { encode = true; }
        exports.send.raw(client, __spreadArrays([Protocol.ROOM_DATA], (encode && notepack_io_1.default.encode(message) || message)));
    },
    _a);
function utf8Write(buff, offset, str) {
    if (str === void 0) { str = ''; }
    buff[offset++] = utf8Length(str) - 1;
    var c = 0;
    for (var i = 0, l = str.length; i < l; i++) {
        c = str.charCodeAt(i);
        if (c < 0x80) {
            buff[offset++] = c;
        }
        else if (c < 0x800) {
            buff[offset++] = 0xc0 | (c >> 6);
            buff[offset++] = 0x80 | (c & 0x3f);
        }
        else if (c < 0xd800 || c >= 0xe000) {
            buff[offset++] = 0xe0 | (c >> 12);
            buff[offset++] = 0x80 | (c >> 6) & 0x3f;
            buff[offset++] = 0x80 | (c & 0x3f);
        }
        else {
            i++;
            c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
            buff[offset++] = 0xf0 | (c >> 18);
            buff[offset++] = 0x80 | (c >> 12) & 0x3f;
            buff[offset++] = 0x80 | (c >> 6) & 0x3f;
            buff[offset++] = 0x80 | (c & 0x3f);
        }
    }
}
exports.utf8Write = utf8Write;
// Faster for short strings than Buffer.byteLength
function utf8Length(str) {
    if (str === void 0) { str = ''; }
    var c = 0;
    var length = 0;
    for (var i = 0, l = str.length; i < l; i++) {
        c = str.charCodeAt(i);
        if (c < 0x80) {
            length += 1;
        }
        else if (c < 0x800) {
            length += 2;
        }
        else if (c < 0xd800 || c >= 0xe000) {
            length += 3;
        }
        else {
            i++;
            length += 4;
        }
    }
    return length + 1;
}
exports.utf8Length = utf8Length;
