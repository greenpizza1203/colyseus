"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Query = /** @class */ (function () {
    function Query(rooms, conditions) {
        this.$rooms = rooms.slice(0);
        this.conditions = conditions;
    }
    Query.prototype.sort = function (options) {
        this.$rooms = this.$rooms.sort(function (room1, room2) {
            for (var field in options) {
                if (options.hasOwnProperty(field)) {
                    var direction = options[field];
                    var isAscending = (direction === 1 || direction === 'asc' || direction === 'ascending');
                    if (isAscending) {
                        if (room1[field] > room2[field]) {
                            return 1;
                        }
                        if (room1[field] < room2[field]) {
                            return -1;
                        }
                    }
                    else {
                        if (room1[field] > room2[field]) {
                            return -1;
                        }
                        if (room1[field] < room2[field]) {
                            return 1;
                        }
                    }
                }
            }
        });
    };
    Query.prototype.then = function (resolve, reject) {
        var _this = this;
        var result = this.$rooms.find((function (room) {
            for (var field in _this.conditions) {
                if (_this.conditions.hasOwnProperty(field) &&
                    room[field] !== _this.conditions[field]) {
                    return false;
                }
            }
            return true;
        }));
        return resolve(result);
    };
    return Query;
}());
exports.Query = Query;
