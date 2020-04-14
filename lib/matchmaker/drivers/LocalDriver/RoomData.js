"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("../../../Utils");
var RoomCache = /** @class */ (function () {
    function RoomCache(initialValues, rooms) {
        this.clients = 0;
        this.locked = false;
        this.private = false;
        this.maxClients = Infinity;
        this.createdAt = new Date();
        for (var field in initialValues) {
            if (initialValues.hasOwnProperty(field)) {
                this[field] = initialValues[field];
            }
        }
        this.$rooms = rooms;
    }
    RoomCache.prototype.toJSON = function () {
        return {
            clients: this.clients,
            createdAt: this.createdAt,
            maxClients: this.maxClients,
            metadata: this.metadata,
            name: this.name,
            processId: this.processId,
            roomId: this.roomId,
        };
    };
    RoomCache.prototype.save = function () {
        if (this.$rooms.indexOf(this) === -1) {
            this.$rooms.push(this);
        }
    };
    RoomCache.prototype.updateOne = function (operations) {
        if (operations.$set) {
            for (var field in operations.$set) {
                if (operations.$set.hasOwnProperty(field)) {
                    this[field] = operations.$set[field];
                }
            }
        }
        if (operations.$inc) {
            for (var field in operations.$inc) {
                if (operations.$inc.hasOwnProperty(field)) {
                    this[field] += operations.$inc[field];
                }
            }
        }
    };
    RoomCache.prototype.remove = function () {
        Utils_1.spliceOne(this.$rooms, this.$rooms.indexOf(this));
        this.$rooms = null;
    };
    return RoomCache;
}());
exports.RoomCache = RoomCache;
