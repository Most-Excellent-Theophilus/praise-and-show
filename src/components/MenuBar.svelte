<!-- MenubarRenderer.svelte -->
<script lang="ts">
  import type { MenuItem } from "./types";

  import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
    MenubarContent,
    MenubarItem,
    MenubarSub,
    MenubarSubTrigger,
    MenubarSubContent,
    MenubarShortcut
  } from "$lib/components/ui/menubar";
 import{Separator } from "$lib/components/ui/separator";

  function isSubmenu(item: MenuItem): item is Extract<MenuItem, { submenu: MenuItem[] }> {
    return "submenu" in item;
  }

  let { items }: { items: MenuItem[] } = $props();
</script>

<Menubar class="bg-transparent text-primary border-none shadow-none text-xs">
  {#each items as item, i}
    <MenubarMenu>
      <!-- Root trigger -->
      <MenubarTrigger class="flex items-center gap-2 text-xs">
        {#if item.icon}
          <svelte:component this={item.icon} class="h-4 w-4" />
        {/if}
        {#if item.label}
          <span class="text-xs">{item.label}</span>
        {/if}
      </MenubarTrigger>

      <MenubarContent class="shadow-none bg-accent mx-0.5 mt-0.5 text-xs">
        {#if isSubmenu(item)}
          {#each item.submenu as sub, idx}
            
            {#if isSubmenu(sub)}
              <!-- Nested submenu -->
              <MenubarSub>
                <MenubarSubTrigger class="flex items-center gap-2 text-xs">
                  {#if sub.icon}
                    <svelte:component this={sub.icon} class="h-4 w-4" />
                  {/if}
                  {#if sub.label}
                    <span class="text-xs">{sub.label}</span>
                  {/if}
                </MenubarSubTrigger>

                <MenubarSubContent class="shadow-none text-xs">
                  {#each sub.submenu as child, cidx}
                    <MenubarItem onclick={child.action} class="flex items-center gap-2 text-xs">
                      {#if child.icon}
                        <svelte:component this={child.icon} class="h-4 w-4" />
                      {/if}

                      {#if child.label}
                        <span class="text-xs">{child.label}</span>
                      {/if}

                      {#if child.shortcut}
                        <MenubarShortcut class="text-xs opacity-70">
                          {child.shortcut}
                        </MenubarShortcut>
                      {/if}
                    </MenubarItem>

                    {#if cidx < sub.submenu.length - 1}
                      <Separator class="my-1 opacity-40" />
                    {/if}
                  {/each}
                </MenubarSubContent>
              </MenubarSub>

            {:else}
              <!-- Normal item -->
              <MenubarItem onclick={sub.action} class="flex items-center gap-2 text-xs">
                {#if sub.icon}
                  <svelte:component this={sub.icon} class="h-4 w-4" />
                {/if}

                {#if sub.label}
                  <span class="text-xs">{sub.label}</span>
                {/if}

                {#if sub.shortcut}
                  <MenubarShortcut class="text-xs opacity-70">
                    {sub.shortcut}
                  </MenubarShortcut>
                {/if}
              </MenubarItem>

              {#if idx < item.submenu.length - 1}
                <Separator class="my-1 opacity-40" />
              {/if}
            {/if}

          {/each}
        {/if}
      </MenubarContent>
    </MenubarMenu>

    {#if i < items.length - 1}
      <Separator orientation='vertical' class="mx-1 h-5 " />
    {/if}
  {/each}
</Menubar>
