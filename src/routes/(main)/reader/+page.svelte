<script lang="ts">
	// import { invoke }   from '@tauri-apps/api/core';
	import { open } from '@tauri-apps/plugin-dialog';

	import { bible } from '@/stores/bible.svelte';

	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Skeleton } from '$lib/components/ui/skeleton';
	// import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import {
		BookOpen,
		Search,
		Plus,
		PanelLeft,
		ChevronLeft,
		ChevronRight,
		BookMarked,
		X,
		Loader2,
		AlertCircle
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { BibleMeta, Book, SearchResult, Verse } from '@/stores/reader';
	import type { ConvertResult } from '@/stores/converter';

	import { readerState } from '@/stores/bible.svelte';

	const loading = $derived($readerState);

	// ── Landing ────────────────────────────────────────────────────────────────
	let availableBibles = $state<BibleMeta[]>([]);
	let importError = $state('');

	// ── Reader ─────────────────────────────────────────────────────────────────
	let convertMeta = $state<ConvertResult | null>(null);
	let books = $state<Book[]>([]);
	let activeBook = $state<Book | null>(null);
	let chapters = $state<number[]>([]);
	let activeChapter = $state(1);
	let verses = $state<Verse[]>([]);

	let sideOpen = $state(true);
	let activeToken = $state(''); // db_token, e.g. "sqlite:KJV.db"
	let activeBibleName = $state('');
	let switchingBible = $state(false);

	// ── Search ─────────────────────────────────────────────────────────────────
	let searchOpen = $state(false);
	let searchQ = $state('');
	let searchT = $state<'' | 'OT' | 'NT'>('');
	let searchHits = $state<SearchResult[]>([]);

	let searchTimer: ReturnType<typeof setTimeout>;

	let otBooks = $derived(books.filter((b) => b.testament === 'OT'));
	let ntBooks = $derived(books.filter((b) => b.testament === 'NT'));

	// ── Boot ───────────────────────────────────────────────────────────────────
	async function loadLanding() {
		try {
			availableBibles = await bible.list(activeToken || undefined);
		} catch {
			availableBibles = [];
		}
	}
	loadLanding();

	// ── Import flow ────────────────────────────────────────────────────────────
	async function importXml() {
		const xmlPath = (await open({
			title: 'Select Zefania XML Bible',
			filters: [{ name: 'Zefania XML', extensions: ['xml'] }]
		})) as string | null;
		if (!xmlPath) return;

		importError = '';

		try {
			const toastId = toast.loading('Importing Bible...', {
				description: '0%'
			});
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

	// ── Open existing bible ────────────────────────────────────────────────────
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

	// ── Version switch ─────────────────────────────────────────────────────────
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

	// ── Navigation ─────────────────────────────────────────────────────────────
	async function pickBook(b: Book) {
		activeBook = b;
		chapters = await bible.chapters(activeToken, b.id);
		activeChapter = chapters[0] ?? 1;
		await fetchVerses();
		if (window.innerWidth < 720) sideOpen = false;
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

	// ── Search ─────────────────────────────────────────────────────────────────
	function onType() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(doSearch, 300);
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

	// function hl(text: string, q: string) {
	//   if (!q.trim()) return text;
	//   const e = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	//   return text.replace(new RegExp(`(${e})`, 'gi'),
	//     '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5">$1</mark>');
	// }

	function onKey(ev: KeyboardEvent) {
		if ((ev.ctrlKey || ev.metaKey) && ev.key === 'f') {
			ev.preventDefault();
			searchOpen = true;
		}
		if (ev.key === 'Escape') searchOpen = false;
	}
</script>

<svelte:window onkeydown={onKey} />

<!-- ══════════ LANDING ══════════ -->
{#if !activeToken && !loading.booting}
	<div class="flex min-h-screen items-center justify-center bg-background p-6">
		<div class="w-full max-w-md space-y-6">
			<div class="space-y-2 text-center">
				<div class="flex items-center justify-center gap-2">
					<BookMarked class="h-8 w-8 text-primary" />
					<span class="text-3xl font-bold tracking-tight">Codex</span>
				</div>
				<p class="text-sm text-muted-foreground">
					Scripture reader · Import a Zefania XML Bible to get started
				</p>
			</div>

			{#if importError}
				<Alert.Root variant="destructive">
					<AlertCircle class="h-4 w-4" />
					<Alert.Title>Import failed</Alert.Title>
					<Alert.Description>{importError}</Alert.Description>
				</Alert.Root>
			{/if}

			{#if loading.booting}
				<div class="space-y-2">
					{#each [0, 1] as i (i)}
						<Skeleton class="h-16 w-full rounded-lg" />
					{/each}
				</div>
			{:else if availableBibles.length > 0}
				<Card.Root>
					<Card.Header class="pb-3">
						<Card.Title class="text-sm font-medium">Your library</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-1 pt-0">
						{#each availableBibles as b (b.db_token)}
							<button
								class="flex w-full items-center justify-between rounded-md px-3 py-2.5
                     text-left transition-colors hover:bg-accent hover:text-accent-foreground"
								onclick={() => openBibleToken(b.db_token)}
							>
								<div class="flex min-w-0 items-center gap-3">
									<BookOpen class="h-4 w-4 shrink-0 text-muted-foreground" />
									<div class="min-w-0">
										<p class="truncate text-sm leading-tight font-medium">{b.name}</p>
										<p class="text-[11px] tracking-wide text-muted-foreground uppercase">
											{b.language} · {b.size_kb} KB
										</p>
									</div>
								</div>
								<ChevronRight class="h-4 w-4 shrink-0 text-muted-foreground" />
							</button>
						{/each}
					</Card.Content>
				</Card.Root>
			{/if}

			<Button class="w-full gap-2" onclick={importXml}>
				<Plus class="h-4 w-4" /> Import Zefania XML…
			</Button>

			<p class="text-center text-[11px] text-muted-foreground">
				Supports any standard Zefania XML Bible (.xml)
			</p>
		</div>
	</div>

	<!-- ══════════ CONVERTING ══════════ -->
{:else if loading.importing || loading.opening}
	<div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
		<Loader2 class="h-10 w-10 animate-spin text-primary" />
		<p class="text-lg font-medium">Loading Bible…</p>
		<p class="text-sm text-muted-foreground">Parsing and indexing, this may take a moment.</p>
	</div>

	<!-- ══════════ READER ══════════ -->
{:else}
	<div class="flex h-screen overflow-hidden bg-background">
		<!-- Sidebar -->
		{#if sideOpen}
			<aside class="flex w-52 shrink-0 flex-col border-r bg-card">
				<div class="flex items-center justify-between border-b px-3 py-2">
					<div class="flex items-center gap-1.5">
						<BookMarked class="h-4 w-4 text-primary" />
						<span class="text-sm font-semibold">Codex</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						class="h-7 w-7 text-muted-foreground"
						onclick={() => (sideOpen = false)}
					>
						<PanelLeft class="h-4 w-4" />
					</Button>
				</div>

				<!-- Version switcher -->
				<div class="space-y-1.5 border-b px-3 py-2">
					<p class="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
						Version
					</p>
					{#if availableBibles.length > 1}
						<Select.Select type="single" onValueChange={(v) => v && switchBible(v)}>
							<Select.Trigger class="h-8 w-full truncate text-xs" disabled={loading.opening}>
								{#if switchingBible}<Loader2 class="mr-1.5 h-3 w-3 animate-spin" />{/if}
								<Select.Label>{activeBibleName}</Select.Label>
							</Select.Trigger>
							<Select.Content>
								{#each availableBibles as b (b.db_token)}
									<Select.Item value={b.db_token} label={b.name} class="text-xs">
										{b.name}
										<span class="ml-auto text-[10px] text-muted-foreground uppercase"
											>{b.language}</span
										>
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Select>
					{:else}
						<p class="truncate text-xs font-medium">{activeBibleName}</p>
					{/if}
<!-- 
					<Tooltip.Root>
						<Tooltip.Trigger class="w-full"> -->
							<Button
								variant="outline"
								size="sm"
								class="h-7 w-full gap-1.5 text-xs"
								onclick={importXml}
							>
								<Plus class="h-3 w-3" /> Add version
							</Button>
						<!-- </Tooltip.Trigger>
						<Tooltip.Content side="right"><p>Import another Zefania XML</p></Tooltip.Content>
					</Tooltip.Root> -->
				</div>

				<!-- Book list -->
				<ScrollArea class="flex-1">
					<div class="space-y-0.5 px-2 py-2">
						<p
							class="px-2 py-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase"
						>
							Old Testament
						</p>
						{#each otBooks as b (b.id)}
							<button
								class="w-full rounded-md px-2 py-1 text-left text-xs transition-colors
                   hover:bg-accent hover:text-accent-foreground
                   {activeBook?.id === b.id
									? 'bg-accent font-medium text-accent-foreground'
									: 'text-muted-foreground'}"
								onclick={() => pickBook(b)}>{b.short_name || b.name}</button
							>
						{/each}
					</div>
					<Separator class="mx-2" />
					<div class="space-y-0.5 px-2 py-2">
						<p
							class="px-2 py-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase"
						>
							New Testament
						</p>
						{#each ntBooks as b (b.id)}
							<button
								class="w-full rounded-md px-2 py-1 text-left text-xs transition-colors
                   hover:bg-accent hover:text-accent-foreground
                   {activeBook?.id === b.id
									? 'bg-accent font-medium text-accent-foreground'
									: 'text-muted-foreground'}"
								onclick={() => pickBook(b)}>{b.short_name || b.name}</button
							>
						{/each}
					</div>
				</ScrollArea>
			</aside>
		{/if}

		<!-- Main -->
		<div class="flex flex-1 flex-col overflow-hidden">
			<!-- Top bar -->
			<header class="flex items-center gap-2 border-b bg-card px-3 py-1.5">
				{#if !sideOpen}
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 shrink-0 text-muted-foreground"
						onclick={() => (sideOpen = true)}
					>
						<PanelLeft class="h-4 w-4" />
					</Button>
				{/if}

				<span class="text-sm font-semibold">{activeBook?.name ?? ''}</span>
				{#if activeBook}
					<Badge variant="secondary" class="text-xs font-normal">Ch. {activeChapter}</Badge>
				{/if}

				<ScrollArea class="flex-1" orientation="horizontal">
					<div class="flex gap-0.5 py-0.5">
						{#each chapters as ch (ch)}
							<button
								class="min-w-[1.75rem] rounded px-1 py-0.5 text-center text-xs transition-colors
                     {activeChapter === ch
									? 'bg-primary font-medium text-primary-foreground'
									: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
								onclick={() => pickChapter(ch)}>{ch}</button
							>
						{/each}
					</div>
				</ScrollArea>

				<!-- <Tooltip.Root>
					<Tooltip.Trigger> -->
						<Button
							variant={searchOpen ? 'secondary' : 'ghost'}
							size="icon"
							class="h-8 w-8 shrink-0 text-muted-foreground"
							onclick={() => (searchOpen = !searchOpen)}
						>
							<Search class="h-4 w-4" />
						</Button>
					<!-- </Tooltip.Trigger>
					<Tooltip.Content side="bottom"><p>Search (Ctrl+F)</p></Tooltip.Content>
				</Tooltip.Root> -->
			</header>

			<!-- Search panel -->
			{#if searchOpen}
				<div class="space-y-2 border-b bg-card px-3 py-2">
					<div class="flex items-center gap-2">
						<Input
							class="h-8 flex-1 text-sm"
							placeholder="Search all verses…"
							bind:value={searchQ}
							oninput={onType}
							autofocus
						/>
						<div class="flex gap-1">
							{#each [['', 'All'], ['OT', 'OT'], ['NT', 'NT']] as [v, l] (v)}
								<Button
									variant={searchT === v ? 'default' : 'outline'}
									size="sm"
									class="h-8 px-2.5 text-xs"
									onclick={() => {
										searchT = v as '' | 'OT' | 'NT';
										doSearch();
									}}>{l}</Button
								>
							{/each}
						</div>
						<Button
							variant="ghost"
							size="icon"
							class="h-8 w-8 text-muted-foreground"
							onclick={() => {
								searchOpen = false;
								searchQ = '';
								searchHits = [];
							}}
						>
							<X class="h-4 w-4" />
						</Button>
					</div>

					{#if loading.searching}
						<div class="space-y-1">
							{#each [0, 1, 2] as i (i)}<Skeleton class="h-8 w-full" />{/each}
						</div>
					{:else if searchHits.length}
						<ScrollArea class="max-h-56">
							<div class="space-y-px">
								{#each searchHits as h (`${h.book_id}-${h.chapter}-${h.verse}`)}
									<button
										class="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm
                       transition-colors hover:bg-accent hover:text-accent-foreground"
										onclick={() => jumpTo(h)}
									>
										<Badge variant="outline" class="mt-0.5 shrink-0 font-mono text-[10px]">
											{h.short_name}
											{h.chapter}:{h.verse}
										</Badge>
										<span class="line-clamp-2 text-xs text-muted-foreground">
											<!-- {@html hl(h.text, searchQ)} -->
										</span>
									</button>
								{/each}
							</div>
						</ScrollArea>
						<p class="text-[11px] text-muted-foreground">
							{searchHits.length} result{searchHits.length !== 1 ? 's' : ''}
						</p>
					{:else if searchQ}
						<p class="text-[11px] text-muted-foreground">No results found.</p>
					{/if}
				</div>
			{/if}

			<!-- Verse pane -->
			<ScrollArea class="flex-1" id="scroll-pane">
				<div class="mx-auto max-w-2xl space-y-8 px-6 py-10">
					{#if convertMeta}
						<div class="flex justify-center">
							<Badge variant="outline" class="gap-2 font-mono text-[10px]">
								<span>{convertMeta.books} books</span>
								<Separator orientation="vertical" class="h-3" />
								<span>{convertMeta.verses.toLocaleString()} verses</span>
							</Badge>
						</div>
					{/if}

					<div class="space-y-1">
						<p class="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
							{activeBook?.name}
						</p>
						<h1 class="text-2xl font-bold">Chapter {activeChapter}</h1>
						<Separator />
					</div>

					{#if loading.loadingVerses}
						<div class="space-y-4">
							{#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as i (i)}
								<Skeleton class="h-5 w-full" />
							{/each}
							<Skeleton class="h-5 w-3/4" />
						</div>
					{:else}
						<div class="space-y-3 text-base leading-relaxed">
							{#each verses as v (v.id)}
								<p>
									<sup class="mr-1 text-[10px] font-bold text-muted-foreground select-none"
										>{v.verse}</sup
									>{v.text}
								</p>
							{/each}
						</div>

						<Separator />

						<div class="flex items-center justify-between">
							<Button
								variant="outline"
								class="gap-1.5"
								disabled={activeChapter <= (chapters[0] ?? 1)}
								onclick={() => pickChapter(activeChapter - 1)}
							>
								<ChevronLeft class="h-4 w-4" /> Previous
							</Button>

							<Badge variant="outline" class="font-mono text-xs">
								{activeBook?.short_name}
								{activeChapter}
							</Badge>

							<Button
								variant="outline"
								class="gap-1.5"
								disabled={activeChapter >= (chapters.at(-1) ?? 1)}
								onclick={() => pickChapter(activeChapter + 1)}
							>
								Next <ChevronRight class="h-4 w-4" />
							</Button>
						</div>
					{/if}
				</div>
			</ScrollArea>
		</div>
	</div>
{/if}

{#if loading.importing}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
	>
		<div class="space-y-4 text-center">
			<Loader2 class="mx-auto h-8 w-8 animate-spin" />

			<div>
				<p class="font-medium">
					{loading.progress?.stage}
				</p>

				<p class="text-sm text-muted-foreground">
					{loading.progress?.percent ?? 0}%
				</p>
			</div>
		</div>
	</div>
{/if}
