<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Badge } from '$lib/components/ui/badge';
	import type { Book, Verse } from '@/stores/reader';
	import type { ConvertResult } from '@/stores/converter';

	let {
		activeBook,
		activeChapter,
		verses,
		convertMeta,
		loadingVerses
	}: {
		activeBook: Book | null;
		activeChapter: number;
		verses: Verse[];
		convertMeta: ConvertResult | null;
		loadingVerses: boolean;
	} = $props();
</script>

<div class="min-h-0 flex-1 overflow-y-auto" id="scroll-pane">
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
			<p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
				{activeBook?.name}
			</p>
			<h1 class="text-2xl font-bold">Chapter {activeChapter}</h1>
			<Separator />
		</div>

		{#if loadingVerses}
			<div class="space-y-4">
				{#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as i (i)}<Skeleton class="h-5 w-full" />{/each}
				<Skeleton class="h-5 w-3/4" />
			</div>
		{:else}
			<div class="space-y-3 text-base leading-relaxed">
				{#each verses as v (v.id)}
					<p>
						<sup class="mr-1 select-none text-[10px] font-bold text-muted-foreground">{v.verse}</sup>{v.text}
					</p>
				{/each}
			</div>
		{/if}
	</div>
</div>