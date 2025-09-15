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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingRequests = exports.getMyConnections = exports.respondToRequest = exports.sendRequest = void 0;
const connectionService = __importStar(require("../services/Connection/connection.service"));
// POST /connections/:receiverId
const sendRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield connectionService.sendRequest({
            requesterId: req.user.id,
            receiverId: req.params.receiverId,
        });
        res.status(201).json(connection);
    }
    catch (err) {
        next(err);
    }
});
exports.sendRequest = sendRequest;
// PATCH /connections/:id/respond
const respondToRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield connectionService.respondToRequest({
            connectionId: req.params.id,
            userId: req.user.id,
            accept: req.body.accept,
        });
        res.json(connection);
    }
    catch (err) {
        next(err);
    }
});
exports.respondToRequest = respondToRequest;
// GET /connections/me
const getMyConnections = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connections = yield connectionService.getMyConnections({
            userId: req.user.id,
        });
        res.json(connections);
    }
    catch (err) {
        next(err);
    }
});
exports.getMyConnections = getMyConnections;
// GET /connections/pending
const getPendingRequests = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield connectionService.getPendingRequests({
            userId: req.user.id,
        });
        res.json(requests);
    }
    catch (err) {
        next(err);
    }
});
exports.getPendingRequests = getPendingRequests;
