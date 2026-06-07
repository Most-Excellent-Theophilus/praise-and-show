<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { typeahead } from './typeahead.svelte';
	import { BookOpen, Hash, Bookmark } from 'lucide-svelte';

	let {
		open = $bindable(),
		typer = $bindable()
	}: {
		open: boolean;
		typer: typeof typeahead;
	} = $props();

	// const stageLabel = $derived(
	// 	typer.stage === 'book'
	// 		? 'Type a book name…'
	// 		: typer.stage === 'chapter'
	// 			? 'Type a chapter number…'
	// 			: 'Type a verse number…'
	// );

	const stageIcon = $derived(
		typer.stage === 'book' ? BookOpen : typer.stage === 'chapter' ? Hash : Bookmark
	);

	// Show cursor blink in the buffer display
	let showCursor = $state(true);
	let cursorTimer = $state<ReturnType<typeof setInterval> | null>(null);

	$effect(() => {
		if (open) {
			cursorTimer = setInterval(() => {
				showCursor = !showCursor;
			}, 530);
		} else {
			if (cursorTimer) {
				clearInterval(cursorTimer);
				cursorTimer = null;
			}
			showCursor = true;
		}
		return () => {
			if (cursorTimer) clearInterval(cursorTimer);
		};
	});
</script>

<Drawer.Root
	{open}
	onClose={() => {
		open = false;
		typer.reset();
	}}
>
	<Drawer.Content class="h-auto">
		<div class="mx-auto w-full max-w-md pb-8">
			<Drawer.Header class="text-center">
				<Drawer.Title class="text-lg font-semibold">Go to Verse</Drawer.Title>
				<Drawer.Description class="text-sm text-muted-foreground">
					Type to navigate · <kbd class="rounded border px-1 text-xs">Enter</kbd> to confirm ·
					<kbd class="rounded border px-1 text-xs">Esc</kbd> to close
				</Drawer.Description>
			</Drawer.Header>

			<!-- Breadcrumb: book / chapter / verse -->
			<div class="flex items-center justify-center gap-2 px-6 pb-4 text-sm">
				<!-- Book crumb -->
				<span
					class={typer.stage === 'book'
						? 'font-semibold text-foreground'
						: typer.book
							? 'text-muted-foreground'
							: 'text-muted-foreground/40'}
				>
					{typer.book ? typer.book.name : 'Book'}
				</span>
				<span class="text-muted-foreground/40">›</span>
				<!-- Chapter crumb -->
				<span
					class={typer.stage === 'chapter'
						? 'font-semibold text-foreground'
						: typer.chapter
							? 'text-muted-foreground'
							: 'text-muted-foreground/40'}
				>
					{typer.chapter ? `Ch. ${typer.chapter}` : 'Chapter'}
				</span>
				<span class="text-muted-foreground/40">›</span>
				<!-- Verse crumb -->
				<span
					class={typer.stage === 'verse'
						? 'font-semibold text-foreground'
						: 'text-muted-foreground/40'}
				>
					Verse
				</span>
			</div>

			<!-- Buffer display -->
			<div class="mx-6 mb-6 flex items-center gap-3 rounded-xl border bg-muted/40 px-5 py-4">
				<svelte:component this={stageIcon} class="size-5 shrink-0 text-muted-foreground" />
				<div class="flex-1">
					<p class="mb-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
						{typer.stage}
					</p>
					<p class="font-mono text-2xl font-bold tracking-wide text-foreground">
						{#if typer.buffer}{typer.buffer}{:else}<span class="text-muted-foreground/30">—</span
							>{/if}
						{#if showCursor}<span
								class="ml-0.5 inline-block h-7 w-0.5 translate-y-0.5 bg-primary align-middle"
							></span>{/if}
					</p>
				</div>
			</div>

			<!-- Chapter grid (only visible in chapter stage) -->
			{#if typer.stage === 'chapter' && typer.chapters.length}
				<div class="mx-6 mb-6">
					<p class="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
						{typer.chapters.length} chapters
					</p>
					<div class="grid max-h-40 grid-cols-8 gap-1 overflow-y-auto">
						{#each typer.chapters as ch (ch)}
							<button
								class="rounded-md py-1.5 text-center text-sm transition-colors
                       hover:bg-accent hover:text-accent-foreground
                       {String(ch) === typer.buffer
									? 'bg-primary text-primary-foreground'
									: 'bg-muted/60'}"
								onclick={() => typer.pushChapterKey(String(ch).split('').at(-1)!, () => {})}
							>
								{ch}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Hint row -->
			<div class="mx-6 flex items-center justify-between text-xs text-muted-foreground">
				<span>
					{#if typer.stage === 'book'}
						Keep typing to narrow · <kbd class="rounded border px-1">Enter</kbd> to pick first match
					{:else if typer.stage === 'chapter'}
						Digits auto-confirm after a pause
					{:else}
						Digits auto-confirm after a pause · then navigates
					{/if}
				</span>
				<kbd class="rounded border px-1">⌫ Backspace</kbd>
			</div>

			<Drawer.Footer class="pt-4">
				<Drawer.Close
					class={buttonVariants({ variant: 'outline' })}
					onclick={() => {
						open = false;
						typer.reset();
					}}
				>
					Cancel
				</Drawer.Close>
			</Drawer.Footer>
		</div>
	</Drawer.Content>
</Drawer.Root>
