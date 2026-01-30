<script lang="ts">
  import Input from "$lib/components/ui/input/input.svelte";

  // No script needed for this simple example
  import * as Resizable from "$lib/components/ui/resizable/index.js";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { Search } from "@lucide/svelte";
  import type { IconMenu } from "../components/types";
    
type FileTab= {name:string, label:string , icon?:IconMenu} ;

const fileTabs:FileTab[]=[
  {name:"bible", label:"Bible", },
  {name:"slides", label:"Slides & Lyrics"},
  {name:"files", label:"Files"},
  {name:"all", label:"All"},
]
const bottomTabs:FileTab[]=[
  {name:"history", label:"History"},
  {name:"favorites", label:"Favorites"},
  {name:"alert", label:"Alerts"},
  {name:"toast", label:"Toast"},
]
</script>
<div class="grid w-full place-items-center  ">
<Resizable.PaneGroup direction="horizontal" class="max-w-full h-full rounded-xs ">
  <Resizable.Pane defaultSize={50} minSize={20} maxSize={30}>
    <Resizable.PaneGroup direction="vertical">
 
  <Resizable.Pane  minSize={50}>
    <div class="relative m-0.5">
      <Search  class='absolute size-4 text-muted-foreground text-xs left-2 bottom-2.5' />
      <Input placeholder='Search...' class='pl-8' />
    </div>
    
    {#if fileTabs.length > 0}
  <Tabs.Root value={fileTabs[0].name} class=" text-xs w-full flex-wrap">
  <Tabs.List class=" flex  rounded-none border-b w-full  " >
    {#each fileTabs as tab}
      <Tabs.Trigger value={tab.name} class="text-xs  flex items-center gap-1">
        <!-- <File class="size-4" /> -->
        {tab.label}
      </Tabs.Trigger>
    {/each}
   
  </Tabs.List>
  {#each fileTabs as tab}
    <Tabs.Content value={tab.name} class="text-xs ">
      <div class="p-0.5">content {tab.name}</div>
    </Tabs.Content>
  {/each}
  
  
</Tabs.Root>
{/if}
</Resizable.Pane>
<Resizable.Handle />

  <Resizable.Pane  minSize={10}>
    {#if bottomTabs.length > 0}
  <Tabs.Root value={bottomTabs[0].name} class=" text-xs w-full flex-wrap">
  <Tabs.List class=" flex  rounded-none border-b w-full  " >
    {#each bottomTabs as tab}
      <Tabs.Trigger value={tab.name} class="text-xs  flex items-center gap-1">
        <!-- <File class="size-4" /> -->
        {tab.label}
      </Tabs.Trigger>
    {/each}
   
  </Tabs.List>
  {#each bottomTabs as tab}
    <Tabs.Content value={tab.name} class="text-xs ">
      <div class="mx-1">
        <div class="relative">
      <Search  class='absolute size-4 text-muted-foreground text-xs left-2 bottom-2.5' />
      <Input placeholder={`Search ${tab.label} ...`} class='pl-8' />
    </div>
    
        </div>
    </Tabs.Content>
  {/each}
  
  
</Tabs.Root>
{/if}
</Resizable.Pane>
</Resizable.PaneGroup>
  </Resizable.Pane>
  <Resizable.Handle />
  <Resizable.Pane  minSize={50}>
    <Resizable.PaneGroup direction="vertical">
      <Resizable.Pane defaultSize={10} minSize={5} maxSize={15}>
        <div class="flex h-full items-center justify-center p-6">
          <span class=" text-xs">Two</span>
        </div>
      </Resizable.Pane>
      <Resizable.Handle />
      <Resizable.Pane defaultSize={75}>
        <div class="flex h-full items-center justify-center p-6">
          <span class=" text-xs">Three</span>
        </div>
      </Resizable.Pane>
    </Resizable.PaneGroup>
  </Resizable.Pane>
</Resizable.PaneGroup>
</div>

<style lang="postcss">
  @reference "tailwindcss";
  
</style>