const HelpArticle = require('../models/HelpArticle');

class HelpArticleService {
  async getArticles(userId, params = {}) {
    const { page = 1, limit = 20, category, tag, search, published } = params;
    const query = { user: userId };
    if (published !== undefined) query.isPublished = published === 'true';
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const [articles, total] = await Promise.all([
      HelpArticle.find(query).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      HelpArticle.countDocuments(query)
    ]);
    return { articles, total, page: Number(page), totalPages: Math.ceil(total / limit) };
  }

  async getArticle(userId, articleId) {
    const article = await HelpArticle.findOne({ _id: articleId, user: userId });
    if (!article) throw new Error('المقال غير موجود');
    return article;
  }

  async getArticleBySlug(userId, slug) {
    const article = await HelpArticle.findOne({ slug, user: userId });
    if (!article) throw new Error('المقال غير موجود');
    article.views += 1;
    await article.save();
    return article;
  }

  async createArticle(userId, data) {
    const article = await HelpArticle.create({ ...data, user: userId, author: userId });
    return article;
  }

  async updateArticle(userId, articleId, data) {
    const article = await HelpArticle.findOneAndUpdate(
      { _id: articleId, user: userId },
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!article) throw new Error('المقال غير موجود');
    return article;
  }

  async deleteArticle(userId, articleId) {
    const article = await HelpArticle.findOneAndDelete({ _id: articleId, user: userId });
    if (!article) throw new Error('المقال غير موجود');
    return article;
  }

  async getCategories(userId) {
    const categories = await HelpArticle.distinct('category', { user: userId, isPublished: true });
    const result = [];
    for (const cat of categories) {
      const count = await HelpArticle.countDocuments({ user: userId, category: cat, isPublished: true });
      result.push({ name: cat, count });
    }
    return result;
  }

  async voteHelpful(userId, articleId, isHelpful) {
    const article = await HelpArticle.findOne({ _id: articleId, user: userId });
    if (!article) throw new Error('المقال غير موجود');
    if (isHelpful) article.helpfulYes += 1;
    else article.helpfulNo += 1;
    await article.save();
    return { helpfulYes: article.helpfulYes, helpfulNo: article.helpfulNo };
  }

  // Public: no auth required, uses userId param to scope
  async getPublicArticles(userId, params = {}) {
    const { category, search, page = 1, limit = 20 } = params;
    const query = { user: userId, isPublished: true };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    const [articles, total] = await Promise.all([
      HelpArticle.find(query, 'title slug excerpt category tags views helpfulYes helpfulNo createdAt')
        .sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      HelpArticle.countDocuments(query)
    ]);
    return { articles, total, page: Number(page), totalPages: Math.ceil(total / limit) };
  }

  async getPublicArticle(userId, slug) {
    const article = await HelpArticle.findOne({ slug, user: userId, isPublished: true });
    if (!article) throw new Error('المقال غير موجود');
    article.views += 1;
    await article.save();
    return article;
  }
}

module.exports = new HelpArticleService();