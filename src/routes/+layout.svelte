<script lang="ts">

  import '../app.css';
  import TopBarMenu from "../components/TopBarMenu.svelte"
  import { menuItems } from '../config/app.menu';
   import { ModeWatcher } from "mode-watcher";
  let { children } = $props();

</script>
<ModeWatcher />
<div class="bg-background h-screen subpixel-antialiased  flex flex-col">
  <TopBarMenu menu={menuItems} />
  <main class="flex-1 grid overflow-hidden h-fit border" data-tauri-drag-region>
    {@render children()}
  </main>
  <!-- <Separator /> -->
</div>

<style>
  
  [data-tauri-drag-region] {
    user-select: none;
  }
</style>
