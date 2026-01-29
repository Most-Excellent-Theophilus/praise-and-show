<script lang="ts">
  // No script needed for this simple example
  import * as Resizable from "$lib/components/ui/resizable/index.js";
</script>
<div class="grid w-full place-items-center  ">
<Resizable.PaneGroup direction="horizontal" class="max-w-full h-full rounded-lg ">
  <Resizable.Pane defaultSize={50} minSize={20} maxSize={30}>
    <div class="flex h-[200px] items-center justify-center p-6">
      <span class="">One</span>
    </div>
  </Resizable.Pane>
  <Resizable.Handle withHandle/>
  <Resizable.Pane  minSize={50}>
    <Resizable.PaneGroup direction="vertical">
      <Resizable.Pane defaultSize={10} minSize={5} maxSize={15}>
        <div class="flex h-full items-center justify-center p-6">
          <span class="">Two</span>
        </div>
      </Resizable.Pane>
      <Resizable.Handle withHandle/>
      <Resizable.Pane defaultSize={75}>
        <div class="flex h-full items-center justify-center p-6">
          <span class="">Three</span>
        </div>
      </Resizable.Pane>
    </Resizable.PaneGroup>
  </Resizable.Pane>
</Resizable.PaneGroup>
</div>

<style lang="postcss">
  @reference "tailwindcss";

  
</style>