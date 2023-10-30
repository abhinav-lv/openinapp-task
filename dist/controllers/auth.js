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
exports.logout = exports.authenticate = void 0;
const utils_1 = require("../lib/utils");
const googleapis_1 = require("googleapis");
const authenticate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if ((_a = req.session) === null || _a === void 0 ? void 0 : _a.user) {
            res.redirect("/user");
            return;
        }
        // Code returned by Google's servers
        const code = req.query.code;
        const error = req.query.error;
        if (error || !code)
            throw new Error(JSON.stringify(error || "No code returned"));
        // Get tokens by exchanging code
        const { tokens } = yield utils_1.oAuth2Client.getToken(code);
        utils_1.oAuth2Client.setCredentials(tokens);
        const gmail = googleapis_1.google.gmail({
            version: "v1",
            auth: utils_1.oAuth2Client,
        });
        // Get email of user
        const email = (yield gmail.users.getProfile({
            userId: "me",
        })).data.emailAddress;
        if (!email)
            throw new Error("Unable to get email from gmail.users.getProfile");
        // Generate session for user and redirect to /user
        req.session.regenerate((err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                throw new Error("Error during session generation");
            req.session.user = {
                email,
                tokens,
            };
            res.redirect("/user");
        }));
    }
    catch (err) {
        console.error(`authenticate: ${err.message}`);
        res.status(500).json("An error occurred during authentication");
    }
});
exports.authenticate = authenticate;
const logout = (req, res) => {
    try {
        if (req.session.user) {
            // Clear the reply process if it had been initiated
            if (utils_1.timeouts[req.session.user.email]) {
                clearInterval(utils_1.timeouts[req.session.user.email]);
            }
            // Destory user session and logout
            req.session.destroy((err) => {
                if (err) {
                    console.error((err === null || err === void 0 ? void 0 : err.message) || "There was an error while logging out.");
                    res.status(500).json("Could not logout on server.");
                }
            });
        }
        res.status(200).send("<h2>Logged out successfully.</h2>");
    }
    catch (err) {
        console.error((err === null || err === void 0 ? void 0 : err.message) || "There was an error while logging out.");
        res.status(500).json("Could not logout on server.");
    }
};
exports.logout = logout;
