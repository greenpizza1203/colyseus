"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("@colyseus/schema");
var fossil_delta_1 = __importDefault(require("fossil-delta"));
var notepack_io_1 = __importDefault(require("notepack.io"));
var Protocol_1 = require("../Protocol");
var fast_json_patch_1 = __importDefault(require("fast-json-patch")); // this is only used for debugging patches
var Debug_1 = require("../Debug");
var FossilDeltaSerializer = /** @class */ (function () {
    function FossilDeltaSerializer() {
        this.id = 'fossil-delta';
    }
    FossilDeltaSerializer.prototype.reset = function (newState) {
        this.previousState = newState;
        this.previousStateEncoded = notepack_io_1.default.encode(this.previousState);
    };
    FossilDeltaSerializer.prototype.getFullState = function (_) {
        return this.previousStateEncoded;
    };
    FossilDeltaSerializer.prototype.applyPatches = function (clients, previousState) {
        var hasChanged = this.hasChanged(previousState);
        if (hasChanged) {
            this.patches.unshift(Protocol_1.Protocol.ROOM_STATE_PATCH);
            var numClients = clients.length;
            while (numClients--) {
                var client = clients[numClients];
                Protocol_1.send.raw(client, this.patches);
            }
        }
        return hasChanged;
    };
    FossilDeltaSerializer.prototype.hasChanged = function (newState) {
        var currentState = newState;
        var changed = false;
        var currentStateEncoded;
        /**
         * allow optimized state changes when using `Schema` class.
         */
        if (newState instanceof schema_1.Schema) {
            if (newState.$changed) {
                changed = true;
                currentStateEncoded = notepack_io_1.default.encode(currentState);
            }
        }
        else {
            currentStateEncoded = notepack_io_1.default.encode(currentState);
            changed = !currentStateEncoded.equals(this.previousStateEncoded);
        }
        if (changed) {
            this.patches = fossil_delta_1.default.create(this.previousStateEncoded, currentStateEncoded);
            //
            // debugging
            //
            if (Debug_1.debugPatch.enabled) {
                Debug_1.debugPatch('%d bytes, %j', this.patches.length, fast_json_patch_1.default.compare(notepack_io_1.default.decode(this.previousStateEncoded), currentState));
            }
            this.previousState = currentState;
            this.previousStateEncoded = currentStateEncoded;
        }
        return changed;
    };
    return FossilDeltaSerializer;
}());
exports.FossilDeltaSerializer = FossilDeltaSerializer;
