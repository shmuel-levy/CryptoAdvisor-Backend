const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * Uses MONGODB_URI from environment variables
 * 
 * Connection string format:
 * mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
 */
async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const options = {
      // These options are recommended for MongoDB Atlas
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(mongoURI, options);

    console.log('MongoDB connected successfully');
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    // Don't exit in development - allow server to start without DB
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('Continuing without MongoDB connection (development mode)');
    }
  }
}

module.exports = connectDB;

