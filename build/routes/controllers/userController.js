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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.login = void 0;
const User_1 = __importDefault(require("../../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const user = new User_1.default();
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user_name = req.body.user_name;
        const user_r = yield user.getUserByUserName(user_name);
        if (user_r == null) {
            return res.status(400).send("can't find the user");
        }
        try {
            if (yield bcrypt_1.default.compare(req.body.pass_hash, user_r.hashed_password)) {
                const user = { name: user_name };
                const token = jsonwebtoken_1.default.sign(user, process.env.TOKEN_SECRET);
                res.status(200).send({ userName: user_name, accessToken: token });
            }
            else {
                res.status(401).send("password is wrong!!!");
            }
        }
        catch (error) {
            res.status(500).send("error:" + error);
        }
    });
}
exports.login = login;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // userName is the old user name in case of changing it.
        // and this old user name come from the authentication middleware.
        const _a = req.body, { userName } = _a, userData = __rest(_a, ["userName"]);
        // Get the user by their old user name to obtain the ID
        const user_r = yield user.getUserByUserName(userName);
        if (!user_r) {
            res
                .status(404)
                .json({ error: `User with old user name ${userName} not found.` });
            return;
        }
        // check if the old password user sent is correct or not.
        //(may be it is the front end and using the user token to take his account ;) ).
        if (yield bcrypt_1.default.compare(userData.pass_hash, user_r.hashed_password)) {
            let updatedUser;
            // If a new password was provided
            if (userData.newPassword) {
                // Hash password before saving it into database
                userData.hashed_password = yield bcrypt_1.default.hash(userData.newPassword, Number(process.env.SALT_ROUNDS));
                // Update the user's data using their ID
                updatedUser = yield user.updateUser(user_r.id, {
                    user_name: userData.user_name,
                    hashed_password: userData.hashed_password,
                });
            }
            else {
                // Update the user's data using their ID
                updatedUser = yield user.updateUser(user_r.id, {
                    user_name: userData.user_name,
                });
            }
            // Prepare the user object to be included in the token
            const tokenData = { name: updatedUser.user_name };
            // Generate a new access token with updated user data
            const token = jsonwebtoken_1.default.sign(tokenData, process.env.TOKEN_SECRET);
            // Return the access token and updated user name in the response
            res
                .status(200)
                .json({ accessToken: token, userName: updatedUser.user_name });
        }
        else {
            res.status(401).send("password is wrong!!!");
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateUser = updateUser;
