import { Response, Request, NextFunction } from "express";
import { upload } from "../app";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

export default function uploadFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  upload.single("cover")(req, res, async (err: unknown) => {
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
      } else {
        try {
          // Upload the file to Cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "my-blog-uploads/",
          });

          // Extract the public URL of the uploaded file from the Cloudinary response
          const cover = `${result.public_id} ${result.version}`;

          // store image id in the blog post data
          req.body.cover = cover;

          // Remove the uploaded file from the server
          fs.unlinkSync(file.path);

          // Proceed to the next middleware or route handler
          next();
        } catch (error) {
          console.error("Error uploading file to Cloudinary:", error);
          res
            .status(500)
            .json({ error: "Failed to upload file to Cloudinary" });
        }
      }
    } else if (file) {
      // store image path in the blog post data
      // and the cloudinary update logic will be in the update method in model to enter a transaction
      // so we just pass it through here
      req.body.newCover = file.path;

      // Proceed to the next middleware or route handler
      next();
    } else {
      // if its put method and the user did not provide a cover image then keep the old one
      // and Proceed to the next middleware or route handler
      next();
    }
  });
}
