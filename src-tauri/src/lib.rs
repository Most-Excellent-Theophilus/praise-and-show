mod screen;
use screen::ScreenUtil;
use tauri::{Manager};

#[derive(serde::Serialize)]
pub struct MonitorInfo {
    pub index: usize,
    pub width: u32,
    pub height: u32,
    pub x: i32,
    pub y: i32,
    pub is_primary: bool,
}

#[tauri::command]
fn get_monitors(window: tauri::WebviewWindow) -> Result<Vec<MonitorInfo>, String> {
    let monitors = window.available_monitors().map_err(|e| e.to_string())?;

    let screens = ScreenUtil::from_monitors(monitors);

    let info = screens
        .all()
        .iter()
        .enumerate()
        .map(|(i, m)| {
            let size = m.size();
            let pos = m.position();
            MonitorInfo {
                index: i,
                width: size.width,
                height: size.height,
                x: pos.x,
                y: pos.y,
                is_primary: i == 0,
            }
        })
        .collect();

    Ok(info)
}

#[tauri::command]
fn open_on_second_monitor(app: tauri::AppHandle) -> Result<(), String> {
    let main_window = app
        .get_webview_window("main")
        .ok_or("main window not found")?;

    let monitors = main_window
        .available_monitors()
        .map_err(|e| e.to_string())?;

    let screens = ScreenUtil::from_monitors(monitors);

    if !screens.has_second_screen() {
        return Err("No second monitor detected".into());
    }

    let second = screens
        .secondary()
        .ok_or("Failed to get secondary monitor")?;
    let pos = second.position();
    let size = second.size();

    // Reuse the pre-declared window — never build a new one
    let window = app
        .get_webview_window("second")
        .ok_or("second window not found in config")?;

    window
        .set_position(tauri::PhysicalPosition::new(pos.x, pos.y))
        .map_err(|e| e.to_string())?;

    window
        .set_size(tauri::PhysicalSize::new(size.width, size.height))
        .map_err(|e| e.to_string())?;

    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn close_second_monitor(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("second") {
        // Hide instead of close — keeps it ready to reuse
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}
// Move the calling window to a monitor by index
#[tauri::command]
fn move_to_monitor(window: tauri::WebviewWindow) -> Result<(), String> {
    let monitors = window.available_monitors().map_err(|e| e.to_string())?;

    let screens = ScreenUtil::from_monitors(monitors);

    let target = screens.secondary().ok_or("No second monitor found")?;

    let pos = target.position();
    let size = target.size();

    // Move to second monitor's origin
    window
        .set_position(tauri::PhysicalPosition::new(pos.x, pos.y))
        .map_err(|e| e.to_string())?;

    // Resize to fill it
    window
        .set_size(tauri::PhysicalSize::new(size.width, size.height))
        .map_err(|e| e.to_string())?;

    window.set_decorations(false).map_err(|e| e.to_string())?;

    Ok(())
}

// Stretch the window across both monitors
#[tauri::command]
fn span_across_monitors(window: tauri::WebviewWindow) -> Result<(), String> {
    let monitors = window.available_monitors().map_err(|e| e.to_string())?;

    let screens = ScreenUtil::from_monitors(monitors);

    if screens.count() < 2 {
        return Err("Need at least 2 monitors".into());
    }

    // Bounding box across all monitors
    let mut min_x = i32::MAX;
    let mut min_y = i32::MAX;
    let mut max_x = i32::MIN;
    let mut max_y = i32::MIN;

    for m in screens.all() {
        let pos = m.position();
        let size = m.size();
        min_x = min_x.min(pos.x);
        min_y = min_y.min(pos.y);
        max_x = max_x.max(pos.x + size.width as i32);
        max_y = max_y.max(pos.y + size.height as i32);
    }

    window
        .set_position(tauri::PhysicalPosition::new(min_x, min_y))
        .map_err(|e| e.to_string())?;

    window
        .set_size(tauri::PhysicalSize::new(
            (max_x - min_x) as u32,
            (max_y - min_y) as u32,
        ))
        .map_err(|e| e.to_string())?;

    window.set_decorations(false).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
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
            get_monitors,
            open_on_second_monitor,
            close_second_monitor,
            move_to_monitor, // new
            span_across_monitors
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
