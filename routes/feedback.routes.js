const express = require('express');
const router = express.Router();
const { verifyTokenMiddleware } = require('../middleware/auth.middleware');

// In-memory storage for feedback (replace with database in production)
const feedbackStore = [];

// POST /api/feedback - Save thumbs up/down votes
router.post('/', verifyTokenMiddleware, (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { type, contentId, comment } = req.body;

    // Validate feedback type
    if (!type || !['thumbs_up', 'thumbs_down'].includes(type)) {
      return res.status(400).json({
        message: 'Feedback type must be "thumbs_up" or "thumbs_down"',
      });
    }

    // Create feedback entry
    const feedback = {
      id: Date.now().toString(),
      userId,
      type,
      contentId: contentId || null,
      comment: comment || null,
      createdAt: new Date().toISOString(),
    };

    feedbackStore.push(feedback);

    res.status(200).json({
      message: 'Feedback saved successfully',
      feedback,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/feedback - Get user's feedback history (optional)
router.get('/', verifyTokenMiddleware, (req, res, next) => {
  try {
    const userId = req.user.userId;

    const userFeedback = feedbackStore.filter(
      (feedback) => feedback.userId === userId
    );

    res.status(200).json({
      feedback: userFeedback,
      count: userFeedback.length,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

