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
const app_1 = require("../app");
const cloudinary_1 = require("cloudinary");
function uploadFile(req, res, next) {
    app_1.upload.single("cover")(req, res, (err) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (err instanceof Error) {
            res.status(400).json({ error: "Failed to upload file" });
            return;
        }
        req.body = JSON.parse(req.body.data);
        // Access the uploaded file buffer from the request object
        const fileBuffer = (_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer;
        if (req.method === "POST") {
            // Check if the file exists
            if (!fileBuffer) {
                res.status(400).json({ error: "No file uploaded" });
                return;
            }
            else {
                try {
                    // Upload the file buffer to Cloudinary
                    const result = yield cloudinary_1.v2.uploader.upload_stream({ resource_type: "auto", folder: "my-blog-uploads/" }, (error, result) => __awaiter(this, void 0, void 0, function* () {
                        if (error) {
                            console.error("Error uploading file to Cloudinary:", error);
                            res
                                .status(500)
                                .json({ error: "Failed to upload file to Cloudinary" });
                            return;
                        }
                        // Extract the public URL of the uploaded file from the Cloudinary response
                        const cover = `${result === null || result === void 0 ? void 0 : result.public_id} ${result === null || result === void 0 ? void 0 : result.version}`;
                        // Store image id in the blog post data
                        req.body.cover = cover;
                        // Proceed to the next middleware or route handler
                        next();
                    }));
                    // Write the file buffer to the stream
                    result.end(fileBuffer);
                }
                catch (error) {
                    console.error("Error uploading file to Cloudinary:", error);
                    res
                        .status(500)
                        .json({ error: "Failed to upload file to Cloudinary" });
                }
            }
        }
        else if (fileBuffer) {
            // Store image path in the blog post data
            // and the cloudinary update logic will be in the update method in model to enter a transaction
            // so we just pass it through here
            req.body.newCover = fileBuffer;
            // Proceed to the next middleware or route handler
            next();
        }
        else {
            // If it's a put method and the user did not provide a cover image then keep the old one
            // and proceed to the next middleware or route handler
            next();
        }
    }));
}
exports.default = uploadFile;
