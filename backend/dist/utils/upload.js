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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = uploadAvatar;
// server/utils/upload.ts
const client_s3_1 = require("@aws-sdk/client-s3");
const crypto_1 = require("crypto");
const s3 = new client_s3_1.S3Client({
    region: process.env.SPACES_REGION,
    endpoint: process.env.SPACES_ENDPOINT, // DigitalOcean endpoint
    credentials: {
        accessKeyId: process.env.SPACES_KEY,
        secretAccessKey: process.env.SPACES_SECRET,
    },
});
function uploadAvatar(fileBuffer, fileName, mimetype) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = `avatars/${(0, crypto_1.randomUUID)()}-${fileName}`; // unique file name in bucket
        yield s3.send(new client_s3_1.PutObjectCommand({
            Bucket: process.env.SPACES_BUCKET,
            Key: key,
            Body: fileBuffer,
            ACL: "public-read", // so the file is publicly accessible
            ContentType: mimetype,
        }));
        return `${process.env.SPACES_ENDPOINT}/${process.env.SPACES_BUCKET}/${key}`;
    });
}
