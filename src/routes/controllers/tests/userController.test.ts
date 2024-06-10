import { Request, Response } from "express";
import supertest from "supertest";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import * as userController from "../../controllers/userController";
import User from "../../../models/User";
import app from "../../../app";

jest.mock("../../../models/User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

const request = supertest(app);

describe("User Controller", () => {
  // Mock request and response objects
  const req: Partial<Request> = {
    body: {
      userName: "testUser",
      pass_hash: "old_password",
      newPassword: "new_password",
      user_name: "new_username",
    },
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  };
  describe("login", () => {
    it("should return a token when given correct credentials", async () => {
      // Mock the behavior of the User model method
      (User.prototype.getUserByUserName as jest.Mock).mockResolvedValueOnce({
        user_name: "testUser",
        hashed_password: "hashed_password",
      });

      // Mock bcrypt.compare to return true
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      // Mock jwt.sign to return a token
      (jwt.sign as jest.Mock).mockReturnValueOnce("mocked_token");

      // Call the login function
      await userController.login(req as Request, res as Response);

      // Assert that the response status is 200 and contains the expected data
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        userName: "new_username",
        accessToken: "mocked_token",
      });
    });
    it("should respond with a 400 if no user is found", async () => {
      const mockError = "can't find the user";

      // Mock the behavior of the User model method
      (User.prototype.getUserByUserName as jest.Mock).mockResolvedValueOnce(
        null
      );

      // Call the login function
      await userController.login(req as Request, res as Response);

      // Check that the response was set up correctly
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(mockError);
    });
    it("should respond with a 401 if user password is wrong", async () => {
      const mockError = "password is wrong!!!";

      // Mock the behavior of the User model method
      (User.prototype.getUserByUserName as jest.Mock).mockResolvedValueOnce({
        user_name: "testUser",
        pass_hash: "password",
      });

      // Mock bcrypt.compare to return false
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      // Call the login function
      await userController.login(req as Request, res as Response);

      // Check that the response was set up correctly
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith(mockError);
    });
    it("should respond with a 500 if there is an error", async () => {
      const mockError = "something wrong";

      // Mock the behavior of the User model method
      (User.prototype.getUserByUserName as jest.Mock).mockRejectedValueOnce(
        mockError
      );

      // Call the login function
      await userController.login(req as Request, res as Response);

      // Check that the response was set up correctly
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(`error:${mockError}`);
    });
  });

  describe("POST /login", () => {
    it("should return a token when given correct credentials", async () => {
      // Mock the behavior of getUserByUserName to return a dummy user
      (User.prototype.getUserByUserName as jest.Mock).mockResolvedValueOnce({
        user_name: "testUser",
        hashed_password: "hashed_password",
      });

      // Mock bcrypt.compare to return true
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      // Mock jwt.sign to return a token
      (jwt.sign as jest.Mock).mockReturnValueOnce("mocked_token");

      // Send a request to the login endpoint with correct credentials
      const response = await request
        .post("/api/login")
        .send({ user_name: "testUser", pass_hash: "password" });

      // Assert that the response status is 200 and contains the expected data
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        userName: "testUser",
        accessToken: "mocked_token",
      });
    });
  });

  describe("updateUser", () => {
    it("should update user information and return an access token", async () => {
      // Mock the behavior of the User model method
      (User.prototype.getUserByUserName as jest.Mock).mockResolvedValueOnce({
        id: 1,
        user_name: "testUser",
        hashed_password: "hashed_old_password",
      });

      // Mock bcrypt.compare to return true
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      // Mock bcrypt.hash to return hashed new password
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce("hashed_new_password");

      // Mock the behavior of the User model method for updating user
      (User.prototype.updateUser as jest.Mock).mockResolvedValueOnce({
        id: 1,
        user_name: "new_username",
      });

      // Mock jwt.sign to return a token
      (jwt.sign as jest.Mock).mockReturnValueOnce("mocked_token");

      // Call the updateUser function
      await userController.updateUser(req as Request, res as Response);

      // Assert that the response status is 200 and contains the expected data
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        accessToken: "mocked_token",
        userName: "new_username",
      });
    });
    it("should update user userName and return an access token", async () => {
      // Mock the behavior of the User model method
      (User.prototype.getUserByUserName as jest.Mock).mockResolvedValueOnce({
        id: 1,
        user_name: "testUser",
        hashed_password: "hashed_old_password",
      });

      // Mock bcrypt.compare to return true
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      req.body.newPassword = null;

      // Mock the behavior of the User model method for updating user
      (User.prototype.updateUser as jest.Mock).mockResolvedValueOnce({
        id: 1,
        user_name: "new_username",
      });

      // Mock jwt.sign to return a token
      (jwt.sign as jest.Mock).mockReturnValueOnce("mocked_token");

      // Call the updateUser function
      await userController.updateUser(req as Request, res as Response);

      // Assert that the response status is 200 and contains the expected data
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        accessToken: "mocked_token",
        userName: "new_username",
      });
    });
    it("should respond with a 404 if no user is found", async () => {
      // Mock the behavior of the User model method
      (User.prototype.getUserByUserName as jest.Mock).mockResolvedValueOnce(
        null
      );

      await userController.updateUser(req as Request, res as Response);

      // Check that the response was set up correctly
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: `User with old user name ${req.body.userName} not found.`,
      });
    });
    it("should respond with a 401 if user password is wrong", async () => {
      const mockError = "password is wrong!!!";

      // Mock the behavior of the User model method
      (User.prototype.getUserByUserName as jest.Mock).mockResolvedValueOnce({
        user_name: "testUser",
        pass_hash: "password",
      });

      // Mock bcrypt.compare to return false
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await userController.updateUser(req as Request, res as Response);

      // Check that the response was set up correctly
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith(mockError);
    });
    it("should respond with a 500 if there is an error", async () => {
      const mockError = "something wrong";

      // Mock the behavior of the User model method
      (User.prototype.getUserByUserName as jest.Mock).mockRejectedValueOnce(
        new Error(mockError)
      );

      await userController.updateUser(req as Request, res as Response);

      // Check that the response was set up correctly
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: mockError });
    });
  });
  describe("PUT /updateUser", () => {
    it("should update user profile when given correct credentials", async () => {
      (jwt.verify as jest.Mock).mockResolvedValueOnce({
        name: "testUser",
      } as any);

      // Mock the behavior of getUserByUserName to return a dummy user
      (User.prototype.getUserByUserName as jest.Mock).mockResolvedValueOnce({
        id: 123,
        user_name: "testUser",
        hashed_password: "hashed_password",
      });

      // Mock bcrypt.compare to return true
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      // Mock bcrypt.hash to return a hashed password
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce("hashed_password");

      // Mock the behavior of updateUser to return the updated user
      (User.prototype.updateUser as jest.Mock).mockResolvedValueOnce({
        user_name: "newUserName",
      });

      // Mock jwt.sign to return a token
      (jwt.sign as jest.Mock).mockReturnValueOnce("mocked_token");

      // Send a request to the user endpoint with correct credentials
      const response = await request
        .put("/api/user")
        .set("authorization", `Bearer mocked_token`)
        .send(req.body);

      // Assert that the response status is 200 and contains the expected data
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: "mocked_token",
        userName: "newUserName",
      });
    });
    it("should return 401 if no token is provided", async () => {
      // Define the request body
      const userData = {
        userName: "testUser",
        pass_hash: "old_password",
        newPassword: "new_password",
      };

      // Make the PUT request without a token
      const response = await request.put("/api/user").send(userData);

      // Expect a 401 Unauthorized response
      expect(response.status).toBe(401);
    });
    it("should return 401 if token is invalid", async () => {
      // Define the request body
      const userData = {
        userName: "testUser",
        pass_hash: "old_password",
        newPassword: "new_password",
      };

      // Make the PUT request with an invalid token
      const response = await request
        .put("/api/user")
        .set("Authorization", "Bearer invalid_token")
        .send(userData);

      // Expect a 401 Unauthorized response
      expect(response.status).toBe(401);
    });
  });
});
