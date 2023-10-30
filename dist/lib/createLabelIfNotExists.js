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
exports.default = (labelName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get list of labels
        utils_1.gmail.users.labels.list({ userId: "me" }, (err, res) => {
            if (err)
                throw new Error(`Error listing labels: ${err.message}`);
            const labels = res === null || res === void 0 ? void 0 : res.data.labels;
            const labelExists = labels === null || labels === void 0 ? void 0 : labels.some((label) => label.name === labelName);
            if (labelExists)
                return;
            // Create label
            utils_1.gmail.users.labels.create({
                userId: "me",
                requestBody: {
                    name: labelName,
                    labelListVisibility: "labelShow",
                    messageListVisibility: "show",
                },
            });
        });
    }
    catch (err) {
        console.error(`create label: ${err.message}`);
    }
});
