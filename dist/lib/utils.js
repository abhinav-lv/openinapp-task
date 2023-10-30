"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeouts = exports.getRandom = exports.gmail = exports.redisStore = exports.getLoginURL = exports.oAuth2Client = void 0;
const googleapis_1 = require("googleapis");
const googleapis_2 = require("googleapis");
const connect_redis_1 = __importDefault(require("connect-redis"));
const dotenv_1 = require("dotenv");
const client_1 = require("@redis/client");
// Environment variables
(0, dotenv_1.config)();
// Set up OAuth2 client
exports.oAuth2Client = new googleapis_1.Auth.OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
});
// Scopes required for accessing Gmail APIs
const scopes = [
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/gmail.labels",
];
// Return login url to redirect user to login
const getLoginURL = () => {
    return exports.oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
    });
};
exports.getLoginURL = getLoginURL;
// Connect to redis client
const redisClient = (0, client_1.createClient)();
redisClient.connect().catch(console.error);
// Redis store
exports.redisStore = new connect_redis_1.default({
    client: redisClient,
    prefix: process.env.SESSION_PREFIX || "sess",
});
// Gmail Object with methods
exports.gmail = googleapis_2.google.gmail({
    version: "v1",
    auth: exports.oAuth2Client,
});
// Returns random number between min and max
const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
exports.getRandom = getRandom;
exports.timeouts = {};
