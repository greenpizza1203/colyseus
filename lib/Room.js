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
Object.defineProperty(exports, "__esModule", { value: true });
var notepack_io_1 = __importDefault(require("notepack.io"));
var schema_1 = require("@colyseus/schema");
var timer_1 = __importDefault(require("@gamestdio/timer"));
var events_1 = require("events");
var SchemaSerializer_1 = require("./serializer/SchemaSerializer");
var Protocol_1 = require("./Protocol");
var Utils_1 = require("./Utils");
var Debug_1 = require("./Debug");
var FossilDeltaSerializer_1 = require("./serializer/FossilDeltaSerializer");
var DEFAULT_PATCH_RATE = 1000 / 20; // 20fps (50ms)
var DEFAULT_SIMULATION_INTERVAL = 1000 / 60; // 60fps (16.66ms)
exports.DEFAULT_SEAT_RESERVATION_TIME = Number(process.env.COLYSEUS_SEAT_RESERVATION_TIME || 8);
var RoomInternalState;
(function (RoomInternalState) {
    RoomInternalState[RoomInternalState["CREATING"] = 0] = "CREATING";
    RoomInternalState[RoomInternalState["CREATED"] = 1] = "CREATED";
    RoomInternalState[RoomInternalState["DISCONNECTING"] = 2] = "DISCONNECTING";
})(RoomInternalState = exports.RoomInternalState || (exports.RoomInternalState = {}));
var Room = /** @class */ (function (_super) {
    __extends(Room, _super);
    function Room(presence) {
        var _this = _super.call(this) || this;
        _this.clock = new timer_1.default();
        _this.maxClients = Infinity;
        _this.patchRate = DEFAULT_PATCH_RATE;
        _this.autoDispose = true;
        _this.clients = [];
        /** @internal */
        _this._internalState = RoomInternalState.CREATING;
        // seat reservation & reconnection
        _this.seatReservationTime = exports.DEFAULT_SEAT_RESERVATION_TIME;
        _this.reservedSeats = {};
        _this.reservedSeatTimeouts = {};
        _this.reconnections = {};
        _this._serializer = new FossilDeltaSerializer_1.FossilDeltaSerializer();
        _this._afterNextPatchBroadcasts = [];
        _this._locked = false;
        _this._lockedExplicitly = false;
        _this._maxClientsReached = false;
        _this.presence = presence;
        _this.once('dispose', function () { return __awaiter(_this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._dispose()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        Debug_1.debugAndPrintError("onDispose error: " + (e_1 && e_1.message || e_1 || 'promise rejected'));
                        return [3 /*break*/, 3];
                    case 3:
                        this.emit('disconnect');
                        return [2 /*return*/];
                }
            });
        }); });
        _this.setPatchRate(_this.patchRate);
        return _this;
    }
    Object.defineProperty(Room.prototype, "locked", {
        get: function () {
            return this._locked;
        },
        enumerable: true,
        configurable: true
    });
    Room.prototype.onAuth = function (client, options, request) {
        return true;
    };
    Room.prototype.hasReachedMaxClients = function () {
        return (this.clients.length + Object.keys(this.reservedSeats).length) >= this.maxClients;
    };
    Room.prototype.setSeatReservationTime = function (seconds) {
        this.seatReservationTime = seconds;
        return this;
    };
    Room.prototype.hasReservedSeat = function (sessionId) {
        return this.reservedSeats[sessionId] !== undefined;
    };
    Room.prototype.setSimulationInterval = function (callback, delay) {
        var _this = this;
        if (delay === void 0) { delay = DEFAULT_SIMULATION_INTERVAL; }
        // clear previous interval in case called setSimulationInterval more than once
        if (this._simulationInterval) {
            clearInterval(this._simulationInterval);
        }
        this._simulationInterval = setInterval(function () {
            _this.clock.tick();
            callback(_this.clock.deltaTime);
        }, delay);
    };
    Room.prototype.setPatchRate = function (milliseconds) {
        var _this = this;
        // clear previous interval in case called setPatchRate more than once
        if (this._patchInterval) {
            clearInterval(this._patchInterval);
            this._patchInterval = undefined;
        }
        if (milliseconds !== null && milliseconds !== 0) {
            this._patchInterval = setInterval(function () {
                _this.broadcastPatch();
                _this.broadcastAfterPatch();
            }, milliseconds);
        }
    };
    Room.prototype.setState = function (newState) {
        this.clock.start();
        if ('_schema' in newState) {
            this._serializer = new SchemaSerializer_1.SchemaSerializer();
        }
        else {
            this._serializer = new FossilDeltaSerializer_1.FossilDeltaSerializer();
        }
        this._serializer.reset(newState);
        this.state = newState;
    };
    Room.prototype.setMetadata = function (meta) {
        if (!this.listing.metadata) {
            this.listing.metadata = meta;
        }
        else {
            for (var field in meta) {
                if (!meta.hasOwnProperty(field)) {
                    continue;
                }
                this.listing.metadata[field] = meta[field];
            }
        }
        if (this._internalState === RoomInternalState.CREATED) {
            this.listing.save();
        }
    };
    Room.prototype.setPrivate = function (bool) {
        if (bool === void 0) { bool = true; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.listing.private = bool;
                        if (!(this._internalState === RoomInternalState.CREATED)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.listing.save()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(Room.prototype, "metadata", {
        get: function () {
            return this.listing.metadata;
        },
        enumerable: true,
        configurable: true
    });
    Room.prototype.lock = function () {
        // rooms locked internally aren't explicit locks.
        this._lockedExplicitly = (arguments[0] === undefined);
        // skip if already locked.
        if (this._locked) {
            return;
        }
        this.emit('lock');
        this._locked = true;
        return this.listing.updateOne({
            $set: { locked: this._locked },
        });
    };
    Room.prototype.unlock = function () {
        // only internal usage passes arguments to this function.
        if (arguments[0] === undefined) {
            this._lockedExplicitly = false;
        }
        // skip if already locked
        if (!this._locked) {
            return;
        }
        this.emit('unlock');
        this._locked = false;
        return this.listing.updateOne({
            $set: { locked: this._locked },
        });
    };
    Room.prototype.send = function (client, message) {
        if (message instanceof schema_1.Schema) {
            Protocol_1.send.raw(client, __spreadArrays([
                Protocol_1.Protocol.ROOM_DATA_SCHEMA,
                message.constructor._typeid
            ], message.encodeAll()));
        }
        else {
            Protocol_1.send[Protocol_1.Protocol.ROOM_DATA](client, message);
        }
    };
    Room.prototype.broadcast = function (message, options) {
        if (options === void 0) { options = {}; }
        if (options.afterNextPatch) {
            delete options.afterNextPatch;
            this._afterNextPatchBroadcasts.push([message, options]);
            return true;
        }
        // no data given, try to broadcast patched state
        if (!message) {
            throw new Error('Room#broadcast: \'data\' is required to broadcast.');
        }
        if (message instanceof schema_1.Schema) {
            var typeId = message.constructor._typeid;
            var encodedMessage = Buffer.from(__spreadArrays([Protocol_1.Protocol.ROOM_DATA_SCHEMA, typeId], message.encodeAll()));
            var numClients = this.clients.length;
            while (numClients--) {
                var client = this.clients[numClients];
                if (options.except !== client) {
                    Protocol_1.send.raw(client, encodedMessage);
                }
            }
        }
        else {
            // encode message with msgpack
            var encodedMessage = (!(message instanceof Buffer))
                ? Buffer.from(__spreadArrays([Protocol_1.Protocol.ROOM_DATA], notepack_io_1.default.encode(message)))
                : message;
            var numClients = this.clients.length;
            while (numClients--) {
                var client = this.clients[numClients];
                if (options.except !== client) {
                    Protocol_1.send.raw(client, encodedMessage);
                }
            }
        }
        return true;
    };
    Room.prototype.disconnect = function () {
        var _this = this;
        this._internalState = RoomInternalState.DISCONNECTING;
        this.autoDispose = true;
        var delayedDisconnection = new Promise(function (resolve) {
            return _this.once('disconnect', function () { return resolve(); });
        });
        for (var _i = 0, _a = Object.values(this.reconnections); _i < _a.length; _i++) {
            var reconnection = _a[_i];
            reconnection.reject();
        }
        var numClients = this.clients.length;
        if (numClients > 0) {
            // prevent new clients to join while this room is disconnecting.
            this.lock();
            // clients may have `async onLeave`, room will be disposed after they all run
            while (numClients--) {
                this._forciblyCloseClient(this.clients[numClients], Protocol_1.Protocol.WS_CLOSE_CONSENTED);
            }
        }
        else {
            // no clients connected, dispose immediately.
            this.emit('dispose');
        }
        return delayedDisconnection;
    };
    Room.prototype['_onJoin'] = function (client, req) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, options, reconnection, _a, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sessionId = client.sessionId;
                        if (this.reservedSeatTimeouts[sessionId]) {
                            clearTimeout(this.reservedSeatTimeouts[sessionId]);
                            delete this.reservedSeatTimeouts[sessionId];
                        }
                        // clear auto-dispose timeout.
                        if (this._autoDisposeTimeout) {
                            clearTimeout(this._autoDisposeTimeout);
                            this._autoDisposeTimeout = undefined;
                        }
                        options = this.reservedSeats[sessionId];
                        delete this.reservedSeats[sessionId];
                        // bind clean-up callback when client connection closes
                        client.once('close', this._onLeave.bind(this, client));
                        client.state = Protocol_1.ClientState.JOINING;
                        client._enqueuedMessages = [];
                        this.clients.push(client);
                        reconnection = this.reconnections[sessionId];
                        if (!reconnection) return [3 /*break*/, 1];
                        reconnection.resolve(client);
                        return [3 /*break*/, 7];
                    case 1:
                        _b.trys.push([1, 5, 6, 7]);
                        _a = client;
                        return [4 /*yield*/, this.onAuth(client, options, req)];
                    case 2:
                        _a.auth = _b.sent();
                        if (!client.auth) {
                            throw new Error('onAuth failed.');
                        }
                        if (!this.onJoin) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.onJoin(client, options, client.auth)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_2 = _b.sent();
                        Utils_1.spliceOne(this.clients, this.clients.indexOf(client));
                        throw e_2;
                    case 6:
                        // remove seat reservation
                        delete this.reservedSeats[sessionId];
                        return [7 /*endfinally*/];
                    case 7:
                        // emit 'join' to room handler
                        this.emit('join', client);
                        // allow client to send messages after onJoin has succeeded.
                        client.on('message', this._onMessage.bind(this, client));
                        // confirm room id that matches the room name requested to join
                        Protocol_1.send[Protocol_1.Protocol.JOIN_ROOM](client, this._serializer.id, this._serializer.handshake && this._serializer.handshake());
                        return [2 /*return*/];
                }
            });
        });
    };
    Room.prototype.sendState = function (client) {
        Protocol_1.send[Protocol_1.Protocol.ROOM_STATE](client, this._serializer.getFullState(client));
    };
    Room.prototype.broadcastPatch = function () {
        if (!this._simulationInterval) {
            this.clock.tick();
        }
        if (!this.state) {
            Debug_1.debugPatch('trying to broadcast null state. you should call #setState');
            return false;
        }
        return this._serializer.applyPatches(this.clients, this.state);
    };
    Room.prototype.broadcastAfterPatch = function () {
        var length = this._afterNextPatchBroadcasts.length;
        if (length > 0) {
            for (var i = 0; i < length; i++) {
                this.broadcast.apply(this, this._afterNextPatchBroadcasts[i]);
            }
            // new messages may have been added in the meantime,
            // let's splice the ones that have been processed
            this._afterNextPatchBroadcasts.splice(0, length);
        }
    };
    Room.prototype.allowReconnection = function (previousClient, seconds) {
        var _this = this;
        if (seconds === void 0) { seconds = Infinity; }
        if (this._internalState === RoomInternalState.DISCONNECTING) {
            this._disposeIfEmpty(); // gracefully shutting down
            throw new Error('disconnecting');
        }
        var sessionId = previousClient.sessionId;
        this._reserveSeat(sessionId, true, seconds, true);
        // keep reconnection reference in case the user reconnects into this room.
        var reconnection = new Utils_1.Deferred();
        this.reconnections[sessionId] = reconnection;
        if (seconds !== Infinity) {
            // expire seat reservation after timeout
            this.reservedSeatTimeouts[sessionId] = setTimeout(function () {
                return reconnection.reject(false);
            }, seconds * 1000);
        }
        var cleanup = function () {
            delete _this.reservedSeats[sessionId];
            delete _this.reconnections[sessionId];
            delete _this.reservedSeatTimeouts[sessionId];
        };
        reconnection.
            then(function (newClient) {
            newClient.auth = previousClient.auth;
            previousClient.state = Protocol_1.ClientState.RECONNECTED;
            clearTimeout(_this.reservedSeatTimeouts[sessionId]);
            cleanup();
        }).
            catch(function () {
            cleanup();
            _this._disposeIfEmpty();
        });
        return reconnection;
    };
    Room.prototype._reserveSeat = function (sessionId, joinOptions, seconds, allowReconnection) {
        if (joinOptions === void 0) { joinOptions = true; }
        if (seconds === void 0) { seconds = this.seatReservationTime; }
        if (allowReconnection === void 0) { allowReconnection = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!allowReconnection && this.hasReachedMaxClients()) {
                            return [2 /*return*/, false];
                        }
                        this.reservedSeats[sessionId] = joinOptions;
                        if (!!allowReconnection) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._incrementClientCount()];
                    case 1:
                        _a.sent();
                        this.reservedSeatTimeouts[sessionId] = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        delete this.reservedSeats[sessionId];
                                        delete this.reservedSeatTimeouts[sessionId];
                                        return [4 /*yield*/, this._decrementClientCount()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, seconds * 1000);
                        this.resetAutoDisposeTimeout(seconds);
                        _a.label = 2;
                    case 2: return [2 /*return*/, true];
                }
            });
        });
    };
    Room.prototype.resetAutoDisposeTimeout = function (timeoutInSeconds) {
        var _this = this;
        clearTimeout(this._autoDisposeTimeout);
        if (!this.autoDispose) {
            return;
        }
        this._autoDisposeTimeout = setTimeout(function () {
            _this._autoDisposeTimeout = undefined;
            _this._disposeIfEmpty();
        }, timeoutInSeconds * 1000);
    };
    Room.prototype._disposeIfEmpty = function () {
        var willDispose = (this.autoDispose &&
            this._autoDisposeTimeout === undefined &&
            this.clients.length === 0 &&
            Object.keys(this.reservedSeats).length === 0);
        if (willDispose) {
            this.emit('dispose');
        }
        return willDispose;
    };
    Room.prototype._dispose = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userReturnData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.onDispose) {
                            userReturnData = this.onDispose();
                        }
                        if (this._patchInterval) {
                            clearInterval(this._patchInterval);
                            this._patchInterval = undefined;
                        }
                        if (this._simulationInterval) {
                            clearInterval(this._simulationInterval);
                            this._simulationInterval = undefined;
                        }
                        if (this._autoDisposeTimeout) {
                            clearInterval(this._autoDisposeTimeout);
                            this._autoDisposeTimeout = undefined;
                        }
                        // clear all timeouts/intervals + force to stop ticking
                        this.clock.clear();
                        this.clock.stop();
                        return [4 /*yield*/, (userReturnData || Promise.resolve())];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Room.prototype._onMessage = function (client, message) {
        message = Protocol_1.decode(message);
        if (!message) {
            Debug_1.debugAndPrintError(this.roomName + " (" + this.roomId + "), couldn't decode message: " + message);
            return;
        }
        if (message[0] === Protocol_1.Protocol.ROOM_DATA) {
            this.onMessage(client, message[1]);
        }
        else if (message[0] === Protocol_1.Protocol.JOIN_ROOM) {
            // join room has been acknowledged by the client
            client.state = Protocol_1.ClientState.JOINED;
            // send current state when new client joins the room
            if (this.state) {
                this.sendState(client);
            }
            // dequeue messages sent before client has joined effectively (on user-defined `onJoin`)
            if (client._enqueuedMessages.length > 0) {
                client._enqueuedMessages.forEach(function (bytes) { return Protocol_1.send.raw(client, bytes); });
            }
            delete client._enqueuedMessages;
        }
        else if (message[0] === Protocol_1.Protocol.LEAVE_ROOM) {
            this._forciblyCloseClient(client, Protocol_1.Protocol.WS_CLOSE_CONSENTED);
        }
        else {
            this.onMessage(client, message);
        }
    };
    Room.prototype._forciblyCloseClient = function (client, closeCode) {
        // stop receiving messages from this client
        client.removeAllListeners('message');
        // prevent "onLeave" from being called twice if player asks to leave
        var closeListeners = client.listeners('close');
        if (closeListeners.length >= 2) {
            client.removeListener('close', closeListeners[1]);
        }
        // only effectively close connection when "onLeave" is fulfilled
        this._onLeave(client, closeCode).then(function () { return client.close(Protocol_1.Protocol.WS_CLOSE_NORMAL); });
    };
    Room.prototype._onLeave = function (client, code) {
        return __awaiter(this, void 0, void 0, function () {
            var success, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        success = Utils_1.spliceOne(this.clients, this.clients.indexOf(client));
                        if (!success) return [3 /*break*/, 5];
                        if (!this.onLeave) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.onLeave(client, (code === Protocol_1.Protocol.WS_CLOSE_CONSENTED))];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        Debug_1.debugAndPrintError("onLeave error: " + (e_3 && e_3.message || e_3 || 'promise rejected'));
                        return [3 /*break*/, 4];
                    case 4:
                        if (client.state !== Protocol_1.ClientState.RECONNECTED) {
                            this.emit('leave', client);
                        }
                        _a.label = 5;
                    case 5:
                        // skip next checks if client has reconnected successfully (through `allowReconnection()`)
                        if (client.state === Protocol_1.ClientState.RECONNECTED) {
                            return [2 /*return*/];
                        }
                        // try to dispose immediatelly if client reconnection isn't set up.
                        return [4 /*yield*/, this._decrementClientCount()];
                    case 6:
                        // try to dispose immediatelly if client reconnection isn't set up.
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Room.prototype._incrementClientCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // lock automatically when maxClients is reached
                        if (!this._locked && this.hasReachedMaxClients()) {
                            this._maxClientsReached = true;
                            this.lock.call(this, true);
                        }
                        return [4 /*yield*/, this.listing.updateOne({
                                $inc: { clients: 1 },
                                $set: { locked: this._locked },
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Room.prototype._decrementClientCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var willDispose;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        willDispose = this._disposeIfEmpty();
                        if (!!willDispose) return [3 /*break*/, 2];
                        if (this._maxClientsReached && !this._lockedExplicitly) {
                            this._maxClientsReached = false;
                            this.unlock.call(this, true);
                        }
                        // update room listing cache
                        return [4 /*yield*/, this.listing.updateOne({
                                $inc: { clients: -1 },
                                $set: { locked: this._locked },
                            })];
                    case 1:
                        // update room listing cache
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return Room;
}(events_1.EventEmitter));
exports.Room = Room;
