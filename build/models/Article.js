"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
class ArticleModel {
    createArticle(article) {
        return __awaiter(this, void 0, void 0, function* () {
            let conn;
            try {
                conn = yield database_1.db.connect();
                const { title, author, description, content, cover } = article;
                const result = yield conn.query("INSERT INTO articles (title, author, description, content, cover) VALUES ($1, $2, $3, $4, $5) RETURNING *", [title, author, description, content, cover]);
                return result.rows[0];
            }
            catch (error) {
                throw new Error(`Error creating article: ${error.message}`);
            }
            finally {
                if (conn) {
                    conn.release(); // Release the connection in the finally block
                }
            }
        });
    }
    getRecentArticles() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch the hottest recent article (most viewed in the 5 most recent articles)
                const hottestRecentArticleQuery = `
                SELECT *
                FROM (
                    SELECT id, date, title, author, description, cover, views
                    FROM articles ra 
	                  ORDER BY ra.date DESC
	                  LIMIT 5
                )
                ORDER BY views DESC
                LIMIT 1;
            `;
                const hottestRecentArticleResult = yield database_1.db.query(hottestRecentArticleQuery);
                const hottestRecentArticle = hottestRecentArticleResult.rows[0];
                // Fetch the other two most recent articles
                const otherRecentArticlesQuery = `
                SELECT id, date, title, author, description, cover, views FROM articles
                WHERE id != $1
                ORDER BY date DESC
                LIMIT 2;
            `;
                const otherRecentArticlesResult = yield database_1.db.query(otherRecentArticlesQuery, [hottestRecentArticle.id]);
                const otherRecentArticles = otherRecentArticlesResult.rows;
                // Combine and return the hottest recent article and the other two most recent articles
                return [
                    Object.assign({ hottest: true }, hottestRecentArticle),
                    ...otherRecentArticles,
                ];
            }
            catch (error) {
                throw new Error(`Error getting recent articles: ${error.message}`);
            }
        });
    }
    /**
     * Retrieves paginated articles from the database.
     * @param itemsPerPage Number of items per page.
     * @param offset Offset for pagination.
     * @param excludeIds Articles ids to exclude.
     * @returns A tuple containing an array of articles for the current page and the total number of items.
     */
    getArticles(excludeIds = [], itemsPerPage, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const excludeCondition = excludeIds.length
                    ? `AND id NOT IN (${excludeIds.join(",")})`
                    : "";
                let query = `
      SELECT id, date, title, author, description, cover, views FROM articles
      WHERE 1=1
      ${excludeCondition}
      ORDER BY id DESC
    `;
                const queryParams = [];
                // Check if itemsPerPage is specified
                if (itemsPerPage) {
                    query += `
        LIMIT $1 OFFSET $2;
      `;
                    queryParams.push(itemsPerPage, offset);
                }
                const articlesResult = yield database_1.db.query(query, queryParams);
                // Fetch total items count if itemsPerPage is specified
                const countQuery = "SELECT COUNT(*) FROM articles;";
                const totalItemsResult = yield database_1.db.query(countQuery);
                const totalItems = parseInt(totalItemsResult.rows[0].count, 10);
                return [articlesResult.rows, totalItems];
            }
            catch (error) {
                throw new Error(`Error getting articles: ${error.message}`);
            }
        });
    }
    getArticleById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield database_1.db.query("SELECT * FROM articles WHERE id = $1", [
                    id,
                ]);
                return result.rows[0] || null;
            }
            catch (error) {
                throw new Error(`Error getting article: ${error.message}`);
            }
        });
    }
    incrementArticleViews(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = `
                UPDATE articles
                SET views = views + 1
                WHERE id = $1;
            `;
                yield database_1.db.query(query, [id]);
            }
            catch (error) {
                throw new Error(`Error incrementing article views: ${error.message}`);
            }
        });
    }
    updateArticle(id, article) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // begin a  transaction to ensure data integrity
                yield database_1.db.query("BEGIN");
                const { title, author, description, content, cover } = article;
                const updateArticleQuery = `
                UPDATE articles
                SET title = $1,
                    author = $2,
                    description = $3,
                    content = $4
                WHERE id = $5 RETURNING *
            `;
                const oldPublic_id = yield database_1.db.query(updateArticleQuery, [
                    title,
                    author,
                    description,
                    content,
                    id,
                ]);
                // If the article update is successful, update the cover image in Cloudinary
                if (cover) {
                    const result = yield cloudinary_1.v2.uploader.upload(cover, {
                        public_id: oldPublic_id.rows[0].cover.split(" ")[0],
                    });
                    // If the Cloudinary upload is successful, update the reference to the cover image in the database
                    const updateCoverQuery = `UPDATE articles
                                  SET cover = $1
                                  WHERE id = $2`;
                    const newPublicId = `${result.public_id} ${result.version}`;
                    yield database_1.db.query(updateCoverQuery, [newPublicId, id]);
                    // Remove the uploaded file from the server
                    fs_1.default.unlinkSync(cover);
                }
                yield database_1.db.query("COMMIT");
                return;
            }
            catch (error) {
                yield database_1.db.query("ROLLBACK");
                throw new Error(`Error updating article: ${error.message}`);
            }
        });
    }
    deleteArticle(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield database_1.db.query("DELETE FROM articles WHERE id = $1", [id]);
            }
            catch (error) {
                throw new Error(`Error deleting article: ${error.message}`);
            }
        });
    }
}
exports.default = ArticleModel;
