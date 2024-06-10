"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("./controllers/userController");
const authentication_1 = __importDefault(require("../middleware/authentication"));
const articleController_1 = require("./controllers/articleController");
const upload_files_1 = __importDefault(require("../middleware/upload-files"));
const router = express_1.default.Router();
// user routes
router.post("/login", userController_1.login);
router.put("/user", authentication_1.default, userController_1.updateUser);
// article routes
router.post("/article", authentication_1.default, upload_files_1.default, articleController_1.createArticle); // only authenticated user
router.get("/article", articleController_1.getArticles);
router.get("/recent-articles", articleController_1.getRecentAndHottestArticles);
router.get("/article/:id", articleController_1.getArticleById);
router.put("/article/:id", authentication_1.default, upload_files_1.default, articleController_1.updateArticle); // only authenticated user
router.delete("/article/:id", authentication_1.default, articleController_1.deleteArticle); // only authenticated user
// Export the router
exports.default = router;
