use tauri::Window;

/// Minimize the window
pub fn minimize(window: Window) {
    let _ = window.minimize();
}

/// Toggle maximize
pub fn toggle_maximize(window: Window) {
    if window.is_maximized().unwrap_or(false) {
        let _ = window.unmaximize();
    } else {
        let _ = window.maximize();
    }
}

/// Close window
pub fn close(window: Window) {
    let _ = window.close();
}
