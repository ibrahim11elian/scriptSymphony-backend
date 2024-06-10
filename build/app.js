"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.storage = exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const folder_builder_1 = require("./utilities/folder-builder");
const cloudinary_1 = require("cloudinary");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes/routes"));
const create_admin_1 = require("./utilities/create-admin");
dotenv_1.default.config();
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
const PORT = process.env.PORT || 3000;
// creating the files folders to store the uploaded files
(0, folder_builder_1.folderBuilder)();
// create Admin user if there is no one in database yet
(0, create_admin_1.createAdmin)();
exports.app.use(express_1.default.urlencoded({ extended: false }));
exports.app.use(express_1.default.json());
exports.app.use("/api", routes_1.default);
// Configure Multer
exports.storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original filename for the uploaded file
    },
});
// Create a Multer instance with the above configuration
exports.upload = (0, multer_1.default)({
    storage: exports.storage,
    limits: { fileSize: 200 * 1024 * 1024 },
});
exports.app.get("/", (req, res) => {
    res.send(`<h1> Welcome to the blog API </h1>`);
});
// Start the server
exports.app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
