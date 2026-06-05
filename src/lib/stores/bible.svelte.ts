import { writable } from 'svelte/store';
import { getBooks, getChapters, getVerses, listBibles, openBible, searchVerses } from './reader';
import { convertBible, type ProgressCallback } from './converter';

export interface ReaderState {
	booting: boolean;
	importing: boolean;
	opening: boolean;
	loadingBooks: boolean;
	loadingChapters: boolean;
	loadingVerses: boolean;
	searching: boolean;

	progress: {
		stage: string;
		current: number;
		total: number;
		percent: number;
	} | null;
}

export const readerState = writable<ReaderState>({
	booting: true,
	importing: false,
	opening: false,
	loadingBooks: false,
	loadingChapters: false,
	loadingVerses: false,
	searching: false,
	progress: null
});

function setLoading(key: keyof ReaderState, value: boolean) {
	readerState.update((s) => ({
		...s,
		[key]: value
	}));
}

export const bible = {
	list: async (activeToken?: string) => {
		setLoading('booting', true);

		try {
			return await listBibles(activeToken);
		} finally {
			setLoading('booting', false);
		}
	},
	convert: async (xmlPath: string, onProgress?: ProgressCallback) => {
		setLoading('importing', true);

		try {
			return await convertBible(xmlPath, (progress) => {
				readerState.update((s) => ({
					...s,
					progress
				}));

				onProgress?.(progress);
			});
		} finally {
			readerState.update((s) => ({
				...s,
				importing: false,
				progress: null
			}));
		}
	},
	open: async (dbToken: string) => {
		setLoading('opening', true);

		try {
			return await openBible(dbToken);
		} finally {
			setLoading('opening', false);
		}
	},
	books: async (dbToken: string) => {
		setLoading('loadingBooks', true);

		try {
			return await getBooks(dbToken);
		} finally {
			setLoading('loadingBooks', false);
		}
	},
	chapters: async (dbToken: string, bookId: number) => {
		setLoading('loadingChapters', true);

		try {
			return await getChapters(dbToken, bookId);
		} finally {
			setLoading('loadingChapters', false);
		}
	},
  verses: async (
  dbToken: string,
  bookId: number,
  chapter: number
) => {
  setLoading('loadingVerses', true);

  try {
    return await getVerses(
      dbToken,
      bookId,
      chapter
    );
  } finally {
    setLoading('loadingVerses', false);
  }
},
search: async (
  dbToken: string,
  query: string,
  testament: '' | 'OT' | 'NT' = '',
  limit = 100
) => {

  setLoading('searching', true);

  try {
    return await searchVerses(
      dbToken,
      query,
      testament,
      limit
    );
  } finally {
    setLoading('searching', false);
  }
},
};
