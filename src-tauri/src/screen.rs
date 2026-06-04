use tauri::Monitor;

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

    pub fn primary(&self) -> Option<&Monitor> {
        self.monitors.get(0)
    }

    pub fn secondary(&self) -> Option<&Monitor> {
        self.monitors.get(1)
    }

    pub fn all(&self) -> &Vec<Monitor> {
        &self.monitors
    }

    pub fn debug_print(&self) {
        for (i, m) in self.monitors.iter().enumerate() {
            let size = m.size();
            let pos = m.position();
            println!(
                "Monitor {} -> {}x{} at ({}, {})",
                i + 1,
                size.width,
                size.height,
                pos.x,
                pos.y
            );
        }
    }
}