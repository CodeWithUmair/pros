"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADMIN_EMAIL = exports.ONE_WEEK_DURATION = exports.REFRESH_TOKEN_DURATION = exports.ACCESS_TOKEN_DURATION = exports.ENCRYPTION_SECRET = exports.EMAIL_VERIFICATION_SECRET = exports.RESET_PASSWORD_SECRET = exports.REFRESH_TOKEN_SECRET = exports.ACCESS_TOKEN_SECRET = exports.MONGO_URI = exports.NODE_ENV = exports.EMAIL_HOST = exports.APP_PASSWORD = exports.FROM_EMIAL_ADDRESS = exports.PORT = exports.IS_TEST_MODE = void 0;
require("dotenv").config();
exports.IS_TEST_MODE = false;
exports.PORT = process.env.PORT;
exports.FROM_EMIAL_ADDRESS = process.env.FROM_EMIAL_ADDRESS;
exports.APP_PASSWORD = process.env.APP_PASSWORD;
exports.EMAIL_HOST = process.env.EMAIL_HOST;
exports.NODE_ENV = process.env.NODE_ENV;
exports.MONGO_URI = process.env.MONGO_URI;
exports.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
exports.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
exports.RESET_PASSWORD_SECRET = process.env
    .RESET_PASSWORD_SECRET;
exports.EMAIL_VERIFICATION_SECRET = process.env
    .EMAIL_VERIFICATION_SECRET;
exports.ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;
// export const ACCESS_TOKEN_DURATION = 900; //15 minutes //TODO: to be opened after testing
exports.ACCESS_TOKEN_DURATION = 259200; //3 days
exports.REFRESH_TOKEN_DURATION = 604800; //7 days
exports.ONE_WEEK_DURATION = 604800; //7 days
exports.ADMIN_EMAIL = "umairamir@decryptedlabs.io"; // admin email
