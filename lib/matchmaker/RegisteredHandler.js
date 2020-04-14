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
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
exports.INVALID_OPTION_KEYS = [
    'clients',
    'locked',
    'private',
    // 'maxClients', - maxClients can be useful as filter options
    'metadata',
    'name',
    'processId',
    'roomId',
];
var RegisteredHandler = /** @class */ (function (_super) {
    __extends(RegisteredHandler, _super);
    function RegisteredHandler(klass, options) {
        var _this = _super.call(this) || this;
        _this.filterOptions = [];
        if (typeof (klass) !== 'function') {
            console.debug('You are likely not importing your room class correctly.');
            throw new Error("class is expected but " + typeof (klass) + " was provided.");
        }
        _this.klass = klass;
        _this.options = options;
        return _this;
    }
    RegisteredHandler.prototype.filterBy = function (options) {
        this.filterOptions = options;
        return this;
    };
    RegisteredHandler.prototype.sortBy = function (options) {
        this.sortOptions = options;
        return this;
    };
    RegisteredHandler.prototype.getFilterOptions = function (options) {
        return this.filterOptions.reduce(function (prev, curr, i, arr) {
            var field = arr[i];
            if (options[field]) {
                if (exports.INVALID_OPTION_KEYS.indexOf(field) !== -1) {
                    console.warn("option \"" + field + "\" has internal usage and is going to be ignored.");
                }
                else {
                    prev[field] = options[field];
                }
            }
            return prev;
        }, {});
    };
    return RegisteredHandler;
}(events_1.EventEmitter));
exports.RegisteredHandler = RegisteredHandler;
