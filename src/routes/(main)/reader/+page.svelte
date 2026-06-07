<script lang="ts">
	import { open } from '@tauri-apps/plugin-dialog';
	import { bible, readerState } from '@/stores/bible.svelte';
	import { Loader2, Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { BibleMeta, Book, SearchResult, Verse } from '@/stores/reader';
	import type { ConvertResult } from '@/stores/converter';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import BibleLanding from './BibleLanding.svelte';
	import BibleSidebar from './BibleSidebar.svelte';
	import BibleHeader from './BibleHeader.svelte';
	import BibleSearch from './BibleSearch.svelte';
	import BibleVersePane from './BibleVersePane.svelte';
	import BibleFooter from './BibleFooter.svelte';
	import VerseSelector from './VerseSelector.svelte';
	import { Button } from '@/components/ui/button';
	import * as Kbd from '$lib/components/ui/kbd/index.js';
	import { onMount } from 'svelte';
	import { session } from './session.svelte';
	import { typeahead } from './typeahead.svelte';

	const loading = $derived($readerState);

	let availableBibles = $state<BibleMeta[]>([]);
	let importError = $state('');
	let convertMeta = $state<ConvertResult | null>(null);
	let books = $state<Book[]>([]);
	let activeBook = $state<Book | null>(null);
	let chapters = $state<number[]>([]);
	let activeChapter = $state(1);
	let verses = $state<Verse[]>([]);
	let activeToken = $state('');
	let activeBibleName = $state('');
	let switchingBible = $state(false);
	let searchOpen = $state(false);
	let searchQ = $state('');
	let searchT = $state<'' | 'OT' | 'NT'>('');
	let searchHits = $state<SearchResult[]>([]);
	let verseSelectorOpen = $state(false);

	let otBooks = $derived(books.filter((b) => b.testament === 'OT'));
	let ntBooks = $derived(books.filter((b) => b.testament === 'NT'));

	onMount(async () => {
		await session.hydrate();
		activeToken = session.state?.activeToken ?? '';
		if (activeToken) await openBibleToken(activeToken);
	});

	async function loadLanding() {
		try {
			availableBibles = await bible.list(activeToken || undefined);
		} catch {
			availableBibles = [];
		}
	}
	loadLanding();

	async function importXml() {
		const xmlPath = (await open({
			title: 'Select Zefania XML Bible',
			filters: [{ name: 'Zefania XML', extensions: ['xml'] }]
		})) as string | null;
		if (!xmlPath) return;
		importError = '';
		try {
			const toastId = toast.loading('Importing Bible...', { description: '0%' });
			convertMeta = await bible.convert(xmlPath, (progress) => {
				toast.loading(progress.stage, {
					id: toastId,
					description: `${progress.percent}% (${progress.current.toLocaleString()}/${progress.total.toLocaleString()})`
				});
			});
			toast.success('Bible imported successfully', {
				id: toastId,
				description: `${convertMeta.name} (${convertMeta.language})`
			});
			await openBibleToken(convertMeta.db_token);
		} catch (e) {
			importError = String(e);
			await loadLanding();
		}
	}

	async function openBibleToken(dbToken: string) {
		try {
			const [name] = await bible.open(dbToken);
			books = await bible.books(dbToken);
			activeToken = dbToken;
			activeBibleName = name;
			await session.set({ activeToken });
			availableBibles = await bible.list(activeToken);
			if (books.length) await pickBook(books[0]);
		} catch (e) {
			importError = String(e);
		}
	}

	async function switchBible(newToken: string) {
		if (newToken === activeToken) return;
		switchingBible = true;
		try {
			const [name] = await bible.open(newToken);
			books = await bible.books(newToken);
			activeToken = newToken;
			activeBibleName = name;
			availableBibles = await bible.list(activeToken);
			if (books.length) await pickBook(books[0]);
		} catch (e) {
			console.error(e);
		}
		switchingBible = false;
	}

	async function pickBook(b: Book) {
		activeBook = b;
		chapters = await bible.chapters(activeToken, b.id);
		activeChapter = chapters[0] ?? 1;
		await fetchVerses();
	}

	async function pickChapter(ch: number) {
		activeChapter = ch;
		await fetchVerses();
	}

	async function fetchVerses() {
		if (!activeBook) return;
		verses = await bible.verses(activeToken, activeBook.id, activeChapter);
		document.getElementById('scroll-pane')?.scrollTo({ top: 0, behavior: 'instant' });
	}

	async function doSearch() {
		if (!searchQ.trim()) {
			searchHits = [];
			return;
		}
		searchHits = await bible.search(activeToken, searchQ, searchT, 80);
	}

	async function jumpTo(h: SearchResult) {
		searchOpen = false;
		const b = books.find((x) => x.id === h.book_id);
		if (!b) return;
		await pickBook(b);
		await pickChapter(h.chapter);
	}

	// ── Typeahead: confirm book then fetch its chapters ──────────────────
	async function confirmTypeaheadBook(match: Book) {
		const chs = await bible.chapters(activeToken, match.id);
		typeahead.confirmBook(match, chs);
	}

	function onKey(ev: KeyboardEvent) {
		// Ctrl+F → search
		if (ev.key === 'f' && ev.ctrlKey) {
			ev.preventDefault();
			searchOpen = true;
			return;
		}

		// Never steal keys from inputs or open dialogs
		const tag = (ev.target as HTMLElement).tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || searchOpen) return;
		if (ev.ctrlKey || ev.altKey || ev.metaKey) return;

		if (ev.key === 'Escape') {
			if (verseSelectorOpen) {
				verseSelectorOpen = false;
				typeahead.reset();
			}
			return;
		}

		if (ev.key === 'Backspace') {
			if (verseSelectorOpen) typeahead.backspace();
			return;
		}

		if (ev.key === 'Enter' && verseSelectorOpen && typeahead.stage === 'book') {
			// Force-confirm the first partial match
			const lower = typeahead.buffer.toLowerCase();
			const match = books.find((b) => b.short_name.trim().toLowerCase().startsWith(lower));
			if (match) confirmTypeaheadBook(match);
			return;
		}

		if (ev.key.length !== 1) return;

		// ── Book stage ───────────────────────────────────────────────────────
		if (typeahead.stage === 'book') {
			const result = typeahead.pushBookKey(ev.key, books);
			if (result === 'none') return;

			verseSelectorOpen = true;

			if (result === 'exact') {
				const match = books.filter(
					(b) => b.short_name.trim().toLowerCase() === typeahead.buffer.toLowerCase()
				);
				if (match.length == 1) confirmTypeaheadBook(match[0]);
			}
			return;
		}

		// ── Chapter stage ────────────────────────────────────────────────────
		if (typeahead.stage === 'chapter') {
			typeahead.pushChapterKey(ev.key);
			return;
		}

		// ── Verse stage ──────────────────────────────────────────────────────
		if (typeahead.stage === 'verse') {
			typeahead.pushVerseKey(ev.key, async (v, book, chapter) => {
				await pickBook(book);
				await pickChapter(chapter);
				await session.set({
					activeVerse: { book: book.short_name, chapter, verse: v }
				});
				verseSelectorOpen = false;
			});
		}
	}
