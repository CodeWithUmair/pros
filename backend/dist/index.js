"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.local_url = exports.frontend_url = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_handler_1 = __importDefault(require("./middlewares/error-handler"));
const constants_1 = require("./constants");
// Routes import here
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const skill_routes_1 = __importDefault(require("./routes/skill.routes"));
const connection_routes_1 = __importDefault(require("./routes/connection.routes"));
exports.frontend_url = "";
exports.local_url = ["http://localhost:3000", "http://localhost:3001"];
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
const corsOptions = {
    origin: [...exports.local_url, exports.frontend_url],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // using cookies, no Authorization header
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
// Disable caching globally
app.use((_, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
});
// Helmet
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use((0, morgan_1.default)("dev"));
// Routes
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/user", user_routes_1.default);
app.use("/api/v1/posts", post_routes_1.default);
app.use("/api/v1/skill", skill_routes_1.default);
app.use("/api/v1/connections", connection_routes_1.default);
// Health
app.get("/", (_, res) => {
    res.status(200).send("Backend is running fine here ............");
});
// Error handler
app.use(error_handler_1.default);
const port = constants_1.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
    console.log(`NODE_ENV: ${constants_1.NODE_ENV}`);
});
exports.default = app;
