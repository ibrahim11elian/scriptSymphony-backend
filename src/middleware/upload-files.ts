import { Response, Request, NextFunction } from "express";
import { upload } from "../app";
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

    // Access the uploaded file buffer from the request object
    const fileBuffer = req.file?.buffer;

    if (req.method === "POST") {
      // Check if the file exists
      if (!fileBuffer) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      } else {
        try {
          // Upload the file buffer to Cloudinary
          const result = await cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "my-blog-uploads/" },
            async (error, result) => {
              if (error) {
                console.error("Error uploading file to Cloudinary:", error);
                res
                  .status(500)
                  .json({ error: "Failed to upload file to Cloudinary" });
                return;
              }

              // Extract the public URL of the uploaded file from the Cloudinary response
              const cover = `${result?.public_id} ${result?.version}`;

              // Store image id in the blog post data
              req.body.cover = cover;

              // Proceed to the next middleware or route handler
              next();
            }
          );

          // Write the file buffer to the stream
          result.end(fileBuffer);
        } catch (error) {
          console.error("Error uploading file to Cloudinary:", error);
          res
            .status(500)
            .json({ error: "Failed to upload file to Cloudinary" });
        }
      }
    } else if (fileBuffer) {
      // Store image path in the blog post data
      // and the cloudinary update logic will be in the update method in model to enter a transaction
      // so we just pass it through here
      req.body.newCover = fileBuffer;

      // Proceed to the next middleware or route handler
      next();
    } else {
      // If it's a put method and the user did not provide a cover image then keep the old one
      // and proceed to the next middleware or route handler
      next();
    }
  });
}
