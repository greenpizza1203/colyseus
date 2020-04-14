"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var nanoid_1 = __importDefault(require("nanoid"));
var Debug_1 = require("./Debug");
// remote room call timeouts
exports.REMOTE_ROOM_SHORT_TIMEOUT = Number(process.env.COLYSEUS_PRESENCE_SHORT_TIMEOUT || 2000);
function generateId() {
    return nanoid_1.default(9);
}
exports.generateId = generateId;
//
// nodemon sends SIGUSR2 before reloading
// (https://github.com/remy/nodemon#controlling-shutdown-of-your-script)
//
var signals = ['SIGINT', 'SIGTERM', 'SIGUSR2'];
function registerGracefulShutdown(callback) {
    /**
     * Gracefully shutdown on uncaught errors
     */
    process.on('uncaughtException', function (err) {
        Debug_1.debugAndPrintError(err);
        callback(err);
    });
    signals.forEach(function (signal) {
        return process.once(signal, function () { return callback(); });
    });
}
exports.registerGracefulShutdown = registerGracefulShutdown;
function retry(cb, maxRetries, errorWhiteList, retries) {
    if (maxRetries === void 0) { maxRetries = 3; }
    if (errorWhiteList === void 0) { errorWhiteList = []; }
    if (retries === void 0) { retries = 0; }
    return new Promise(function (resolve, reject) {
        cb()
            .then(resolve)
            .catch(function (e) {
            if (errorWhiteList.indexOf(e.constructor) !== -1 &&
                retries++ < maxRetries) {
                setTimeout(function () {
                    retry(cb, maxRetries, errorWhiteList, retries).
                        then(resolve).
                        catch(function (e2) { return reject(e2); });
                }, Math.floor(Math.random() * Math.pow(2, retries) * 400));
            }
            else {
                reject(e);
            }
        });
    });
}
exports.retry = retry;
var Deferred = /** @class */ (function () {
    function Deferred() {
        var _this = this;
        this.promise = new Promise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
    }
    Deferred.prototype.then = function (func) {
        return this.promise.then.apply(this.promise, arguments);
    };
    Deferred.prototype.catch = function (func) {
        return this.promise.catch(func);
    };
    return Deferred;
}());
exports.Deferred = Deferred;
function spliceOne(arr, index) {
    // manually splice availableRooms array
    // http://jsperf.com/manual-splice
    if (index === -1 || index >= arr.length) {
        return false;
    }
    var len = arr.length - 1;
    for (var i = index; i < len; i++) {
        arr[i] = arr[i + 1];
    }
    arr.length = len;
    return true;
}
exports.spliceOne = spliceOne;
function merge(a) {
    var objs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objs[_i - 1] = arguments[_i];
    }
    for (var i = 0, len = objs.length; i < len; i++) {
        var b = objs[i];
        for (var key in b) {
            if (b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
    }
    return a;
}
exports.merge = merge;
