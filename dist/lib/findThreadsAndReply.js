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
const utils_1 = require("./utils");
exports.default = (user) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all unread emails in inbox
    const messageIDs = (yield utils_1.gmail.users.messages.list({
        userId: "me",
        labelIds: ["INBOX"],
        q: "label:unread",
    })).data.messages;
    if (!messageIDs) {
        console.log("No new emails found");
        return;
    }
    // Get message objects for each ID
    messageIDs.forEach((messageIdObj) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (!messageIdObj.id)
            return;
        // Get message object from its ID
        const message = (yield utils_1.gmail.users.messages.get({ userId: "me", id: messageIdObj.id })).data;
        if (!message.payload || !message.threadId)
            return;
        // Get threadId and sender information
        const threadId = message.threadId;
        const headers = message.payload.headers;
        if (!headers)
            return;
        const sender = (_a = headers.find((header) => header.name === "From")) === null || _a === void 0 ? void 0 : _a.value;
        if (!sender)
            return;
        // Get thread message object from the threadId
        const thread = (yield utils_1.gmail.users.threads.get({ userId: "me", id: threadId })).data;
        if (!thread.messages)
            return;
        // Check if the user is the sender of any previous email in the thread
        const isUserSent = thread.messages.some((threadMessage) => {
            var _a, _b;
            return (_b = (_a = threadMessage.payload) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b.some((header) => { var _a; return (header === null || header === void 0 ? void 0 : header.name) === "From" && ((_a = header === null || header === void 0 ? void 0 : header.value) === null || _a === void 0 ? void 0 : _a.includes(user.email)); });
        });
        if (isUserSent || sender.includes(user.email))
            return;
        // Unread thread found that does not contain any reply from user!
        console.log(`Unread message from :${sender}`);
        // Generate raw message in base64 format to be sent
        const rawReplyMessage = Buffer.from(`To: ${sender}\r\n` +
            `Content-Type: text/plain; charset="UTF-8"\r\n` +
            `MIME-Version: 1.0\r\n` +
            `References: <${threadId}>\r\n` +
            `In-Reply-To: <${threadId}>\r\n` +
            `Subject: Re: Reply to this mail\r\n\r\nSome random content\r\n`).toString("base64");
        // Send message asynchronously
        utils_1.gmail.users.messages.send({
            userId: "me",
            requestBody: { raw: rawReplyMessage, threadId },
        });
        // Get list of labels in user's gmail and find label id of "openingapp" if exists
        const labels = (yield utils_1.gmail.users.labels.list({ userId: "me" })).data
            .labels;
        const labelId = (_b = labels === null || labels === void 0 ? void 0 : labels.find((label) => (label === null || label === void 0 ? void 0 : label.name) === "openinapp")) === null || _b === void 0 ? void 0 : _b.id;
        if (!labelId)
            return;
        // Asynchronously add label "openingapp" to the thread
        utils_1.gmail.users.threads.modify({
            userId: "me",
            id: threadId,
            requestBody: { addLabelIds: ["INBOX", labelId] },
        });
    }));
});
