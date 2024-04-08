import { v2 as cloudinary } from "cloudinary";

// Function to generate a secure URL for an image using its public ID
export default function generateImageUrl(publicId: string): string {
  const [id, version] = publicId.split(" ");
  // Use the cloudinary.url method to generate the secure URL
  const imageUrl = cloudinary.url(id, {
    version: version,
    format: "jpg",
    shorten: true,
  });

  return imageUrl;
}
