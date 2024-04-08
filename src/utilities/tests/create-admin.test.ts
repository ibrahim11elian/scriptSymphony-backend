import { createAdmin } from "../create-admin";
import User from "../../models/User";
import bcrypt from "bcrypt";

// Mocking User model methods
jest.mock("../../models/User");
// Mock bcrypt
jest.mock("bcrypt");
// Mock console.error
const consoleErrorMock = jest.spyOn(console, "error").mockImplementation();

describe("createAdmin utility function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create admin user if it doesn't exist", async () => {
    // Mocking getUserByUserName to return null (user doesn't exist)
    (User.prototype.getUserByUserName as jest.Mock).mockResolvedValueOnce(null);

    (bcrypt.hashSync as jest.Mock).mockReturnValueOnce("password_hashed");

    // Mocking createUser method
    (User.prototype.createUser as jest.Mock).mockResolvedValueOnce(undefined);

    await createAdmin();

    // Expect getUserByUserName to be called with ADMIN_NAME from environment variables
    expect(User.prototype.getUserByUserName).toHaveBeenCalledWith(
      process.env.ADMIN_NAME
    );

    // Expect createUser to be called with admin user details
    expect(User.prototype.createUser).toHaveBeenCalledWith({
      user_name: process.env.ADMIN_NAME,
      hashed_password: "password_hashed",
    });
  });

  it("should not create admin user if it already exists", async () => {
    // Mocking getUserByUserName to return an existing user
    (User.prototype.getUserByUserName as jest.Mock).mockResolvedValueOnce({});

    await createAdmin();

    // Expect getUserByUserName to be called with ADMIN_NAME from environment variables
    expect(User.prototype.getUserByUserName).toHaveBeenCalledWith(
      process.env.ADMIN_NAME
    );

    // Expect createUser not to be called
    expect(User.prototype.createUser).not.toHaveBeenCalled();
  });

  it("should handle missing environment variables", async () => {
    // Removing ADMIN_NAME environment variable
    const oldAdminName = process.env.ADMIN_NAME;
    delete process.env.ADMIN_NAME;

    try {
      await createAdmin();
    } catch (error: any) {
      // Expect an error message to be logged
      expect(error).toContain("missing");
    } finally {
      // Restoring the old value for ADMIN_NAME
      process.env.ADMIN_NAME = oldAdminName;
    }
  });

  it("should handle errors during user creation", async () => {
    const errorMessage = "Error creating user";

    // Mocking getUserByUserName to return null (user doesn't exist)
    (User.prototype.getUserByUserName as jest.Mock).mockResolvedValueOnce(null);

    (bcrypt.hashSync as jest.Mock).mockReturnValueOnce("password_hashed");

    // Mocking createUser method to throw an error
    (User.prototype.createUser as jest.Mock).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    await createAdmin();

    // Expect getUserByUserName to be called with ADMIN_NAME from environment variables
    expect(User.prototype.getUserByUserName as jest.Mock).toHaveBeenCalledWith(
      process.env.ADMIN_NAME
    );

    // Expect createUser to be called with admin user details
    expect(User.prototype.createUser as jest.Mock).toHaveBeenCalledWith({
      user_name: process.env.ADMIN_NAME,
      hashed_password: "password_hashed",
    });

    // Expect an error message to be logged
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error creating admin user:",
      errorMessage
    );
  });
});
