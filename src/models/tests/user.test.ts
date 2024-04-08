import UserModel, { User } from "../User"; // Import the UserModel class
import { db } from "../../database";

// Create a mock instance of the UserModel class
const user = new UserModel();

describe("User Model", () => {
  afterAll(async () => {
    await db.end(); // Releases the database connection
  });
  describe("Define Methods", () => {
    it("should have a createUser method", () => {
      expect(user.createUser).toBeDefined();
    });

    it("should have a getUserByUserName method", () => {
      expect(user.getUserByUserName).toBeDefined();
    });

    it("should have an updateUser method", () => {
      expect(user.updateUser).toBeDefined();
    });
  });

  describe("Method Tests", () => {
    let id: number;

    afterEach(() => {
      jest.restoreAllMocks(); // Restore all mocks after each test
    });
    describe("Test createUser Method", () => {
      it("should add a user to the database", async () => {
        const result = await user.createUser({
          user_name: "ibrahim_ahmed",
          hashed_password: "12345678",
        });

        const conn = await db.connect();

        // Query the database to check if the user has been inserted
        const queryResult = await conn.query(
          "SELECT * FROM users WHERE user_name = $1",
          ["ibrahim_ahmed"]
        );

        conn.release();
        // Assert that the user has been inserted correctly
        expect(queryResult.rows.length).toBeGreaterThan(0);
      });
      it("should throw an error when database query fails", async () => {
        // Mock the query method only for this test
        jest
          .spyOn(db, "query")
          .mockImplementationOnce(() => Promise.reject(new Error()));

        try {
          await user.createUser({} as any);
        } catch (error) {
          expect(error).toBeTruthy();
        }
      });
    });

    describe("Test getUserByUserName Method", () => {
      it("should retrieve a user by user name", async () => {
        const result = await user.getUserByUserName("ibrahim_ahmed");
        id = result?.id as number;
        expect(result).not.toBeFalsy();
      });
      it("should throw an error when database query fails", async () => {
        jest
          .spyOn(db, "query")
          .mockImplementationOnce(() => Promise.reject(new Error()));
        try {
          await user.getUserByUserName("user_name");
        } catch (error) {
          expect(error).toBeTruthy();
        }
      });
    });

    describe("Test updateUser Method", () => {
      it("should update user information", async () => {
        const updateUser: User = {
          user_name: "mohamed",
          hashed_password: "87654321",
        };
        const result = await user.updateUser(id, updateUser);
        expect(result).not.toBeFalsy();
      });
      it("should throw an error when database query fails", async () => {
        jest
          .spyOn(db, "query")
          .mockImplementationOnce(() => Promise.reject(new Error()));
        try {
          await user.updateUser(1, {} as any);
        } catch (error) {
          expect(error).toBeTruthy();
        }
      });
    });
  });
});
