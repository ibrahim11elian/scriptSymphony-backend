import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// getting environment variables from .env folder
const {
  PG_HOST,
  PG_USER,
  PG_DATABASE,
  PG_PASSWORD,
  PG_PORT,
  PG_TEST_DATABASE,
  NODE_ENV,
} = process.env;

// database connection
export const db = new Pool({
  host: PG_HOST,
  ssl: {
    rejectUnauthorized: false, // This is important for Supabase
  },
  user: PG_USER,
  database: NODE_ENV === "DEV" ? PG_DATABASE : PG_TEST_DATABASE,
  password: PG_PASSWORD,
  port: Number(PG_PORT),
});

db.on("error", (err) => console.error(`database connection failed: ${err}`));

db.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  console.log("Database connected successfully");
  release();
});
