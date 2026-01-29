<script lang="ts">
 import * as Command from "$lib/components/ui/command/index.js";

 type Item = {
  label: string;
  action: () => void;
 };
 type CommandConfig = {
  placeholder: string;
 };
 let { items, config  }:{ items:Item[], config: CommandConfig  } = $props();
</script>
 
<Command.Root class=" ">
 <Command.Input placeholder={`${config.placeholder} ...`} />
 <Command.List>
  <Command.Empty class='text-xs'>No results found.</Command.Empty>

  {#each items as item }
    <Command.Item onclick={item.action}  class='text-xs'>
     <span>{item.label}</span>
   </Command.Item>
  {/each}
   
   
  

 
 </Command.List>
</Command.Root>