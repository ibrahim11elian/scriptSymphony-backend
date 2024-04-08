"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authentication(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Access denied, token missing" });
        return;
    }
    try {
        const user = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
        req.body.userName = user.name;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
}
exports.default = authentication;
