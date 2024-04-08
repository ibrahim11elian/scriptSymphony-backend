import { db } from "../database";

export type User = {
  id?: number;
  user_name: string;
  hashed_password: string;
};

class UserModel {
  async createUser(user: User): Promise<void> {
    let conn;
    try {
      conn = await db.connect();

      const { user_name, hashed_password } = user;
      await conn.query(
        "INSERT INTO users (user_name, hashed_password) VALUES ($1, $2)",
        [user_name, hashed_password]
      );
    } catch (error: any) {
      throw new Error(`Error creating user: ${error.message}`);
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  async getUserByUserName(user_name: string): Promise<User | null> {
    try {
      const result = await db.query(
        "SELECT * FROM users WHERE user_name = $1",
        [user_name]
      );
      return result.rows[0] || null;
    } catch (error: any) {
      throw new Error(`Error getting user: ${error.message}`);
    }
  }

  async updateUser(id: User["id"], updatedColumns: object): Promise<User> {
    let conn;
    try {
      conn = await db.connect();
      const keys = Object.keys(updatedColumns);
      const values = Object.values(updatedColumns);
      const setExpressions = keys
        .map((key, index) => `${key} = $${index + 2}`)
        .join(", ");

      const sql = `UPDATE users SET ${setExpressions} WHERE id = $1 RETURNING *`;
      const result = await conn.query(sql, [id, ...values]);

      return result.rows[0];
    } catch (error) {
      throw new Error(`unable to update User: ${error}`);
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }
}

export default UserModel;
