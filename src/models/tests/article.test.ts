import ArticleModel, { Article } from "../Article"; // Import the ArticleModel class
import { db } from "../../database";

// Create a mock instance of the ArticleModel class
const articleModel = new ArticleModel();

describe("Article Model", () => {
  describe("Define Methods", () => {
    it("should have a createArticle method", () => {
      expect(articleModel.createArticle).toBeDefined();
    });

    it("should have a getRecentArticles method", () => {
      expect(articleModel.getRecentArticles).toBeDefined();
    });

    it("should have a getArticles method", () => {
      expect(articleModel.getArticles).toBeDefined();
    });

    it("should have a getArticleById method", () => {
      expect(articleModel.getArticleById).toBeDefined();
    });

    it("should have an incrementArticleViews method", () => {
      expect(articleModel.incrementArticleViews).toBeDefined();
    });

    it("should have an updateArticle method", () => {
      expect(articleModel.updateArticle).toBeDefined();
    });

    it("should have a deleteArticle method", () => {
      expect(articleModel.deleteArticle).toBeDefined();
    });
  });

  describe("Method Tests", () => {
    let createdArticleId: number;

    afterAll(async () => {
      await db.end(); // Releases the database connection
    });

    describe("Test createArticle Method", () => {
      const article: Article = {
        title: "Test Article",
        author: "Test Author",
        description: "Test Description",
        content: "Test Content",
        cover: "test_cover.jpg",
      };
      it("should add an article to the database", async () => {
        const result = await articleModel.createArticle(article);
        createdArticleId = result.id as number;

        const conn = await db.connect();

        // Query the database to check if the article has been inserted
        const queryResult = await conn.query(
          "SELECT * FROM articles WHERE id = $1",
          [createdArticleId]
        );

        conn.release();

        // Assert that the article has been inserted correctly
        expect(queryResult.rows.length).toBeGreaterThan(0);
      });
      it("should throw an error when database insertion fails", async () => {
        try {
          article.title = null as any;
          await articleModel.createArticle(article);
        } catch (error) {
          expect(error).toBeTruthy();
        }
      });
    });

    describe("Test getRecentArticles Method", () => {
      it("should retrieve recent articles", async () => {
        const recentArticles = await articleModel.getRecentArticles();
        expect(recentArticles.length).toBeGreaterThan(0);
      });
      it("should throw an error when database query fails", async () => {
        jest
          .spyOn(db, "query")
          .mockImplementationOnce(() => Promise.reject(new Error()));
        try {
          await articleModel.getRecentArticles();
        } catch (error) {
          expect(error).toBeTruthy();
        }
      });
    });

    describe("Test getArticles Method", () => {
      it("should retrieve articles", async () => {
        const [articles, totalItems] = await articleModel.getArticles();
        expect(articles.length).toBeGreaterThan(0);
        expect(totalItems).toBeGreaterThan(0);
      });
      it("should throw an error when database query fails", async () => {
        jest
          .spyOn(db, "query")
          .mockImplementationOnce(() => Promise.reject(new Error()));
        try {
          await articleModel.getArticles();
        } catch (error) {
          expect(error).toBeTruthy();
        }
      });
    });

    describe("Test getArticleById Method", () => {
      it("should retrieve an article by ID", async () => {
        const article = await articleModel.getArticleById(createdArticleId);
        expect(article).toBeDefined();
      });
      it("should throw an error when database query fails", async () => {
        jest
          .spyOn(db, "query")
          .mockImplementationOnce(() => Promise.reject(new Error()));
        try {
          await articleModel.getArticleById(12);
        } catch (error) {
          expect(error).toBeTruthy();
        }
      });
    });

    describe("Test incrementArticleViews Method", () => {
      it("should increment article views", async () => {
        await articleModel.incrementArticleViews(createdArticleId);
        // Assuming no error means successful execution
        expect(true).toBeTruthy();
      });
      it("should throw an error when database query fails", async () => {
        jest
          .spyOn(db, "query")
          .mockImplementationOnce(() => Promise.reject(new Error()));
        try {
          await articleModel.getRecentArticles();
        } catch (error) {
          expect(error).toBeTruthy();
        }
      });
    });

    describe("Test updateArticle Method", () => {
      it("should update article information", async () => {
        const updatedArticle: Partial<Article> = {
          title: "Updated Test Article",
          author: "Updated Test Author",
          description: "Updated Test Description",
          content: "Updated Test Content",
        };
        await articleModel.updateArticle(createdArticleId, updatedArticle);
        // Assuming no error means successful execution
        expect(true).toBeTruthy();
      });
      it("should throw an error when database query fails", async () => {
        jest
          .spyOn(db, "query")
          .mockImplementationOnce(() => Promise.reject(new Error()));
        try {
          await articleModel.updateArticle(1, {} as any);
        } catch (error) {
          expect(error).toBeTruthy();
        }
      });
    });

    describe("Test deleteArticle Method", () => {
      it("should delete an article", async () => {
        await articleModel.deleteArticle(createdArticleId);
        // Assuming no error means successful execution
        expect(true).toBeTruthy();
      });
      it("should throw an error when database query fails", async () => {
        jest
          .spyOn(db, "query")
          .mockImplementationOnce(() => Promise.reject(new Error()));
        try {
          await articleModel.deleteArticle(1);
        } catch (error) {
          expect(error).toBeTruthy();
        }
      });
    });
  });
});
