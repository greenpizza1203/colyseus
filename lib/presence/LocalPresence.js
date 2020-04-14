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
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var Utils_1 = require("../Utils");
var LocalPresence = /** @class */ (function () {
    function LocalPresence() {
        this.channels = new events_1.EventEmitter();
        this.data = {};
        this.hash = {};
        this.keys = {};
        this.listenersByTopic = {};
        this.timeouts = {};
    }
    LocalPresence.prototype.subscribe = function (topic, callback) {
        if (!this.listenersByTopic[topic]) {
            this.listenersByTopic[topic] = [];
        }
        this.listenersByTopic[topic].push(callback);
        this.channels.on(topic, callback);
        return this;
    };
    LocalPresence.prototype.unsubscribe = function (topic, callback) {
        var _this = this;
        if (callback) {
            var idx = this.listenersByTopic[topic].indexOf(callback);
            if (idx !== -1) {
                this.listenersByTopic[topic].splice(idx, 1);
                this.channels.removeListener(topic, callback);
            }
        }
        else if (this.listenersByTopic[topic]) {
            this.listenersByTopic[topic].forEach(function (cb) { return _this.channels.removeListener(topic, cb); });
            delete this.listenersByTopic[topic];
        }
        return this;
    };
    LocalPresence.prototype.publish = function (topic, data) {
        this.channels.emit(topic, data);
        return this;
    };
    LocalPresence.prototype.exists = function (roomId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.channels.listenerCount(roomId) > 0];
            });
        });
    };
    LocalPresence.prototype.setex = function (key, value, seconds) {
        var _this = this;
        // ensure previous timeout is clear before setting another one.
        if (this.timeouts[key]) {
            clearTimeout(this.timeouts[key]);
        }
        this.keys[key] = value;
        this.timeouts[key] = setTimeout(function () {
            delete _this.keys[key];
            delete _this.timeouts[key];
        }, seconds * 1000);
    };
    LocalPresence.prototype.get = function (key) {
        return this.keys[key];
    };
    LocalPresence.prototype.del = function (key) {
        delete this.keys[key];
        delete this.data[key];
        delete this.hash[key];
    };
    LocalPresence.prototype.sadd = function (key, value) {
        if (!this.data[key]) {
            this.data[key] = [];
        }
        if (this.data[key].indexOf(value) === -1) {
            this.data[key].push(value);
        }
    };
    LocalPresence.prototype.smembers = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.data[key] || []];
            });
        });
    };
    LocalPresence.prototype.sismember = function (key, field) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.data[key] && this.data[key].includes(field) ? 1 : 0];
            });
        });
    };
    LocalPresence.prototype.srem = function (key, value) {
        if (this.data[key]) {
            Utils_1.spliceOne(this.data[key], this.data[key].indexOf(value));
        }
    };
    LocalPresence.prototype.scard = function (key) {
        return (this.data[key] || []).length;
    };
    LocalPresence.prototype.sinter = function () {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var intersection, i, l;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        intersection = {};
                        i = 0, l = keys.length;
                        _a.label = 1;
                    case 1:
                        if (!(i < l)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.smembers(keys[i])];
                    case 2:
                        (_a.sent()).forEach(function (member) {
                            if (!intersection[member]) {
                                intersection[member] = 0;
                            }
                            intersection[member]++;
                        });
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, Object.keys(intersection).reduce(function (prev, curr) {
                            if (intersection[curr] > 1) {
                                prev.push(curr);
                            }
                            return prev;
                        }, [])];
                }
            });
        });
    };
    LocalPresence.prototype.hset = function (key, field, value) {
        if (!this.hash[key]) {
            this.hash[key] = {};
        }
        this.hash[key][field] = value;
    };
    LocalPresence.prototype.hincrby = function (key, field, value) {
        if (!this.hash[key]) {
            this.hash[key] = {};
        }
        var previousValue = Number(this.hash[key][field] || '0');
        this.hash[key][field] = (previousValue + value).toString();
    };
    LocalPresence.prototype.hget = function (key, field) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.hash[key] && this.hash[key][field]];
            });
        });
    };
    LocalPresence.prototype.hgetall = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.hash[key] || {}];
            });
        });
    };
    LocalPresence.prototype.hdel = function (key, field) {
        if (this.hash[key]) {
            delete this.hash[key][field];
        }
    };
    LocalPresence.prototype.hlen = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.hash[key] && Object.keys(this.hash[key]).length || 0];
            });
        });
    };
    LocalPresence.prototype.incr = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.keys[key]) {
                    this.keys[key] = 0;
                }
                this.keys[key]++;
                return [2 /*return*/, this.keys[key]];
            });
        });
    };
    LocalPresence.prototype.decr = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.keys[key]) {
                    this.keys[key] = 0;
                }
                this.keys[key]--;
                return [2 /*return*/, this.keys[key]];
            });
        });
    };
    return LocalPresence;
}());
exports.LocalPresence = LocalPresence;
