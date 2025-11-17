const mongoose = require('mongoose');

/**
 * Feedback Schema
 * Stores user feedback (thumbs up/down) for dashboard content
 * Used for future ML model training and content recommendations
 */
const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // For faster queries by user
    },
    type: {
      type: String,
      enum: ['thumbs_up', 'thumbs_down'],
      required: true,
    },
    section: {
      type: String,
      enum: ['coinPrices', 'marketNews', 'aiInsight', 'meme'],
      required: true,
    },
    contentId: {
      type: String,
      default: null, // ID of specific content item (e.g., news article ID, meme ID)
    },
    comment: {
      type: String,
      default: null, // Optional user comment
      maxlength: 500,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Compound index for faster queries (user + section)
feedbackSchema.index({ userId: 1, section: 1 });
feedbackSchema.index({ createdAt: -1 }); // For sorting by date

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;

