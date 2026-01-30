<script lang="ts">
  import Input from "$lib/components/ui/input/input.svelte";

  // No script needed for this simple example
  import * as Resizable from "$lib/components/ui/resizable/index.js";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { PlusCircle, Search , Lock, LockOpen} from "@lucide/svelte";
  import type { IconMenu } from "../components/types";
  import Button from "$lib/components/ui/button/button.svelte";
    
type FileTab= {name:string, label:string , icon?:IconMenu} ;
let isLocked = $state(false);
const fileTabs:FileTab[]=[
  {name:"bible", label:"Bible", },
  {name:"slides", label:"Slides & Lyrics"},
  {name:"files", label:"Files"},
  {name:"all", label:"All"},
]


  type Artwork = {
    artist: string;
    art: string;
  };
 
  const works: Artwork[] = [
    {
      artist: "Ornella Binni",
      art: "https://images.unsplash.com/photo-1465869185982-5a1a7522cbcb?auto=format&fit=crop&w=300&q=80"
    },
    {
      artist: "Tom Byrom",
      art: "https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&fit=crop&w=300&q=80"
    },
    {
      artist: "Vladimir Malyavko",
      art: "https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80"
    }
  ];
const bottomTabs:FileTab[]=[

  {name:"alert", label:"Alerts"},
  {name:"toast", label:"Toasts"},
]
const topTabs:FileTab[]=[

  {name:"favorites", label:"Favorites"},
  {name:"recent", label:"Recent"},
]

  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
 
  const tags = Array.from({ length: 176 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`
  );
</script>
<div class="  place-items-center  ">
<Resizable.PaneGroup direction="horizontal" class="max-w-full  rounded-xs ">
  <!--  LEFT SIDE BAR ::: START -->
  <Resizable.Pane defaultSize={50} minSize={20} maxSize={30}>
    <Resizable.PaneGroup direction="vertical">
 <!-- TOP TABS START::: START -->
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
<!-- TOP TABS ::: END -->
<!-- BOTTOM TABS::: START -->
  <Resizable.Pane defaultSize={10} minSize={10}>
    {#if bottomTabs.length > 0}
  <Tabs.Root value={bottomTabs[0].name} class=" text-xs w-full flex-wrap">
  <Tabs.List class=" flex  rounded-none border-b w-full  " >
    {#each bottomTabs as tab}
      <Tabs.Trigger value={tab.name} class="text-xs data-[state=active]:outline data-[state=active]:bg-accent data-[state=active]:text-accent-foreground flex items-center gap-1">
        <!-- <File class="size-4" /> -->
        {tab.label}
      </Tabs.Trigger>
    {/each}
   
  </Tabs.List>
  {#each bottomTabs as tab}
    <Tabs.Content value={tab.name} class="text-xs ">
      <div class="mx-1">
        <Button  variant='link' class='text-xs cursor-pointer' size='sm'>  New {tab.label.slice(0, -1)}<PlusCircle/></Button>
    
        </div>
    </Tabs.Content>
  {/each}
  
  
</Tabs.Root>
{/if}
</Resizable.Pane>
<!-- BOTTOM TABS::: END -->
</Resizable.PaneGroup>
</Resizable.Pane>
<!-- LEFT SIDE BAR::: END -->
  <Resizable.Handle />
  <!-- REST OF THE PAGE -->
  <Resizable.Pane  minSize={75}>
    <Resizable.PaneGroup direction="vertical">
<!-- TOP BAR -->
      <Resizable.Pane  defaultSize={10} minSize={8} maxSize={15}>
  <div class="h-full">          {#if bottomTabs.length > 0}
  <Tabs.Root value={bottomTabs[0].name}  class=" border h-full text-xs flex-row">
  <Tabs.List class=" flex flex-col  rounded-none border h-full" >
    {#each bottomTabs as tab}
      <Tabs.Trigger value={tab.name} class="text-xs data-[state=active]:outline data-[state=active]:bg-accent data-[state=active]:text-accent-foreground flex items-center gap-1">
        <!-- <File class="size-4" /> -->
        {tab.label}
      </Tabs.Trigger>
    {/each}
   
  </Tabs.List>
  {#each bottomTabs as tab}
    <Tabs.Content value={tab.name} class="text-xs overflow-x-auto ">
 
{#each tags as tag (tag)}
      <Button variant="outline" class="text-sm m-1">
        {tag}
        
      </Button>
    {/each}
 

    </Tabs.Content>
  {/each}
  
  
</Tabs.Root>
{/if}</div>
      </Resizable.Pane>
      <Resizable.Handle />
      <Resizable.Pane defaultSize={75}>
    
    <Resizable.PaneGroup direction="horizontal">
<!-- TOP BAR -->
      <Resizable.Pane  defaultSize={20} minSize={15} maxSize={25}>
        <div class="flex h-full    flex-col gap-1">
          <span class=" text-xs flex border-b bg-accent items-center pl-2.5"><b>Queue</b> <Button onclick={() =>{ isLocked = !isLocked}} variant="secondary" size="icon-sm" class="ml-auto"> {#if isLocked}
            <Lock class="size-3"/>
          {/if} {#if !isLocked}
            <LockOpen class="size-3"/>
          {/if}</Button></span>
       <ScrollArea class="w-full h-full ">
  <div class="p-4">
    {#each tags as tag (tag)}
      <div class="text-sm">
        {tag}
      </div>
      <Separator class="my-2" />
    {/each}
  </div>
</ScrollArea>
        </div>

      </Resizable.Pane>
      <Resizable.Handle />
      <Resizable.Pane defaultSize={55} class="p-6  ">
        <div class="flex flex-col pane-text l h-full items-center justify-center   bg-black text-amber-50">
          <p  class="">In the Begining, God Created the Heavens and the Earth</p>
          <b class="">Genesis 1:1</b>
        </div>
      </Resizable.Pane>
    </Resizable.PaneGroup>
 
      </Resizable.Pane>
    </Resizable.PaneGroup>
  </Resizable.Pane>
  <Resizable.Handle />
</Resizable.PaneGroup>
</div>


<style>

.pane {
  container-type: inline-size;
}
@container (min-width: 300px) {
  .pane-text { font-size: 5rem; }
}

@container (min-width: 600px) {
  .pane-text { font-size: 5rem; }
}

@container (min-width: 900px) {
  .pane-text { font-size: 1.2rem; }
}

</style>