import CacheManager from "../CacheManager";
import ArticleModel, { Article } from "../../models/Article";
import TagModel from "../../models/Tag";

// Mock the ArticleModel class
jest.mock("../../models/Article");

// Mock the TagModel class
jest.mock("../../models/Tag");

describe("CacheManager", () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("refreshCache", () => {
    it("should refresh the cache with recent articles data", async () => {
      const recentArticles: Article[] = [
        { id: 1, title: "Article 1", content: "content 1", author: "author 1" },
        { id: 2, title: "Article 2", content: "content 2", author: "author 2" },
      ];
      const tagsForArticle1 = [
        { id: 1, name: "Tag 1" },
        { id: 2, name: "Tag 2" },
      ];

      // Mock the behavior of getRecentArticles method
      (
        ArticleModel.prototype.getRecentArticles as jest.Mock
      ).mockResolvedValueOnce(recentArticles);

      // Mock the behavior of getTagsByArticleId method for article 1
      (
        TagModel.prototype.getTagsByArticleId as jest.Mock
      ).mockResolvedValueOnce(tagsForArticle1);

      await cacheManager.refreshCache();

      // Expect recentArticlesCache to be populated with recent articles data along with tags
      expect(cacheManager["recentArticlesCache"]).toEqual([
        {
          id: 1,
          title: "Article 1",
          content: "content 1",
          author: "author 1",
          tags: tagsForArticle1,
        },
        {
          id: 2,
          title: "Article 2",
          content: "content 2",
          author: "author 2",
        }, // Assuming no tags for Article 2
      ]);
    });
    it("should log error", async () => {
      const mockError = new Error("An error occurred");

      // Mock the behavior of getRecentArticles method to throw an error
      (
        ArticleModel.prototype.getRecentArticles as jest.Mock
      ).mockRejectedValueOnce(mockError);

      try {
        await cacheManager.refreshCache();
      } catch (error) {
        expect(console.log).toHaveBeenCalledWith("Error:" + mockError.message);
        expect(error).toEqual(mockError);
      }
    });
  });

  describe("isCacheExpired", () => {
    it("should return true if cache is expired", () => {
      // Set cache expiry time to a past time
      cacheManager["cacheExpiryTime"] = Date.now() - 1000;
      expect(cacheManager.isCacheExpired()).toBe(true);
    });

    it("should return false if cache is not expired", () => {
      // Set cache expiry time to a future time
      cacheManager["cacheExpiryTime"] = Date.now() + 1000;
      expect(cacheManager.isCacheExpired()).toBe(false);
    });
  });

  describe("getRecentArticles", () => {
    it("should return recent articles from cache if cache is not expired", async () => {
      const recentArticles = [
        { id: 1, title: "Article 1", content: "content 1", author: "author 1" },
        { id: 2, title: "Article 2", content: "content 2", author: "author 2" },
      ];
      cacheManager["recentArticlesCache"] = recentArticles;

      // Mock isCacheExpired to return false
      jest.spyOn(cacheManager, "isCacheExpired").mockReturnValueOnce(false);

      const result = await cacheManager.getRecentArticles();

      expect(result).toEqual(recentArticles);
    });

    it("should refresh cache and return recent articles if cache is expired", async () => {
      const recentArticles = [
        { id: 1, title: "Article 1", content: "content 1", author: "author 1" },
        { id: 2, title: "Article 2", content: "content 2", author: "author 2" },
      ];
      const tagsForArticle1 = [
        { id: 1, name: "Tag 1" },
        { id: 2, name: "Tag 2" },
      ];

      // Mock the behavior of getRecentArticles method
      (
        ArticleModel.prototype.getRecentArticles as jest.Mock
      ).mockResolvedValueOnce(recentArticles);

      // Mock the behavior of getTagsByArticleId method for article 1
      (
        TagModel.prototype.getTagsByArticleId as jest.Mock
      ).mockResolvedValueOnce(tagsForArticle1);

      // Set cache expiry time to a past time
      cacheManager["cacheExpiryTime"] = Date.now() - 1000;

      const result = await cacheManager.getRecentArticles();

      expect(result).toEqual([
        {
          id: 1,
          title: "Article 1",
          content: "content 1",
          author: "author 1",
          tags: tagsForArticle1,
        },
        {
          id: 2,
          title: "Article 2",
          content: "content 2",
          author: "author 2",
        }, // Assuming no tags for Article 2
      ]);
    });
  });
});
