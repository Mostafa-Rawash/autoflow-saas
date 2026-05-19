const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/auth');
const { successResponse, asyncHandler } = require('../utils/response');
const helpArticleService = require('../services/helpArticle.service');

// Authenticated routes
router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  const result = await helpArticleService.getArticles(req.user.id, req.query);
  res.json(successResponse(result, 'تم جلب المقالات بنجاح'));
}));

router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await helpArticleService.getCategories(req.user.id);
  res.json(successResponse(categories, 'تم جلب التصنيفات بنجاح'));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const article = await helpArticleService.getArticle(req.user.id, req.params.id);
  res.json(successResponse(article, 'تم جلب المقال بنجاح'));
}));

router.post('/', authorize('manager'), checkSubscription, asyncHandler(async (req, res) => {
  const article = await helpArticleService.createArticle(req.user.id, req.body);
  res.status(201).json(successResponse(article, 'تم إنشاء المقال بنجاح'));
}));

router.put('/:id', authorize('manager'), asyncHandler(async (req, res) => {
  const article = await helpArticleService.updateArticle(req.user.id, req.params.id, req.body);
  res.json(successResponse(article, 'تم تحديث المقال بنجاح'));
}));

router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const article = await helpArticleService.deleteArticle(req.user.id, req.params.id);
  res.json(successResponse(article, 'تم حذف المقال بنجاح'));
}));

router.post('/:id/helpful', asyncHandler(async (req, res) => {
  const result = await helpArticleService.voteHelpful(req.user.id, req.params.id, req.body.isHelpful);
  res.json(successResponse(result, 'تم تسجيل التصويت'));
}));

module.exports = router;