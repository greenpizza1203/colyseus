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
var http_1 = __importDefault(require("http"));
var net_1 = __importDefault(require("net"));
var ws_1 = __importDefault(require("ws"));
var Debug_1 = require("./Debug");
var matchMaker = __importStar(require("./MatchMaker"));
var Transport_1 = require("./transport/Transport");
var Utils_1 = require("./Utils");
var _1 = require(".");
var discovery_1 = require("./discovery");
var LocalPresence_1 = require("./presence/LocalPresence");
var MatchMakeError_1 = require("./errors/MatchMakeError");
var Protocol_1 = require("./Protocol");
var Server = /** @class */ (function () {
    function Server(options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this.processId = _1.generateId();
        this.route = '/matchmake';
        this.exposedMethods = ['joinOrCreate', 'create', 'join', 'joinById'];
        this.allowedRoomNameChars = /([a-zA-Z_\-0-9]+)/gi;
        this.onShutdownCallback = function () { return Promise.resolve(); };
        var _a = options.gracefullyShutdown, gracefullyShutdown = _a === void 0 ? true : _a;
        this.presence = options.presence || new LocalPresence_1.LocalPresence();
        // setup matchmaker
        matchMaker.setup(this.presence, options.driver, this.processId);
        // "presence" option is not used from now on
        delete options.presence;
        this.attach(options);
        if (gracefullyShutdown) {
            Utils_1.registerGracefulShutdown(function (err) { return _this.gracefullyShutdown(true, err); });
        }
    }
    Server.prototype.attach = function (options) {
        var _this = this;
        if (!options.server) {
            options.server = http_1.default.createServer();
        }
        options.server.once('listening', function () { return _this.registerProcessForDiscovery(); });
        this.attachMatchMakingRoutes(options.server);
        var engine = options.engine || ws_1.default.Server;
        delete options.engine;
        this.transport = (engine === net_1.default.Server)
            ? new Transport_1.TCPTransport(options)
            : new Transport_1.WebSocketTransport(options, engine);
    };
    Server.prototype.listen = function (port, hostname, backlog, listeningListener) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.transport.listen(port, hostname, backlog, function (err) {
                            if (listeningListener) {
                                listeningListener(err);
                            }
                            if (err) {
                                reject();
                            }
                            else {
                                resolve();
                            }
                        });
                    })];
            });
        });
    };
    Server.prototype.registerProcessForDiscovery = function () {
        // register node for proxy/service discovery
        discovery_1.registerNode(this.presence, {
            port: this.transport.address().port,
            processId: this.processId,
        });
    };
    Server.prototype.define = function (name, handler, defaultOptions) {
        return matchMaker.defineRoomType(name, handler, defaultOptions);
    };
    Server.prototype.gracefullyShutdown = function (exit, err) {
        if (exit === void 0) { exit = true; }
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, discovery_1.unregisterNode(this.presence, {
                            port: this.transport.address().port,
                            processId: this.processId,
                        })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, 6, 7]);
                        return [4 /*yield*/, matchMaker.gracefullyShutdown()];
                    case 3:
                        _a.sent();
                        this.transport.shutdown();
                        return [4 /*yield*/, this.onShutdownCallback()];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        e_1 = _a.sent();
                        Debug_1.debugAndPrintError("error during shutdown: " + e_1);
                        return [3 /*break*/, 7];
                    case 6:
                        if (exit) {
                            process.exit(err ? 1 : 0);
                        }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Server.prototype.onShutdown = function (callback) {
        this.onShutdownCallback = callback;
    };
    Server.prototype.attachMatchMakingRoutes = function (server) {
        var _this = this;
        var listeners = server.listeners('request').slice(0);
        server.removeAllListeners('request');
        server.on('request', function (req, res) {
            if (req.url.indexOf('/matchmake') !== -1) {
                Debug_1.debugMatchMaking('received matchmake request: %s', req.url);
                _this.handleMatchMakeRequest(req, res);
            }
            else {
                for (var i = 0, l = listeners.length; i < l; i++) {
                    listeners[i].call(server, req, res);
                }
            }
        });
    };
    Server.prototype.handleMatchMakeRequest = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var headers, matchedParams, method_1, name_1, data_1, matchedParams, roomName, conditions, _a, _b, _c, _d;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        headers = {
                            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
                            'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Max-Age': 2592000,
                        };
                        if (!(req.method === 'OPTIONS')) return [3 /*break*/, 1];
                        res.writeHead(204, headers);
                        res.end();
                        return [3 /*break*/, 4];
                    case 1:
                        if (!(req.method === 'POST')) return [3 /*break*/, 2];
                        matchedParams = req.url.match(this.allowedRoomNameChars);
                        method_1 = matchedParams[matchedParams.length - 2];
                        name_1 = matchedParams[matchedParams.length - 1];
                        data_1 = [];
                        req.on('data', function (chunk) { return data_1.push(chunk); });
                        req.on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                            var body, response, e_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        headers['Content-Type'] = 'application/json';
                                        res.writeHead(200, headers);
                                        body = JSON.parse(Buffer.concat(data_1).toString());
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        if (this.exposedMethods.indexOf(method_1) === -1) {
                                            throw new MatchMakeError_1.MatchMakeError("invalid method \"" + method_1 + "\"");
                                        }
                                        return [4 /*yield*/, matchMaker[method_1](name_1, body)];
                                    case 2:
                                        response = _a.sent();
                                        res.write(JSON.stringify(response));
                                        return [3 /*break*/, 4];
                                    case 3:
                                        e_2 = _a.sent();
                                        res.write(JSON.stringify({
                                            code: e_2.code || Protocol_1.Protocol.ERR_MATCHMAKE_UNHANDLED,
                                            error: e_2.message,
                                        }));
                                        return [3 /*break*/, 4];
                                    case 4:
                                        res.end();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(req.method === 'GET')) return [3 /*break*/, 4];
                        matchedParams = req.url.match(this.allowedRoomNameChars);
                        roomName = matchedParams[matchedParams.length - 1];
                        conditions = {
                            locked: false,
                            private: false,
                        };
                        // TODO: improve me, "matchmake" room names aren't allowed this way.
                        if (roomName !== 'matchmake') {
                            conditions.name = roomName;
                        }
                        headers['Content-Type'] = 'application/json';
                        res.writeHead(200, headers);
                        _b = (_a = res).write;
                        _d = (_c = JSON).stringify;
                        return [4 /*yield*/, matchMaker.query(conditions)];
                    case 3:
                        _b.apply(_a, [_d.apply(_c, [_e.sent()])]);
                        res.end();
                        _e.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Server;
}());
exports.Server = Server;
