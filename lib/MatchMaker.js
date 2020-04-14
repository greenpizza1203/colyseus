"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var Protocol_1 = require("./Protocol");
var IPC_1 = require("./IPC");
var Utils_1 = require("./Utils");
var RegisteredHandler_1 = require("./matchmaker/RegisteredHandler");
var Room_1 = require("./Room");
var LocalPresence_1 = require("./presence/LocalPresence");
var Debug_1 = require("./Debug");
var MatchMakeError_1 = require("./errors/MatchMakeError");
exports.MatchMakeError = MatchMakeError_1.MatchMakeError;
var SeatReservationError_1 = require("./errors/SeatReservationError");
var LocalDriver_1 = require("./matchmaker/drivers/LocalDriver");
var handlers = {};
var rooms = {};
var isGracefullyShuttingDown;
function setup(_presence, _driver, _processId) {
    exports.presence = _presence || new LocalPresence_1.LocalPresence();
    exports.driver = _driver || new LocalDriver_1.LocalDriver();
    exports.processId = _processId;
    isGracefullyShuttingDown = false;
    /**
     * Subscribe to remote `handleCreateRoom` calls.
     */
    IPC_1.subscribeIPC(exports.presence, exports.processId, getProcessChannel(), function (_, args) {
        return handleCreateRoom.apply(undefined, args);
    });
    exports.presence.hset(getRoomCountKey(), exports.processId, '0');
}
exports.setup = setup;
/**
 * Join or create into a room and return seat reservation
 */
function joinOrCreate(roomName, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Utils_1.retry(function () { return __awaiter(_this, void 0, void 0, function () {
                        var room;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, findOneRoomAvailable(roomName, options)];
                                case 1:
                                    room = _a.sent();
                                    if (!!room) return [3 /*break*/, 3];
                                    return [4 /*yield*/, createRoom(roomName, options)];
                                case 2:
                                    room = _a.sent();
                                    _a.label = 3;
                                case 3: return [4 /*yield*/, reserveSeatFor(room, options)];
                                case 4: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }, 5, [SeatReservationError_1.SeatReservationError])];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.joinOrCreate = joinOrCreate;
/**
 * Create a room and return seat reservation
 */
function create(roomName, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var room;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createRoom(roomName, options)];
                case 1:
                    room = _a.sent();
                    return [2 /*return*/, reserveSeatFor(room, options)];
            }
        });
    });
}
exports.create = create;
/**
 * Join a room and return seat reservation
 */
function join(roomName, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Utils_1.retry(function () { return __awaiter(_this, void 0, void 0, function () {
                        var room;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, findOneRoomAvailable(roomName, options)];
                                case 1:
                                    room = _a.sent();
                                    if (!room) {
                                        throw new MatchMakeError_1.MatchMakeError("no rooms found with provided criteria", Protocol_1.Protocol.ERR_MATCHMAKE_INVALID_CRITERIA);
                                    }
                                    return [2 /*return*/, reserveSeatFor(room, options)];
                            }
                        });
                    }); })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.join = join;
/**
 * Join a room by id and return seat reservation
 */
