import { Request, Response } from "express";
import dotenv from "dotenv";
import multer from "multer";
import { folderBuilder } from "./utilities/folder-builder";
import { v2 as cloudinary } from "cloudinary";
import express from "express";
import cors from "cors";
import router from "./routes/routes";
import { createAdmin } from "./utilities/create-admin";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const app = express();

app.use(cors());

const PORT = process.env.PORT || 3000;

// creating the files folders to store the uploaded files
folderBuilder();

// create Admin user if there is no one in database yet
createAdmin();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api", router);

// Configure Multer
export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename for the uploaded file
  },
});

// Create a Multer instance with the above configuration
export const upload = multer({
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 },
});

app.get("/", (req: Request, res: Response) => {
  res.send(`<h1> Welcome to the blog API </h1>`);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
