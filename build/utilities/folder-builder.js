"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.folderBuilder = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const folderBuilder = () => {
    const uploads = path_1.default.join(__dirname, "../..", "uploads");
    // Check if the destination folder exists
    if (!fs_1.default.existsSync(uploads)) {
        // Create the destination folder
        fs_1.default.mkdirSync(uploads, { recursive: true });
    }
};
exports.folderBuilder = folderBuilder;
