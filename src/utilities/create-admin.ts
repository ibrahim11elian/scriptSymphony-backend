import User from "../models/User";

export const createAdmin = async () => {
  try {
    // Destructure environment variables with default parameters
    const { ADMIN_NAME, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_PASSWORD) {
      throw new Error(
        "Admin name or password is missing in environment variables."
      );
    }

    const user = new User();
    const existingUser = await user.getUserByUserName(ADMIN_NAME);

    if (!existingUser) {
      await user.createUser({
        user_name: ADMIN_NAME,
        hashed_password: ADMIN_PASSWORD,
      });
      console.log("Admin user created successfully.");
    }
  } catch (error: any) {
    console.error("Error creating admin user:", error.message);
  }
};
