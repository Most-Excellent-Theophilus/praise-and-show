import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { page } from "$app/state";
import type { Pathname } from "$app/types";
import { message } from "@tauri-apps/plugin-dialog";
import { toast } from "svelte-sonner";

export const toastedgoto = (path: Pathname) => {
  const id = toast.loading("Please Wait");
  goto( resolve( path))
    .catch((res) => {
      message(`Something went wrong${JSON.stringify(res)}`, {
        kind: "warning",
      });
    })
    .finally(() => {
      if (!page.url.pathname.startsWith(path))
        message(`Page Not Ready: Please Try Again Later`, {
          kind: "warning",
        });
      toast.dismiss(id);
    });
};
