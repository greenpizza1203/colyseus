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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("@colyseus/schema");
var Room_1 = require("../Room");
var RoomData = /** @class */ (function (_super) {
    __extends(RoomData, _super);
    function RoomData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        schema_1.type('string')
    ], RoomData.prototype, "id", void 0);
    __decorate([
        schema_1.type('string')
    ], RoomData.prototype, "name", void 0);
    __decorate([
        schema_1.type('number')
    ], RoomData.prototype, "clients", void 0);
    __decorate([
        schema_1.type('number')
    ], RoomData.prototype, "maxClients", void 0);
    __decorate([
        schema_1.type('string')
    ], RoomData.prototype, "metadata", void 0);
    return RoomData;
}(schema_1.Schema));
var LobbyState = /** @class */ (function (_super) {
    __extends(LobbyState, _super);
    function LobbyState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        schema_1.type([RoomData])
    ], LobbyState.prototype, "rooms", void 0);
    return LobbyState;
}(schema_1.Schema));
var LobbyRoom = /** @class */ (function (_super) {
    __extends(LobbyRoom, _super);
    function LobbyRoom() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LobbyRoom.prototype.onCreate = function (options) {
        var _this = this;
        this.setState(new LobbyState());
        this.clock.setInterval(function () { return _this.fetch(); }, Math.max(1, options.updateInterval || 5000) * 1000);
    };
    LobbyRoom.prototype.fetch = function () {
        // TODO: make .driver available on this scope!
    };
    LobbyRoom.prototype.onMessage = function () {
        // TODO:
    };
    LobbyRoom.prototype.onDispose = function () {
        // TODO:
    };
    return LobbyRoom;
}(Room_1.Room));
exports.LobbyRoom = LobbyRoom;
