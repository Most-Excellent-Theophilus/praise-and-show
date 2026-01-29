// types.ts
import type { Menu } from "@lucide/svelte";
import type { SvelteComponent } from "svelte";

export type IconMenu = typeof SvelteComponent | typeof Menu;

type WithLabelOrIcon =
  | { label: string; icon?: IconMenu }
  | { label?: string; icon: IconMenu };



type MenuBase = WithLabelOrIcon & {
  shortcut?: string;
};
export type MenuItem =
  | (MenuBase & {
      action: () => void;
      submenu?: never;
    })
  | (MenuBase & {
      submenu: MenuItem[];
      action?: never;
    });
