use tauri::Window;

mod window_controls;
#[tauri::command]
pub fn minimize_window(window: Window) {
    window_controls::minimize(window);
}

#[tauri::command]
pub fn toggle_maximize_window(window: Window) {
    window_controls::toggle_maximize(window);
}

#[tauri::command]
pub fn close_window(window: Window) {
    window_controls::close(window);
}

#[tauri::command]
pub fn start_drag(window: Window) {
    // Native OS-level drag
    let _ = window.start_dragging();
}

