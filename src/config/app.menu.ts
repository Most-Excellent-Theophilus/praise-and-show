import { File, LogOut, Menu, Save, Settings, User } from "@lucide/svelte";
import type { MenuItem } from "../components/types";

export const menuItems: MenuItem[] = [
    {
        // label: "File",
        icon: Menu,
        submenu: [
            {
                label: "Save",
                // icon: Save,
                shortcut: "Ctrl+S",
                action: () => console.log("Save"),
            },
            {
                label: "Settings",
                icon: Settings,
                action: () => console.log("Settings"),
            },
        ],
    },
    {
        label: "Account",
        // icon: User,
        submenu: [
            {
                label: "Logout",
                icon: LogOut,
                shortcut: "Ctrl+Q",
                action: () => console.log("Logout"),
            },
        ],
    },
    { label: "New File",  shortcut: "Ctrl+N", action: () => console.log("New File") },
    { label: "Open File",  shortcut: "Ctrl+O", submenu: [{ label: "From Computer", icon: File, action: () => console.log("Open From Computer") }, { label: "From Cloud", icon: File, action: () => console.log("Open From Cloud") }] },
];