function joinById(roomId, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var room, rejoinSessionId, hasReservedSeat;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.driver.findOne({ roomId: roomId })];
                case 1:
                    room = _a.sent();
                    if (!room) return [3 /*break*/, 5];
                    rejoinSessionId = options.sessionId;
                    if (!rejoinSessionId) return [3 /*break*/, 3];
                    return [4 /*yield*/, remoteRoomCall(room.roomId, 'hasReservedSeat', [rejoinSessionId])];
                case 2:
                    hasReservedSeat = _a.sent();
                    if (hasReservedSeat) {
                        return [2 /*return*/, { room: room, sessionId: rejoinSessionId }];
                    }
                    else {
                        throw new MatchMakeError_1.MatchMakeError("session expired", Protocol_1.Protocol.ERR_MATCHMAKE_EXPIRED);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    if (!room.locked) {
                        return [2 /*return*/, reserveSeatFor(room, options)];
                    }
                    else {
                        throw new MatchMakeError_1.MatchMakeError("room \"" + roomId + "\" is locked", Protocol_1.Protocol.ERR_MATCHMAKE_INVALID_ROOM_ID);
                    }
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5: throw new MatchMakeError_1.MatchMakeError("room \"" + roomId + "\" not found", Protocol_1.Protocol.ERR_MATCHMAKE_INVALID_ROOM_ID);
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.joinById = joinById;
/**
 * Perform a query for all cached rooms
 */
function query(conditions) {
    if (conditions === void 0) { conditions = {}; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.driver.find(conditions)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.query = query;
/**
 * Find for a public and unlocked room available
 */
function findOneRoomAvailable(roomName, options) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, awaitRoomAvailable(roomName, function () { return __awaiter(_this, void 0, void 0, function () {
                        var handler, roomQuery;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    handler = handlers[roomName];
                                    if (!handler) {
                                        throw new MatchMakeError_1.MatchMakeError("\"" + roomName + "\" not defined", Protocol_1.Protocol.ERR_MATCHMAKE_NO_HANDLER);
                                    }
                                    roomQuery = exports.driver.findOne(__assign({ locked: false, name: roomName, private: false }, handler.getFilterOptions(options)));
                                    if (handler.sortOptions) {
                                        roomQuery.sort(handler.sortOptions);
                                    }
                                    return [4 /*yield*/, roomQuery];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.findOneRoomAvailable = findOneRoomAvailable;
/**
 * Call a method or return a property on a remote room.
 */
function remoteRoomCall(roomId, method, args, rejectionTimeout) {
    if (rejectionTimeout === void 0) { rejectionTimeout = Utils_1.REMOTE_ROOM_SHORT_TIMEOUT; }
    return __awaiter(this, void 0, void 0, function () {
        var room, e_1, request, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    room = rooms[roomId];
                    if (!!room) return [3 /*break*/, 5];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, IPC_1.requestFromIPC(exports.presence, getRoomChannel(roomId), method, args)];
                case 2: return [2 /*return*/, _b.sent()];
                case 3:
                    e_1 = _b.sent();
                    request = "" + method + (args && ' with args ' + JSON.stringify(args) || '');
                    throw new MatchMakeError_1.MatchMakeError("remote room (" + roomId + ") timed out, requesting \"" + request + "\". (" + rejectionTimeout + "ms exceeded)", Protocol_1.Protocol.ERR_MATCHMAKE_UNHANDLED);
                case 4: return [3 /*break*/, 9];
                case 5:
                    if (!(!args && typeof (room[method]) !== 'function')) return [3 /*break*/, 6];
                    _a = room[method];
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, room[method].apply(room, args)];
                case 7:
                    _a = (_b.sent());
                    _b.label = 8;
                case 8: return [2 /*return*/, _a];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.remoteRoomCall = remoteRoomCall;
function defineRoomType(name, klass, defaultOptions) {
    var registeredHandler = new RegisteredHandler_1.RegisteredHandler(klass, defaultOptions);
    handlers[name] = registeredHandler;
    cleanupStaleRooms(name);
    return registeredHandler;
}
exports.defineRoomType = defineRoomType;
function removeRoomType(name) {
    delete handlers[name];
    cleanupStaleRooms(name);
}
exports.removeRoomType = removeRoomType;
function hasHandler(name) {
    return handlers[name] !== undefined;
}
exports.hasHandler = hasHandler;
/**
 * Create a room
 */
function createRoom(roomName, clientOptions) {
    return __awaiter(this, void 0, void 0, function () {
        var roomsSpawnedByProcessId, processIdWithFewerRooms, room, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.presence.hgetall(getRoomCountKey())];
                case 1:
                    roomsSpawnedByProcessId = _a.sent();
                    processIdWithFewerRooms = (Object.keys(roomsSpawnedByProcessId).sort(function (p1, p2) {
                        return (Number(roomsSpawnedByProcessId[p1]) > Number(roomsSpawnedByProcessId[p2]))
                            ? 1
                            : -1;
                    })[0]) || exports.processId;
                    if (!(processIdWithFewerRooms === exports.processId)) return [3 /*break*/, 3];
                    return [4 /*yield*/, handleCreateRoom(roomName, clientOptions)];
                case 2: 
                // create the room on this process!
                return [2 /*return*/, _a.sent()];
                case 3:
                    room = void 0;
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 8]);
                    return [4 /*yield*/, IPC_1.requestFromIPC(exports.presence, getProcessChannel(processIdWithFewerRooms), undefined, [roomName, clientOptions], Utils_1.REMOTE_ROOM_SHORT_TIMEOUT)];
                case 5:
                    room = _a.sent();
                    return [3 /*break*/, 8];
                case 6:
                    e_2 = _a.sent();
                    // if other process failed to respond, create the room on this process
                    Debug_1.debugAndPrintError(e_2);
                    return [4 /*yield*/, handleCreateRoom(roomName, clientOptions)];
                case 7:
                    room = _a.sent();
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/, room];
            }
        });
    });
}
exports.createRoom = createRoom;
function handleCreateRoom(roomName, clientOptions) {
    return __awaiter(this, void 0, void 0, function () {
        var registeredHandler, room, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    registeredHandler = handlers[roomName];
                    if (!registeredHandler) {
                        throw new MatchMakeError_1.MatchMakeError("\"" + roomName + "\" not defined", Protocol_1.Protocol.ERR_MATCHMAKE_NO_HANDLER);
                    }
                    room = new registeredHandler.klass();
                    // set room public attributes
                    room.roomId = Utils_1.generateId();
                    room.roomName = roomName;
                    room.presence = exports.presence;
                    // create a RoomCache reference.
                    room.listing = exports.driver.createInstance(__assign({ name: roomName, processId: exports.processId }, registeredHandler.getFilterOptions(clientOptions)));
                    if (!room.onCreate) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, room.onCreate(Utils_1.merge({}, clientOptions, registeredHandler.options))];
                case 2:
                    _a.sent();
                    // increment amount of rooms this process is handling
                    exports.presence.hincrby(getRoomCountKey(), exports.processId, 1);
                    return [3 /*break*/, 4];
                case 3:
                    e_3 = _a.sent();
                    Debug_1.debugAndPrintError(e_3);
                    throw new MatchMakeError_1.MatchMakeError(e_3.message);
                case 4:
                    room._internalState = Room_1.RoomInternalState.CREATED;
                    room.listing.roomId = room.roomId;
                    room.listing.maxClients = room.maxClients;
                    // imediatelly ask client to join the room
                    Debug_1.debugMatchMaking('spawning \'%s\', roomId: %s, processId: %s', roomName, room.roomId, exports.processId);
                    room.on('lock', lockRoom.bind(this, roomName, room));
                    room.on('unlock', unlockRoom.bind(this, roomName, room));
                    room.on('join', onClientJoinRoom.bind(this, room));
                    room.on('leave', onClientLeaveRoom.bind(this, room));
                    room.once('dispose', disposeRoom.bind(this, roomName, room));
                    room.once('disconnect', function () { return room.removeAllListeners(); });
                    // room always start unlocked
                    return [4 /*yield*/, createRoomReferences(room, true)];
                case 5:
                    // room always start unlocked
                    _a.sent();
                    return [4 /*yield*/, room.listing.save()];
                case 6:
                    _a.sent();
                    registeredHandler.emit('create', room);
                    return [2 /*return*/, room.listing];
            }
        });
    });
}
function getRoomById(roomId) {
    return rooms[roomId];
}
exports.getRoomById = getRoomById;
function gracefullyShutdown() {
    if (isGracefullyShuttingDown) {
        return Promise.reject(false);
    }
    isGracefullyShuttingDown = true;
    Debug_1.debugMatchMaking(exports.processId + " is shutting down!");
    // remove processId from room count key
    exports.presence.hdel(getRoomCountKey(), exports.processId);
    // unsubscribe from process id channel
    exports.presence.unsubscribe(getProcessChannel());
    var promises = [];
    for (var roomId in rooms) {
        if (!rooms.hasOwnProperty(roomId)) {
            continue;
        }
        promises.push(rooms[roomId].disconnect());
    }
    return Promise.all(promises);
}
exports.gracefullyShutdown = gracefullyShutdown;
/**
 * Reserve a seat for a client in a room
 */
