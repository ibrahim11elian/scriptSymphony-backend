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
const app_1 = require("../app");
const fs_1 = __importDefault(require("fs"));
const cloudinary_1 = require("cloudinary");
function uploadFile(req, res, next) {
    app_1.upload.single("cover")(req, res, (err) => __awaiter(this, void 0, void 0, function* () {
        if (err instanceof Error) {
            res.status(400).json({ error: "Failed to upload file" });
            return;
        }
        req.body = JSON.parse(req.body.data);
        // Access the uploaded file from the request object
        const file = req.file;
        if (req.method === "POST") {
            // Check if the file exists
            if (!file) {
                res.status(400).json({ error: "No file uploaded" });
                return;
            }
            else {
                try {
                    // Upload the file to Cloudinary
                    const result = yield cloudinary_1.v2.uploader.upload(file.path, {
                        folder: "my-blog-uploads/",
                    });
                    // Extract the public URL of the uploaded file from the Cloudinary response
                    const cover = `${result.public_id} ${result.version}`;
                    // store image id in the blog post data
                    req.body.cover = cover;
                    // Remove the uploaded file from the server
                    fs_1.default.unlinkSync(file.path);
                    // Proceed to the next middleware or route handler
                    next();
                }
                catch (error) {
                    console.error("Error uploading file to Cloudinary:", error);
                    res
                        .status(500)
                        .json({ error: "Failed to upload file to Cloudinary" });
                }
            }
        }
        else if (file) {
            // store image id in the blog post data
            req.body.newCover = file.path;
            // Proceed to the next middleware or route handler
            next();
        }
        else {
            // if its put method and the user did not provide a cover image then keep the old one
            // and Proceed to the next middleware or route handler
            next();
        }
    }));
}
exports.default = uploadFile;
