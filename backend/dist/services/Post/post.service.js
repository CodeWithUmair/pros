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
exports.deletePostService = exports.unlikePostService = exports.likePostService = exports.createCommentService = exports.getFeedService = exports.createPostService = void 0;
const db_1 = __importDefault(require("../../config/db"));
const createPostService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.post.create({
        data,
        include: { author: true },
    });
});
exports.createPostService = createPostService;
const getFeedService = () => __awaiter(void 0, void 0, void 0, function* () {
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
exports.getFeedService = getFeedService;
const createCommentService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.comment.create({
        data,
        include: { author: true },
    });
});
exports.createCommentService = createCommentService;
const likePostService = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.postLike.upsert({
        where: { userId_postId: { userId, postId } },
        update: {},
        create: { userId, postId },
    });
});
exports.likePostService = likePostService;
const unlikePostService = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.postLike.deleteMany({
        where: { postId, userId },
    });
});
exports.unlikePostService = unlikePostService;
const deletePostService = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield db_1.default.post.findUnique({ where: { id: postId } });
    if (!post) {
        return { success: false, status: 404, message: "Post not found" };
    }
    if (post.authorId !== userId) {
        return {
            success: false,
            status: 403,
            message: "You can delete only your own posts",
        };
    }
    yield db_1.default.post.delete({ where: { id: postId } });
    return { success: true, status: 200 };
});
exports.deletePostService = deletePostService;
