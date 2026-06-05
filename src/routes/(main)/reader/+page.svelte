<script lang="ts">
	import { open } from '@tauri-apps/plugin-dialog';
	import { bible, readerState } from '@/stores/bible.svelte';
	import { Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { BibleMeta, Book, SearchResult, Verse } from '@/stores/reader';
	import type { ConvertResult } from '@/stores/converter';
	import * as Resizable from '$lib/components/ui/resizable/index.js';

	import BibleLanding from './BibleLanding.svelte';
	import BibleSidebar from './BibleSidebar.svelte';
	import BibleHeader from './BibleHeader.svelte';
	import BibleSearch from './BibleSearch.svelte';
	import BibleVersePane from './BibleVersePane.svelte';
	import BibleFooter from './BibleFooter.svelte';

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

	let otBooks = $derived(books.filter((b) => b.testament === 'OT'));
	let ntBooks = $derived(books.filter((b) => b.testament === 'NT'));

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

	function onKey(ev: KeyboardEvent) {
		if (ev.key === 'f') {
			ev.preventDefault();
			searchOpen = true;
		}
		if (ev.key === 'Escape') searchOpen = false;
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
			class="flex min-h-0 flex-1 flex-col overflow-hidden"
		>
			{#if searchOpen}
				<BibleSearch
					bind:searchQ
					bind:searchT
					{searchHits}
					searching={loading.searching}
					onSearch={doSearch}
					onJumpTo={jumpTo}
					onClose={() => {
						searchOpen = false;
						searchQ = '';
						searchHits = [];
					}}
				/>
			{/if}

			<BibleVersePane
				{activeBook}
				{activeChapter}
				{verses}
				{convertMeta}
				loadingVerses={loading.loadingVerses}
			/>

			<BibleFooter
				{activeBook}
				{activeChapter}
				{chapters}
				onPrev={() => pickChapter(activeChapter - 1)}
				onNext={() => pickChapter(activeChapter + 1)}
			/>
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane
			defaultSize={10}
			minSize={15}
			maxSize={20}
			class="min-h-0 flex-1 overflow-y-auto "
		>
			<BibleHeader
				{activeBook}
				{activeChapter}
				{chapters}
				{searchOpen}
				onPickChapter={pickChapter}
				onToggleSearch={() => (searchOpen = !searchOpen)}
			/>
		</Resizable.Pane>
	</Resizable.PaneGroup>
{/if}

{#if loading.importing}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
	>
		<div class="space-y-4 text-center">
			<Loader2 class="mx-auto h-8 w-8 animate-spin" />
			<div>
				<p class="font-medium">{loading.progress?.stage}</p>
				<p class="text-sm text-muted-foreground">{loading.progress?.percent ?? 0}%</p>
			</div>
		</div>
	</div>
{/if}