function reserveSeatFor(room, options) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionId, successfulSeatReservation, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sessionId = Utils_1.generateId();
                    Debug_1.debugMatchMaking('reserving seat. sessionId: \'%s\', roomId: \'%s\', processId: \'%s\'', sessionId, room.roomId, exports.processId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, remoteRoomCall(room.roomId, '_reserveSeat', [sessionId, options])];
                case 2:
                    successfulSeatReservation = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_4 = _a.sent();
                    Debug_1.debugMatchMaking(e_4);
                    successfulSeatReservation = false;
                    return [3 /*break*/, 4];
                case 4:
                    if (!successfulSeatReservation) {
                        throw new SeatReservationError_1.SeatReservationError(room.roomId + " is already full.");
                    }
                    return [2 /*return*/, { room: room, sessionId: sessionId }];
            }
        });
    });
}
exports.reserveSeatFor = reserveSeatFor;
function cleanupStaleRooms(roomName) {
    return __awaiter(this, void 0, void 0, function () {
        var cachedRooms;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.driver.find({ name: roomName }, { _id: 1 })];
                case 1:
                    cachedRooms = _a.sent();
                    // remove connecting counts
                    return [4 /*yield*/, exports.presence.del(getHandlerConcurrencyKey(roomName))];
                case 2:
                    // remove connecting counts
                    _a.sent();
                    return [4 /*yield*/, Promise.all(cachedRooms.map(function (room) { return __awaiter(_this, void 0, void 0, function () {
                            var e_5;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        // use hardcoded short timeout for cleaning up stale rooms.
                                        return [4 /*yield*/, remoteRoomCall(room.roomId, 'roomId')];
                                    case 1:
                                        // use hardcoded short timeout for cleaning up stale rooms.
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_5 = _a.sent();
                                        Debug_1.debugMatchMaking("cleaning up stale room '" + roomName + "', roomId: " + room.roomId);
                                        room.remove();
                                        clearRoomReferences({ roomId: room.roomId, roomName: roomName });
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function createRoomReferences(room, init) {
    if (init === void 0) { init = false; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rooms[room.roomId] = room;
                    if (!init) return [3 /*break*/, 2];
                    return [4 /*yield*/, IPC_1.subscribeIPC(exports.presence, exports.processId, getRoomChannel(room.roomId), function (method, args) {
                            return (!args && typeof (room[method]) !== 'function')
                                ? room[method]
                                : room[method].apply(room, args);
                        })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, true];
            }
        });
    });
}
function clearRoomReferences(room) {
    // clear list of connecting clients.
    exports.presence.del(room.roomId);
}
function awaitRoomAvailable(roomToJoin, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var concurrencyKey, concurrency, concurrencyTimeout;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                concurrencyKey = getHandlerConcurrencyKey(roomToJoin);
                                return [4 /*yield*/, exports.presence.incr(concurrencyKey)];
                            case 1:
                                concurrency = (_a.sent()) - 1;
                                concurrencyTimeout = Math.min(concurrency * 100, Utils_1.REMOTE_ROOM_SHORT_TIMEOUT);
                                if (concurrency > 0) {
                                    Debug_1.debugMatchMaking('receiving %d concurrent requests for joining \'%s\' (waiting %d ms)', concurrency, roomToJoin, concurrencyTimeout);
                                }
                                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var result, e_6;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, 3, 5]);
                                                return [4 /*yield*/, callback()];
                                            case 1:
                                                result = _a.sent();
                                                resolve(result);
                                                return [3 /*break*/, 5];
                                            case 2:
                                                e_6 = _a.sent();
                                                reject(e_6);
                                                return [3 /*break*/, 5];
                                            case 3: return [4 /*yield*/, exports.presence.decr(concurrencyKey)];
                                            case 4:
                                                _a.sent();
                                                return [7 /*endfinally*/];
                                            case 5: return [2 /*return*/];
                                        }
                                    });
                                }); }, concurrencyTimeout);
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
function getRoomChannel(roomId) {
    return "$" + roomId;
}
function getHandlerConcurrencyKey(name) {
    return "c:" + name;
}
function getProcessChannel(id) {
    if (id === void 0) { id = exports.processId; }
    return "p:" + id;
}
function getRoomCountKey() {
    return 'roomcount';
}
function onClientJoinRoom(room, client) {
    handlers[room.roomName].emit('join', room, client);
}
function onClientLeaveRoom(room, client) {
    handlers[room.roomName].emit('leave', room, client);
}
function lockRoom(roomName, room) {
    clearRoomReferences(room);
    // emit public event on registered handler
    handlers[room.roomName].emit('lock', room);
}
function unlockRoom(roomName, room) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createRoomReferences(room)];
                case 1:
                    if (_a.sent()) {
                        // emit public event on registered handler
                        handlers[room.roomName].emit('unlock', room);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function disposeRoom(roomName, room) {
    Debug_1.debugMatchMaking('disposing \'%s\' (%s) on processId \'%s\'', roomName, room.roomId, exports.processId);
    // decrease amount of rooms this process is handling
    if (!isGracefullyShuttingDown) {
        exports.presence.hincrby(getRoomCountKey(), exports.processId, -1);
    }
    // remove from room listing
    room.listing.remove();
    // emit disposal on registered session handler
    handlers[roomName].emit('dispose', room);
    // remove concurrency key
    exports.presence.del(getHandlerConcurrencyKey(roomName));
    // remove from available rooms
    clearRoomReferences(room);
    // unsubscribe from remote connections
    exports.presence.unsubscribe(getRoomChannel(room.roomId));
    // remove actual room reference
    delete rooms[room.roomId];
}
