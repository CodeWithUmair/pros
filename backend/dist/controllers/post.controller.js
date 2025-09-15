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
exports.unlikePost = exports.likePost = exports.createComment = exports.getFeed = exports.createPost = void 0;
const postService = __importStar(require("../services/Post/post.service"));
const createPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield postService.createPost({
            content: req.body.content,
            image: req.body.image,
            authorId: req.user.id,
        });
        res.status(201).json(post);
    }
    catch (err) {
        next(err);
    }
});
exports.createPost = createPost;
const getFeed = (_, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield postService.getFeed();
        res.json(posts);
    }
    catch (err) {
        next(err);
    }
});
exports.getFeed = getFeed;
const createComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield postService.createComment({
            postId: req.params.postId,
            content: req.body.content,
            authorId: req.user.id,
        });
        res.status(201).json(comment);
    }
    catch (err) {
        next(err);
    }
});
exports.createComment = createComment;
const likePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield postService.likePost(req.params.postId, req.user.id);
        res.json({ message: "Post liked" });
    }
    catch (err) {
        next(err);
    }
});
exports.likePost = likePost;
const unlikePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield postService.unlikePost(req.params.postId, req.user.id);
        res.json({ message: "Post unliked" });
    }
    catch (err) {
        next(err);
    }
});
exports.unlikePost = unlikePost;
