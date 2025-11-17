const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Stores user authentication and profile data
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    profileImg: {
      type: String,
      default: '',
    },
    account: {
      type: String,
      enum: ['basic', 'pro'],
      default: 'basic',
    },
    score: {
      type: Number,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    preferences: {
      interestedAssets: {
        type: [String],
        default: [],
      },
      investorType: {
        type: String,
        enum: ['HODLer', 'Day Trader', 'NFT Collector', 'DeFi Enthusiast', 'Swing Trader'],
        default: null,
      },
      contentTypes: {
        type: [String],
        default: [],
      },
      completedOnboarding: {
        type: Boolean,
        default: false,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

/**
 * Hash password before saving
 */
userSchema.pre('save', async function (next) {
  // Only hash if password is modified (or new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare password method
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Remove password from JSON output
 */
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Create indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;

