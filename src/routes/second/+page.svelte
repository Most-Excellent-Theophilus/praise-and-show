<script lang="ts">
  import { onMount } from "svelte";
  import { getCurrentWindow } from "@tauri-apps/api/window";

  let label = "";

  onMount(() => {
    label = getCurrentWindow().label;
  });
</script>

<main>
  <h1>Second Monitor</h1>
  <p>Window label: <code>{label}</code></p>
  <p>This window is running on your secondary display.</p>
</main>

<style>
  main {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: sans-serif;
    background: #0f0f0f;
    color: #fff;
    padding:0;
    margin:0;
  }

  code {
    background: #222;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
  }
</style>