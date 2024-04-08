import User from "../../models/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const user = new User();

export async function login(req: Request, res: Response) {
  const user_name: string = req.body.user_name;

  try {
    const user_r = await user.getUserByUserName(user_name);

    if (user_r == null) {
      return res.status(400).send("can't find the user");
    }

    if (await bcrypt.compare(req.body.pass_hash, user_r.hashed_password)) {
      const user = { name: user_name };
      const token = jwt.sign(user, process.env.TOKEN_SECRET as Secret);
      res.status(200).send({ userName: user_name, accessToken: token });
    } else {
      res.status(401).send("password is wrong!!!");
    }
  } catch (error) {
    res.status(500).send("error:" + error);
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    // userName is the old user name in case of changing it.
    // and this old user name come from the authentication middleware.
    const { userName, ...userData } = req.body;

    // Get the user by their old user name to obtain the ID
    const user_r = await user.getUserByUserName(userName);

    if (!user_r) {
      res
        .status(404)
        .json({ error: `User with old user name ${userName} not found.` });
      return;
    }

    // check if the old password user sent is correct or not.
    //(may be it is the front end and using the user token to take his account ;) ).
    if (await bcrypt.compare(userData.pass_hash, user_r.hashed_password)) {
      let updatedUser;
      // If a new password was provided
      if (userData.newPassword) {
        // Hash password before saving it into database
        userData.hashed_password = await bcrypt.hash(
          userData.newPassword,
          Number(process.env.SALT_ROUNDS)
        );
        // Update the user's data using their ID
        updatedUser = await user.updateUser(user_r.id, {
          user_name: userData.user_name,
          hashed_password: userData.hashed_password,
        });
      } else {
        // Update the user's data using their ID
        updatedUser = await user.updateUser(user_r.id, {
          user_name: userData.user_name,
        });
      }

      // Prepare the user object to be included in the token
      const tokenData = { name: updatedUser.user_name };

      // Generate a new access token with updated user data
      const token = jwt.sign(tokenData, process.env.TOKEN_SECRET as Secret);

      // Return the access token and updated user name in the response
      res
        .status(200)
        .json({ accessToken: token, userName: updatedUser.user_name });
    } else {
      res.status(401).send("password is wrong!!!");
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
