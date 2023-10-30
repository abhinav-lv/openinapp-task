import { Auth } from "googleapis";
import { google } from "googleapis";
import RedisStore from "connect-redis";
import { config as envConfig } from "dotenv";
import { createClient } from "@redis/client";

// Environment variables
envConfig();

// Set up OAuth2 client
export const oAuth2Client = new Auth.OAuth2Client({
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
export const getLoginURL = () => {
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
};

// User model to be stored in session object
export interface User {
  email: string;
  tokens: any;
  intervalHandle?: any;
}

// Connect to redis client
const redisClient = createClient();
redisClient.connect().catch(console.error);

// Redis store
export const redisStore = new RedisStore({
  client: redisClient,
  prefix: process.env.SESSION_PREFIX || "sess",
});

// Gmail Object with methods
export const gmail = google.gmail({
  version: "v1",
  auth: oAuth2Client,
});

// Returns random number between min and max
export const getRandom = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);
