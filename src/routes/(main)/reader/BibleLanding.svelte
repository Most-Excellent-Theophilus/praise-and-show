<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import { BookOpen, BookMarked, ChevronRight, Plus, AlertCircle } from 'lucide-svelte';
	import type { BibleMeta } from '@/stores/reader';

	let {
		availableBibles,
		importError,
		booting,
		onOpen,
		onImport
	}: {
		availableBibles: BibleMeta[];
		importError: string;
		booting: boolean;
		onOpen: (token: string) => void;
		onImport: () => void;
	} = $props();
</script>

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

		{#if booting}
			<div class="space-y-2">
				{#each [0, 1] as i (i)}<Skeleton class="h-16 w-full rounded-lg" />{/each}
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
							onclick={() => onOpen(b.db_token)}
						>
							<div class="flex min-w-0 items-center gap-3">
								<BookOpen class="h-4 w-4 shrink-0 text-muted-foreground" />
								<div class="min-w-0">
									<p class="truncate text-sm font-medium leading-tight">{b.name}</p>
									<p class="text-[11px] uppercase tracking-wide text-muted-foreground">
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

		<Button class="w-full gap-2" onclick={onImport}>
			<Plus class="h-4 w-4" /> Import Zefania XML…
		</Button>
		<p class="text-center text-[11px] text-muted-foreground">
			Supports any standard Zefania XML Bible (.xml)
		</p>
	</div>
</div>