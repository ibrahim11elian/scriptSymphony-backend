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
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
class TagModel {
    createTag(tag) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tag: tag_name, article_id } = tag;
                yield database_1.db.query("INSERT INTO tags (tag, article_id) VALUES ($1, $2)", [
                    tag_name,
                    article_id,
                ]);
            }
            catch (error) {
                throw new Error(`Error creating tag: ${error.message}`);
            }
        });
    }
    getTagsByArticleId(article_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield database_1.db.query("SELECT * FROM tags WHERE article_id = $1", [article_id]);
                return result.rows;
            }
            catch (error) {
                throw new Error(`Error getting tags: ${error.message}`);
            }
        });
    }
    deleteTagsByArticleId(article_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield database_1.db.query("DELETE FROM tags WHERE article_id = $1", [article_id]);
            }
            catch (error) {
                throw new Error(`Error deleting tags: ${error.message}`);
            }
        });
    }
}
exports.default = TagModel;
