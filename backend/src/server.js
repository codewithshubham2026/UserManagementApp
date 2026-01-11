const express = require('express');
const cors = require('cors');
const connectDb = require('./config/db');
const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

env.ensureEnv();

// Basic security/quality middleware setup.
app.use(cors({
  origin: env.clientOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type'],
  optionsSuccessStatus: 204
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// Fallback for unmatched routes to give clear response.
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

// Start server only after DB connection to avoid runtime surprises.
connectDb()
  .then(() => {
    app.listen(env.port, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${env.port}`);
      console.log(`📍 Local: http://localhost:${env.port}`);
      console.log(`🌐 Network: http://0.0.0.0:${env.port}`);
      console.log(`🔗 CORS Origin: ${env.clientOrigin}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
