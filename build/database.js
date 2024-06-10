"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// getting environment variables from .env folder
const { PG_HOST, PG_USER, PG_DATABASE, PG_PASSWORD, PG_PORT, PG_TEST_DATABASE, NODE_ENV, } = process.env;
// database connection
exports.db = new pg_1.Pool({
    host: PG_HOST,
    ssl: true,
    user: PG_USER,
    database: NODE_ENV === "DEV" ? PG_DATABASE : PG_TEST_DATABASE,
    password: PG_PASSWORD,
    port: Number(PG_PORT),
});
exports.db.on("error", (err) => console.error(`database connection failed: ${err}`));
