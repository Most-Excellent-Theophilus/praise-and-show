use tauri::Monitor;
use tauri::{Manager};

pub struct ScreenUtil {
    monitors: Vec<Monitor>,
}

impl ScreenUtil {
    pub fn from_monitors(monitors: Vec<Monitor>) -> Self {
        Self { monitors }
    }

    pub fn count(&self) -> usize {
        self.monitors.len()
    }

    pub fn has_second_screen(&self) -> bool {
        self.monitors.len() > 1
    }

    // pub fn primary(&self) -> Option<&Monitor> {
    //     self.monitors.get(0)
    // }

    pub fn secondary(&self) -> Option<&Monitor> {
        self.monitors.get(1)
    }

    pub fn all(&self) -> &Vec<Monitor> {
        &self.monitors
    }

    // pub fn debug_print(&self) {
    //     for (i, m) in self.monitors.iter().enumerate() {
    //         let size = m.size();
    //         let pos = m.position();
    //         println!(
    //             "Monitor {} -> {}x{} at ({}, {})",
    //             i + 1,
    //             size.width,
    //             size.height,
    //             pos.x,
    //             pos.y
    //         );
    //     }
    // }
}

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
pub fn get_monitors(window: tauri::WebviewWindow) -> Result<Vec<MonitorInfo>, String> {
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
pub fn open_on_second_monitor(app: tauri::AppHandle) -> Result<(), String> {
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
pub fn close_second_monitor(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("second") {
        // Hide instead of close — keeps it ready to reuse
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}
// Move the calling window to a monitor by index
#[tauri::command]
pub fn move_to_monitor(window: tauri::WebviewWindow) -> Result<(), String> {
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
pub fn span_across_monitors(window: tauri::WebviewWindow) -> Result<(), String> {
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

#[tauri::command]
pub async fn app_ready(app: tauri::AppHandle) -> Result<(), String> {
    let splashscreen = app
        .get_webview_window("splashscreen")
        .ok_or("splashscreen window not found")?;

    let main = app
        .get_webview_window("main")
        .ok_or("main window not found")?;

    splashscreen
        .close()
        .map_err(|e| format!("failed to close splashscreen: {e}"))?;

    main.show()
        .map_err(|e| format!("failed to show main window: {e}"))?;

    main.set_focus()
        .map_err(|e| format!("failed to focus main window: {e}"))?;

    Ok(())
}
