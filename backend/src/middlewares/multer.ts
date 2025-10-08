// middlewares/multer.ts
import multer from "multer";

const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PNG and JPEG images are allowed."));
        }
    },
});
