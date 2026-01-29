import { invoke } from "@tauri-apps/api/core";

type UseWindowOptions = {
  longPressDelay?: number;
};

export function useWindow(options?: UseWindowOptions) {
  let timer: number | null = null;
  const delay = options?.longPressDelay ?? 400;
 

  function onPressStart() {
    timer = window.setTimeout(() => {
      invoke("start_drag"); // 🦀 rust native drag
    }, delay);
  }

  function onPressEnd() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return {
    onPressStart,
    onPressEnd,
    minimize: () => invoke("minimize_window"),
    maximize: () => invoke("toggle_maximize_window"),
    close: () => invoke("close_window"),
  };
}
