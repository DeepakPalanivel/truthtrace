import { Router } from 'express';
import {
  analyze,
  validateAnalyze,
  getAnalysis,
  getAnalysisHistory,
  clearHistory,
  getDemoAnalysisEndpoint,
} from '../controllers/analysisController';

const router = Router();

// POST /api/analyze        — analyze news (text, url, or headline)
router.post('/analyze', validateAnalyze, analyze);

// GET  /api/analysis/:id   — retrieve a stored analysis by ID
router.get('/analysis/:id', getAnalysis);

// GET  /api/history        — list recent analyses
router.get('/history', getAnalysisHistory);

// DELETE /api/history      — clear all history
router.delete('/history', clearHistory);

// GET  /api/demo/:n        — load a demo analysis (1, 2, 3)
router.get('/demo/:caseNumber', getDemoAnalysisEndpoint);

export default router;
