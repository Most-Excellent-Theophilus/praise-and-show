<script lang="ts">
	import '../layout.css';
	import Header from '@/components/layout/Header.svelte';


	let { children } = $props();
</script>

<main class="flex items-center flex-col h-screen antialiased select-none">
  <Header />
  <div class=" overflow-hidden w-full p-3">
    {@render children?.()}
  </div>
  
</main>
