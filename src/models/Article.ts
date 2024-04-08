import { db } from "../database";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export type Article = {
  id?: number;
  title: string;
  author: string;
  description?: string;
  content: string;
  views?: number;
  cover?: string;
  date?: Date;
};

class ArticleModel {
  async createArticle(article: Article): Promise<Article> {
    let conn;
    try {
      conn = await db.connect();
      const { title, author, description, content, cover } = article;

      const result = await conn.query(
        "INSERT INTO articles (title, author, description, content, cover) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [title, author, description, content, cover]
      );
      return result.rows[0];
    } catch (error: any) {
      throw new Error(`Error creating article: ${error.message}`);
    } finally {
      if (conn) {
        conn.release(); // Release the connection in the finally block
      }
    }
  }

  async getRecentArticles(): Promise<Article[]> {
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
      const hottestRecentArticleResult = await db.query(
        hottestRecentArticleQuery
      );
      const hottestRecentArticle = hottestRecentArticleResult.rows[0];

      // Fetch the other two most recent articles
      const otherRecentArticlesQuery = `
                SELECT id, date, title, author, description, cover, views FROM articles
                WHERE id != $1
                ORDER BY date DESC
                LIMIT 2;
            `;
      const otherRecentArticlesResult = await db.query(
        otherRecentArticlesQuery,
        [hottestRecentArticle.id]
      );
      const otherRecentArticles = otherRecentArticlesResult.rows;

      // Combine and return the hottest recent article and the other two most recent articles
      return [
        { hottest: true, ...hottestRecentArticle },
        ...otherRecentArticles,
      ];
    } catch (error: any) {
      throw new Error(`Error getting recent articles: ${error.message}`);
    }
  }

  /**
   * Retrieves paginated articles from the database.
   * @param itemsPerPage Number of items per page.
   * @param offset Offset for pagination.
   * @param excludeIds Articles ids to exclude.
   * @returns A tuple containing an array of articles for the current page and the total number of items.
   */
  async getArticles(
    excludeIds: number[] = [],
    itemsPerPage?: number,
    offset?: number
  ): Promise<[Article[], number]> {
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

      const queryParams: any[] = [];

      // Check if itemsPerPage is specified
      if (itemsPerPage) {
        query += `
        LIMIT $1 OFFSET $2;
      `;
        queryParams.push(itemsPerPage, offset);
      }

      const articlesResult = await db.query(query, queryParams);

      // Fetch total items count if itemsPerPage is specified
      const countQuery = "SELECT COUNT(*) FROM articles;";
      const totalItemsResult = await db.query(countQuery);
      const totalItems = parseInt(totalItemsResult.rows[0].count, 10);

      return [articlesResult.rows, totalItems];
    } catch (error: any) {
      throw new Error(`Error getting articles: ${error.message}`);
    }
  }

  async getArticleById(id: number): Promise<Article | null> {
    try {
      const result = await db.query("SELECT * FROM articles WHERE id = $1", [
        id,
      ]);
      return result.rows[0] || null;
    } catch (error: any) {
      throw new Error(`Error getting article: ${error.message}`);
    }
  }

  async incrementArticleViews(id: number): Promise<void> {
    try {
      const query = `
                UPDATE articles
                SET views = views + 1
                WHERE id = $1;
            `;
      await db.query(query, [id]);
    } catch (error: any) {
      throw new Error(`Error incrementing article views: ${error.message}`);
    }
  }

  async updateArticle(id: number, article: Partial<Article>): Promise<void> {
    try {
      // begin a  transaction to ensure data integrity
      await db.query("BEGIN");
      const { title, author, description, content, cover } = article;

      const updateArticleQuery = `
                UPDATE articles
                SET title = $1,
                    author = $2,
                    description = $3,
                    content = $4
                WHERE id = $5 RETURNING *
            `;
      const oldPublic_id = await db.query(updateArticleQuery, [
        title,
        author,
        description,
        content,
        id,
      ]);

      // If the article update is successful, update the cover image in Cloudinary
      if (cover) {
        const result = await cloudinary.uploader.upload(cover, {
          public_id: oldPublic_id.rows[0].cover.split(" ")[0],
        });
        // If the Cloudinary upload is successful, update the reference to the cover image in the database
        const updateCoverQuery = `UPDATE articles
                                  SET cover = $1
                                  WHERE id = $2`;
        const newPublicId = `${result.public_id} ${result.version}`;
        await db.query(updateCoverQuery, [newPublicId, id]);

        // Remove the uploaded file from the server
        fs.unlinkSync(cover);
      }
      await db.query("COMMIT");
      return;
    } catch (error: any) {
      await db.query("ROLLBACK");
      throw new Error(`Error updating article: ${error.message}`);
    }
  }

  async deleteArticle(id: number): Promise<void> {
    try {
      await db.query("DELETE FROM articles WHERE id = $1", [id]);
    } catch (error: any) {
      throw new Error(`Error deleting article: ${error.message}`);
    }
  }
}

export default ArticleModel;
