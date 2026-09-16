import type { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { analyzeNews, getAnalysisById, getHistory } from '../services/analysisService';
import { clearAllAnalyses } from '../database/init';
import type { NewsInput } from '../types/index';

// ─── Validation middleware ────────────────────────────────────────────────────

export const validateAnalyze = [
  body('text').optional().isString().isLength({ max: 10000 }),
  body('url').optional().isURL({ protocols: ['http', 'https'], require_protocol: true }),
  body('headline').optional().isString().isLength({ max: 500 }),
  body('description').optional().isString().isLength({ max: 5000 }),
  body('demoCase').optional().isInt({ min: 1, max: 3 }),
];

// ─── POST /api/analyze ────────────────────────────────────────────────────────

export async function analyze(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
    return;
  }

  const input = req.body as NewsInput;

  if (!input.text && !input.url && !input.headline && !input.demoCase) {
    res.status(400).json({
      success: false,
      error: 'Please provide news text, a URL, a headline, or select a demo case.',
    });
    return;
  }

  try {
    const analysis = await analyzeNews(input);
    res.json({ success: true, data: analysis });
  } catch (err) {
    console.error('[ANALYZE] Error:', err);
    res.status(500).json({
      success: false,
      error: 'Analysis failed. Please try again or use Demo Mode.',
    });
  }
}

// ─── GET /api/analysis/:id ────────────────────────────────────────────────────

export async function getAnalysis(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || id.length > 100) {
    res.status(400).json({ success: false, error: 'Invalid analysis ID' });
    return;
  }

  try {
    const analysis = await getAnalysisById(id);
    if (!analysis) {
      res.status(404).json({ success: false, error: 'Analysis not found' });
      return;
    }
    res.json({ success: true, data: analysis });
  } catch (err) {
    console.error('[GET_ANALYSIS] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve analysis' });
  }
}

// ─── GET /api/history ─────────────────────────────────────────────────────────

export async function getAnalysisHistory(_req: Request, res: Response): Promise<void> {
  try {
    const history = getHistory();
    res.json({ success: true, data: history });
  } catch (err) {
    console.error('[HISTORY] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve history' });
  }
}

// ─── DELETE /api/history ──────────────────────────────────────────────────────

export function clearHistory(_req: Request, res: Response): void {
  try {
    clearAllAnalyses();
    res.json({ success: true, message: 'History cleared' });
  } catch (err) {
    console.error('[CLEAR_HISTORY] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to clear history' });
  }
}

// ─── GET /api/demo/:caseNumber ────────────────────────────────────────────────

export async function getDemoAnalysisEndpoint(req: Request, res: Response): Promise<void> {
  const caseNumber = parseInt(req.params.caseNumber, 10) as 1 | 2 | 3;

  if (![1, 2, 3].includes(caseNumber)) {
    res.status(400).json({ success: false, error: 'Demo case must be 1, 2, or 3' });
    return;
  }

  try {
    const analysis = await analyzeNews({ demoCase: caseNumber });
    res.json({ success: true, data: analysis });
  } catch (err) {
    console.error('[DEMO] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to load demo analysis' });
  }
}
