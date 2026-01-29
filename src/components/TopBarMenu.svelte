<script lang="ts"> 
import ThemeToggle from "./ThemeToggle.svelte"

import { X , Maximize2 , Minimize2} from "@lucide/svelte";
import { Button } from "$lib/components/ui/button/index.js";
  import type { MenuItem } from "./types";
   import MenuBar from "./MenuBar.svelte";
  import { useWindow } from '$lib/hooks/use-window';
  import { cn } from '$lib/utils';
  import { Separator } from "$lib/components/ui/separator";

let isDraging = $state(false)

const {
  onPressStart,
  onPressEnd,
  close,
  maximize,
  minimize,
} = useWindow({ longPressDelay: 200 });
let { menu}:{menu: MenuItem[]} = $props()
</script>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore event_directive_deprecated -->
<header class={cn("flex justify-between bg-accent  items-center  ", isDraging ? 'drag-active':"") }
 onmousedown={()=> {onPressStart() ; isDraging=true }}
  onmouseup={()=>{onPressEnd(); isDraging=false}}
  onmouseleave={()=>{onPressEnd(); isDraging=false}}
  ontouchstart={()=> {onPressStart() ; isDraging=true }}
  ontouchend={()=>{onPressEnd(); isDraging=false}}
>
  <MenuBar items={menu} />
    <div class="ml-auto flex space-x-2 text-primary p-0.5 items-center" >
<ThemeToggle />
<Separator orientation='vertical' class="m-1 h-5 " />
            <Button variant='link' size='icon' class='cursor-pointer' onclick={minimize}><Minimize2 /></Button>
            <Button variant="link" size="icon" class='cursor-pointer' onclick={maximize}><Maximize2 size={8} /></Button>
            <Button variant='link' class='hover:text-red-500/90 cursor-pointer ' size='icon' onclick={close}><X /></Button>
    </div>
</header>

<style>
    .drag-active {
  opacity: 0.8;
  cursor: grabbing;
}
  </style>