<!-- routes/+page.svelte -->
<script lang="ts">
  import { openSecondMonitor, closeSecondMonitor } from "$lib/monitors";

  let error = "";
  let open = false;

  async function toggle() {
    try {
      if (open) {
        await closeSecondMonitor();
      } else {
        await openSecondMonitor();
      }
      open = !open;
    } catch (e) {
      error = String(e);
    }
  }
</script>

{#if error}
  <p style="color: red">{error}</p>
{/if}

<button onclick={toggle}>
  {open ? "Close" : "Open"} second monitor
</button>