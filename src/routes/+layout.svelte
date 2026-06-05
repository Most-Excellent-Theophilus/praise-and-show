<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '@/components/ui/sonner';
	import { invoke } from '@tauri-apps/api/core';
	// import { message } from '@tauri-apps/plugin-dialog';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';

	let { children } = $props();
	onMount(async () => {
			await invoke('app_ready');
	
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children?.()}
<Toaster position="top-center" richColors />
<ModeWatcher />
