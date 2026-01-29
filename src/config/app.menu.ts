import { File, LogOut, Menu, Music4, Settings, Settings2, Presentation, Plus, User, BadgeInfo, HeartHandshake, PackageOpen } from "@lucide/svelte";
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


    { label: "New ", shortcut: "Ctrl+N", icon: Plus, action: () => console.log("New File") },
    { label: "Open ", shortcut: "Ctrl+O", icon:PackageOpen, submenu: [{ label: "From Computer", icon: File, action: () => console.log("Open From Computer") }, { label: "From Cloud", icon: File, action: () => console.log("Open From Cloud") }] },
    { label: "Power Point", shortcut: "Ctrl+O", icon: Presentation, submenu: [{ label: "From Computer", icon: File, action: () => console.log("Open From Computer") }, { label: "From Cloud", icon: File, action: () => console.log("Open From Cloud") }] },
    { label: "Lyrics", shortcut: "Ctrl+O", icon: Music4, submenu: [{ label: "From Computer", icon: File, action: () => console.log("Open From Computer") }, { label: "From Cloud", icon: File, action: () => console.log("Open From Cloud") }] },
    { label: "Settings", icon: Settings2, shortcut: "Ctrl+O", submenu: [{ label: "From Computer", icon: File, action: () => console.log("Open From Computer") }, { label: "From Cloud", icon: File, action: () => console.log("Open From Cloud") }] },
    {
        label: "Account",
        icon: User,
        submenu: [
            {
                label: "Logout",
                icon: LogOut,
                shortcut: "Ctrl+Q",
                action: () => console.log("Logout"),
            },
        ],
    },
    {
        label: "Help",
        icon: BadgeInfo,
        submenu: [
            {
                label: "Logout",
                icon: LogOut,
                shortcut: "Ctrl+Q",
                action: () => console.log("Logout"),
            },
        ],
    },
    { icon: HeartHandshake, action: () => null }
];