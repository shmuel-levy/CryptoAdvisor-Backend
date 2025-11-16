export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

