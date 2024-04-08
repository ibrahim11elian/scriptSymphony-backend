import express from "express";
import { login, updateUser } from "./controllers/userController";
import authentication from "../middleware/authentication";
import {
  createArticle,
  deleteArticle,
  getArticleById,
  getArticles,
  getRecentAndHottestArticles,
  updateArticle,
} from "./controllers/articleController";
import uploadFile from "../middleware/upload-files";

const router = express.Router();

// user routes
router.post("/login", login);
router.put("/user", authentication, updateUser);

// article routes
router.post("/article", authentication, uploadFile, createArticle); // only authenticated user
router.get("/article", getArticles);
router.get("/recent-articles", getRecentAndHottestArticles);
router.get("/article/:id", getArticleById);
router.put("/article/:id", authentication, uploadFile, updateArticle); // only authenticated user
router.delete("/article/:id", authentication, deleteArticle); // only authenticated user

// Export the router
export default router;
