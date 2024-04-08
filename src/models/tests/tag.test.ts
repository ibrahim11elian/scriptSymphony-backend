import TagModel, { Tag } from "../Tag"; // Import the TagModel class
import { db } from "../../database";

// Create a mock instance of the TagModel class
const tagModel = new TagModel();

describe("Tag Model", () => {
  let createdArticleId: number;

  beforeAll(async () => {
    // Create a new article to use its ID for testing tags
    const result = await db.query(
      "INSERT INTO articles (title, author, content) VALUES ($1, $2, $3) RETURNING id",
      ["Test Article", "Test Author", "Test Content"]
    );
    createdArticleId = result.rows[0].id;
  });

  afterAll(async () => {
    // Clean up: Delete the created article and its associated tags
    await db.query("DELETE FROM articles WHERE id = $1", [createdArticleId]);
  });

  afterAll(async () => {
    await db.end(); // Releases the database connection
  });
  describe("Define Methods", () => {
    it("should have a createTag method", () => {
      expect(tagModel.createTag).toBeDefined();
    });

    it("should have a getTagsByArticleId method", () => {
      expect(tagModel.getTagsByArticleId).toBeDefined();
    });

    it("should have a deleteTagsByArticleId method", () => {
      expect(tagModel.deleteTagsByArticleId).toBeDefined();
    });
  });

  describe("Method Tests", () => {
    let createdTagId: number;

    describe("Test createTag Method", () => {
      it("should add a tag to the database", async () => {
        const tag: Tag = {
          tag: "Test Tag",
          article_id: createdArticleId,
        };

        await tagModel.createTag(tag);

        const result = await db.query("SELECT * FROM tags WHERE tag = $1", [
          tag.tag,
        ]);
        const createdTag = result.rows[0];
        createdTagId = createdTag.id;

        expect(createdTag).toBeDefined();
      });
      it("should throw an error when database query fails", async () => {
        jest
          .spyOn(db, "query")
          .mockImplementationOnce(() => Promise.reject(new Error()));
        try {
          await tagModel.createTag({} as any);
        } catch (error) {
          expect(error).toBeTruthy();
        }
      });
    });

    describe("Test getTagsByArticleId Method", () => {
      it("should retrieve tags by article ID", async () => {
        const articleId = createdArticleId;
        const tags = await tagModel.getTagsByArticleId(articleId);
        expect(tags).toBeDefined();
      });
      it("should throw an error when database query fails", async () => {
        jest
          .spyOn(db, "query")
          .mockImplementationOnce(() => Promise.reject(new Error()));
        try {
          await tagModel.getTagsByArticleId(1);
        } catch (error) {
          expect(error).toBeTruthy();
        }
      });
    });

    describe("Test deleteTagsByArticleId Method", () => {
      it("should delete tags by article ID", async () => {
        const articleId = createdArticleId;
        await tagModel.deleteTagsByArticleId(articleId);
        const tags = await tagModel.getTagsByArticleId(articleId);
        expect(tags.length).toBe(0);
      });
      it("should throw an error when database query fails", async () => {
        jest
          .spyOn(db, "query")
          .mockImplementationOnce(() => Promise.reject(new Error()));
        try {
          await tagModel.deleteTagsByArticleId(1);
        } catch (error) {
          expect(error).toBeTruthy();
        }
      });
    });
  });
});
