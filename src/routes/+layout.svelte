<script>
  let { children } = $props();
  import "../app.css";
</script>
<div class="bg-gray-100 text-gray-900 min-h-screen antialiased">
{@render children()}
</div>