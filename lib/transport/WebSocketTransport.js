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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var querystring_1 = __importDefault(require("querystring"));
var url_1 = __importDefault(require("url"));
var __1 = require("..");
var matchMaker = __importStar(require("../MatchMaker"));
var Protocol_1 = require("../Protocol");
var Transport_1 = require("./Transport");
var Debug_1 = require("./../Debug");
function noop() { }
function heartbeat() { this.pingCount = 0; }
var WebSocketTransport = /** @class */ (function (_super) {
    __extends(WebSocketTransport, _super);
    function WebSocketTransport(options, engine) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        // disable per-message deflate
        options.perMessageDeflate = false;
        if (options.pingTimeout !== undefined) {
            console.warn('"pingTimeout" is deprecated. Use "pingInterval" instead.');
            options.pingInterval = options.pingTimeout;
        }
        if (options.pingCountMax !== undefined) {
            console.warn('"pingCountMax" is deprecated. Use "pingMaxRetries" instead.');
            options.pingMaxRetries = options.pingCountMax;
        }
        _this.pingIntervalMS = (options.pingInterval !== undefined)
            ? options.pingInterval
            : 1500;
        _this.pingMaxRetries = (options.pingMaxRetries !== undefined)
            ? options.pingMaxRetries
            : 2;
        _this.wss = new engine(options);
        _this.wss.on('connection', _this.onConnection);
        _this.server = options.server;
        if (_this.pingIntervalMS > 0 && _this.pingMaxRetries > 0) {
            _this.autoTerminateUnresponsiveClients(_this.pingIntervalMS, _this.pingMaxRetries);
        }
        return _this;
    }
    WebSocketTransport.prototype.listen = function (port, hostname, backlog, listeningListener) {
        this.server.listen(port, hostname, backlog, listeningListener);
        return this;
    };
    WebSocketTransport.prototype.shutdown = function () {
        clearInterval(this.pingInterval);
        this.wss.close();
        this.server.close();
    };
    WebSocketTransport.prototype.autoTerminateUnresponsiveClients = function (pingInterval, pingMaxRetries) {
        var _this = this;
        // interval to detect broken connections
        this.pingInterval = setInterval(function () {
            _this.wss.clients.forEach(function (client) {
                //
                // if client hasn't responded after the interval, terminate its connection.
                //
                if (client.pingCount >= pingMaxRetries) {
                    Debug_1.debugConnection("terminating unresponsive client " + client.sessionId);
                    return client.terminate();
                }
                client.pingCount++;
                client.ping(noop);
            });
        }, pingInterval);
    };
    WebSocketTransport.prototype.onConnection = function (client, req) {
        return __awaiter(this, void 0, void 0, function () {
            var upgradeReq, parsedURL, sessionId, processAndRoomId, roomId, room, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // prevent server crashes if a single client had unexpected error
                        client.on('error', function (err) { return Debug_1.debugAndPrintError(err.message + '\n' + err.stack); });
                        client.on('pong', heartbeat);
                        upgradeReq = req || client.upgradeReq;
                        parsedURL = url_1.default.parse(upgradeReq.url);
                        sessionId = querystring_1.default.parse(parsedURL.query).sessionId;
                        processAndRoomId = parsedURL.pathname.match(/\/[a-zA-Z0-9_\-]+\/([a-zA-Z0-9_\-]+)$/);
                        roomId = processAndRoomId && processAndRoomId[1];
                        room = matchMaker.getRoomById(roomId);
                        // set client id
                        client.pingCount = 0;
                        // set client options
                        client.id = sessionId;
                        client.sessionId = sessionId;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        if (!room || !room.hasReservedSeat(sessionId)) {
                            throw new Error('seat reservation expired.');
                        }
                        return [4 /*yield*/, room._onJoin(client, upgradeReq)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        Debug_1.debugAndPrintError(e_1);
                        Protocol_1.send[__1.Protocol.JOIN_ERROR](client, (e_1 && e_1.message) || '');
                        client.close(__1.Protocol.WS_CLOSE_WITH_ERROR);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return WebSocketTransport;
}(Transport_1.Transport));
exports.WebSocketTransport = WebSocketTransport;
