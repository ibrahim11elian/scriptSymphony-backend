import authenticationMiddleware from "../authentication";
import jwt, { Secret } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

// Mock the response and next function
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
} as unknown as Response;

const mockNext = jest.fn() as NextFunction;

describe("Authentication Middleware", () => {
  it("should pass authentication and set user name in request body when valid token is provided", () => {
    // Mock a valid token
    const token = jwt.sign(
      { name: "testUser" },
      process.env.TOKEN_SECRET as Secret
    );

    // Mock request object with the token in the authorization header
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {},
    } as Request;

    // Call the authentication middleware
    authenticationMiddleware(req, res, mockNext);

    // Expect that the request body has the user name set
    expect(req.body.userName).toBe("testUser");

    // Expect that next() function is called
    expect(mockNext).toHaveBeenCalled();
  });

  it("should return 401 if no token is provided", () => {
    // Mock request object without the authorization header
    const req = {
      headers: {},
    } as Request;

    // Call the authentication middleware
    authenticationMiddleware(req, res, mockNext);

    // Expect that the response status is 401
    expect(res.status).toHaveBeenCalledWith(401);
    // Expect that the response message indicates token is missing
    expect(res.json).toHaveBeenCalledWith({
      message: "Access denied, token missing",
    });

    // Expect that next() function is not called
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 if token is invalid", () => {
    // Mock request object with an invalid token
    const req = {
      headers: {
        authorization: "Bearer invalid_token",
      },
    } as Request;

    // Call the authentication middleware
    authenticationMiddleware(req, res, mockNext);

    // Expect that the response status is 401
    expect(res.status).toHaveBeenCalledWith(401);
    // Expect that the response message indicates token is not valid
    expect(res.json).toHaveBeenCalledWith({
      message: "Token is not valid",
    });

    // Expect that next() function is not called
    expect(mockNext).not.toHaveBeenCalled();
  });
});
