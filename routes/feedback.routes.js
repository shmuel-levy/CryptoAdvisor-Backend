const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { verifyTokenMiddleware } = require('../middleware/auth.middleware');
const Feedback = require('../models/Feedback');

/**
 * POST /api/feedback - Save thumbs up/down votes
 * 
 * Request body:
 * {
 *   "type": "thumbs_up" | "thumbs_down",
 *   "section": "coinPrices" | "marketNews" | "aiInsight" | "meme",
 *   "contentId": "optional-id-of-specific-content",
 *   "comment": "optional-user-comment"
 * }
 */
router.post('/', verifyTokenMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { type, section, contentId, comment } = req.body;

    // Validate feedback type
    if (!type || !['thumbs_up', 'thumbs_down'].includes(type)) {
      return res.status(400).json({
        message: 'Feedback type must be "thumbs_up" or "thumbs_down"',
      });
    }

    // Validate section
    if (!section || !['coinPrices', 'marketNews', 'aiInsight', 'meme'].includes(section)) {
      return res.status(400).json({
        message: 'Section must be one of: coinPrices, marketNews, aiInsight, meme',
      });
    }

    // Validate comment length
    if (comment && comment.length > 500) {
      return res.status(400).json({
        message: 'Comment must be 500 characters or less',
      });
    }

    // Create feedback entry in MongoDB
    const feedback = new Feedback({
      userId,
      type,
      section,
      contentId: contentId || null,
      comment: comment || null,
    });

    const savedFeedback = await feedback.save();

    res.status(200).json({
      message: 'Feedback saved successfully',
      feedback: {
        id: savedFeedback._id,
        userId: savedFeedback.userId,
        type: savedFeedback.type,
        section: savedFeedback.section,
        contentId: savedFeedback.contentId,
        comment: savedFeedback.comment,
        createdAt: savedFeedback.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/feedback - Get user's feedback history
 * Optional query params:
 * - section: filter by section (coinPrices, marketNews, aiInsight, meme)
 * - limit: number of results (default: 50)
 */
router.get('/', verifyTokenMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { section, limit = 50 } = req.query;

    // Build query
    const query = { userId };
    if (section && ['coinPrices', 'marketNews', 'aiInsight', 'meme'].includes(section)) {
      query.section = section;
    }

    // Fetch feedback from MongoDB
    const userFeedback = await Feedback.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .limit(parseInt(limit))
      .select('-__v'); // Exclude version field

    res.status(200).json({
      feedback: userFeedback,
      count: userFeedback.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/feedback/stats - Get feedback statistics for user
 * Returns counts of thumbs up/down per section
 */
router.get('/stats', verifyTokenMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Aggregate feedback statistics
    const stats = await Feedback.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { section: '$section', type: '$type' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.section',
          thumbsUp: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'thumbs_up'] }, '$count', 0],
            },
          },
          thumbsDown: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'thumbs_down'] }, '$count', 0],
            },
          },
        },
      },
    ]);

    // Format response
    const formattedStats = {
      coinPrices: { thumbsUp: 0, thumbsDown: 0 },
      marketNews: { thumbsUp: 0, thumbsDown: 0 },
      aiInsight: { thumbsUp: 0, thumbsDown: 0 },
      meme: { thumbsUp: 0, thumbsDown: 0 },
    };

    stats.forEach((stat) => {
      if (formattedStats[stat._id]) {
        formattedStats[stat._id] = {
          thumbsUp: stat.thumbsUp,
          thumbsDown: stat.thumbsDown,
        };
      }
    });

    res.status(200).json({
      stats: formattedStats,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

