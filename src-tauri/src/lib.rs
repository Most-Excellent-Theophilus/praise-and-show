// src-tauri/src/lib.rs
//
// converter.rs and reader.rs have been removed — all Bible logic now lives in
// TypeScript (src/lib/converter.ts and src/lib/reader.ts) and uses
// tauri-plugin-sql directly from the frontend.

mod screen;
use screen::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // screen commands only — Bible commands are now pure TS
            get_monitors,
            open_on_second_monitor,
            close_second_monitor,
            move_to_monitor,
            span_across_monitors,
            app_ready,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
