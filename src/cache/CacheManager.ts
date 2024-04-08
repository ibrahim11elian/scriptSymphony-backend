import ArticleModel, { Article } from "../models/Article";
import TagModel from "../models/Tag";

// Create an instance of the ArticleModel
const articleModel = new ArticleModel();
const tagModel = new TagModel();

class CacheManager {
  private recentArticlesCache: Article[] | null = null;
  private cacheExpiryTime: number = Date.now() + 2 * 60 * 60 * 1000; // Expiry time set to 2 hours

  // Function to refresh cache with recent articles data
  public async refreshCache(): Promise<void> {
    try {
      const recentArticles = await articleModel.getRecentArticles();

      const articlesWithTags = recentArticles.map(async (e) => {
        const articlesTags = await tagModel.getTagsByArticleId(e.id as number);
        return { ...e, tags: articlesTags };
      });

      await Promise.all(articlesWithTags).then((value) => {
        this.recentArticlesCache = value;
      });
    } catch (error: any) {
      console.log("Error:" + error.message);
    }
  }

  // Function to check if cache has expired
  public isCacheExpired(): boolean {
    return Date.now() >= this.cacheExpiryTime;
  }

  // Function to get recent articles from cache or database
  public async getRecentArticles(): Promise<Article[]> {
    if (!this.recentArticlesCache || this.isCacheExpired()) {
      await this.refreshCache();
    }
    return this.recentArticlesCache!;
  }
}

export default CacheManager;
