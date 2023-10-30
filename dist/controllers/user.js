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
exports.initiateReplies = exports.userActions = void 0;
const findThreadsAndReply_1 = __importDefault(require("../lib/findThreadsAndReply"));
const createLabelIfNotExists_1 = __importDefault(require("../lib/createLabelIfNotExists"));
const utils_1 = require("../lib/utils");
const userActions = (req, res) => {
    var _a;
    try {
        // Check if user is logged in
        if ((_a = req.session) === null || _a === void 0 ? void 0 : _a.user) {
            res.send(`
        <div>
          <h2>User: ${req.session.user.email}</h2>
          <a href=/user/initiate>Send replies</a>
          </br>
          <a href=/auth/logout>Logout</a>
        </div>`);
            // Redirect to home if no session object is found (not logged in)
        }
        else
            res.redirect("/");
    }
    catch (err) {
        console.error(`userActions: ${err.message}`);
        res.status(500).json("An error occurred when fetching user actions");
    }
};
exports.userActions = userActions;
const initiateReplies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if user is logged in
        if ((_a = req.session) === null || _a === void 0 ? void 0 : _a.user) {
            // Set credentials to oAuth2Client
            utils_1.oAuth2Client.setCredentials(req.session.user.tokens);
            // Create label in user's gmail if it does not exist
            (0, createLabelIfNotExists_1.default)("openinapp");
            // Start process that calls the findThreadsAndReply function in
            // random intervals of 45 to 120 seconds
            if (req.session.user.intervalHandle) {
                clearInterval(req.session.user.intervalHandle);
            }
            (0, findThreadsAndReply_1.default)({
                email: req.session.user.email,
                tokens: req.session.user.tokens,
            });
            const intervalHandle = setInterval(findThreadsAndReply_1.default, (0, utils_1.getRandom)(45 * 1000, 120 * 1000), {
                email: req.session.user.email,
                tokens: req.session.user.tokens,
            });
            utils_1.timeouts[req.session.user.email] = intervalHandle;
            // Send response back
            res.status(200).send(`
        <div>
          <h2 style="color:green;">Reply process initiated!</h2>
          <h2>Process will repeat in random intervals of 45 to 120 seconds.</h2>
          <p>Logout to terminate the process</p>
          <a href='/auth/logout'>Logout</a>
        </div>`);
        }
        else {
            // Redirect to home if no session object is found (not logged in)
            res.redirect("/");
        }
    }
    catch (err) {
        console.error(`userActions: ${err.message}`);
        res.status(500).json(`An error occurred when fetching user actions`);
    }
});
exports.initiateReplies = initiateReplies;
