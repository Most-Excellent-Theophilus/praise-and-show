<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Search } from 'lucide-svelte';
	import type { Book } from '@/stores/reader';

	let {
		activeBook,
		activeChapter,
		chapters,
		searchOpen,
		onPickChapter,
		onToggleSearch
	}: {
		activeBook: Book | null;
		activeChapter: number;
		chapters: number[];
		searchOpen: boolean;
		onPickChapter: (ch: number) => void;
		onToggleSearch: () => void;
	} = $props();
</script>

<header class="shrink-0 items-center gap-2 border-b px-3 py-1.5">
	<span class="text-sm font-semibold">{activeBook?.name ?? ''}</span>
	{#if activeBook}
		<Badge variant="secondary" class="text-xs font-normal">Ch. {activeChapter}</Badge>
	{/if}

	<div class="min-h-0 flex-1 overflow-y-auto">
		<div class="h-64 flex-1 overflow-y-auto">
			{#each chapters as ch (ch)}
				<Button
					variant={activeChapter === ch ? 'default' : 'link'}
          size='icon-lg'
					onclick={() => onPickChapter(ch)}>{ch}</Button
				>
			{/each}
		</div>
	</div>

	<Button
		variant={searchOpen ? 'secondary' : 'ghost'}
		size="icon"
		class="h-8 w-8 shrink-0 text-muted-foreground"
		onclick={onToggleSearch}
	>
		<Search class="h-4 w-4" />
	</Button>
</header>