</script>

<svelte:window onkeydown={onKey} />

{#if !activeToken && !loading.booting}
	<BibleLanding
		{availableBibles}
		{importError}
		booting={loading.booting}
		onOpen={openBibleToken}
		onImport={importXml}
	/>
{:else if loading.importing || loading.opening}
	<div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
		<Loader2 class="h-10 w-10 animate-spin text-primary" />
		<p class="text-lg font-medium">Loading Bible…</p>
		<p class="text-sm text-muted-foreground">Parsing and indexing, this may take a moment.</p>
	</div>
{:else}
	<Resizable.PaneGroup
		direction="horizontal"
		class="flex h-[calc(100vh-70px)] min-h-0 overflow-hidden bg-background"
	>
		<Resizable.Pane
			defaultSize={10}
			minSize={15}
			maxSize={20}
			class="flex  shrink-0 flex-col overflow-hidden "
			><BibleSidebar
				{availableBibles}
				{activeBibleName}
				{activeBook}
				{otBooks}
				{ntBooks}
				{switchingBible}
				opening={loading.opening}
				onSwitchBible={switchBible}
				onPickBook={pickBook}
				onImport={importXml}
			/>
		</Resizable.Pane>

		<Resizable.Handle withHandle />
		<Resizable.Pane
			defaultSize={65}
			maxSize={70}
			minSize={60}
			class="relative flex min-h-0 flex-1 flex-col overflow-hidden"
		>
			<BibleVersePane
				{activeBook}
				{activeChapter}
				activeVerse={session.state?.activeVerse.verse||1}
				{verses}
				{convertMeta}
				loadingVerses={loading.loadingVerses}
			/>
			<Button
				variant={searchOpen ? 'outline' : 'default'}
				size="lg"
				class=" absolute right-5 bottom-20  cursor-pointer rounded-3xl !shadow-2xl"
				onclick={() => {
					searchOpen = !searchOpen;
					searchQ = '';
					searchT = '';
					searchHits = [];
				}}
			>
				<Search class="size-6" />
				<Kbd.Group>
					<Kbd.Root>Ctrl + F</Kbd.Root>
				</Kbd.Group>
			</Button>
			<BibleFooter
				{activeBook}
				{activeChapter}
				{chapters}
				onPrev={() => pickChapter(activeChapter - 1)}
				onNext={() => pickChapter(activeChapter + 1)}
				openVerse={() => (verseSelectorOpen = !verseSelectorOpen)}
			/>
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane
			defaultSize={10}
			minSize={15}
			maxSize={20}
			class="min-h-0 flex-1 overflow-y-auto "
		>
			<BibleHeader {activeBook} {activeChapter} {chapters} onPickChapter={pickChapter} />
		</Resizable.Pane>
	</Resizable.PaneGroup>
{/if}

<AlertDialog.Root bind:open={loading.importing}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{loading.progress?.stage}</AlertDialog.Title>
			<AlertDialog.Description>
				{loading.progress?.percent ?? 0}%
			</AlertDialog.Description>
		</AlertDialog.Header>
	</AlertDialog.Content>
</AlertDialog.Root>

<Dialog.Root bind:open={searchOpen}>
	<Dialog.Content style="width:700px;max-width:95vw;height:95vh;" class="flex flex-col">
		<Dialog.Header>
			<Dialog.Title>Search</Dialog.Title>
		</Dialog.Header>

		<BibleSearch
			bind:searchQ
			bind:searchT
			{searchHits}
			searching={loading.searching}
			onSearch={doSearch}
			onJumpTo={jumpTo}
		/>
	</Dialog.Content>
</Dialog.Root>

<VerseSelector bind:open={verseSelectorOpen} typer={typeahead} />
