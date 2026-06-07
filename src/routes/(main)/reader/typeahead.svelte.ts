import type { Book } from '@/stores/reader';

type Stage = 'book' | 'chapter' | 'verse';

function createTypeahead() {
  let buffer   = $state('');
  let stage    = $state<Stage>('book');
  let book     = $state<Book | null>(null);
  let chapter  = $state<number | null>(null);
  let chapters = $state<number[]>([]);
  let timer: ReturnType<typeof setTimeout> | null = null;

  function reset() {
    buffer  = '';
    stage   = 'book';
    book    = null;
    chapter = null;
    chapters = [];
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function debounce(fn: () => void, ms = 800) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { timer = null; fn(); }, ms);
  }

  return {
    get buffer()   { return buffer; },
    get stage()    { return stage; },
    get book()     { return book; },
    get chapter()  { return chapter; },
    get chapters() { return chapters; },

    reset,

    backspace() {
      if (buffer.length > 1) buffer = buffer.slice(0, -1);
      else if (buffer.length === 1) {
        buffer = '';
        if (stage !== 'book') { stage = 'book'; book = null; chapter = null; }
      }
    },

    /** Returns true if the keypress was consumed */
    pushBookKey(key: string, books: Book[]): 'none' | 'partial' | 'exact' {
      const next  = buffer + key;
      const lower = next.toLowerCase();

      const exact   = books.find(b => b.short_name.trim().toLowerCase() === lower);
      const partial = books.find(b => b.short_name.trim().toLowerCase().startsWith(lower));

      if (exact) {
        buffer = exact.short_name;
        return 'exact';
      }
      if (partial) {
        buffer = next;
        return 'partial';
      }
      // No match — restart with just this key
      const restart = books.find(b => b.short_name.trim().toLowerCase().startsWith(key.toLowerCase()));
      buffer = restart ? key : '';
      return restart ? 'partial' : 'none';
    },

    confirmBook(b: Book, availableChapters: number[]) {
      book     = b;
      chapters = availableChapters;
      buffer   = '';
      stage    = 'chapter';
    },

    pushChapterKey(key: string, onConfirm?: (ch: number) => void) {
      if (!/^\d$/.test(key)) return;
      const next = buffer + key;
      const num  = parseInt(next);
      buffer = next;
      debounce(() => {
        const clamped = Math.min(Math.max(num, 1), chapters.length || 1);
        chapter = clamped;
        buffer  = '';
        stage   = 'verse';
        onConfirm?.(clamped);
      });
    },

    pushVerseKey(key: string, onConfirm: (v: number, book: Book, chapter: number) => void) {
  if (!/^\d$/.test(key)) return;
  const next = buffer + key;
  buffer = next;
  debounce(() => {
    const resolvedBook    = book!;
    const resolvedChapter = chapter!;
    const resolvedVerse   = parseInt(next);
    reset();
    onConfirm(resolvedVerse, resolvedBook, resolvedChapter);
  });
},
  };
}

export const typeahead = createTypeahead();