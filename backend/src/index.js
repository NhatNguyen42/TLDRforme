const path = require('path');
// Ensure CWD is the backend root (needed when launched from a parent directory)
process.chdir(path.join(__dirname, '..'));
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const apiRoutes = require('./routes/api');
const { startScheduler } = require('./cron/scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());

// CORS — allow FRONTEND_URL (comma-separated for multiple origins)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());
app.use(cors({
  origin(origin, cb) {
    // Allow requests with no origin (server-to-server, health checks)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use('/api', apiRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`TLDRforme backend running on port ${PORT}`);
  startScheduler();
});
