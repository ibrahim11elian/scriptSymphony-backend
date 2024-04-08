import fs from "fs";
import path from "path";
import { folderBuilder } from "../folder-builder";

describe("folderBuilder", () => {
  it("should create the uploads folder if it doesn't exist", () => {
    const uploadsFolder = path.join(__dirname, "../../..", "uploads");

    // Mock fs.existsSync to return false (indicating that the folder doesn't exist)
    jest.spyOn(fs, "existsSync").mockReturnValueOnce(false);

    // Mock fs.mkdirSync to track whether it's called
    const mkdirSyncMock = jest.spyOn(fs, "mkdirSync");

    // Call the folderBuilder function
    folderBuilder();

    // Expect fs.existsSync to have been called with the uploads folder path
    expect(fs.existsSync).toHaveBeenCalledWith(uploadsFolder);

    // Expect fs.mkdirSync to have been called with the uploads folder path and options
    expect(mkdirSyncMock).toHaveBeenCalledWith(uploadsFolder, {
      recursive: true,
    });
  });

  it("should not create the uploads folder if it already exists", () => {
    // Mock fs.existsSync to return true (indicating that the folder already exists)
    jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);

    // Mock fs.mkdirSync to track whether it's called
    const mkdirSyncMock = jest.spyOn(fs, "mkdirSync");

    // Call the folderBuilder function
    folderBuilder();

    // Expect fs.existsSync to have been called with the uploads folder path
    expect(fs.existsSync).toHaveBeenCalled();

    // Expect fs.mkdirSync not to have been called
    expect(mkdirSyncMock).not.toHaveBeenCalled();
  });
});
