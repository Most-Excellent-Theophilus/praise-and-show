<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	import type { Book } from '@/stores/reader';

	let {
		activeBook,
		activeChapter,
		chapters,

		onPickChapter
	}: {
		activeBook: Book | null;
		activeChapter: number;
		chapters: number[];

		onPickChapter: (ch: number) => void;
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
					size="icon-lg"
					onclick={() => onPickChapter(ch)}>{ch}</Button
				>
			{/each}
		</div>
	</div>
</header>
