"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = exports.updateUser = exports.getUserById = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            role: true,
            isVerified: true,
            createdAt: true,
            skills: {
                include: { skill: true },
            },
        },
    });
});
exports.getUserById = getUserById;
const updateUser = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.user.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            role: true,
            isVerified: true,
            updatedAt: true,
        },
    });
});
exports.updateUser = updateUser;
const listUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            role: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });
});
exports.listUsers = listUsers;
