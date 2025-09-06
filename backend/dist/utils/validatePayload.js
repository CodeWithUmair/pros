"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = require("./AppError");
const validatePayload = (schema, payload) => {
    const { error } = schema.validate(payload);
    if ((error === null || error === void 0 ? void 0 : error.details) && error.details.length > 0) {
        const errorMessage = error.details[0].message
            ? `${error.details[0].message}`
            : "Validation error occurred.";
        throw new AppError_1.ValidationError(errorMessage);
    }
};
exports.default = validatePayload;
