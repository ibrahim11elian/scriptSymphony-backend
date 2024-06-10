import { Request, Response } from "express";
import ArticleModel, { Article } from "../../models/Article";
import TagModel, { Tag } from "../../models/Tag";
import CacheManager from "../../cache/CacheManager";
import generateImageUrl from "../../utilities/generate-image-url";
import { v2 as cloudinary } from "cloudinary";

const articleModel = new ArticleModel();
const tagModel = new TagModel();
// Create an instance of the cache manager
const cacheManager = new CacheManager();

export const createArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, author, description, content, cover, tags } = req.body;

    // Create the article
    const newArticle: Article = {
      title,
      author,
      description,
      content,
      cover,
    };
    const article = await articleModel.createArticle(newArticle);

    // Create tags for the article
    if (tags && Array.isArray(tags)) {
      const tagPromises = tags.map(async (tag: string) => {
        const newTag: Tag = {
          tag,
          article_id: article?.id as number,
        };
        await tagModel.createTag(newTag);
      });
      await Promise.all(tagPromises);
    }

    // Refresh the articles list in cache to update it with the newly created one
    cacheManager.refreshCache();
    // Set the response and status code
    res
      .status(201)
      .json({ code: 201, message: "Article created successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getArticles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string); // Current page number
    const itemsPerPage = parseInt(req.query.itemsPerPage as string); // Items per page
    // Offset dictates the number of rows to skip from the beginning of the returned data before presenting the results.
    const offset = (page - 1) * itemsPerPage;

    // Fetch recent articles from cache or database
    const recentArticles = await cacheManager.getRecentArticles();

    // Extract IDs of recent articles
    const excludeIds = recentArticles.map((article: Article) => article.id);

    // Fetch articles for "All Articles" section, excluding recent articles
    const [articles, totalItems] = await articleModel.getArticles(
      excludeIds as number[],
      itemsPerPage,
      offset
    );

    // Map articles with tags using Promise.all
    const articlesWithTags = await Promise.all(
      articles.map(async (e) => {
        // generate a secure URL (from cloudinary) for an image using its public ID that stored in DB
        e.cover = generateImageUrl(e.cover as string);
        const articlesTags = await tagModel.getTagsByArticleId(e.id as number);
        return { ...e, tags: articlesTags };
      })
    );

    res.status(200).json({
      data: articlesWithTags,
      totalItems,
      currentPage: page,
      itemsPerPage,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Controller function to fetch the most recent and hottest (most viewed in last week) articles
export const getRecentAndHottestArticles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetch recent articles from cache or database
    const recentArticles = await cacheManager.getRecentArticles();
    recentArticles.forEach((article) => {
      // generate a secure URL (from cloudinary) for an image using its public ID that stored in DB
      article.cover = generateImageUrl(article.cover as string);
    });
    // Send the fetched data as a response to the client
    res.status(200).json(recentArticles);
  } catch (error: any) {
    // Handle any errors and send an error response
    res.status(500).json({ error: error.message });
  }
};

export const getArticleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const article = await articleModel.getArticleById(id);

    if (!article) {
      res.status(404).json({ message: "Article not found" });
      return;
    }

    // Increment view count
    if (article) {
      await articleModel.incrementArticleViews(id);
    }

    const tags = await tagModel.getTagsByArticleId(id);

    // generate a secure URL (from cloudinary) for an image using its public ID that stored in DB
    article.cover = generateImageUrl(article.cover as string);

    res.status(200).json({ ...article, tags });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { title, author, description, content, newCover, tags } = req.body;

    // Prepare updated article details
    const updatedArticle: Partial<Article> = {
      title,
      author,
      description,
      content,
      cover: newCover,
    };

    // Update article details
    await articleModel.updateArticle(id, updatedArticle);

    // Update associated tags
    if (tags && Array.isArray(tags)) {
      await tagModel.deleteTagsByArticleId(id); // Delete existing tags for the article
      const tagPromises = tags.map(async (tag: string) => {
        const newTag: Tag = {
          tag,
          article_id: id,
        };
        await tagModel.createTag(newTag);
      });
      await Promise.all(tagPromises);
    }

    // Refresh the articles list in cache to update it with the updated one
    cacheManager.refreshCache();

    res
      .status(200)
      .json({ code: 200, message: "Article updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // check if the article exist

    const id = parseInt(req.params.id);
    const isExist = await articleModel.getArticleById(id);
    if (!isExist) {
      res.status(404).json({ massage: "the article does not exist" });
      return;
    }

    const publicId = (isExist.cover as string)?.split(" ")[0] as string;
    // delete the image on cloudinary by public ID
    await cloudinary.uploader.destroy(publicId);

    await articleModel.deleteArticle(id);

    // Refresh the articles list in cache to update it with the newly created one
    cacheManager.refreshCache();
    res.status(204).json({ message: "Article deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
