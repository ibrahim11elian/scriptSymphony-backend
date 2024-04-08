import { db } from "../database";

export type Tag = {
  id?: number;
  tag: string;
  article_id: number;
};

class TagModel {
  async createTag(tag: Tag): Promise<void> {
    try {
      const { tag: tag_name, article_id } = tag;
      await db.query("INSERT INTO tags (tag, article_id) VALUES ($1, $2)", [
        tag_name,
        article_id,
      ]);
    } catch (error: any) {
      throw new Error(`Error creating tag: ${error.message}`);
    }
  }

  async getTagsByArticleId(article_id: number): Promise<Tag[]> {
    try {
      const result = await db.query(
        "SELECT * FROM tags WHERE article_id = $1",
        [article_id]
      );
      return result.rows;
    } catch (error: any) {
      throw new Error(`Error getting tags: ${error.message}`);
    }
  }

  async deleteTagsByArticleId(article_id: number): Promise<void> {
    try {
      await db.query("DELETE FROM tags WHERE article_id = $1", [article_id]);
    } catch (error: any) {
      throw new Error(`Error deleting tags: ${error.message}`);
    }
  }
}

export default TagModel;
