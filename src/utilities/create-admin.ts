import User from "../models/User";
import bcrypt from "bcrypt";

export const createAdmin = async () => {
  try {
    // Destructure environment variables with default parameters
    const { ADMIN_NAME, ADMIN_PASSWORD, SALT_ROUNDS } = process.env;

    if (!ADMIN_NAME || !ADMIN_PASSWORD) {
      throw new Error(
        "Admin name or password is missing in environment variables."
      );
    }

    const user = new User();
    const existingUser = await user.getUserByUserName(ADMIN_NAME);

    if (!existingUser) {
      const hashed_password = bcrypt.hashSync(
        ADMIN_PASSWORD,
        parseInt(SALT_ROUNDS as string)
      );
      await user.createUser({
        user_name: ADMIN_NAME,
        hashed_password: hashed_password,
      });
      console.log("Admin user created successfully.");
    }
  } catch (error: any) {
    console.error("Error creating admin user:", error.message);
  }
};
