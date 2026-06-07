import { load } from '@tauri-apps/plugin-store';

interface SessionState {
	activeToken: string;
	activeVerse: { book: string; chapter: number; verse: number };
}

const STORE_KEY = 'session';

const tauriStore = load('session.json', {
	autoSave: false,
	defaults: { [STORE_KEY]: null }
});

function createSessionStore() {
	let state = $state<SessionState | null>(null);

	async function persist(): Promise<void> {
		const store = await tauriStore;
		await store.set(STORE_KEY, state);
		await store.save();
	}

	async function hydrate(): Promise<void> {
		const store = await tauriStore;
		const saved = await store.get<SessionState>(STORE_KEY);
		if (!saved) return;
		state = saved;
	}

	hydrate();

	return {
		get state() {
			return state;
		},

		async set(partial: Partial<SessionState>) {
			state = { ...state, ...partial } as SessionState;
			await persist();
		},

		async clear() {
			state = null;
			await persist();
		},

		hydrate
	};
}

export const session = createSessionStore();
