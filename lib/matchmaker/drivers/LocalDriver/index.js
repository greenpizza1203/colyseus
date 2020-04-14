"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Query_1 = require("./Query");
var RoomData_1 = require("./RoomData");
var LocalDriver = /** @class */ (function () {
    function LocalDriver() {
        this.rooms = [];
    }
    LocalDriver.prototype.createInstance = function (initialValues) {
        if (initialValues === void 0) { initialValues = {}; }
        return new RoomData_1.RoomCache(initialValues, this.rooms);
    };
    LocalDriver.prototype.find = function (conditions) {
        return this.rooms.filter((function (room) {
            for (var field in conditions) {
                if (conditions.hasOwnProperty(field) &&
                    room[field] !== conditions[field]) {
                    return false;
                }
            }
            return true;
        }));
    };
    LocalDriver.prototype.findOne = function (conditions) {
        return new Query_1.Query(this.rooms, conditions);
    };
    return LocalDriver;
}());
exports.LocalDriver = LocalDriver;
