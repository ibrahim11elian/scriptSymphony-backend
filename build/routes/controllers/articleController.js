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
exports.deleteArticle = exports.updateArticle = exports.getArticleById = exports.getRecentAndHottestArticles = exports.getArticles = exports.createArticle = void 0;
const Article_1 = __importDefault(require("../../models/Article"));
const Tag_1 = __importDefault(require("../../models/Tag"));
const CacheManager_1 = __importDefault(require("../../cache/CacheManager"));
const generate_image_url_1 = __importDefault(require("../../utilities/generate-image-url"));
const cloudinary_1 = require("cloudinary");
const articleModel = new Article_1.default();
const tagModel = new Tag_1.default();
// Create an instance of the cache manager
const cacheManager = new CacheManager_1.default();
const createArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, author, description, content, cover, tags } = req.body;
        // Create the article
        const newArticle = {
            title,
            author,
            description,
            content,
            cover,
        };
        const article = yield articleModel.createArticle(newArticle);
        // Create tags for the article
        if (tags && Array.isArray(tags)) {
            const tagPromises = tags.map((tag) => __awaiter(void 0, void 0, void 0, function* () {
                const newTag = {
                    tag,
                    article_id: article === null || article === void 0 ? void 0 : article.id,
                };
                yield tagModel.createTag(newTag);
            }));
            yield Promise.all(tagPromises);
        }
        // Refresh the articles list in cache to update it with the newly created one
        cacheManager.refreshCache();
        // Set the response and status code
        res
            .status(201)
            .json({ code: 201, message: "Article created successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createArticle = createArticle;
const getArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page); // Current page number
        const itemsPerPage = parseInt(req.query.itemsPerPage); // Items per page
        // Offset dictates the number of rows to skip from the beginning of the returned data before presenting the results.
        const offset = (page - 1) * itemsPerPage;
        // Fetch recent articles from cache or database
        const recentArticles = yield cacheManager.getRecentArticles();
        // Extract IDs of recent articles
        const excludeIds = recentArticles === null || recentArticles === void 0 ? void 0 : recentArticles.map((article) => article.id);
        // Fetch articles for "All Articles" section, excluding recent articles
        const [articles, totalItems] = yield articleModel.getArticles(excludeIds, itemsPerPage, offset);
        // Map articles with tags using Promise.all
        const articlesWithTags = yield Promise.all(articles.map((e) => __awaiter(void 0, void 0, void 0, function* () {
            // generate a secure URL (from cloudinary) for an image using its public ID that stored in DB
            e.cover = (0, generate_image_url_1.default)(e.cover);
            const articlesTags = yield tagModel.getTagsByArticleId(e.id);
            return Object.assign(Object.assign({}, e), { tags: articlesTags });
        })));
        res.status(200).json({
            data: articlesWithTags,
            totalItems,
            currentPage: page,
            itemsPerPage,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getArticles = getArticles;
// Controller function to fetch the most recent and hottest (most viewed in last week) articles
const getRecentAndHottestArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch recent articles from cache or database
        const recentArticles = yield cacheManager.getRecentArticles();
        recentArticles.forEach((article) => {
            // generate a secure URL (from cloudinary) for an image using its public ID that stored in DB
            article.cover = (0, generate_image_url_1.default)(article.cover);
        });
        // Send the fetched data as a response to the client
        res.status(200).json(recentArticles);
    }
    catch (error) {
        // Handle any errors and send an error response
        res.status(500).json({ error: error.message });
    }
});
exports.getRecentAndHottestArticles = getRecentAndHottestArticles;
const getArticleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const article = yield articleModel.getArticleById(id);
        if (!article) {
            res.status(404).json({ message: "Article not found" });
            return;
        }
        // Increment view count
        if (article) {
            yield articleModel.incrementArticleViews(id);
        }
        const tags = yield tagModel.getTagsByArticleId(id);
        // generate a secure URL (from cloudinary) for an image using its public ID that stored in DB
        article.cover = (0, generate_image_url_1.default)(article.cover);
        res.status(200).json(Object.assign(Object.assign({}, article), { tags }));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getArticleById = getArticleById;
const updateArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { title, author, description, content, newCover, tags } = req.body;
        // Prepare updated article details
        const updatedArticle = {
            title,
            author,
            description,
            content,
            cover: newCover,
        };
        // Update article details
        yield articleModel.updateArticle(id, updatedArticle);
        // Update associated tags
        if (tags && Array.isArray(tags)) {
            yield tagModel.deleteTagsByArticleId(id); // Delete existing tags for the article
            const tagPromises = tags.map((tag) => __awaiter(void 0, void 0, void 0, function* () {
                const newTag = {
                    tag,
                    article_id: id,
                };
                yield tagModel.createTag(newTag);
            }));
            yield Promise.all(tagPromises);
        }
        // Refresh the articles list in cache to update it with the updated one
        cacheManager.refreshCache();
        res
            .status(200)
            .json({ code: 200, message: "Article updated successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateArticle = updateArticle;
const deleteArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // check if the article exist
        const id = parseInt(req.params.id);
        const isExist = yield articleModel.getArticleById(id);
        if (!isExist) {
            res.status(404).json({ massage: "the article does not exist" });
            return;
        }
        const publicId = (_a = isExist.cover) === null || _a === void 0 ? void 0 : _a.split(" ")[0];
        // delete the image on cloudinary by public ID
        yield cloudinary_1.v2.uploader.destroy(publicId);
        yield articleModel.deleteArticle(id);
        // Refresh the articles list in cache to update it with the newly created one
        cacheManager.refreshCache();
        res.status(204).json({ message: "Article deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deleteArticle = deleteArticle;
