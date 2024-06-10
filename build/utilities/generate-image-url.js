"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
// Function to generate a secure URL for an image using its public ID
function generateImageUrl(publicId) {
    const [id, version] = publicId.split(" ");
    // Use the cloudinary.url method to generate the secure URL
    const imageUrl = cloudinary_1.v2.url(id, {
        version: version,
        format: "jpg",
        shorten: true,
    });
    return imageUrl;
}
exports.default = generateImageUrl;
