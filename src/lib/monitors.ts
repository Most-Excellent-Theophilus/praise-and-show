// lib/monitor.ts
import { invoke } from "@tauri-apps/api/core";

export interface MonitorInfo {
  index: number;
  width: number;
  height: number;
  x: number;
  y: number;
  is_primary: boolean;
}

export const getMonitors = () => invoke<MonitorInfo[]>("get_monitors");
export const spanAcrossMonitors = () => invoke<void>("span_across_monitors");
export const openSecondMonitor = () => invoke<void>("open_on_second_monitor");
export const closeSecondMonitor = () => invoke<void>("close_second_monitor");