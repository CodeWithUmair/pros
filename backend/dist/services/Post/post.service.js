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
exports.unlikePost = exports.likePost = exports.createComment = exports.getFeed = exports.createPost = void 0;
const db_1 = __importDefault(require("../../config/db"));
const createPost = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.post.create({
        data,
        include: { author: true },
    });
});
exports.createPost = createPost;
const getFeed = () => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            author: true,
            comments: {
                include: { author: true },
            },
            likes: true,
        },
    });
});
exports.getFeed = getFeed;
const createComment = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.comment.create({
        data,
        include: { author: true },
    });
});
exports.createComment = createComment;
const likePost = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.postLike.upsert({
        where: { userId_postId: { userId, postId } },
        update: {},
        create: { userId, postId },
    });
});
exports.likePost = likePost;
const unlikePost = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.postLike.deleteMany({
        where: { postId, userId },
    });
});
exports.unlikePost = unlikePost;
