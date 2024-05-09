"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBAdapter = exports.PrismaAdapter = exports.createBreezeAuth = void 0;
var create_breeze_auth_1 = require("./create-breeze-auth");
Object.defineProperty(exports, "createBreezeAuth", { enumerable: true, get: function () { return create_breeze_auth_1.createBreezeAuth; } });
var adapters_1 = require("./adapters");
Object.defineProperty(exports, "PrismaAdapter", { enumerable: true, get: function () { return adapters_1.PrismaAdapter; } });
Object.defineProperty(exports, "MongoDBAdapter", { enumerable: true, get: function () { return adapters_1.MongoDBAdapter; } });
__exportStar(require("./types"), exports);
