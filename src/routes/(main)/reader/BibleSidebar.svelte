<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Plus, Loader2 } from 'lucide-svelte';
	import type { BibleMeta, Book } from '@/stores/reader';
	

	let {
		availableBibles,
		activeBibleName,
		activeBook,
		otBooks,
		ntBooks,
		switchingBible,
		opening,
		onSwitchBible,
		onPickBook,
		onImport
	}: {
		availableBibles: BibleMeta[];
		activeBibleName: string;
		activeBook: Book | null;
		otBooks: Book[];
		ntBooks: Book[];
		switchingBible: boolean;
		opening: boolean;
		onSwitchBible: (token: string) => void;
		onPickBook: (book: Book) => void;
		onImport: () => void;
	} = $props();
</script>


	<!-- Version switcher -->
	<div class="shrink-0 space-y-1.5  px-3 py-2">
		{#if availableBibles.length > 1}
			<Select.Select type="single" onValueChange={(v) => v && onSwitchBible(v)}>
				<Select.Trigger class="h-8 w-full truncate text-xs" disabled={opening}>
					{#if switchingBible}<Loader2 class="mr-1.5 h-3 w-3 animate-spin" />{/if}
					<Select.Label>{activeBibleName}</Select.Label>
				</Select.Trigger>
				<Select.Content>
					{#each availableBibles as b (b.db_token)}
						<Select.Item value={b.db_token} label={b.name} class="text-xs">
							{b.name}
							<span class="ml-auto text-[10px] uppercase text-muted-foreground">{b.language}</span>
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Select>
		{:else}
			<p class="truncate text-xs font-medium">{activeBibleName}</p>
		{/if}
		<Button variant="outline" size="sm" class="h-7 w-full gap-1.5 text-xs" onclick={onImport}>
			<Plus class="h-3 w-3" /> Add version
		</Button>
	</div>

	<!-- Book list -->
	<div class="min-h-0 flex-1 overflow-y-auto">
		<div class="grid space-y-0.5 py-2">
			<p class="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
				Old Testament
			</p>
			{#each otBooks as b (b.id)}
				<Button
					variant={activeBook?.id === b.id ? 'default' : 'secondary'}
					onclick={() => onPickBook(b)}
				>{b.short_name || b.name}</Button>
			{/each}
		</div>
		<Separator />
		<div class="grid space-y-0.5 py-2">
			<p class="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
				New Testament
			</p>
			{#each ntBooks as b (b.id)}
				<Button
					variant={activeBook?.id === b.id ? 'default' : 'secondary'}
					onclick={() => onPickBook(b)}
				>{b.short_name || b.name}</Button>
			{/each}
		</div>
	</div>
