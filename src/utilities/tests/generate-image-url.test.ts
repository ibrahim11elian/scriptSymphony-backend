import generateImageUrl from "../generate-image-url"; // Update the path as needed
import { v2 as cloudinary } from "cloudinary";

// Mock the cloudinary module
jest.mock("cloudinary", () => ({
  v2: {
    url: jest.fn().mockImplementation((publicId, options) => {
      return `https://example.com/${publicId}?${Object.entries(options)
        .map(([key, value]) => `${key}=${value}`)
        .join("&")}`;
    }),
  },
}));

describe("generateImageUrl", () => {
  it("should generate a secure URL for an image using its public ID", () => {
    const publicId = "example_public_id 1";
    const expectedUrl =
      "https://example.com/example_public_id?version=1&format=jpg&shorten=true";

    // Call the generateImageUrl function
    const imageUrl = generateImageUrl(publicId);

    // Verify that cloudinary.v2.url was called with the correct arguments
    expect(cloudinary.url).toHaveBeenCalledWith(publicId.split(" ")[0], {
      version: "1",
      format: "jpg",
      shorten: true,
    });

    // Verify that the function returns the expected URL
    expect(imageUrl).toBe(expectedUrl);
  });
});
