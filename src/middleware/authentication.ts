import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

export default function authentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader: string = req.headers["authorization"] as string;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access denied, token missing" });
    return;
  }

  try {
    const user = jwt.verify(
      token as string,
      process.env.TOKEN_SECRET as Secret
    ) as JwtPayload;

    req.body.userName = user.name;

    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
}
