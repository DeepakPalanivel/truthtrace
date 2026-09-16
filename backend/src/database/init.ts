/**
 * JSON file-based persistence layer.
 * No native modules required — works on any Node.js 18+ installation.
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import type { NewsAnalysis } from '../types/index';

dotenv.config();

const DB_DIR = path.resolve(process.env.DB_DIR || './database');
const DB_FILE = path.join(DB_DIR, 'analyses.json');

interface DbSchema {
  analyses: DbAnalysisRow[];
}

export interface DbAnalysisRow {
  id: string;
  headline: string;
  url?: string;
  truth_score: number;
  verdict: string;
  is_demo: boolean;
  created_at: string;
  full_result: string; // JSON-stringified NewsAnalysis
}

function ensureDb(): DbSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const empty: DbSchema = { analyses: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(empty, null, 2), 'utf-8');
    return empty;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DbSchema;
  } catch {
    const empty: DbSchema = { analyses: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(empty, null, 2), 'utf-8');
    return empty;
  }
}

function saveDb(data: DbSchema): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function insertAnalysis(analysis: NewsAnalysis): void {
  const db = ensureDb();
  const row: DbAnalysisRow = {
    id: analysis.id,
    headline: analysis.headline,
    url: analysis.url,
    truth_score: analysis.truthScore.overall,
    verdict: analysis.truthScore.verdict,
    is_demo: analysis.isDemo,
    created_at: analysis.createdAt,
    full_result: JSON.stringify(analysis),
  };
  // Prepend so newest is first; cap at 200 records
  db.analyses.unshift(row);
  if (db.analyses.length > 200) db.analyses = db.analyses.slice(0, 200);
  saveDb(db);
}

export function findAnalysisById(id: string): NewsAnalysis | null {
  try {
    const db = ensureDb();
    const row = db.analyses.find((a) => a.id === id);
    if (!row) return null;
    return JSON.parse(row.full_result) as NewsAnalysis;
  } catch {
    return null;
  }
}

export function listAnalyses(): Omit<DbAnalysisRow, 'full_result'>[] {
  try {
    const db = ensureDb();
    return db.analyses.map(({ full_result: _fr, ...rest }) => rest);
  } catch {
    return [];
  }
}

export function clearAllAnalyses(): void {
  const db = ensureDb();
  db.analyses = [];
  saveDb(db);
}

// Initialize on import
try {
  ensureDb();
  console.log('[DB] JSON store ready:', DB_FILE);
} catch (e) {
  console.error('[DB] Init failed:', e);
}
