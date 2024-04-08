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
const Article_1 = __importDefault(require("../models/Article"));
const Tag_1 = __importDefault(require("../models/Tag"));
// Create an instance of the ArticleModel
const articleModel = new Article_1.default();
const tagModel = new Tag_1.default();
class CacheManager {
    constructor() {
        this.recentArticlesCache = null;
        this.cacheExpiryTime = Date.now() + 2 * 60 * 60 * 1000; // Expiry time set to 2 hours
    }
    // Function to refresh cache with recent articles data
    refreshCache() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const recentArticles = yield articleModel.getRecentArticles();
                const articlesWithTags = recentArticles.map((e) => __awaiter(this, void 0, void 0, function* () {
                    const articlesTags = yield tagModel.getTagsByArticleId(e.id);
                    return Object.assign(Object.assign({}, e), { tags: articlesTags });
                }));
                yield Promise.all(articlesWithTags).then((value) => {
                    this.recentArticlesCache = value;
                });
            }
            catch (error) {
                console.log("Error:" + error);
            }
        });
    }
    // Function to check if cache has expired
    isCacheExpired() {
        return Date.now() >= this.cacheExpiryTime;
    }
    // Function to get recent articles from cache or database
    getRecentArticles() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.recentArticlesCache || this.isCacheExpired()) {
                yield this.refreshCache();
            }
            return this.recentArticlesCache;
        });
    }
}
exports.default = CacheManager;
