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
exports.search = void 0;
// src/services/Search/search.service.ts
const db_1 = __importDefault(require("../../config/db"));
const search = (_a) => __awaiter(void 0, [_a], void 0, function* ({ query, type }) {
    const searchQuery = query.trim();
    switch (type) {
        case "user":
            return db_1.default.user.findMany({
                where: {
                    OR: [
                        { name: { contains: searchQuery, mode: "insensitive" } },
                        { city: { contains: searchQuery, mode: "insensitive" } },
                        { skills: { some: { skill: { name: { contains: searchQuery, mode: "insensitive" } } } } },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    city: true,
                    avatar: true,
                    skills: { include: { skill: true } },
                },
                take: 20,
            });
        case "post":
            return db_1.default.post.findMany({
                where: {
                    OR: [
                        { content: { contains: searchQuery, mode: "insensitive" } },
                        { author: { name: { contains: searchQuery, mode: "insensitive" } } },
                    ],
                },
                include: { author: true },
                take: 20,
            });
        case "skill":
            return db_1.default.skill.findMany({
                where: { name: { contains: searchQuery, mode: "insensitive" } },
                take: 20,
            });
        default:
            // Default: search all
            const [users, posts, skills] = yield Promise.all([
                db_1.default.user.findMany({
                    where: {
                        OR: [
                            { name: { contains: searchQuery, mode: "insensitive" } },
                            { city: { contains: searchQuery, mode: "insensitive" } },
                        ],
                    },
                    select: { id: true, name: true, city: true, avatar: true },
                    take: 10,
                }),
                db_1.default.post.findMany({
                    where: { content: { contains: searchQuery, mode: "insensitive" } },
                    take: 10,
                }),
                db_1.default.skill.findMany({
                    where: { name: { contains: searchQuery, mode: "insensitive" } },
                    take: 10,
                }),
            ]);
            return { users, posts, skills };
    }
});
exports.search = search;
