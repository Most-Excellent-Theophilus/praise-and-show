/**
 * reader.ts
 *
 * Pure-TypeScript replacement for reader.rs.
 * All queries go directly through tauri-plugin-sql — no Rust commands needed.
 */

import { appDataDir, join } from '@tauri-apps/api/path';
import Database              from '@tauri-apps/plugin-sql';
import {  stat }      from '@tauri-apps/plugin-fs';

// ── Domain types (mirrors Rust structs) ───────────────────────────────────────

export interface Book {
  id:         number;
  name:       string;
  short_name: string;
  testament:  'OT' | 'NT';
  book_order: number;
}

export interface Verse {
  id:      number;
  chapter: number;
  verse:   number;
  text:    string;
}

export interface SearchResult {
  book_id:    number;
  book_name:  string;
  short_name: string;
  chapter:    number;
  verse:      number;
  text:       string;
}

export interface BibleMeta {
  name:      string;
  language:  string;
  db_token:  string;
  size_kb:   number;
  is_active: boolean;
}

// ── Pool cache ─────────────────────────────────────────────────────────────────
// Database.load() returns the same cached instance if called again with the
// same token, so it's safe to call it before every query.

async function pool(dbToken: string): Promise<Database> {
  return Database.load(dbToken);
}

// ── list_bibles ────────────────────────────────────────────────────────────────

/**
 * Scan the app data directory for *.db files and return metadata for each.
 * Pass the currently-active token so is_active is set correctly.
 */
export async function listBibles(activeToken?: string): Promise<BibleMeta[]> {
  const { readDir } = await import('@tauri-apps/plugin-fs');
  const dataDir = await appDataDir();

  // eslint-disable-next-line no-useless-assignment
  let entries: { name?: string }[] = [];
  try {
    entries = await readDir(dataDir);
  } catch {
    return [];
  }

  const bibles: BibleMeta[] = [];

  for (const entry of entries) {
    const filename = entry.name ?? '';
    if (!filename.endsWith('.db')) continue;

    const dbToken  = `sqlite:${filename}`;
    const filePath = await join(dataDir, filename);

    let name     = filename.replace(/\.db$/, '');
    let language = '?';

    try {
      const db   = await pool(dbToken);
      const rows = await db.select<{ key: string; value: string }[]>(
        "SELECT key, value FROM meta WHERE key IN ('name','language')",
      );
      for (const row of rows) {
        if (row.key === 'name')     name     = row.value;
        if (row.key === 'language') language = row.value;
      }
    } catch { /* skip unreadable dbs */ }

    let size_kb = 0;
    try {
      const info = await stat(filePath);
      size_kb    = Math.round((info.size ?? 0) / 1024);
    } catch { /* ignore */ }

    bibles.push({
      name,
      language,
      db_token:  dbToken,
      size_kb,
      is_active: activeToken === dbToken,
    });
  }

  bibles.sort((a, b) => a.name.localeCompare(b.name));
  return bibles;
}

// ── open_bible ─────────────────────────────────────────────────────────────────

/**
 * Ensure the pool for a db_token is loaded and return [name, language].
 * Call this before any query if you're switching databases.
 */
export async function openBible(dbToken: string): Promise<[string, string]> {
  const db   = await pool(dbToken);
  const rows = await db.select<{ key: string; value: string }[]>(
    "SELECT key, value FROM meta WHERE key IN ('name','language')",
  );
  let name = 'Unknown', language = '?';
  for (const row of rows) {
    if (row.key === 'name')     name     = row.value;
    if (row.key === 'language') language = row.value;
  }
  return [name, language];
}

// ── get_books ─────────────────────────────────────────────────────────────────

export async function getBooks(dbToken: string): Promise<Book[]> {
  const db = await pool(dbToken);
  return db.select<Book[]>(
    'SELECT id, name, short_name, testament, book_order FROM books ORDER BY book_order',
  );
}

// ── get_chapters ──────────────────────────────────────────────────────────────

export async function getChapters(dbToken: string, bookId: number): Promise<number[]> {
  const db   = await pool(dbToken);
  const rows = await db.select<{ chapter: number }[]>(
    'SELECT DISTINCT chapter FROM verses WHERE book_id = $1 ORDER BY chapter',
    [bookId],
  );
  return rows.map(r => r.chapter);
}

// ── get_verses ────────────────────────────────────────────────────────────────

export async function getVerses(
  dbToken: string,
  bookId:  number,
  chapter: number,
): Promise<Verse[]> {
  const db = await pool(dbToken);
  return db.select<Verse[]>(
    'SELECT id, chapter, verse, text FROM verses WHERE book_id = $1 AND chapter = $2 ORDER BY verse',
    [bookId, chapter],
  );
}

// ── get_chapter_verse_count ───────────────────────────────────────────────────

export async function getChapterVerseCount(
  dbToken: string,
  bookId:  number,
  chapter: number,
): Promise<number> {
  const db   = await pool(dbToken);
  const rows = await db.select<{ count: number }[]>(
    'SELECT COUNT(*) AS count FROM verses WHERE book_id = $1 AND chapter = $2',
    [bookId, chapter],
  );
  return rows[0]?.count ?? 0;
}

// ── search_verses ─────────────────────────────────────────────────────────────

export async function searchVerses(
  dbToken:   string,
  query:     string,
  testament: '' | 'OT' | 'NT' = '',
  limit      = 100,
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const db        = await pool(dbToken);
  const clampedL  = Math.min(Math.max(limit, 1), 200);
  const like      = `%${query}%`;

  if (!testament) {
    return db.select<SearchResult[]>(
      `SELECT v.book_id, b.name AS book_name, b.short_name,
              v.chapter, v.verse, v.text
       FROM verses v JOIN books b ON b.id = v.book_id
       WHERE v.text LIKE $1
       ORDER BY b.book_order, v.chapter, v.verse
       LIMIT $2`,
      [like, clampedL],
    );
  }

  return db.select<SearchResult[]>(
    `SELECT v.book_id, b.name AS book_name, b.short_name,
            v.chapter, v.verse, v.text
     FROM verses v JOIN books b ON b.id = v.book_id
     WHERE b.testament = $3 AND v.text LIKE $1
     ORDER BY b.book_order, v.chapter, v.verse
     LIMIT $2`,
    [like, clampedL, testament],
  );
}