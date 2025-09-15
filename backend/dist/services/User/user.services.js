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
exports.updateAvatar = exports.removeSkill = exports.addSkill = exports.updateUser = exports.getUserById = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            bio: true,
            city: true,
            madhab: true,
            halalCareerPreference: true,
            avatar: true,
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
        data, // already typed correctly
        select: { id: true, bio: true, city: true, madhab: true, halalCareerPreference: true },
    });
});
exports.updateUser = updateUser;
const addSkill = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, skillName }) {
    let skill = yield db_1.default.skill.findUnique({ where: { name: skillName } });
    if (!skill) {
        skill = yield db_1.default.skill.create({ data: { name: skillName } });
    }
    return db_1.default.userSkill.create({
        data: { userId, skillId: skill.id },
        include: { skill: true },
    });
});
exports.addSkill = addSkill;
const removeSkill = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, skillId }) {
    return db_1.default.userSkill.deleteMany({
        where: { userId, skillId },
    });
});
exports.removeSkill = removeSkill;
const updateAvatar = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, avatarUrl }) {
    return db_1.default.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
        select: { id: true, avatar: true },
    });
});
exports.updateAvatar = updateAvatar;
