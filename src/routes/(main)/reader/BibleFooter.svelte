<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import type { Book } from '@/stores/reader';

	let {
		activeBook,
		activeChapter,
		chapters,
		onPrev,
		onNext
	}: {
		activeBook: Book | null;
		activeChapter: number;
		chapters: number[];
		onPrev: () => void;
		onNext: () => void;
	} = $props();
</script>

<Separator />
<div class="flex shrink-0 items-center justify-around p-3.5">
	<Button
		variant="outline"
		class="gap-1.5"
		disabled={activeChapter <= (chapters[0] ?? 1)}
		onclick={onPrev}
	>
		<ChevronLeft class="h-4 w-4" /> Previous
	</Button>
	<Badge variant="outline" class="font-mono text-xs">
		{activeBook?.short_name} {activeChapter}
	</Badge>
	<Button
		variant="outline"
		class="gap-1.5"
		disabled={activeChapter >= (chapters.at(-1) ?? 1)}
		onclick={onNext}
	>
		Next <ChevronRight class="h-4 w-4" />
	</Button>
</div>