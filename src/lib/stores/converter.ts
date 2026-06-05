/**
 * converter.ts
 *
 * Pure-TypeScript replacement for converter.rs.
 * Parses a Zefania XML Bible file and writes it into a SQLite database
 * via tauri-plugin-sql.  No Rust command needed.
 *
 * Dependencies (already in most Tauri+SvelteKit stacks):
 *   @tauri-apps/api          – path helpers
 *   @tauri-apps/plugin-fs    – readTextFile
 *   @tauri-apps/plugin-sql   – Database
 */

import { appDataDir, join } from '@tauri-apps/api/path';
import { readTextFile } from '@tauri-apps/plugin-fs';
import Database from '@tauri-apps/plugin-sql';

// ── Public result (mirrors Rust ConvertResult) ─────────────────────────────────

export interface ConvertResult {
	books: number;
	verses: number;
	/** e.g. "sqlite:KJV.db" — pass to every reader call */
	db_token: string;
	name: string;
	language: string;
}

export interface ConvertProgress {
	stage: string;
	current: number;
	total: number;
	percent: number;
}

export type ProgressCallback = (progress: ConvertProgress) => void;

// ── Private parse types ────────────────────────────────────────────────────────

interface ParsedVerse {
	vnum: number;
	text: string;
}
interface ParsedChapter {
	chapter: number;
	verses: ParsedVerse[];
}
interface ParsedBook {
	id: number;
	name: string;
	shortName: string;
	testament: 'OT' | 'NT';
	bookOrder: number;
	chapters: ParsedChapter[];
}

// ── Main entry point ───────────────────────────────────────────────────────────

/**
 * Convert a Zefania XML file to a SQLite database stored in the app data dir.
 * @param xmlPath  Absolute path to the .xml file (from tauri-plugin-dialog open()).
 * @returns        ConvertResult with db_token you pass to all reader calls.
 */
export async function convertBible(
	xmlPath: string,
	onProgress?: ProgressCallback
): Promise<ConvertResult> {
	// 1. Read the XML
	const raw = await readTextFile(xmlPath);

	// 2. Parse
	const { bibleName, bibleLanguage, books, verseTotal } = parseZefania(raw);

	onProgress?.({
		stage: 'Preparing database',
		current: 0,
		total: verseTotal,
		percent: 0
	});

	// 3. Build db path
	const stem =
		xmlPath
			.split(/[/\\]/)
			.pop()
			?.replace(/\.xml$/i, '') ?? 'bible';
	const dataDir = await appDataDir();
	const dbFile = await join(dataDir, `${stem}.db`);
	const dbToken = `sqlite:${stem}.db`;

	// 4. Write SQLite
	await writeSqlite(dbToken, dbFile, bibleName, bibleLanguage, books, verseTotal, onProgress);

	return {
		books: books.length,
		verses: verseTotal,
		db_token: dbToken,
		name: bibleName,
		language: bibleLanguage
	};
}

// ── XML parser ─────────────────────────────────────────────────────────────────

function parseZefania(raw: string) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(raw, 'application/xml');

	const root = doc.documentElement;
	const tag = root.localName.toUpperCase();
	if (tag !== 'XMLBIBLE' && tag !== 'BIBLE') {
		throw new Error(`Unexpected root element: ${root.localName}`);
	}

	const bibleName = (root.getAttribute('biblename') ?? root.getAttribute('name') ?? '').trim();
	const bibleLanguage = (root.getAttribute('language') ?? root.getAttribute('lang') ?? 'en').trim();

	const books: ParsedBook[] = [];
	let bookOrder = 0;
	let verseTotal = 0;

	// BIBLEBOOK elements
	const bookEls = root.getElementsByTagName('BIBLEBOOK');
	for (let bi = 0; bi < bookEls.length; bi++) {
		const bookEl = bookEls[bi];
		const bnum = parseInt(bookEl.getAttribute('bnumber') ?? '0', 10);
		const bname = bookEl.getAttribute('bname') ?? '';
		const bsname = bookEl.getAttribute('bsname') ?? bname;
		bookOrder++;

		const parsedChapters: ParsedChapter[] = [];

		const chapterEls = bookEl.getElementsByTagName('CHAPTER');
		for (let ci = 0; ci < chapterEls.length; ci++) {
			const chEl = chapterEls[ci];
			const cnum = parseInt(chEl.getAttribute('cnumber') ?? '0', 10);
			const parsedVerses: ParsedVerse[] = [];

			const versEls = chEl.getElementsByTagName('VERS');
			for (let vi = 0; vi < versEls.length; vi++) {
				const vEl = versEls[vi];
				const vnum = parseInt(vEl.getAttribute('vnumber') ?? '0', 10);
				// Some Zefania files use child text nodes; others wrap in sub-elements.
				// textContent gives us the concatenated text regardless of structure.
				const text = (vEl.textContent ?? '').trim();
				if (text) {
					parsedVerses.push({ vnum, text });
					verseTotal++;
				}
			}

			if (parsedVerses.length) {
				parsedChapters.push({ chapter: cnum, verses: parsedVerses });
			}
		}

		books.push({
			id: bnum,
			name: bname,
			shortName: bsname,
			testament: bnum <= 39 ? 'OT' : 'NT',
			bookOrder,
			chapters: parsedChapters
		});
	}

	return { bibleName, bibleLanguage, books, verseTotal };
}

