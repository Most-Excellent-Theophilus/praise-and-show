<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	import { Separator } from '$lib/components/ui/separator';
	import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import type { Book } from '@/stores/reader';

	let {
		activeBook,
		activeChapter,
		chapters,
		onPrev,
		onNext,
		openVerse
	}: {
		activeBook: Book | null;
		activeChapter: number;
		chapters: number[];
		onPrev: () => void;
		onNext: () => void;
		openVerse: () => void;
	} = $props();
</script>

<Separator />
<div class="flex shrink-0 items-center justify-around p-3.5">
	<Button
		variant="outline"
		class="cursor-pointer gap-1.5"
		disabled={activeChapter <= (chapters[0] ?? 1)}
		onclick={onPrev}
		size="lg"
	>
		<ChevronLeft class="h-4 w-4" /> Previous
	</Button>

	<Button onclick={openVerse} size="lg" class="cursor-pointer gap-1.5" variant="outline">
		<span>{activeBook?.short_name} </span> :
		<span>{activeChapter} </span>
		<ChevronDown />
	</Button>

	<Button
		variant="outline"
		size="lg"
		class="cursor-pointer gap-1.5"
		disabled={activeChapter >= (chapters.at(-1) ?? 1)}
		onclick={onNext}
	>
		Next <ChevronRight class="h-4 w-4" />
	</Button>
</div>
