import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import analysisRoutes from './routes/analysis.routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import './database/init';
import { getSearchStatus } from './services/searchService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '50', 10),
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ─── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  const searchStatus = getSearchStatus();
  res.json({
    status: 'ok',
    version: '1.2.0',
    service: 'TruthTrace API',
    search: { provider: searchStatus.provider, available: searchStatus.available, label: searchStatus.label },
    ai: { configured: !!(process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY) },
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api', analysisRoutes);

// ─── Error handlers ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start server ──────────────────────────────────────────────────────────────
async function start() {
  // Database is initialized on import above
  console.log('[DB] JSON data store initialized');

  app.listen(PORT, () => {
    const searchStatus = getSearchStatus();
    console.log(`\n🔍 TruthTrace API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   AI: ${(process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY) ? 'Configured' : 'Not configured (heuristic fallback)'}`);
    console.log(`   Search: ${searchStatus.label}`);
    console.log('');
  });
}

start().catch(console.error);

export default app;
