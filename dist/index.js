"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_session_1 = __importDefault(require("express-session"));
const user_1 = __importDefault(require("./routes/user"));
const auth_1 = __importDefault(require("./routes/auth"));
const express_1 = __importDefault(require("express"));
const utils_1 = require("./lib/utils");
/* Initiate Express app */
const app = (0, express_1.default)();
/* Session Middleware */
app.use((0, express_session_1.default)({
    store: utils_1.redisStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hourse
}));
/* Root Route */
app.get("/", (req, res) => {
    var _a;
    if ((_a = req.session) === null || _a === void 0 ? void 0 : _a.user) {
        res.redirect("/user");
        return;
    }
    const loginURL = (0, utils_1.getLoginURL)();
    res.status(200).send(`<a href=${loginURL}>Login with Google</a>`);
});
/* Auth Routes */
app.use("/auth", auth_1.default);
/* User Routes */
app.use("/user", user_1.default);
/* Fallback */
app.get("*", (_, res) => {
    res.status(404).json("Requested Resource Not Found");
});
/* PORT */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
