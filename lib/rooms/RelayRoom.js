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
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("@colyseus/schema");
var Room_1 = require("../Room");
/**
 * Create another context to avoid these types from being in the user's global `Context`
 */
var context = new schema_1.Context();
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Player;
}(schema_1.Schema));
schema_1.defineTypes(Player, {
    connected: 'boolean',
    sessionId: 'string',
}, context);
var State = /** @class */ (function (_super) {
    __extends(State, _super);
    function State() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.players = new schema_1.MapSchema();
        return _this;
    }
    return State;
}(schema_1.Schema));
schema_1.defineTypes(State, {
    players: { map: Player },
}, context);
/**
 * client.joinOrCreate("relayroom", {
 *   maxClients: 10,
 *   allowReconnectionTime: 20
 * });
 */
var RelayRoom = /** @class */ (function (_super) {
    __extends(RelayRoom, _super);
    function RelayRoom() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.allowReconnectionTime = 0;
        return _this;
    }
    RelayRoom.prototype.onCreate = function (options) {
        this.setState(new State());
        if (options.maxClients) {
            this.maxClients = options.maxClients;
        }
        if (options.allowReconnectionTime) {
            this.allowReconnectionTime = Math.min(options.allowReconnectionTime, 40);
        }
        if (options.metadata) {
            this.setMetadata(options.metadata);
        }
    };
    RelayRoom.prototype.onJoin = function (client, options) {
        var player = new Player();
        player.connected = true;
        player.sessionId = client.sessionId;
        this.state.players[client.sessionId] = player;
    };
    RelayRoom.prototype.onMessage = function (client, message) {
        /**
         * append `sessionId` into the message for broadcast.
         */
        if (typeof (message) === 'object' && !Array.isArray(message)) {
            message.sessionId = client.sessionId;
        }
        this.broadcast(message, { except: client });
    };
    RelayRoom.prototype.onLeave = function (client, consented) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.allowReconnectionTime > 0)) return [3 /*break*/, 4];
                        this.state.players[client.sessionId].connected = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        if (consented) {
                            throw new Error('consented leave');
                        }
                        return [4 /*yield*/, this.allowReconnection(client, this.allowReconnectionTime)];
                    case 2:
                        _a.sent();
                        this.state.players[client.sessionId].connected = true;
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        delete this.state.players[client.sessionId];
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return RelayRoom;
}(Room_1.Room));
exports.RelayRoom = RelayRoom;
