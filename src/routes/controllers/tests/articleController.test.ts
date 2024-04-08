import { Request, Response } from "express";
import * as articleController from "../../controllers/articleController";
import ArticleModel from "../../../models/Article";
import TagModel from "../../../models/Tag";
import CacheManager from "../../../cache/CacheManager";
import generateImageUrl from "../../../utilities/generate-image-url";
import { v2 as cloudinary } from "cloudinary";

// Mock ArticleModel and TagModel
jest.mock("../../../models/Article");
jest.mock("../../../models/Tag");

// Mock CacheManager
jest.mock("../../../cache/CacheManager");

// Mock the generateImageUrl function
jest.mock("../../../utilities/generate-image-url");

// Mock Cloudinary
jest.mock("cloudinary", () => ({
  v2: {
    uploader: {
      destroy: jest.fn().mockResolvedValue({}),
    },
  },
}));

describe("Article Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  describe("createArticle", () => {
    beforeEach(() => {
      // Reset mock implementation and clear mock calls before each test
      jest.clearAllMocks();

      // Mock request and response objects
      req = {
        body: {
          title: "Test Article",
          author: "Test Author",
          description: "Test Description",
          content: "Test Content",
          cover: "Test Cover",
          tags: ["tag1", "tag2"],
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("should create an article with tags and return 201 status code", async () => {
      // Mock the behavior of createArticle and createTag methods
      (ArticleModel.prototype.createArticle as jest.Mock).mockResolvedValueOnce(
        {
          id: 1,
        }
      );
      (TagModel.prototype.createTag as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      // Call the createArticle function
      await articleController.createArticle(req as Request, res as Response);

      // Expect the response status to be 201
      expect(res.status).toHaveBeenCalledWith(201);
      // Expect the response body to contain the success message
      expect(res.json).toHaveBeenCalledWith({
        code: 201,
        message: "Article created successfully",
      });

      // Expect the cache to be refreshed
      expect(CacheManager.prototype.refreshCache).toHaveBeenCalled();
    });

    it("should handle errors and return 500 status code", async () => {
      const errorMessage = "Internal Server Error";

      // Mock the behavior of createArticle to throw an error
      (ArticleModel.prototype.createArticle as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      // Call the createArticle function
      await articleController.createArticle(req as Request, res as Response);

      // Expect the response status to be 500
      expect(res.status).toHaveBeenCalledWith(500);
      // Expect the response body to contain the error message
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe("getArticles", () => {
    beforeEach(() => {
      // Reset mock implementation and clear mock calls before each test
      jest.clearAllMocks();

      // Mock request and response objects
      req = {
        query: { page: "1", itemsPerPage: "10" },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("should get articles and return them with 200 status code", async () => {
      const mockRecentArticles = [{ id: 1, title: "Recent Article" }];
      const mockArticles = [
        { id: 2, title: "Article 1", cover: "image 1" },
        { id: 3, title: "Article 2", cover: "image 2" },
      ];
      const mockTags = [
        { id: 1, tag: "Tag 1" },
        { id: 2, tag: "Tag 2" },
      ];

      // Mock generate image url
      (generateImageUrl as jest.Mock).mockReturnValue("image-url");

      // Mock the behavior of getRecentArticles, getArticles, and getTagsByArticleId methods
      (
        CacheManager.prototype.getRecentArticles as jest.Mock
      ).mockResolvedValueOnce(mockRecentArticles);

      (ArticleModel.prototype.getArticles as jest.Mock).mockResolvedValueOnce([
        mockArticles,
        3,
      ]);
      (TagModel.prototype.getTagsByArticleId as jest.Mock).mockResolvedValue(
        mockTags
      );

      // Call the getArticles function
      await articleController.getArticles(req as Request, res as Response);

      // Expect the response status to be 200
      expect(res.status).toHaveBeenCalledWith(200);
      // Expect the response body to contain the articles with tags
      expect(res.json).toHaveBeenCalledWith({
        data: [
          {
            id: 2,
            title: "Article 1",
            cover: "image-url",
            tags: mockTags,
          },
          {
            id: 3,
            title: "Article 2",
            cover: "image-url",
            tags: mockTags,
          },
        ],
        totalItems: 3,
        currentPage: 1,
        itemsPerPage: 10,
      });
    });

    it("should handle errors and return 500 status code", async () => {
      const errorMessage = "Internal Server Error";

      // Mock the behavior of getRecentArticles to throw an error
      (
        CacheManager.prototype.getRecentArticles as jest.Mock
      ).mockRejectedValueOnce(new Error(errorMessage));

      // Call the getArticles function
      await articleController.getArticles(req as Request, res as Response);

      // Expect the response status to be 500
      expect(res.status).toHaveBeenCalledWith(500);
      // Expect the response body to contain the error message
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
  describe("get Recent And Hottest Articles", () => {
    beforeEach(() => {
      // Reset mock implementation and clear mock calls before each test
      jest.clearAllMocks();

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("should get recent and hottest articles and return them with 200 status code", async () => {
      const mockRecentArticles = [
        { id: 2, title: "Article 1", cover: "image 1" },
        { id: 3, title: "Article 2", cover: "image 2" },
      ];

      // Mock generate image url
      (generateImageUrl as jest.Mock).mockReturnValue("image-url");

      (
        CacheManager.prototype.getRecentArticles as jest.Mock
      ).mockResolvedValueOnce(mockRecentArticles);

      await articleController.getRecentAndHottestArticles(
        req as Request,
        res as Response
      );

      // Expect the response status to be 200
      expect(res.status).toHaveBeenCalledWith(200);
      // Expect the response body to contain the articles with tags
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 2,
          title: "Article 1",
          cover: "image-url",
        },
        {
          id: 3,
          title: "Article 2",
          cover: "image-url",
        },
      ]);
    });

    it("should handle errors and return 500 status code", async () => {
      const errorMessage = "Internal Server Error";

      // Mock the behavior of getRecentArticles to throw an error
      (
        CacheManager.prototype.getRecentArticles as jest.Mock
      ).mockRejectedValueOnce(new Error(errorMessage));

      await articleController.getRecentAndHottestArticles(
        req as Request,
        res as Response
      );

      // Expect the response status to be 500
      expect(res.status).toHaveBeenCalledWith(500);
      // Expect the response body to contain the error message
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe("get Article by ID", () => {
    beforeEach(() => {
      // Reset mock implementation and clear mock calls before each test
      jest.clearAllMocks();
      req = {
        params: {
          id: "1",
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("should get article by its id and return it with 200 status code", async () => {
      const mockArticle = {
        id: 1,
        title: "Article 1",
        cover: "image 1",
      };
      const mockTags = [
        { id: 1, tag: "Tag 1" },
        { id: 2, tag: "Tag 2" },
      ];

      // Mock generate image url
      (generateImageUrl as jest.Mock).mockReturnValueOnce("image-url");

      (
        ArticleModel.prototype.getArticleById as jest.Mock
      ).mockResolvedValueOnce(mockArticle);
      (
        ArticleModel.prototype.incrementArticleViews as jest.Mock
      ).mockResolvedValueOnce(undefined);

      (TagModel.prototype.getTagsByArticleId as jest.Mock).mockResolvedValue(
        mockTags
      );

      await articleController.getArticleById(req as Request, res as Response);

      // Expect the response status to be 200
      expect(res.status).toHaveBeenCalledWith(200);
      // Expect the response body to contain the articles with tags
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        title: "Article 1",
        cover: "image-url",
        tags: mockTags,
      });
    });

    it("should handle not found and return 404 status code", async () => {
      // Mock the behavior of getArticleById to return null
      (ArticleModel.prototype.getArticleById as jest.Mock).mockResolvedValue(
        null
      );

      await articleController.getArticleById(req as Request, res as Response);

      // Expect the response status to be 404
      expect(res.status).toHaveBeenCalledWith(404);
      // Expect the response body to contain the error message
      expect(res.json).toHaveBeenCalledWith({ message: "Article not found" });
    });

    it("should handle errors and return 500 status code", async () => {
      const errorMessage = "Internal Server Error";

      // Mock the behavior of getArticleById to throw an error
      (
        ArticleModel.prototype.getArticleById as jest.Mock
      ).mockRejectedValueOnce(new Error(errorMessage));

      await articleController.getArticleById(req as Request, res as Response);

      // Expect the response status to be 500
      expect(res.status).toHaveBeenCalledWith(500);
      // Expect the response body to contain the error message
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe("updateArticle", () => {
    beforeEach(() => {
      // Reset mock implementation and clear mock calls before each test
      jest.clearAllMocks();

      // Mock request and response objects
      req = {
        params: { id: "1" }, // Mock the article ID
        body: {
          title: "Updated Title",
          author: "Updated Author",
          description: "Updated Description",
          content: "Updated Content",
          newCover: "Updated Cover",
          tags: ["tag1", "tag2"],
        },
      };

      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
    });

    it("should update an article and return 200 status code", async () => {
      // Mock the behavior of updateArticle and createTag methods
      (ArticleModel.prototype.updateArticle as jest.Mock).mockResolvedValueOnce(
        undefined
      );
      (
        TagModel.prototype.deleteTagsByArticleId as jest.Mock
      ).mockResolvedValueOnce(undefined);
      (TagModel.prototype.createTag as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      // Call the updateArticle function
      await articleController.updateArticle(req as Request, res as Response);

      // Expect the response status to be 200
      expect(res.status).toHaveBeenCalledWith(200);
      // Expect the response body to contain the success message
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: "Article updated successfully",
      });

      // Expect the cache to be refreshed
      expect(CacheManager.prototype.refreshCache).toHaveBeenCalled();
    });

    it("should handle errors and return 500 status code", async () => {
      const errorMessage = "Internal Server Error";

      // Mock the behavior of updateArticle to throw an error
      (ArticleModel.prototype.updateArticle as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      // Call the updateArticle function
      await articleController.updateArticle(req as Request, res as Response);

      // Expect the response status to be 500
      expect(res.status).toHaveBeenCalledWith(500);
      // Expect the response body to contain the error message
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
  describe("deleteArticle", () => {
    beforeEach(() => {
      // Reset mock implementation and clear mock calls before each test
      jest.clearAllMocks();

      // Mock request and response objects
      req = {
        params: { id: "1" }, // Mock the article ID
      };

      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
    });

    it("should delete an article and return 204 status code", async () => {
      // Mock the behavior of getArticleById, deleteTagsByArticleId, and deleteArticle methods
      (
        ArticleModel.prototype.getArticleById as jest.Mock
      ).mockResolvedValueOnce({
        id: 1,
        cover: "cover-public-id",
      });

      // Call the deleteArticle function
      await articleController.deleteArticle(req as Request, res as Response);

      // Expect the response status to be 204
      expect(res.status).toHaveBeenCalledWith(204);
      // Expect the response body to contain the success message
      expect(res.json).toHaveBeenCalledWith({
        message: "Article deleted successfully",
      });
      // Expect cloudinary.uploader.destroy to be called with the cover public ID
      expect(cloudinary.uploader.destroy as jest.Mock).toHaveBeenCalledWith(
        "cover-public-id"
      );

      // Expect the cache to be refreshed
      expect(CacheManager.prototype.refreshCache).toHaveBeenCalled();
    });

    it("should handle if article does not exist and return 404 status code", async () => {
      // Mock the behavior of getArticleById to return null, indicating article does not exist
      (
        ArticleModel.prototype.getArticleById as jest.Mock
      ).mockResolvedValueOnce(null);

      // Call the deleteArticle function
      await articleController.deleteArticle(req as Request, res as Response);

      // Expect the response status to be 404
      expect(res.status).toHaveBeenCalledWith(404);
      // Expect the response body to contain the error message
      expect(res.json).toHaveBeenCalledWith({
        massage: "the article does not exist",
      });
      // Expect cloudinary.uploader.destroy not to be called since article doesn't exist
      expect(cloudinary.uploader.destroy as jest.Mock).not.toHaveBeenCalled();
      // Expect cache not to be refreshed
      expect(CacheManager.prototype.refreshCache).not.toHaveBeenCalled();
    });

    it("should handle errors and return 500 status code", async () => {
      const errorMessage = "Internal Server Error";

      // Mock the behavior of getArticleById to throw an error
      (
        ArticleModel.prototype.getArticleById as jest.Mock
      ).mockRejectedValueOnce(new Error(errorMessage));

      // Call the deleteArticle function
      await articleController.deleteArticle(req as Request, res as Response);

      // Expect the response status to be 500
      expect(res.status).toHaveBeenCalledWith(500);
      // Expect the response body to contain the error message
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
      // Expect cloudinary.uploader.destroy not to be called since there was an error
      expect(cloudinary.uploader.destroy as jest.Mock).not.toHaveBeenCalled();
      // Expect cache not to be refreshed
      expect(CacheManager.prototype.refreshCache).not.toHaveBeenCalled();
    });
  });
});