// ── SQLite writer ──────────────────────────────────────────────────────────────

async function writeSqlite(
	dbToken: string,
	_dbFile: string,
	bibleName: string,
	bibleLanguage: string,
	books: ParsedBook[],
	totalVerses: number,
	onProgress?: ProgressCallback
): Promise<void> {
	// tauri-plugin-sql opens/creates the file automatically from the token.
	let inserted = 0;
	let lastPercent = 0;
	const db = await Database.load(dbToken);

	// Drop & recreate schema (idempotent re-import)
	await db.execute('PRAGMA journal_mode = WAL');
	await db.execute('PRAGMA synchronous  = NORMAL');

	await db.execute('DROP TABLE IF EXISTS verses');
	await db.execute('DROP TABLE IF EXISTS books');
	await db.execute('DROP TABLE IF EXISTS meta');

	await db.execute(`
    CREATE TABLE meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
	await db.execute(`
    CREATE TABLE books (
      id         INTEGER PRIMARY KEY,
      name       TEXT    NOT NULL,
      short_name TEXT    NOT NULL,
      testament  TEXT    NOT NULL,
      book_order INTEGER NOT NULL
    )
  `);
	await db.execute(`
    CREATE TABLE verses (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL REFERENCES books(id),
      chapter INTEGER NOT NULL,
      verse   INTEGER NOT NULL,
      text    TEXT    NOT NULL
    )
  `);
	await db.execute('CREATE INDEX IF NOT EXISTS idx_bk_ch ON verses(book_id, chapter)');

	// Meta
	await db.execute("INSERT INTO meta VALUES ('name', $1), ('language', $2)", [
		bibleName,
		bibleLanguage
	]);

	// Books + verses — tauri-plugin-sql has no explicit transaction API, but
	// SQLite auto-wraps each execute() in an implicit transaction; batching
	// large inserts with a manual BEGIN/COMMIT is significantly faster.
	await db.execute('BEGIN');
	try {
		for (const b of books) {
			await db.execute(
				'INSERT INTO books (id, name, short_name, testament, book_order) VALUES ($1,$2,$3,$4,$5)',
				[b.id, b.name, b.shortName, b.testament, b.bookOrder]
			);
			for (const ch of b.chapters) {
				for (const v of ch.verses) {
					await db.execute(
						'INSERT INTO verses (book_id, chapter, verse, text) VALUES ($1,$2,$3,$4)',
						[b.id, ch.chapter, v.vnum, v.text]
					);

					inserted++;

					const percent = Math.floor((inserted / totalVerses) * 100);

					if (percent > lastPercent) {
						lastPercent = percent;

						onProgress?.({
							stage: `Importing ${b.name}`,
							current: inserted,
							total: totalVerses,
							percent
						});
					}
				}
			}
		}
		await db.execute('COMMIT');
		onProgress?.({
			stage: 'Completed',
			current: totalVerses,
			total: totalVerses,
			percent: 100
		});
	} catch (err) {
		await db.execute('ROLLBACK');
		throw err;
	}
}
