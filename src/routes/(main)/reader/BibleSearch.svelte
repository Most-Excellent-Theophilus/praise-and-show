<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';

	import type { SearchResult } from '@/stores/reader';

	let {
		searchQ = $bindable(),
		searchT = $bindable(),
		searchHits,
		searching,
		onSearch,
		onJumpTo
	}: {
		searchQ: string;
		searchT: '' | 'OT' | 'NT';
		searchHits: SearchResult[];
		searching: boolean;
		onSearch: () => void;
		onJumpTo: (hit: SearchResult) => void;
	} = $props();

	let searchTimer: ReturnType<typeof setTimeout>;

	function onType() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(onSearch, 300);
	}
</script>

<div class="flex-1 shrink-0 space-y-2 border-b bg-card px-3 py-2">
	<div class="flex items-center gap-2">
		<Input
			class="h-10 flex-1 text-sm"
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
						onSearch();
					}}>{l}</Button
				>
			{/each}
		</div>
	</div>

	{#if searching}
		<div class="space-y-1">
			{#each [0, 1, 2] as i (i)}<Skeleton class="h-8 w-full" />{/each}
		</div>
	{:else if searchHits.length}
		<div class="max-h-96 space-y-px overflow-y-auto">
			{#each searchHits as h (`${h.book_id}-${h.chapter}-${h.verse}`)}
				<button
					class="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm
					       transition-colors hover:bg-accent hover:text-accent-foreground"
					onclick={() => onJumpTo(h)}
				>
					<Badge variant="outline" class="mt-0.5 shrink-0 font-mono text-[10px]">
						{h.short_name}
						{h.chapter}:{h.verse}
					</Badge>
					<span class="line-clamp-2 text-muted-foreground">{h.text}</span>
				</button>
			{/each}
		</div>
		<p class="text-[11px] text-muted-foreground">
			{searchHits.length} result{searchHits.length !== 1 ? 's' : ''}
		</p>
	{:else if searchQ}
		<p class="text-[11px] text-muted-foreground">No results found.</p>
	{:else if searchQ == ''}
		<p class=" text-sm text-green-500">Start typing in the Search Box.</p>
	{/if}
</div>
