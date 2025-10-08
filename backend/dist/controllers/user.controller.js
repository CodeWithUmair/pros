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
exports.updateAvatar = exports.removeSkill = exports.addSkill = exports.updateMe = exports.getMe = void 0;
const userService = __importStar(require("../services/User/user.services"));
const upload_1 = require("../utils/upload");
// GET /users/me
const getMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userService.getUserById(req.user.id);
        res.json(user);
    }
    catch (err) {
        next(err);
    }
});
exports.getMe = getMe;
// PATCH /users/me
const updateMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dto = req.body;
        const user = yield userService.updateUser(req.user.id, dto);
        res.json(user);
    }
    catch (err) {
        next(err);
    }
});
exports.updateMe = updateMe;
// POST /users/me/skills
const addSkill = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dto = { userId: req.user.id, skillName: req.body.skill };
        const skill = yield userService.addSkill(dto);
        res.status(201).json(skill);
    }
    catch (err) {
        next(err);
    }
});
exports.addSkill = addSkill;
// DELETE /users/me/skills/:skillId
const removeSkill = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dto = { userId: req.user.id, skillId: req.params.skillId };
        yield userService.removeSkill(dto);
        res.json({ message: "Skill removed" });
    }
    catch (err) {
        next(err);
    }
});
exports.removeSkill = removeSkill;
// PATCH /users/me/avatar
const updateAvatar = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file; // assuming multer is used
        if (!file)
            return res.status(400).json({ message: "No file uploaded" });
        const url = yield (0, upload_1.uploadAvatar)(file.buffer, file.originalname, file.mimetype);
        // Update user in DB
        const updatedUser = yield userService.updateAvatar({
            userId: req.user.id,
            avatarUrl: url,
        });
        res.json(updatedUser);
    }
    catch (err) {
        next(err);
    }
});
exports.updateAvatar = updateAvatar;
