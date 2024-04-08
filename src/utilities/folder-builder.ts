import fs from "fs";
import path from "path";

export const folderBuilder = () => {
  const uploads = path.join(__dirname, "../..", "uploads");

  // Check if the destination folder exists
  if (!fs.existsSync(uploads)) {
    // Create the destination folder
    fs.mkdirSync(uploads, { recursive: true });
  }
};
