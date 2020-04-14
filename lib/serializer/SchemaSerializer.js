"use strict";
/* tslint:disable:no-string-literal */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("@colyseus/schema");
var Debug_1 = require("../Debug");
var Protocol_1 = require("../Protocol");
var SchemaSerializer = /** @class */ (function () {
    function SchemaSerializer() {
        this.id = 'schema';
        this.hasFiltersByClient = false;
    }
    SchemaSerializer.prototype.reset = function (newState) {
        this.state = newState;
        this.hasFiltersByClient = this.hasFilter(newState['_schema'] || {}, newState['_filters'] || {});
    };
    SchemaSerializer.prototype.getFullState = function (client) {
        return (client && this.hasFiltersByClient)
            ? this.state.encodeAllFiltered(client)
            : this.state.encodeAll();
    };
    SchemaSerializer.prototype.applyPatches = function (clients) {
        var hasChanges = this.state.$changed;
        if (hasChanges) {
            var numClients = clients.length;
            if (!this.hasFiltersByClient) {
                // dump changes for patch debugging
                if (Debug_1.debugPatch.enabled) {
                    Debug_1.debugPatch.dumpChanges = schema_1.dumpChanges(this.state);
                }
                // encode changes once, for all clients
                var patches = this.state.encode();
                patches.unshift(Protocol_1.Protocol.ROOM_STATE_PATCH);
                while (numClients--) {
                    var client = clients[numClients];
                    Protocol_1.send.raw(client, patches);
                }
                if (Debug_1.debugPatch.enabled) {
                    Debug_1.debugPatch('%d bytes sent to %d clients, %j', patches.length, clients.length, Debug_1.debugPatch.dumpChanges);
                }
            }
            else {
                // encode state multiple times, for each client
                while (numClients--) {
                    var client = clients[numClients];
                    Protocol_1.send.raw(client, __spreadArrays([Protocol_1.Protocol.ROOM_STATE_PATCH], this.state.encodeFiltered(client)));
                }
                this.state.discardAllChanges();
            }
        }
        return hasChanges;
    };
    SchemaSerializer.prototype.handshake = function () {
        /**
         * Cache handshake to avoid encoding it for each client joining
         */
        if (!this.handshakeCache) {
            this.handshakeCache = (this.state && schema_1.Reflection.encode(this.state));
        }
        return this.handshakeCache;
    };
    SchemaSerializer.prototype.hasFilter = function (schema, filters, schemasCache) {
        if (filters === void 0) { filters = {}; }
        var hasFilter = false;
        // set of schemas we already checked OR are still checking
        var knownSchemas = schemasCache || new WeakSet();
        knownSchemas.add(schema);
        for (var _i = 0, _a = Object.keys(schema); _i < _a.length; _i++) {
            var fieldName = _a[_i];
            // skip if a filter has been found
            if (hasFilter) {
                break;
            }
            if (filters[fieldName]) {
                hasFilter = true;
            }
            else if (typeof schema[fieldName] === 'function') {
                var childSchema = schema[fieldName]['_schema'];
                var childFilters = schema[fieldName]['_filters'];
                if (!knownSchemas.has(childSchema)) {
                    hasFilter = this.hasFilter(childSchema, childFilters, knownSchemas);
                }
            }
            else if (Array.isArray(schema[fieldName])) {
                if (typeof schema[fieldName][0] === 'string') {
                    continue;
                }
                var childSchema = schema[fieldName][0]['_schema'];
                var childFilters = schema[fieldName][0]['_filters'];
                if (!knownSchemas.has(childSchema)) {
                    hasFilter = this.hasFilter(childSchema, childFilters, knownSchemas);
                }
            }
            else if (schema[fieldName].map) {
                if (typeof schema[fieldName].map === 'string') {
                    continue;
                }
                var childSchema = schema[fieldName].map['_schema'];
                var childFilters = schema[fieldName].map['_filters'];
                if (!knownSchemas.has(childSchema)) {
                    hasFilter = this.hasFilter(childSchema, childFilters, knownSchemas);
                }
            }
        }
        return hasFilter;
    };
    return SchemaSerializer;
}());
exports.SchemaSerializer = SchemaSerializer;
