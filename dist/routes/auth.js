"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate);
router.get("/logout", auth_1.logout);
exports.default = router;
