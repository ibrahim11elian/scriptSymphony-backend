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
exports.createAdmin = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const createAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Destructure environment variables with default parameters
        const { ADMIN_NAME, ADMIN_PASSWORD, SALT_ROUNDS } = process.env;
        if (!ADMIN_NAME || !ADMIN_PASSWORD) {
            throw new Error("Admin name or password is missing in environment variables.");
        }
        const user = new User_1.default();
        const existingUser = yield user.getUserByUserName(ADMIN_NAME);
        if (!existingUser) {
            const hashed_password = bcrypt_1.default.hashSync(ADMIN_PASSWORD, parseInt(SALT_ROUNDS));
            yield user.createUser({
                user_name: ADMIN_NAME,
                hashed_password: hashed_password,
            });
            console.log("Admin user created successfully.");
        }
    }
    catch (error) {
        console.error("Error creating admin user:", error.message);
    }
});
exports.createAdmin = createAdmin;
