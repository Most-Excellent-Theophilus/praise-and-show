<script lang="ts">
  import { Info } from '@lucide/svelte';


  import '../app.css';
  import TopBarMenu from "../components/TopBarMenu.svelte"
  import { menuItems } from '../config/app.menu';
   import { ModeWatcher } from "mode-watcher";
  let { children } = $props();

</script>
<ModeWatcher />
<div class="bg-background h-screen subpixel-antialiased  flex flex-col">
  <TopBarMenu menu={menuItems} />
  <main class="flex-1 overflow-hidden h-fit flex" data-tauri-drag-region>
    {@render children()}
  </main>
  <div class=" pt-0.5 text-xs border flex justify-between">
 
</div>

</div>

<style>
  
  [data-tauri-drag-region] {
    user-select: none;
  }
</style>
