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
const database_1 = require("../database");
class UserModel {
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.db.connect();
                const { user_name, hashed_password } = user;
                yield conn.query("INSERT INTO users (user_name, hashed_password) VALUES ($1, $2)", [user_name, hashed_password]);
                conn.release();
            }
            catch (error) {
                throw new Error(`Error creating user: ${error.message}`);
            }
        });
    }
    getUserByUserName(user_name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield database_1.db.query("SELECT * FROM users WHERE user_name = $1", [user_name]);
                return result.rows[0] || null;
            }
            catch (error) {
                throw new Error(`Error getting user: ${error.message}`);
            }
        });
    }
    updateUser(id, updatedColumns) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.db.connect();
                const keys = Object.keys(updatedColumns);
                const values = Object.values(updatedColumns);
                const setExpressions = keys
                    .map((key, index) => `${key} = $${index + 2}`)
                    .join(", ");
                const sql = `UPDATE users SET ${setExpressions} WHERE id = $1 RETURNING *`;
                const result = yield conn.query(sql, [id, ...values]);
                conn.release();
                return result.rows[0];
            }
            catch (error) {
                throw new Error(`unable to update User: ${error}`);
            }
        });
    }
}
exports.default = UserModel;
